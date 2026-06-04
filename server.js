'use strict';
const http   = require('http');
const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');
const { getDb } = require('./db');

/* ═══════════════════════════════════════════════════════════════
   CONFIG  (all from environment — no secrets in code)
   ═══════════════════════════════════════════════════════════════ */
const PORT               = parseInt(process.env.PORT, 10)              || 3000;
const IS_HTTPS           = process.env.HTTPS                          === 'true';
const SESSION_TIMEOUT_MS = parseInt(process.env.SESSION_TIMEOUT_MS, 10) || 7_200_000; // 2 h
const SESSION_COOKIE     = 'sid';
const MAX_BODY_BYTES     = 35_000_000;
const MAX_FIELD_LEN      = 500;
const MAX_PHOTO_BYTES    = 5_242_880;  // 5 MB per photo
const MAX_PHOTOS         = 10;
const PUBLIC             = path.join(__dirname, 'public');
const UPLOADS_DIR        = process.env.UPLOADS_PATH || path.join(__dirname, 'uploads');
const ALLOWED_ROLES      = ['system_admin','facility_manager','cleaning_manager','cleaning_supervisor','cleaner'];

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

/* ═══════════════════════════════════════════════════════════════
   SECURITY HEADERS
   ═══════════════════════════════════════════════════════════════ */
function setSecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(self), microphone=(), geolocation=()');
  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",   // required for current single-file architecture
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://api.qrserver.com",
    "font-src 'self'",
    "connect-src 'self'",
    "media-src 'self' blob:",
    "worker-src 'self' blob:",
    "frame-ancestors 'none'",
    "base-uri 'self'"
  ].join('; '));
  if (IS_HTTPS) {
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }
}

/* ═══════════════════════════════════════════════════════════════
   COOKIE HELPERS
   ═══════════════════════════════════════════════════════════════ */
function parseCookies(req) {
  const out = {};
  (req.headers.cookie || '').split(';').forEach(part => {
    const eq = part.indexOf('=');
    if (eq < 1) return;
    const k = part.slice(0, eq).trim();
    const v = part.slice(eq + 1).trim();
    try { out[k] = decodeURIComponent(v); } catch { out[k] = v; }
  });
  return out;
}
function setSessionCookie(res, token) {
  const flags = [`${SESSION_COOKIE}=${token}`, 'HttpOnly', 'SameSite=Strict', 'Path=/',
                 `Max-Age=${Math.floor(SESSION_TIMEOUT_MS / 1000)}`];
  if (IS_HTTPS) flags.push('Secure');
  res.setHeader('Set-Cookie', flags.join('; '));
}
function clearSessionCookie(res) {
  const flags = [`${SESSION_COOKIE}=deleted`, 'HttpOnly', 'SameSite=Strict', 'Path=/', 'Max-Age=0'];
  if (IS_HTTPS) flags.push('Secure');
  res.setHeader('Set-Cookie', flags.join('; '));
}

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */
function send(res, code, body, type = 'application/json') {
  setSecurityHeaders(res);
  res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(!Buffer.isBuffer(body) && type === 'application/json' ? JSON.stringify(body) : body);
}
function bodyJSON(req) {
  return new Promise((resolve, reject) => {
    let b = '';
    req.on('data', chunk => {
      b += chunk;
      if (b.length > MAX_BODY_BYTES) { req.destroy(); reject(new Error('Payload too large')); }
    });
    req.on('end', () => {
      try { resolve(b ? JSON.parse(b) : {}); } catch { reject(new Error('Invalid JSON')); }
    });
  });
}
function clientIP(req) {
  return (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
         req.socket.remoteAddress || '';
}
function clientUA(req) { return (req.headers['user-agent'] || '').slice(0, 300); }
function now()   { return new Date().toISOString(); }
function newId(prefix = 'id') { return `${prefix}-${crypto.randomBytes(8).toString('hex')}`; }

function sanitize(v, maxLen = MAX_FIELD_LEN) {
  if (v === undefined || v === null) return '';
  return String(v).trim().slice(0, maxLen);
}
function sanitizeUsername(v) {
  return sanitize(v, 50).replace(/[^a-zA-Z0-9_\-]/g, '');
}

/* ═══════════════════════════════════════════════════════════════
   PASSWORD HASHING  (scrypt — built-in crypto, no external deps)
   ═══════════════════════════════════════════════════════════════ */
function hashPassword(plain) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(plain, salt, 64).toString('hex');
  return `$scrypt$${salt}$${hash}`;
}
function verifyPassword(plain, stored) {
  if (!stored || !stored.startsWith('$scrypt$')) return false;
  const [, , salt, hash] = stored.split('$');
  try { return crypto.timingSafeEqual(
    Buffer.from(crypto.scryptSync(plain, salt, 64).toString('hex')),
    Buffer.from(hash)
  ); } catch { return false; }
}

/* ═══════════════════════════════════════════════════════════════
   PHOTO VALIDATION & STORAGE
   ═══════════════════════════════════════════════════════════════ */
const MAGIC = {
  jpeg: [0xFF, 0xD8, 0xFF],
  png:  [0x89, 0x50, 0x4E, 0x47],
  webp_riff: [0x52, 0x49, 0x46, 0x46],
  webp_mark: [0x57, 0x45, 0x42, 0x50]
};
function detectMime(buf) {
  if (buf.length >= 3 && buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF)
    return 'image/jpeg';
  if (buf.length >= 4 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47)
    return 'image/png';
  if (buf.length >= 12 &&
      buf[0]===0x52 && buf[1]===0x49 && buf[2]===0x46 && buf[3]===0x46 &&
      buf[8]===0x57 && buf[9]===0x45 && buf[10]===0x42 && buf[11]===0x50)
    return 'image/webp';
  return null;
}

/** Decode, validate and persist one base64 data URL. Returns photo record or null. */
function storePhoto(dataUrl, uploadedBy, reportId = null, ticketId = null) {
  const m = /^data:(image\/(?:jpeg|jpg|png|webp));base64,([A-Za-z0-9+/=]+)$/i.exec(dataUrl);
  if (!m) return null;
  let buf;
  try { buf = Buffer.from(m[2], 'base64'); } catch { return null; }
  if (buf.length === 0 || buf.length > MAX_PHOTO_BYTES) return null;

  const mime = detectMime(buf);
  if (!mime) return null;

  const ext  = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' }[mime];
  const filename = crypto.randomBytes(16).toString('hex') + ext;
  const filepath = path.join(UPLOADS_DIR, filename);

  try { fs.writeFileSync(filepath, buf); } catch (e) {
    console.error('[photo] write failed:', e.message); return null;
  }

  const id = newId('ph');
  const ts = now();
  getDb().prepare(`
    INSERT INTO photos (id, filename, mime_type, size_bytes, report_id, ticket_id, uploaded_by, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, filename, mime, buf.length, reportId, ticketId, uploadedBy, ts);

  return { id, url: `/uploads/${filename}` };
}

/** Process array of base64 strings; return array of photo URL strings. */
function processPhotos(raw, uploadedBy, reportId = null, ticketId = null) {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, MAX_PHOTOS)
    .map(d => storePhoto(d, uploadedBy, reportId, ticketId))
    .filter(Boolean)
    .map(p => p.url);
}

/* ═══════════════════════════════════════════════════════════════
   RATE LIMITER
   ═══════════════════════════════════════════════════════════════ */
const loginAttempts = new Map();
function checkRateLimit(ip) {
  const t = Date.now();
  if (!loginAttempts.has(ip)) return true;
  const rec = loginAttempts.get(ip);
  rec.attempts = rec.attempts.filter(x => t - x < 60_000);
  return rec.attempts.length < 5;
}
function recordAttempt(ip) {
  if (!loginAttempts.has(ip)) loginAttempts.set(ip, { attempts: [] });
  loginAttempts.get(ip).attempts.push(Date.now());
}

/* ═══════════════════════════════════════════════════════════════
   SESSION LAYER  (stored in DB — survives restarts)
   ═══════════════════════════════════════════════════════════════ */
function sessionCreate(token, userId, ip, ua) {
  const ts      = now();
  const expires = new Date(Date.now() + SESSION_TIMEOUT_MS).toISOString();
  getDb().prepare(`
    INSERT INTO sessions (token, user_id, created_at, last_activity, expires_at, ip, user_agent)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(token, userId, ts, ts, expires, ip, ua);
}

function sessionGetUser(req) {
  const token = parseCookies(req)[SESSION_COOKIE];
  if (!token) return null;

  const db  = getDb();
  const row = db.prepare(
    'SELECT * FROM sessions WHERE token = ? AND expires_at > ?'
  ).get(token, now());
  if (!row) { db.prepare('DELETE FROM sessions WHERE token = ?').run(token); return null; }

  // Slide expiry window
  const newExpiry = new Date(Date.now() + SESSION_TIMEOUT_MS).toISOString();
  db.prepare('UPDATE sessions SET last_activity = ?, expires_at = ? WHERE token = ?')
    .run(now(), newExpiry, token);

  return db.prepare(
    'SELECT * FROM users WHERE id = ? AND active = 1 AND deleted_at IS NULL'
  ).get(row.user_id) || null;
}

function sessionDelete(req) {
  const token = parseCookies(req)[SESSION_COOKIE];
  if (token) getDb().prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

// Periodic cleanup of expired sessions
setInterval(() => {
  try { getDb().prepare('DELETE FROM sessions WHERE expires_at < ?').run(now()); } catch {}
}, 3_600_000);

/* ═══════════════════════════════════════════════════════════════
   AUDIT LOG  (stored in DB)
   ═══════════════════════════════════════════════════════════════ */
function auditLog(action, user, ip, ua, opts = {}) {
  try {
    getDb().prepare(`
      INSERT INTO audit_logs
        (ts, action, user_id, username, role, ip, user_agent, target_type, target_id, result, extra)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      now(), action,
      user?.id    || '',
      user?.username || '',
      user?.role  || '',
      ip, ua,
      opts.targetType || '',
      opts.targetId   || '',
      opts.result     || 'success',
      JSON.stringify(opts.extra || {})
    );
  } catch (e) { console.error('[audit]', e.message); }
}

/* ═══════════════════════════════════════════════════════════════
   FIELD MAPPERS  (snake_case DB → camelCase frontend)
   ═══════════════════════════════════════════════════════════════ */
const publicUser = u => {
  if (!u) return null;
  return {
    id:                  u.id,
    name:                u.name,
    username:            u.username,
    role:                u.role,
    active:              u.active === 1 || u.active === true,
    employeeNo:          u.employee_no || '',
    forcePasswordChange: u.force_password_change === 1 || u.force_password_change === true,
    lastPasswordChange:  u.last_password_change || ''
  };
};

const mapLocation = l => l ? {
  id:       l.id,
  type:     l.type,
  nameAr:   l.name_ar,
  nameEn:   l.name_en,
  floor:    l.floor,
  zone:     l.zone,
  priority: l.priority,
  active:   l.active === 1 || l.active === true
} : null;

function canManageUsers(role) { return ['system_admin','cleaning_manager'].includes(role); }
function canManageSystem(role){ return ['system_admin','facility_manager','cleaning_manager'].includes(role); }
function canCreateTickets(role){ return ['system_admin','facility_manager','cleaning_manager','cleaning_supervisor'].includes(role); }
function canReview(role)       { return ['system_admin','facility_manager','cleaning_manager','cleaning_supervisor'].includes(role); }
function canDelete(role)       { return ['system_admin','facility_manager','cleaning_manager'].includes(role); }
function allowedRoleEditor(editorRole, targetRole) {
  return editorRole === 'system_admin' || ['cleaning_supervisor','cleaner'].includes(targetRole);
}

/* ═══════════════════════════════════════════════════════════════
   DATA HELPERS  (all DB queries → camelCase output)
   ═══════════════════════════════════════════════════════════════ */
function dbUsers()    {
  return getDb().prepare('SELECT * FROM users WHERE deleted_at IS NULL').all();
}
function dbLocs()     {
  return getDb().prepare('SELECT * FROM locations WHERE deleted_at IS NULL').all().map(mapLocation);
}
function dbZones()    {
  return getDb().prepare('SELECT name FROM zones').all().map(r => r.name);
}
function dbSettings() {
  const rows = getDb().prepare('SELECT key, value FROM settings').all();
  const s    = Object.fromEntries(rows.map(r => [r.key, r.value]));
  return {
    appVersion:       s.app_version       || '2.0.0',
    frequencyMinutes: parseInt(s.frequency_minutes, 10) || 120,
    requirePhoto:     s.require_photo     === '1',
    prototypeMode:    s.prototype_mode    === '1'
  };
}
function dbAssignments() {
  const rows = getDb().prepare('SELECT worker_id, location_id FROM assignments').all();
  const map  = {};
  rows.forEach(r => {
    if (!map[r.worker_id]) map[r.worker_id] = [];
    map[r.worker_id].push(r.location_id);
  });
  return Object.entries(map).map(([workerId, locationIds]) => ({ workerId, locationIds }));
}
function dbTickets()  {
  return getDb().prepare(`
    SELECT t.*, GROUP_CONCAT(p.filename) AS photo_files
    FROM tickets t
    LEFT JOIN photos p ON p.ticket_id = t.id AND p.deleted_at IS NULL
    WHERE t.deleted_at IS NULL
    GROUP BY t.id ORDER BY t.created_at DESC
  `).all().map(ticketRow);
}
function dbReports()  {
  return getDb().prepare(`
    SELECT r.*, GROUP_CONCAT(p.filename) AS photo_files
    FROM reports r
    LEFT JOIN photos p ON p.report_id = r.id AND p.deleted_at IS NULL
    WHERE r.deleted_at IS NULL
    GROUP BY r.id ORDER BY r.created_at DESC
  `).all().map(reportRow);
}

/** Map DB ticket row → frontend camelCase */
function ticketRow(r) {
  if (!r) return null;
  const photos = r.photo_files ? r.photo_files.split(',').map(f => `/uploads/${f}`) : [];
  return {
    id:             r.id,
    title:          r.title,
    description:    r.description,
    locationId:     r.location_id,
    locationNameAr: r.location_name_ar,
    locationNameEn: r.location_name_en,
    assignedTo:     r.assigned_to,
    assignedToName: r.assigned_to_name,
    createdBy:      r.created_by,
    status:         r.status,
    priority:       r.priority,
    notes:          r.notes,
    createdAt:      r.created_at,
    completedAt:    r.completed_at || '',
    photos
  };
}

/** Map DB report row → frontend camelCase */
function reportRow(r) {
  if (!r) return null;
  const photos = r.photo_files ? r.photo_files.split(',').map(f => `/uploads/${f}`) : [];
  return {
    id:             r.id,
    workerId:       r.worker_id,
    workerName:     r.worker_name,
    locationId:     r.location_id,
    locationNameAr: r.location_name_ar,
    locationNameEn: r.location_name_en,
    locationType:   r.location_type,
    status:         r.status,
    tasks:          JSON.parse(r.tasks || '[]'),
    notes:          r.notes,
    createdAt:      r.created_at,
    approvalStatus: r.approval_status,
    approvedBy:     r.approved_by,
    approvedAt:     r.approved_at || '',
    reviewNote:     r.review_note,
    photos
  };
}

/* ── Role-filtered bootstrap payload ─────────────────────────── */
function buildBootstrap(me) {
  const users       = dbUsers();
  const locations   = dbLocs();          // already mapped to camelCase
  const zones       = dbZones();
  const assignments = dbAssignments();
  const settings    = dbSettings();
  const allTickets  = dbTickets();
  const allReports  = dbReports();

  const base = { user: publicUser(me), locations, zones, settings };

  if (me.role === 'cleaner') {
    const myAssign = assignments.find(a => a.workerId === me.id);
    return {
      ...base,
      users:       [publicUser(me)],
      assignments: myAssign ? [myAssign] : [],
      tickets:     allTickets.filter(t => t.assignedTo === me.id),
      reports:     allReports.filter(r => r.workerId  === me.id)
    };
  }
  if (me.role === 'cleaning_supervisor') {
    return {
      ...base,
      users:       users.filter(u => ['cleaner','cleaning_supervisor'].includes(u.role)).map(publicUser),
      assignments,
      tickets:     allTickets,
      reports:     allReports
    };
  }
  // admin / facility_manager / cleaning_manager — full view
  return {
    ...base,
    users:       users.map(publicUser),
    assignments,
    tickets:     allTickets,
    reports:     allReports
  };
}

/* ═══════════════════════════════════════════════════════════════
   SSE CLIENTS  (in-memory — reconnects after restart are fine)
   ═══════════════════════════════════════════════════════════════ */
const sseClients = new Set();
function broadcast(event, payload) {
  const msg = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const c of sseClients) { try { c.write(msg); } catch { sseClients.delete(c); } }
}

/* ═══════════════════════════════════════════════════════════════
   CSV helper
   ═══════════════════════════════════════════════════════════════ */
function csvCell(v) { return '"' + String(v ?? '').replace(/"/g, '""') + '"'; }

/* ═══════════════════════════════════════════════════════════════
   HTTP SERVER
   ═══════════════════════════════════════════════════════════════ */
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const ip  = clientIP(req);
    const ua  = clientUA(req);

    /* ── health ───────────────────────────────────────────────── */
    if (url.pathname === '/health') {
      return send(res, 200, { status: 'ok', mode: 'prototype', uptime: Math.floor(process.uptime()) });
    }

    /* ── API routes ───────────────────────────────────────────── */
    if (url.pathname.startsWith('/api/')) {

      /* ── LOGIN ──────────────────────────────────────────────── */
      if (req.method === 'POST' && url.pathname === '/api/login') {
        if (!checkRateLimit(ip)) return send(res, 429, { error: 'TOO_MANY_ATTEMPTS' });
        const b        = await bodyJSON(req);
        const username = sanitize(b.username, 50).toLowerCase();
        const password = sanitize(b.password, 200);
        if (!username || !password) return send(res, 400, { error: 'MISSING_FIELDS' });

        const u = getDb().prepare(
          'SELECT * FROM users WHERE username = ? AND active = 1 AND deleted_at IS NULL'
        ).get(username);
        if (!u || !verifyPassword(password, u.password)) {
          recordAttempt(ip);
          auditLog('login_failed', { username }, ip, ua, { result: 'failure' });
          return send(res, 401, { error: 'INVALID_LOGIN' });
        }
        const token = crypto.randomBytes(32).toString('hex');
        sessionCreate(token, u.id, ip, ua);
        setSessionCookie(res, token);
        auditLog('login', u, ip, ua);
        return send(res, 200, {
          user: publicUser(u),
          forcePasswordChange: u.force_password_change === 1
        });
      }

      /* ── LOGOUT ─────────────────────────────────────────────── */
      if (req.method === 'POST' && url.pathname === '/api/logout') {
        const me = sessionGetUser(req);
        auditLog('logout', me, ip, ua);
        sessionDelete(req);
        clearSessionCookie(res);
        return send(res, 200, { ok: true });
      }

      /* ── SSE — cookie auth, no token in URL ─────────────────── */
      if (req.method === 'GET' && url.pathname === '/api/events') {
        const me = sessionGetUser(req);
        if (!me) return send(res, 401, { error: 'UNAUTHORIZED' });
        setSecurityHeaders(res);
        res.writeHead(200, {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection':    'keep-alive'
        });
        res.write(`event: connected\ndata: ${JSON.stringify({ userId: me.id })}\n\n`);
        sseClients.add(res);
        const hb = setInterval(() => {
          try { res.write(': hb\n\n'); } catch { clearInterval(hb); sseClients.delete(res); }
        }, 25_000);
        req.on('close', () => { clearInterval(hb); sseClients.delete(res); });
        return;
      }

      /* ── AUTH GATE ──────────────────────────────────────────── */
      const me = sessionGetUser(req);
      if (!me) return send(res, 401, { error: 'UNAUTHORIZED' });
      const db = getDb();

      /* ── BOOTSTRAP ──────────────────────────────────────────── */
      if (req.method === 'GET' && url.pathname === '/api/bootstrap') {
        return send(res, 200, buildBootstrap(me));
      }

      /* ── CHANGE PASSWORD ────────────────────────────────────── */
      if (req.method === 'POST' && url.pathname === '/api/change-password') {
        const b = await bodyJSON(req);
        const newPwd = sanitize(b.newPassword, 200);
        if (newPwd.length < 8) return send(res, 400, { error: 'WEAK_PASSWORD' });
        if (verifyPassword(newPwd, me.password)) return send(res, 400, { error: 'SAME_PASSWORD' });
        db.prepare(`
          UPDATE users SET password = ?, force_password_change = 0,
          last_password_change = ?, updated_at = ? WHERE id = ?
        `).run(hashPassword(newPwd), now(), now(), me.id);
        auditLog('change_password', me, ip, ua);
        const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(me.id);
        return send(res, 200, { ok: true, user: publicUser(updated) });
      }

      /* ── REPORTS CSV ────────────────────────────────────────── */
      if (req.method === 'GET' && url.pathname === '/api/reports.csv') {
        if (!canReview(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        const reports = dbReports();
        const rows = [
          ['id','worker','location','status','approval','created_at','notes'],
          ...reports.map(r => [
            r.id, r.worker_name, r.location_name_en || r.location_name_ar,
            r.status, r.approval_status, r.created_at, r.notes
          ])
        ];
        auditLog('export_reports', me, ip, ua);
        return send(res, 200, '﻿' + rows.map(r => r.map(csvCell).join(',')).join('\n'), 'text/csv; charset=utf-8');
      }

      /* ── USERS: CREATE ──────────────────────────────────────── */
      if (req.method === 'POST' && url.pathname === '/api/users') {
        if (!canManageUsers(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        const b        = await bodyJSON(req);
        const name     = sanitize(b.name, 100);
        const username = sanitizeUsername(b.username);
        const role     = sanitize(b.role, 50);
        if (!name || !username || !role)    return send(res, 400, { error: 'MISSING_FIELDS' });
        if (!ALLOWED_ROLES.includes(role))  return send(res, 400, { error: 'INVALID_ROLE' });
        if (!allowedRoleEditor(me.role, role)) return send(res, 403, { error: 'ROLE_NOT_ALLOWED' });
        if (db.prepare('SELECT 1 FROM users WHERE username = ? AND deleted_at IS NULL').get(username))
          return send(res, 409, { error: 'USERNAME_EXISTS' });
        const pwd = sanitize(b.password, 200);
        if (pwd.length < 8) return send(res, 400, { error: 'WEAK_PASSWORD' });
        const id = newId('u');
        const ts = now();
        db.prepare(`
          INSERT INTO users (id,name,username,password,role,active,employee_no,
            force_password_change,last_password_change,created_at,updated_at)
          VALUES (?,?,?,?,?,?,?,1,'',?,?)
        `).run(id, name, username, hashPassword(pwd), role,
               b.active !== false ? 1 : 0, sanitize(b.employeeNo, 50), ts, ts);
        const u = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
        auditLog('user_created', me, ip, ua, { targetType: 'user', targetId: id, extra: { username, role } });
        return send(res, 200, { user: publicUser(u) });
      }

      /* ── USERS: UPDATE ──────────────────────────────────────── */
      if (req.method === 'PUT' && url.pathname.startsWith('/api/users/')) {
        if (!canManageUsers(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        const id = sanitize(url.pathname.split('/').pop(), 50);
        const b  = await bodyJSON(req);
        const u  = db.prepare('SELECT * FROM users WHERE id = ? AND deleted_at IS NULL').get(id);
        if (!u) return send(res, 404, { error: 'USER_NOT_FOUND' });
        if (u.username === 'admin' && me.username !== 'admin') return send(res, 403, { error: 'CANNOT_EDIT_SYSADMIN' });
        if (b.role && !allowedRoleEditor(me.role, b.role)) return send(res, 403, { error: 'ROLE_NOT_ALLOWED' });
        const sets = [];
        const vals = [];
        if (b.name)       { sets.push('name = ?');        vals.push(sanitize(b.name, 100)); }
        if (b.username)   { sets.push('username = ?');    vals.push(sanitizeUsername(b.username)); }
        if (b.role)       { sets.push('role = ?');        vals.push(sanitize(b.role, 50)); }
        if (b.employeeNo !== undefined) { sets.push('employee_no = ?'); vals.push(sanitize(b.employeeNo, 50)); }
        if (b.password) {
          const pwd = sanitize(b.password, 200);
          if (pwd.length < 8) return send(res, 400, { error: 'WEAK_PASSWORD' });
          sets.push('password = ?', 'force_password_change = 1', 'last_password_change = ?');
          vals.push(hashPassword(pwd), '');
        }
        if (b.active !== undefined) { sets.push('active = ?'); vals.push(b.active ? 1 : 0); }
        sets.push('updated_at = ?'); vals.push(now());
        vals.push(id);
        if (sets.length > 1) db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
        const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
        auditLog('user_updated', me, ip, ua, { targetType: 'user', targetId: id });
        return send(res, 200, { user: publicUser(updated) });
      }

      /* ── USERS: DELETE (soft) ───────────────────────────────── */
      if (req.method === 'DELETE' && url.pathname.startsWith('/api/users/')) {
        if (!canManageUsers(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        const id = sanitize(url.pathname.split('/').pop(), 50);
        const u  = db.prepare('SELECT * FROM users WHERE id = ? AND deleted_at IS NULL').get(id);
        if (!u) return send(res, 404, { error: 'USER_NOT_FOUND' });
        if (u.username === 'admin') return send(res, 403, { error: 'CANNOT_DELETE_SYSADMIN' });
        if (id === me.id) return send(res, 403, { error: 'CANNOT_DELETE_SELF' });
        db.prepare('UPDATE users SET deleted_at = ?, updated_at = ?, active = 0 WHERE id = ?').run(now(), now(), id);
        db.prepare('DELETE FROM assignments WHERE worker_id = ?').run(id);
        auditLog('user_deleted', me, ip, ua, { targetType: 'user', targetId: id });
        return send(res, 200, { ok: true });
      }

      /* ── LOCATIONS: CREATE ──────────────────────────────────── */
      if (req.method === 'POST' && url.pathname === '/api/locations') {
        if (!canManageSystem(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        const b     = await bodyJSON(req);
        const locId = sanitize(b.id || ('loc-' + crypto.randomBytes(4).toString('hex')), 80)
                        .replace(/[^a-zA-Z0-9\-_]/g, '');
        if (db.prepare('SELECT 1 FROM locations WHERE id = ?').get(locId))
          return send(res, 409, { error: 'LOCATION_ID_EXISTS' });
        const ts  = now();
        const loc = {
          id: locId, type: sanitize(b.type, 30) || 'other',
          name_ar: sanitize(b.nameAr, 200), name_en: sanitize(b.nameEn, 200),
          floor: sanitize(b.floor, 10), zone: sanitize(b.zone, 10),
          priority: sanitize(b.priority, 10) || 'medium', active: b.active !== false ? 1 : 0
        };
        db.prepare(`
          INSERT INTO locations (id,type,name_ar,name_en,floor,zone,priority,active,created_at,updated_at)
          VALUES (?,?,?,?,?,?,?,?,?,?)
        `).run(loc.id,loc.type,loc.name_ar,loc.name_en,loc.floor,loc.zone,loc.priority,loc.active,ts,ts);
        return send(res, 200, { location: loc });
      }

      /* ── LOCATIONS: UPDATE ──────────────────────────────────── */
      if (req.method === 'PUT' && url.pathname.startsWith('/api/locations/')) {
        if (!canManageSystem(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        const id  = sanitize(url.pathname.split('/').pop(), 80);
        const b   = await bodyJSON(req);
        const loc = db.prepare('SELECT * FROM locations WHERE id = ? AND deleted_at IS NULL').get(id);
        if (!loc) return send(res, 404, { error: 'LOCATION_NOT_FOUND' });
        const sets = []; const vals = [];
        if (b.type)    { sets.push('type = ?');    vals.push(sanitize(b.type, 30)); }
        if (b.nameAr)  { sets.push('name_ar = ?'); vals.push(sanitize(b.nameAr, 200)); }
        if (b.nameEn)  { sets.push('name_en = ?'); vals.push(sanitize(b.nameEn, 200)); }
        if (b.floor)   { sets.push('floor = ?');   vals.push(sanitize(b.floor, 10)); }
        if (b.zone)    { sets.push('zone = ?');     vals.push(sanitize(b.zone, 10)); }
        if (b.priority){ sets.push('priority = ?');vals.push(sanitize(b.priority, 10)); }
        if (b.active !== undefined) { sets.push('active = ?'); vals.push(b.active ? 1 : 0); }
        sets.push('updated_at = ?'); vals.push(now()); vals.push(id);
        if (sets.length > 1) db.prepare(`UPDATE locations SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
        const updated = db.prepare('SELECT * FROM locations WHERE id = ?').get(id);
        return send(res, 200, { location: mapLocation(updated) });
      }

      /* ── LOCATIONS: DELETE (soft) ───────────────────────────── */
      if (req.method === 'DELETE' && url.pathname.startsWith('/api/locations/')) {
        if (!canManageSystem(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        const id = decodeURIComponent(url.pathname.split('/').pop());
        db.prepare('UPDATE locations SET deleted_at = ?, updated_at = ? WHERE id = ?').run(now(), now(), id);
        db.prepare('DELETE FROM assignments WHERE location_id = ?').run(id);
        return send(res, 200, { ok: true });
      }

      /* ── ZONES ──────────────────────────────────────────────── */
      if (req.method === 'POST' && url.pathname === '/api/zones') {
        if (!canManageSystem(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        const b = await bodyJSON(req);
        const z = sanitize(b.zone, 20);
        if (!z) return send(res, 400, { error: 'EMPTY' });
        db.prepare('INSERT OR IGNORE INTO zones (name) VALUES (?)').run(z);
        return send(res, 200, { zones: dbZones() });
      }
      if (req.method === 'DELETE' && url.pathname.startsWith('/api/zones/')) {
        if (!canManageSystem(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        const z = decodeURIComponent(url.pathname.split('/').pop());
        db.prepare('DELETE FROM zones WHERE name = ?').run(z);
        return send(res, 200, { zones: dbZones() });
      }

      /* ── ASSIGNMENTS ────────────────────────────────────────── */
      if (req.method === 'POST' && url.pathname === '/api/assignments') {
        if (!canManageSystem(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        const b          = await bodyJSON(req);
        const workerId   = sanitize(b.workerId, 50);
        const locationIds = Array.isArray(b.locationIds)
          ? b.locationIds.map(l => sanitize(l, 80)).filter(Boolean) : [];
        db.transaction(() => {
          db.prepare('DELETE FROM assignments WHERE worker_id = ?').run(workerId);
          const ins = db.prepare('INSERT OR IGNORE INTO assignments (worker_id,location_id,created_at) VALUES (?,?,?)');
          locationIds.forEach(lid => ins.run(workerId, lid, now()));
        })();
        auditLog('assignment_updated', me, ip, ua, {
          targetType: 'worker', targetId: workerId, extra: { locationCount: locationIds.length }
        });
        return send(res, 200, { ok: true });
      }

      /* ── TICKETS: CREATE ────────────────────────────────────── */
      if (req.method === 'POST' && url.pathname === '/api/tickets') {
        if (!canCreateTickets(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        const b      = await bodyJSON(req);
        const loc    = db.prepare('SELECT * FROM locations WHERE id = ? AND deleted_at IS NULL').get(b.locationId);
        const worker = db.prepare('SELECT * FROM users WHERE id = ? AND active = 1 AND deleted_at IS NULL').get(b.assignedTo);
        if (!loc || !worker) return send(res, 400, { error: 'MISSING_LOCATION_OR_WORKER' });
        const id  = newId('t');
        const ts  = now();
        const priority = ['high','medium','low'].includes(b.priority) ? b.priority : 'medium';
        db.prepare(`
          INSERT INTO tickets (id,title,description,location_id,location_name_ar,location_name_en,
            assigned_to,assigned_to_name,created_by,status,priority,notes,created_at,updated_at)
          VALUES (?,?,?,?,?,?,?,?,?,'open',?,?,?,?)
        `).run(id, sanitize(b.title, 200) || 'بلاغ نظافة',
               sanitize(b.description, 1000), loc.id, loc.name_ar, loc.name_en,
               worker.id, worker.name, me.name, priority, '', ts, ts);
        const ticket = ticketRow(db.prepare(`
          SELECT t.*, NULL AS photo_files FROM tickets t WHERE t.id = ?
        `).get(id));
        broadcast('ticket_created', { ticket });
        auditLog('ticket_created', me, ip, ua, { targetType: 'ticket', targetId: id });
        return send(res, 200, { ticket });
      }

      /* ── TICKETS: COMPLETE ──────────────────────────────────── */
      if (req.method === 'POST' && url.pathname === '/api/tickets/complete') {
        const b = await bodyJSON(req);
        const t = db.prepare('SELECT * FROM tickets WHERE id = ? AND deleted_at IS NULL').get(b.id);
        if (!t) return send(res, 404, { error: 'TICKET_NOT_FOUND' });
        if (me.role === 'cleaner' && t.assigned_to !== me.id) return send(res, 403, { error: 'FORBIDDEN' });
        processPhotos(b.photos, me.id, null, t.id);
        db.prepare(`
          UPDATE tickets SET status='completed', completed_at=?, notes=?, updated_at=? WHERE id=?
        `).run(now(), sanitize(b.notes, 1000), now(), t.id);
        const ticket = ticketRow(db.prepare(`
          SELECT t.*, GROUP_CONCAT(p.filename) AS photo_files
          FROM tickets t LEFT JOIN photos p ON p.ticket_id=t.id AND p.deleted_at IS NULL
          WHERE t.id=? GROUP BY t.id
        `).get(t.id));
        broadcast('ticket_completed', { ticket });
        auditLog('ticket_completed', me, ip, ua, { targetType: 'ticket', targetId: t.id });
        return send(res, 200, { ticket });
      }

      /* ── TICKETS: UPDATE ────────────────────────────────────── */
      if (req.method === 'PUT' && url.pathname.startsWith('/api/tickets/')) {
        if (!canCreateTickets(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        const id = sanitize(url.pathname.split('/').pop(), 50);
        const b  = await bodyJSON(req);
        const t  = db.prepare('SELECT * FROM tickets WHERE id = ? AND deleted_at IS NULL').get(id);
        if (!t) return send(res, 404, { error: 'TICKET_NOT_FOUND' });
        const sets = []; const vals = [];
        if (b.title !== undefined)    { sets.push('title = ?');       vals.push(sanitize(b.title, 200)); }
        if (b.description !== undefined){ sets.push('description = ?'); vals.push(sanitize(b.description, 1000)); }
        if (['high','medium','low'].includes(b.priority)) { sets.push('priority = ?'); vals.push(b.priority); }
        if (b.status !== undefined)   { sets.push('status = ?'); vals.push(b.status);
          if (b.status === 'completed') { sets.push('completed_at = ?'); vals.push(now()); }
        }
        if (b.assignedTo) {
          const w = db.prepare('SELECT * FROM users WHERE id = ? AND active=1 AND deleted_at IS NULL').get(b.assignedTo);
          if (w) { sets.push('assigned_to = ?', 'assigned_to_name = ?'); vals.push(w.id, w.name); }
        }
        sets.push('updated_at = ?'); vals.push(now()); vals.push(id);
        if (sets.length > 1) db.prepare(`UPDATE tickets SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
        const ticket = ticketRow(db.prepare(`
          SELECT t.*, GROUP_CONCAT(p.filename) AS photo_files
          FROM tickets t LEFT JOIN photos p ON p.ticket_id=t.id AND p.deleted_at IS NULL
          WHERE t.id=? GROUP BY t.id
        `).get(id));
        auditLog('ticket_updated', me, ip, ua, { targetType: 'ticket', targetId: id });
        return send(res, 200, { ticket });
      }

      /* ── TICKETS: DELETE (soft) ─────────────────────────────── */
      if (req.method === 'DELETE' && url.pathname.startsWith('/api/tickets/')) {
        if (!['system_admin','cleaning_manager'].includes(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        const id = sanitize(url.pathname.split('/').pop(), 50);
        const t  = db.prepare('SELECT 1 FROM tickets WHERE id = ? AND deleted_at IS NULL').get(id);
        if (!t) return send(res, 404, { error: 'TICKET_NOT_FOUND' });
        db.prepare('UPDATE tickets SET deleted_at = ?, updated_at = ? WHERE id = ?').run(now(), now(), id);
        auditLog('ticket_deleted', me, ip, ua, { targetType: 'ticket', targetId: id });
        return send(res, 200, { ok: true });
      }

      /* ── REPORTS: CREATE ────────────────────────────────────── */
      if (req.method === 'POST' && url.pathname === '/api/reports') {
        if (me.role !== 'cleaner') return send(res, 403, { error: 'ONLY_CLEANER' });
        const b   = await bodyJSON(req);
        const loc = db.prepare(
          'SELECT * FROM locations WHERE id = ? AND active = 1 AND deleted_at IS NULL'
        ).get(b.locationId);
        if (!loc) return send(res, 404, { error: 'LOCATION_NOT_FOUND' });
        const asgRow = db.prepare(
          'SELECT location_id FROM assignments WHERE worker_id = ? AND location_id = ?'
        ).get(me.id, loc.id);
        const hasAny = db.prepare('SELECT 1 FROM assignments WHERE worker_id = ?').get(me.id);
        if (hasAny && !asgRow) return send(res, 403, { error: 'NOT_ASSIGNED' });
        const tasks  = Array.isArray(b.tasks) ? b.tasks.map(t => sanitize(t, 200)).slice(0, 50) : [];
        const id     = newId('r');
        const ts     = now();
        const status = ['completed','needs_followup'].includes(b.status) ? b.status : 'completed';
        db.prepare(`
          INSERT INTO reports (id,worker_id,worker_name,location_id,location_name_ar,location_name_en,
            location_type,status,tasks,notes,approval_status,created_at,updated_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,'pending',?,?)
        `).run(id, me.id, me.name, loc.id, loc.name_ar, loc.name_en,
               loc.type, status, JSON.stringify(tasks), sanitize(b.notes, 1000), ts, ts);
        processPhotos(b.photos, me.id, id, null);
        const report = reportRow(db.prepare(`
          SELECT r.*, GROUP_CONCAT(p.filename) AS photo_files
          FROM reports r LEFT JOIN photos p ON p.report_id=r.id AND p.deleted_at IS NULL
          WHERE r.id=? GROUP BY r.id
        `).get(id));
        broadcast('report_created', { report });
        auditLog('report_created', me, ip, ua, {
          targetType: 'report', targetId: id,
          extra: { locationId: loc.id, photoCount: report.photos.length }
        });
        return send(res, 200, { report });
      }

      /* ── REPORTS: REVIEW ────────────────────────────────────── */
      if (req.method === 'POST' && url.pathname === '/api/reports/review') {
        if (!canReview(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        const b = await bodyJSON(req);
        const r = db.prepare('SELECT 1 FROM reports WHERE id = ? AND deleted_at IS NULL').get(b.id);
        if (!r) return send(res, 404, { error: 'REPORT_NOT_FOUND' });
        const validSt = ['approved','rejected','needs_recleaning'];
        const status  = validSt.includes(b.status) ? b.status : 'approved';
        db.prepare(`
          UPDATE reports SET approval_status=?, approved_by=?, approved_at=?, review_note=?, updated_at=? WHERE id=?
        `).run(status, me.name, now(), sanitize(b.note, 500), now(), b.id);
        const report = reportRow(db.prepare(`
          SELECT r.*, GROUP_CONCAT(p.filename) AS photo_files
          FROM reports r LEFT JOIN photos p ON p.report_id=r.id AND p.deleted_at IS NULL
          WHERE r.id=? GROUP BY r.id
        `).get(b.id));
        broadcast('report_reviewed', { report, reviewedBy: me.name });
        auditLog('report_reviewed', me, ip, ua, {
          targetType: 'report', targetId: b.id, extra: { status }
        });
        return send(res, 200, { report });
      }

      /* ── REPORTS: DELETE (soft) ─────────────────────────────── */
      if (req.method === 'DELETE' && url.pathname.startsWith('/api/reports/')) {
        if (!canDelete(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        const id = sanitize(url.pathname.split('/').pop(), 50);
        const r  = db.prepare('SELECT 1 FROM reports WHERE id = ? AND deleted_at IS NULL').get(id);
        if (!r) return send(res, 404, { error: 'REPORT_NOT_FOUND' });
        db.prepare('UPDATE reports SET deleted_at = ?, updated_at = ? WHERE id = ?').run(now(), now(), id);
        auditLog('report_deleted', me, ip, ua, { targetType: 'report', targetId: id });
        return send(res, 200, { ok: true });
      }

      /* ── AUDIT LOGS: READ (admin only) ──────────────────────── */
      if (req.method === 'GET' && url.pathname === '/api/audit-logs') {
        if (me.role !== 'system_admin') return send(res, 403, { error: 'FORBIDDEN' });
        const limit  = Math.min(parseInt(url.searchParams.get('limit') || '100', 10), 500);
        const offset = parseInt(url.searchParams.get('offset') || '0', 10);
        const logs   = db.prepare(
          'SELECT * FROM audit_logs ORDER BY ts DESC LIMIT ? OFFSET ?'
        ).all(limit, offset);
        return send(res, 200, { logs, limit, offset });
      }

      return send(res, 404, { error: 'NOT_FOUND' });
    }

    /* ── UPLOADS — auth + path traversal protected ──────────── */
    if (url.pathname.startsWith('/uploads/')) {
      const me = sessionGetUser(req);
      if (!me) return send(res, 401, { error: 'UNAUTHORIZED' });
      const fname = path.basename(url.pathname);
      if (!/^[a-f0-9]{32}\.(jpg|png|webp)$/.test(fname))
        return send(res, 403, 'Forbidden', 'text/plain');
      const fp = path.join(UPLOADS_DIR, fname);
      if (!fp.startsWith(UPLOADS_DIR) || !fs.existsSync(fp))
        return send(res, 404, 'Not found', 'text/plain');
      const ct = fname.endsWith('.png') ? 'image/png' : fname.endsWith('.webp') ? 'image/webp' : 'image/jpeg';
      setSecurityHeaders(res);
      res.writeHead(200, { 'Content-Type': ct, 'Cache-Control': 'private, max-age=86400' });
      res.end(fs.readFileSync(fp));
      return;
    }

    /* ── STATIC FILES ───────────────────────────────────────── */
    let file = url.pathname === '/' ? '/index.html' : url.pathname;
    file = path.normalize(file).replace(/^(\.\.[/\\])+/, '');
    const p = path.join(PUBLIC, file);
    if (!p.startsWith(PUBLIC) || !fs.existsSync(p))
      return send(res, 404, 'Not found', 'text/plain');
    const ext   = path.extname(p).toLowerCase();
    const types = {
      '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
      '.js':   'text/javascript; charset=utf-8', '.json': 'application/json',
      '.svg':  'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
      '.ttf':  'font/ttf', '.woff': 'font/woff', '.woff2': 'font/woff2'
    };
    setSecurityHeaders(res);
    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
    res.end(fs.readFileSync(p));

  } catch (e) {
    console.error('[server]', e.message);
    send(res, 500, { error: 'INTERNAL_ERROR' });
  }
});

/* ═══════════════════════════════════════════════════════════════
   AUTO-SEED  (runs only when DB has no users — safe on restart)
   Reads passwords from env vars. If absent, generates random ones.
   Credentials printed to stdout once and never stored in source.
   ═══════════════════════════════════════════════════════════════ */
function autoSeedIfEmpty() {
  const db = getDb();
  const count = db.prepare('SELECT COUNT(*) AS c FROM users WHERE deleted_at IS NULL').get().c;
  if (count > 0) return count;

  function rndPwd() {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
    let p = '';
    while (p.length < 16) {
      const b = crypto.randomBytes(1)[0];
      if (b < chars.length * Math.floor(256 / chars.length)) p += chars[b % chars.length];
    }
    return p;
  }

  // ADMIN_PASSWORD is the canonical env var for the admin account.
  // Other accounts get random passwords (printed once to stdout).
  // The admin password is NEVER printed — the operator already knows it.
  if (!process.env.ADMIN_PASSWORD && !process.env.DEMO_ADMIN_PASSWORD) {
    console.warn('[startup] WARNING: ADMIN_PASSWORD env var not set. A random admin password will be generated and printed once.');
  }
  const pw = {
    admin:      process.env.ADMIN_PASSWORD           ||
                process.env.DEMO_ADMIN_PASSWORD      || rndPwd(),
    fm:         process.env.DEMO_FM_PASSWORD         || rndPwd(),
    manager:    process.env.DEMO_MANAGER_PASSWORD    || rndPwd(),
    supervisor: process.env.DEMO_SUPERVISOR_PASSWORD || rndPwd(),
    worker:     process.env.DEMO_WORKER_PASSWORD     || rndPwd()
  };
  const adminPwdFromEnv = !!(process.env.ADMIN_PASSWORD || process.env.DEMO_ADMIN_PASSWORD);

  const ts = new Date().toISOString();
  const insUser = db.prepare(`
    INSERT OR IGNORE INTO users
      (id,name,username,password,role,active,employee_no,
       force_password_change,last_password_change,created_at,updated_at)
    VALUES (?,?,?,?,?,1,'',1,'',?,?)
  `);
  const insLoc = db.prepare(`
    INSERT OR IGNORE INTO locations
      (id,type,name_ar,name_en,floor,zone,priority,active,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,1,?,?)
  `);

  db.transaction(() => {
    [
      ['u-admin','مدير النظام','admin',pw.admin,'system_admin'],
      ['u-fm','مدير المرافق','fm',pw.fm,'facility_manager'],
      ['u-clean-manager','مدير النظافة','manager',pw.manager,'cleaning_manager'],
      ['u-s1','مشرف 1','supervisor1',pw.supervisor,'cleaning_supervisor'],
      ['u-s2','مشرف 2','supervisor2',pw.supervisor,'cleaning_supervisor'],
      ['u-w3','عامل 3','worker3',pw.worker,'cleaner'],
      ['u-w4','عامل 4','worker4',pw.worker,'cleaner'],
      ['u-w5','عامل 5','worker5',pw.worker,'cleaner'],
      ['u-w6','عامل 6','worker6',pw.worker,'cleaner'],
      ['u-w7','عامل 7','worker7',pw.worker,'cleaner']
    ].forEach(([id,name,username,pass,role]) =>
      insUser.run(id,name,username,hashPassword(pass),role,ts,ts)
    );
    [
      ['wc-gf-a','restroom','دورة مياه - الدور الأرضي - A','Restroom - GF - Zone A','GF','GF','medium'],
      ['wc-gf-b','restroom','دورة مياه - الدور الأرضي - B','Restroom - GF - Zone B','GF','GF','medium'],
      ['wc-mz-a','restroom','دورة مياه - الميزانين - A','Restroom - Mezzanine - A','MZ','MZ','medium'],
      ['wc-01-a','restroom','دورة مياه - الدور الأول - A','Restroom - First Floor - A','01','1F','medium'],
      ['lobby-gf','lobby','الردهة الرئيسية - الأرضي','Main Lobby - Ground Floor','GF','GF','high'],
      ['pantry-05','pantry','منطقة الضيافة - الخامس','Pantry Area - Fifth Floor','05','5F','medium'],
      ['meeting-08-a','meeting_room','قاعة اجتماع - الثامن - A','Meeting Room - 8F - A','08','8F','high'],
      ['corridor-04','corridor','ممرات الدور الرابع','Fourth Floor Corridors','04','4F','low'],
      ['prayer-mz','prayer_room','مصلى الميزانين','Mezzanine Prayer Room','MZ','MZ','high']
    ].forEach(([id,type,ar,en,floor,zone,pri]) => insLoc.run(id,type,ar,en,floor,zone,pri,ts,ts));

    ['GF','MZ','1F','2F','3F','4F','5F','6F','7F','8F','B1','B2'].forEach(z =>
      db.prepare('INSERT OR IGNORE INTO zones (name) VALUES (?)').run(z)
    );
    [['u-w3',['wc-gf-a','lobby-gf']],['u-w4',['wc-gf-b','corridor-04']],
     ['u-w5',['wc-mz-a','prayer-mz']],['u-w6',['wc-01-a','pantry-05']],
     ['u-w7',['meeting-08-a']]
    ].forEach(([wid,lids]) =>
      lids.forEach(lid =>
        db.prepare('INSERT OR IGNORE INTO assignments (worker_id,location_id,created_at) VALUES (?,?,?)').run(wid,lid,ts)
      )
    );
    db.prepare(`INSERT OR IGNORE INTO tickets
      (id,title,description,location_id,location_name_ar,location_name_en,
       assigned_to,assigned_to_name,created_by,status,priority,notes,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?,'مدير النظافة','open','high','',?,?)
    `).run('t-demo-1','تنظيف عاجل لمنطقة الضيافة','بيانات تجريبية فقط',
           'pantry-05','منطقة الضيافة - الخامس','Pantry - 5F','u-w6','عامل 6',ts,ts);
  })();

  console.log('');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║   AUTO-SEED: Demo accounts created                       ║');
  console.log('║   ⚠ All accounts require password change on first login  ║');
  console.log('╠══════════════════════════════════════════════════════════╣');
  // Admin password: never printed if it came from env var (operator knows it)
  if (adminPwdFromEnv) {
    console.log('║   admin      : [set via ADMIN_PASSWORD env var]          ║');
  } else {
    console.log(`║   admin      : ${pw.admin.padEnd(42)}║`);
  }
  console.log(`║   fm         : ${pw.fm.padEnd(42)}║`);
  console.log(`║   manager    : ${pw.manager.padEnd(42)}║`);
  console.log(`║   supervisor : ${pw.supervisor.padEnd(42)}║`);
  console.log(`║   worker3-7  : ${pw.worker.padEnd(42)}║`);
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log('║   Username for admin login: admin                        ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');

  return db.prepare('SELECT COUNT(*) AS c FROM users WHERE deleted_at IS NULL').get().c;
}

/* ═══════════════════════════════════════════════════════════════
   STARTUP
   ═══════════════════════════════════════════════════════════════ */
try {
  getDb();
} catch (e) {
  console.error('[startup] DB init failed:', e.message);
  process.exit(1);
}

const userCount = autoSeedIfEmpty();

server.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║   REGA Facility Care — PROTOTYPE / نسخة تجريبية          ║');
  console.log('║   بيانات غير حقيقية — Demo Data Only                     ║');
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log(`║   Port    : ${String(PORT).padEnd(47)}║`);
  console.log(`║   Database: ${String(process.env.DB_PATH || 'data.db').padEnd(47)}║`);
  console.log(`║   Uploads : ${String(UPLOADS_DIR).slice(0, 47).padEnd(47)}║`);
  console.log(`║   Users   : ${String(userCount).padEnd(47)}║`);
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');
});
