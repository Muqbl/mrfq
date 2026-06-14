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
// IS_HTTPS: explicit env var OR auto-detect Railway/Render reverse-proxy
const IS_HTTPS           = process.env.HTTPS === 'true';
const SESSION_TIMEOUT_MS = parseInt(process.env.SESSION_TIMEOUT_MS, 10) || 7_200_000; // 2 h
const SESSION_COOKIE     = 'sid';
const MAX_BODY_BYTES     = 35_000_000;
const MAX_FIELD_LEN      = 500;
const MAX_PHOTO_BYTES    = 5_242_880;  // 5 MB per photo
const MAX_PHOTOS         = 10;
const PUBLIC             = path.join(__dirname, 'public');
const UPLOADS_DIR        = process.env.UPLOADS_PATH || path.join(__dirname, 'uploads');
const ALLOWED_ROLES      = ['system_admin','facility_manager','cleaning_manager','cleaning_supervisor','cleaner','employee','hospitality_manager','hospitality_supervisor','hospitality_worker'];

/* ═══════════════════════════════════════════════════════════════
   TICKET STATUS STATE MACHINE
   ═══════════════════════════════════════════════════════════════ */
const TICKET_STATUSES  = ['submitted','assigned','accepted','in_progress','waiting_verification','completed','reclean_required','rejected','cancelled'];
const TICKET_TERMINAL  = ['completed','rejected','cancelled'];
const TICKET_TRANSITIONS = {
  submitted:            ['assigned','cancelled','rejected'],
  assigned:             ['accepted','in_progress','waiting_verification','reclean_required','submitted','cancelled','rejected'],
  accepted:             ['in_progress','waiting_verification','cancelled','rejected'],
  in_progress:          ['waiting_verification','cancelled','rejected'],
  waiting_verification: ['completed','reclean_required','rejected'],
  reclean_required:     ['assigned','accepted','in_progress','waiting_verification','cancelled'],
  completed:            [],
  rejected:             [],
  cancelled:            []
};
const REPORT_REVIEW_STATUSES = ['approved','rejected','needs_recleaning'];

/* ═══════════════════════════════════════════════════════════════
   HOSPITALITY ORDER STATUS STATE MACHINE
   ═══════════════════════════════════════════════════════════════ */
const HOSPITALITY_STATUSES = ['submitted','accepted','preparing','ready','out_for_delivery','delivered','completed','cancelled','rejected'];
const HOSPITALITY_TERMINAL = ['completed','cancelled','rejected'];
const HOSPITALITY_TRANSITIONS = {
  submitted:        ['accepted','rejected','cancelled'],
  accepted:         ['preparing','cancelled','rejected'],
  preparing:        ['ready','cancelled'],
  ready:            ['out_for_delivery','cancelled'],
  out_for_delivery: ['delivered','cancelled'],
  delivered:        ['completed'],
  completed:        [],
  cancelled:        [],
  rejected:         []
};
// Per-role transition scopes (override roles get full HOSPITALITY_TRANSITIONS)
const HOSPITALITY_WORKER_TRANSITIONS = {
  accepted:         ['preparing'],
  preparing:        ['ready'],
  ready:            ['out_for_delivery'],
  out_for_delivery: ['delivered']
};
const HOSPITALITY_SUPERVISOR_TRANSITIONS = {
  submitted:        ['accepted','rejected'],
  accepted:         ['preparing','cancelled','rejected'],
  preparing:        ['ready','cancelled'],
  ready:            ['out_for_delivery','cancelled'],
  out_for_delivery: ['delivered','cancelled'],
  delivered:        ['completed']
};
const HOSPITALITY_EMPLOYEE_TRANSITIONS = {
  submitted: ['cancelled']
};
const HOSPITALITY_SLA_MINS = 60;

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
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https://api.qrserver.com",
    "font-src 'self' https://fonts.gstatic.com",
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
/** Convert Arabic-Indic (٠-٩) and Extended Arabic-Indic (۰-۹) digits to ASCII 0-9. */
function normalizeDigits(v) {
  return String(v).replace(/[٠-٩۰-۹]/g, d =>
    String(d.charCodeAt(0) & 0xF));
}
function sanitizePhone(v) {
  return normalizeDigits(sanitize(v, 20)).replace(/[^0-9+]/g, '');
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
  const entityType = reportId ? 'report' : (ticketId ? 'ticket' : '');
  const entityId   = reportId || ticketId || '';
  getDb().prepare(`
    INSERT INTO photos (id, filename, mime_type, size_bytes, report_id, ticket_id,
      entity_type, entity_id, uploaded_by, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, filename, mime, buf.length, reportId, ticketId, entityType, entityId, uploadedBy, ts);

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
   HOSPITALITY MENU ITEM IMAGES  (public — no session required)
   ═══════════════════════════════════════════════════════════════ */
const MENU_IMAGES_DIR = path.join(UPLOADS_DIR, 'menu');
if (!fs.existsSync(MENU_IMAGES_DIR)) fs.mkdirSync(MENU_IMAGES_DIR, { recursive: true });

/** Decode, validate and persist one base64 data URL as a menu item image. Returns filename or null. */
function storeMenuImage(dataUrl) {
  const m = /^data:(image\/(?:jpeg|jpg|png|webp));base64,([A-Za-z0-9+/=]+)$/i.exec(dataUrl);
  if (!m) return null;
  let buf;
  try { buf = Buffer.from(m[2], 'base64'); } catch { return null; }
  if (buf.length === 0 || buf.length > MAX_PHOTO_BYTES) return null;

  const mime = detectMime(buf);
  if (!mime) return null;

  const ext = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' }[mime];
  const filename = crypto.randomBytes(16).toString('hex') + ext;
  const filepath = path.join(MENU_IMAGES_DIR, filename);

  try { fs.writeFileSync(filepath, buf); } catch (e) {
    console.error('[menu-image] write failed:', e.message); return null;
  }
  return filename;
}

/** Remove a previously stored menu image file (best-effort). */
function deleteMenuImage(filename) {
  if (!filename || !/^[a-f0-9]{32}\.(jpg|jpeg|png|webp)$/.test(filename)) return;
  const fp = path.join(MENU_IMAGES_DIR, filename);
  try { if (fp.startsWith(MENU_IMAGES_DIR) && fs.existsSync(fp)) fs.unlinkSync(fp); } catch {}
}

/** Like processPhotos but sets photo_type after storing. */
function processPhotosTyped(raw, uploadedBy, reportId = null, ticketId = null, photoType = 'general') {
  if (!Array.isArray(raw)) return [];
  const db = getDb();
  return raw.slice(0, MAX_PHOTOS)
    .map(d => {
      const p = storePhoto(d, uploadedBy, reportId, ticketId);
      if (p) {
        db.prepare('UPDATE photos SET photo_type = ? WHERE id = ?').run(photoType, p.id);
      }
      return p;
    })
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

  const newExpiry = new Date(Date.now() + SESSION_TIMEOUT_MS).toISOString();
  db.prepare('UPDATE sessions SET last_activity = ?, expires_at = ? WHERE token = ?')
    .run(now(), newExpiry, token);

  const user = db.prepare(
    'SELECT * FROM users WHERE id = ? AND active = 1 AND deleted_at IS NULL'
  ).get(row.user_id);
  if (!user) return null;

  // Attach all roles from user_roles (with fallback to primary role column)
  try {
    const roleRows = db.prepare('SELECT role FROM user_roles WHERE user_id = ?').all(user.id);
    user._roles = roleRows.length ? roleRows.map(r => r.role) : [user.role];
  } catch { user._roles = [user.role]; }

  // Apply active workspace as effective role for this request
  if (row.active_workspace && user._roles.includes(row.active_workspace)) {
    user.role = row.active_workspace;
  }

  return user;
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
   FIELD MAPPERS  (snake_case DB → camelCase frontend)
   ═══════════════════════════════════════════════════════════════ */
const publicUser = u => {
  if (!u) return null;
  return {
    id:                  u.id,
    name:                u.name,
    username:            u.username,
    role:                u.role,
    roles:               u._roles || [u.role],
    active:              u.active === 1 || u.active === true,
    employeeNo:          u.employee_no || '',
    forcePasswordChange: u.force_password_change === 1 || u.force_password_change === true,
    lastPasswordChange:  u.last_password_change || ''
  };
};

const mapLocation = l => l ? {
  id:         l.id,
  type:       l.type,
  nameAr:     l.name_ar,
  nameEn:     l.name_en,
  floor:      l.floor,
  zone:       l.zone,
  priority:   l.priority,
  active:     l.active === 1 || l.active === true,
  facilityId: l.facility_id || '',
  buildingId: l.building_id || '',
  room:       l.room  || '',
  space:      l.space || ''
} : null;

function canManageUsers(role) { return ['system_admin','cleaning_manager'].includes(role); }
function canManageSystem(role){ return ['system_admin','facility_manager','cleaning_manager'].includes(role); }
function canCreateTickets(role){ return ['system_admin','facility_manager','cleaning_manager','cleaning_supervisor'].includes(role); }
function canReview(role)       { return ['system_admin','facility_manager','cleaning_manager','cleaning_supervisor'].includes(role); }
function canDelete(role)       { return ['system_admin','facility_manager','cleaning_manager'].includes(role); }
function allowedRoleEditor(editorRole, targetRole) {
  return editorRole === 'system_admin' || ['cleaning_supervisor','cleaner'].includes(targetRole);
}

/* ── Hospitality permissions ─────────────────────────────────── */
function canHospitalityOverride(role) { return ['system_admin','facility_manager','hospitality_manager'].includes(role); }
function canHospitalityAssign(role)   { return ['system_admin','facility_manager','hospitality_manager','hospitality_supervisor'].includes(role); }
function canHospitalityReview(role)   { return ['system_admin','facility_manager','hospitality_manager','hospitality_supervisor'].includes(role); }
function canHospitalityCreate(role)   { return ['employee','system_admin','facility_manager','hospitality_manager','hospitality_supervisor'].includes(role); }
function canHospitalityAccess(role)   { return ['system_admin','facility_manager','hospitality_manager','hospitality_supervisor','hospitality_worker','employee'].includes(role); }
function canManageHospitalityMenu(role) { return ['system_admin','hospitality_manager'].includes(role); }
function canManageHospitalityKitchens(role) { return ['system_admin','hospitality_manager'].includes(role); }

/* ═══════════════════════════════════════════════════════════════
   DATA HELPERS  (all DB queries → camelCase output)
   ═══════════════════════════════════════════════════════════════ */
function dbUsers() {
  const db    = getDb();
  const users = db.prepare('SELECT * FROM users WHERE deleted_at IS NULL').all();
  const allRoleRows = db.prepare('SELECT user_id, role FROM user_roles').all();
  const roleMap = {};
  for (const r of allRoleRows) {
    if (!roleMap[r.user_id]) roleMap[r.user_id] = [];
    roleMap[r.user_id].push(r.role);
  }
  for (const u of users) {
    u._roles = roleMap[u.id] || [u.role];
  }
  return users;
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
    SELECT r.*,
      GROUP_CONCAT(p.filename)   AS photo_files,
      GROUP_CONCAT(p.photo_type) AS photo_types
    FROM reports r
    LEFT JOIN photos p ON p.report_id = r.id AND p.deleted_at IS NULL
    WHERE r.deleted_at IS NULL
    GROUP BY r.id ORDER BY r.created_at DESC
  `).all().map(reportRow);
}
function dbHospitalityOrders() {
  return getDb().prepare(`
    SELECT * FROM hospitality_orders WHERE deleted_at IS NULL ORDER BY created_at DESC
  `).all().map(hospitalityOrderRow);
}

/** Map DB hospitality_menu_items row → frontend camelCase */
function menuItemRow(r) {
  if (!r) return null;
  return {
    id:            r.id,
    nameAr:        r.name_ar,
    nameEn:        r.name_en,
    descriptionAr: r.description_ar,
    descriptionEn: r.description_en,
    category:      r.category,
    imagePath:     r.image_path ? `/menu-images/${r.image_path}` : '',
    isActive:      r.is_active === 1,
    sortOrder:     r.sort_order,
    createdAt:     r.created_at,
    updatedAt:     r.updated_at
  };
}
function dbMenuItems(activeOnly = false) {
  const sql = `SELECT * FROM hospitality_menu_items WHERE deleted_at IS NULL
    ${activeOnly ? 'AND is_active = 1' : ''}
    ORDER BY sort_order ASC, created_at ASC`;
  return getDb().prepare(sql).all().map(menuItemRow);
}

/** Map DB hospitality_kitchens row (LEFT JOIN users) → frontend camelCase */
function kitchenRow(r) {
  if (!r) return null;
  return {
    id:                  r.id,
    nameAr:              r.name_ar,
    nameEn:              r.name_en,
    locationName:        r.location_name,
    responsibleWorkerId:   r.responsible_worker_id || '',
    responsibleWorkerName: r.responsible_worker_name || '',
    isActive:            r.is_active === 1,
    sortOrder:           r.sort_order,
    createdAt:           r.created_at,
    updatedAt:           r.updated_at
  };
}
function dbKitchens(activeOnly = false) {
  const sql = `SELECT k.*, u.name AS responsible_worker_name
    FROM hospitality_kitchens k
    LEFT JOIN users u ON u.id = k.responsible_worker_id
    WHERE k.deleted_at IS NULL
    ${activeOnly ? 'AND k.is_active = 1' : ''}
    ORDER BY k.sort_order ASC, k.created_at ASC`;
  return getDb().prepare(sql).all().map(kitchenRow);
}

/** Resolve an active kitchen + its responsible worker (for direct order assignment). */
function resolveKitchenAssignment(db, kitchenId) {
  const kitchen = db.prepare(
    'SELECT * FROM hospitality_kitchens WHERE id = ? AND is_active = 1 AND deleted_at IS NULL'
  ).get(kitchenId);
  if (!kitchen) return null;
  let assignedTo = '', assignedToName = '';
  if (kitchen.responsible_worker_id) {
    const worker = db.prepare(
      "SELECT * FROM users WHERE id = ? AND role = 'hospitality_worker' AND active = 1 AND deleted_at IS NULL"
    ).get(kitchen.responsible_worker_id);
    if (worker) { assignedTo = worker.id; assignedToName = worker.name; }
  }
  return { kitchen, assignedTo, assignedToName };
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
    createdById:    r.created_by_id || '',
    status:         r.status,
    priority:       r.priority,
    category:       r.category || 'general',
    referenceNo:    r.reference_no || '',
    notes:          r.notes,
    createdAt:          r.created_at,
    completedAt:                 r.completed_at || '',
    acceptedAt:                  r.accepted_at || '',
    startedAt:                   r.started_at || '',
    verificationRequestedAt:     r.verification_requested_at || '',
    cancelledAt:                 r.cancelled_at || '',
    slaDeadline:                 r.sla_deadline || '',
    slaBreached:                 r.sla_breached === 1,
    responseTimeMins:            r.response_time_mins  ?? null,
    completionTimeMins:          r.completion_time_mins ?? null,
    photos
  };
}

/** Map DB report row → frontend camelCase */
function reportRow(r) {
  if (!r) return null;
  const allPhotos = r.photo_files ? r.photo_files.split(',') : [];
  const allTypes  = r.photo_types ? r.photo_types.split(',') : [];
  const photos = allPhotos.map(f => `/uploads/${f}`);
  const beforePhotos = allPhotos
    .filter((_, i) => (allTypes[i] || 'general') === 'before')
    .map(f => `/uploads/${f}`);
  const afterPhotos = allPhotos
    .filter((_, i) => (allTypes[i] || 'general') === 'after')
    .map(f => `/uploads/${f}`);
  return {
    id:               r.id,
    workerId:         r.worker_id,
    workerName:       r.worker_name,
    locationId:       r.location_id,
    locationNameAr:   r.location_name_ar,
    locationNameEn:   r.location_name_en,
    locationType:     r.location_type,
    status:           r.status,
    tasks:            JSON.parse(r.tasks || '[]'),
    notes:            r.notes,
    createdAt:        r.created_at,
    approvalStatus:   r.approval_status,
    approvedBy:       r.approved_by,
    approvedAt:       r.approved_at || '',
    reviewNote:       r.review_note,
    ratingSupervisor: r.rating_supervisor ?? null,
    ratingManager:    r.rating_manager    ?? null,
    photos,
    beforePhotos,
    afterPhotos
  };
}

/** Map DB hospitality_orders row → frontend camelCase */
function hospitalityOrderRow(r) {
  if (!r) return null;
  return {
    id:             r.id,
    referenceNo:    r.reference_no || '',
    orderType:      r.order_type,
    items:          JSON.parse(r.items || '[]'),
    locationId:     r.location_id,
    locationNameAr: r.location_name_ar,
    locationNameEn: r.location_name_en,
    requestedBy:    r.requested_by,
    requestedById:  r.requested_by_id,
    requesterName:  r.requester_name  || '',
    requesterPhone: r.requester_phone || '',
    assignedTo:     r.assigned_to,
    assignedToName: r.assigned_to_name,
    kitchenId:      r.kitchen_id      || '',
    kitchenNameAr:  r.kitchen_name_ar || '',
    kitchenNameEn:  r.kitchen_name_en || '',
    status:         r.status,
    notes:          r.notes,
    slaDeadline:    r.sla_deadline || '',
    slaBreached:    r.sla_breached === 1,
    createdAt:      r.created_at,
    updatedAt:      r.updated_at,
    acceptedAt:     r.accepted_at  || '',
    readyAt:        r.ready_at     || '',
    deliveredAt:    r.delivered_at || '',
    completedAt:    r.completed_at || '',
    cancelledAt:    r.cancelled_at || '',
    rejectedAt:     r.rejected_at  || ''
  };
}

/** Strip internal fields for the unauthenticated public hospitality endpoints. */
function publicHospitalityOrder(o) {
  return {
    id:             o.id,
    referenceNo:    o.referenceNo,
    orderType:      o.orderType,
    items:          o.items,
    locationNameAr: o.locationNameAr,
    locationNameEn: o.locationNameEn,
    kitchenNameAr:  o.kitchenNameAr,
    kitchenNameEn:  o.kitchenNameEn,
    status:         o.status,
    notes:          o.notes,
    createdAt:      o.createdAt,
    updatedAt:      o.updatedAt
  };
}

/* ── Role-filtered bootstrap payload ─────────────────────────── */
/** Hospitality orders visible to `me`, scoped by role. */
function hospitalityOrdersForRole(me, allOrders) {
  if (me.role === 'employee')            return allOrders.filter(o => o.requestedById === me.id);
  if (me.role === 'hospitality_worker')  return allOrders.filter(o => o.assignedTo === me.id);
  if (['hospitality_supervisor','hospitality_manager','system_admin','facility_manager'].includes(me.role)) return allOrders;
  return [];
}

function buildBootstrap(me) {
  const users       = dbUsers();
  const locations   = dbLocs();          // already mapped to camelCase
  const zones       = dbZones();
  const assignments = dbAssignments();
  const settings    = dbSettings();
  const allTickets  = dbTickets();
  const allReports  = dbReports();
  const allHospitalityOrders = dbHospitalityOrders();

  const base = { user: publicUser(me), locations, zones, settings };
  const hospitalityOrders = hospitalityOrdersForRole(me, allHospitalityOrders);

  if (me.role === 'employee') {
    return {
      ...base,
      users:       [publicUser(me)],
      assignments: [],
      tickets:     allTickets.filter(t => t.createdById === me.id),
      reports:     [],
      hospitalityOrders
    };
  }
  if (me.role === 'cleaner') {
    const myAssign = assignments.find(a => a.workerId === me.id);
    return {
      ...base,
      users:       [publicUser(me)],
      assignments: myAssign ? [myAssign] : [],
      tickets:     allTickets.filter(t => t.assignedTo === me.id),
      reports:     allReports.filter(r => r.workerId  === me.id),
      hospitalityOrders
    };
  }
  if (me.role === 'cleaning_supervisor') {
    return {
      ...base,
      users:       users.filter(u => ['cleaner','cleaning_supervisor'].includes(u.role)).map(publicUser),
      assignments,
      tickets:     allTickets,
      reports:     allReports,
      hospitalityOrders
    };
  }
  if (me.role === 'hospitality_worker') {
    return {
      ...base,
      users:       [publicUser(me)],
      assignments: [],
      tickets:     [],
      reports:     [],
      hospitalityOrders
    };
  }
  if (me.role === 'hospitality_supervisor' || me.role === 'hospitality_manager') {
    return {
      ...base,
      users:       users.filter(u => ['hospitality_worker','hospitality_supervisor','hospitality_manager'].includes(u.role)).map(publicUser),
      assignments: [],
      tickets:     [],
      reports:     [],
      hospitalityOrders
    };
  }
  // admin / facility_manager / cleaning_manager — full view
  return {
    ...base,
    users:       users.map(publicUser),
    assignments,
    tickets:     allTickets,
    reports:     allReports,
    hospitalityOrders
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
   REFERENCE NUMBER GENERATOR  (CLN-YYYY-XXXXXX)
   ═══════════════════════════════════════════════════════════════ */
function generateRefNo(db, prefix = 'CLN') {
  const year = new Date().getFullYear();
  const key  = `${prefix.toLowerCase()}_ref_seq_${year}`;
  const row  = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  const seq  = parseInt(row?.value || '0', 10) + 1;
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, String(seq));
  return `${prefix.toUpperCase()}-${year}-${String(seq).padStart(6, '0')}`;
}

function logEvent(db, eventType, entityType, entityId, actor, payload = {}, module = 'cleaning') {
  try {
    db.prepare(`
      INSERT INTO event_log
        (event_type, module, entity_type, entity_id, actor_id, actor_role, payload, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      eventType, module, entityType, entityId,
      actor?.id   || '',
      actor?.role || '',
      JSON.stringify(payload),
      now()
    );
  } catch (e) { console.error('[event]', e.message); }
}

/* ═══════════════════════════════════════════════════════════════
   SLA
   ═══════════════════════════════════════════════════════════════ */
const SLA_MINS = { emergency: 15, spill: 30, restroom: 30, meeting_room: 60, general: 240 };

function slaMins(category) { return SLA_MINS[category] || SLA_MINS.general; }

function computeSlaDeadline(category) {
  return new Date(Date.now() + slaMins(category) * 60_000).toISOString();
}

// Periodic SLA breach check every 5 minutes
setInterval(() => {
  try {
    getDb().prepare(
      "UPDATE tickets SET sla_breached=1,updated_at=? WHERE sla_deadline < ? AND status NOT IN ('completed','rejected','cancelled') AND sla_breached=0 AND deleted_at IS NULL"
    ).run(now(), now());
  } catch {}
}, 300_000);

/* ═══════════════════════════════════════════════════════════════
   AUTO-ASSIGNMENT
   Pick the worker assigned to the location with fewest open tickets.
   Returns { id, name } or null if no worker covers this location.
   ═══════════════════════════════════════════════════════════════ */
function autoAssign(locationId, db) {
  return db.prepare(`
    SELECT a.worker_id AS id, u.name,
      (SELECT COUNT(*) FROM tickets
       WHERE assigned_to = a.worker_id
         AND status NOT IN ('completed','rejected','cancelled')
         AND deleted_at IS NULL) AS open_count
    FROM assignments a
    JOIN  users u ON u.id = a.worker_id
      AND u.active = 1 AND u.deleted_at IS NULL AND u.role = 'cleaner'
    WHERE a.location_id = ?
    ORDER BY open_count ASC
    LIMIT 1
  `).get(locationId) || null;
}

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
          return send(res, 401, { error: 'INVALID_LOGIN' });
        }
        const token = crypto.randomBytes(32).toString('hex');
        sessionCreate(token, u.id, ip, ua);
        setSessionCookie(res, token);
        return send(res, 200, {
          user: publicUser(u),
          forcePasswordChange: u.force_password_change === 1
        });
      }

      /* ── LOGOUT ─────────────────────────────────────────────── */
      if (req.method === 'POST' && url.pathname === '/api/logout') {
        const me = sessionGetUser(req);
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

      /* ── PUBLIC HOSPITALITY: CREATE ORDER (no login required) ─── */
      if (req.method === 'POST' && url.pathname === '/api/public/hospitality/orders') {
        if (!checkRateLimit(ip)) return send(res, 429, { error: 'TOO_MANY_ATTEMPTS' });
        const db = getDb();
        const b = await bodyJSON(req);
        const requesterName  = sanitize(b.requesterName, 100);
        const requesterPhone = sanitizePhone(b.requesterPhone);
        if (!requesterName || !requesterPhone) return send(res, 400, { error: 'MISSING_FIELDS' });
        const loc = db.prepare('SELECT * FROM locations WHERE id = ? AND deleted_at IS NULL').get(sanitize(b.locationId, 80));
        if (!loc) return send(res, 404, { error: 'LOCATION_NOT_FOUND' });
        const kitchenId = sanitize(b.kitchenId, 80);
        if (!kitchenId) return send(res, 400, { error: 'MISSING_FIELDS' });
        const kitchenInfo = resolveKitchenAssignment(db, kitchenId);
        if (!kitchenInfo) return send(res, 404, { error: 'KITCHEN_NOT_FOUND' });
        const { kitchen, assignedTo, assignedToName } = kitchenInfo;
        const orderType = sanitize(b.orderType || 'general', 50) || 'general';
        const items = Array.isArray(b.items) ? b.items.slice(0, 20).map(i => sanitize(String(i), 100)) : [];
        const refNo = generateRefNo(db, 'HSP');
        const id    = newId('h');
        const ts    = now();
        const slaDeadline = new Date(Date.now() + HOSPITALITY_SLA_MINS * 60_000).toISOString();
        db.prepare(`
          INSERT INTO hospitality_orders (id,reference_no,order_type,items,location_id,location_name_ar,location_name_en,
            requested_by,requested_by_id,requester_name,requester_phone,assigned_to,assigned_to_name,
            kitchen_id,kitchen_name_ar,kitchen_name_en,status,notes,sla_deadline,created_at,updated_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `).run(id, refNo, orderType, JSON.stringify(items), loc.id, loc.name_ar, loc.name_en,
               requesterName, '', requesterName, requesterPhone, assignedTo, assignedToName,
               kitchen.id, kitchen.name_ar, kitchen.name_en, 'submitted', sanitize(b.notes, 1000), slaDeadline, ts, ts);
        const order = hospitalityOrderRow(db.prepare('SELECT * FROM hospitality_orders WHERE id = ?').get(id));
        broadcast('hospitality_order_created', { order });
        logEvent(db, 'hospitality.submitted', 'hospitality_order', id, { id: '', role: 'public' }, { refNo, orderType, locationId: loc.id, public: true }, 'hospitality');
        return send(res, 200, { order: publicHospitalityOrder(order) });
      }

      /* ── PUBLIC HOSPITALITY: MY ORDERS BY PHONE (no login required) ── */
      if (req.method === 'GET' && url.pathname === '/api/public/hospitality/orders') {
        if (!checkRateLimit(ip)) return send(res, 429, { error: 'TOO_MANY_ATTEMPTS' });
        const db = getDb();
        const phone = sanitizePhone(url.searchParams.get('phone'));
        if (!phone) return send(res, 400, { error: 'MISSING_PHONE' });
        const orders = db.prepare(
          'SELECT * FROM hospitality_orders WHERE requester_phone = ? AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 50'
        ).all(phone).map(hospitalityOrderRow).map(publicHospitalityOrder);
        return send(res, 200, { orders });
      }

      /* ── PUBLIC: HOSPITALITY MENU (no login required) ─────────── */
      if (req.method === 'GET' && url.pathname === '/api/public/hospitality/menu') {
        return send(res, 200, { items: dbMenuItems(true) });
      }

      /* ── PUBLIC: HOSPITALITY KITCHENS (no login required) ─────── */
      if (req.method === 'GET' && url.pathname === '/api/public/hospitality/kitchens') {
        const kitchens = dbKitchens(true).map(k => ({ id: k.id, nameAr: k.nameAr, nameEn: k.nameEn, locationName: k.locationName }));
        return send(res, 200, { kitchens });
      }

      /* ── PUBLIC: LOCATIONS LIST (no login required) ──────────── */
      if (req.method === 'GET' && url.pathname === '/api/public/locations') {
        const db = getDb();
        const rows = db.prepare(
          'SELECT id, name_ar, name_en, type FROM locations WHERE active = 1 AND deleted_at IS NULL ORDER BY name_ar'
        ).all();
        const locations = rows.map(l => ({ id: l.id, nameAr: l.name_ar, nameEn: l.name_en, type: l.type }));
        return send(res, 200, { locations });
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
        try {
          db.prepare('INSERT OR IGNORE INTO user_roles (user_id,role,module,created_at) VALUES (?,?,?,?)')
            .run(id, role, 'cleaning', ts);
        } catch {}
        const u = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
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
        return send(res, 200, { user: publicUser(updated) });
      }

      /* ── USERS: RESET PASSWORD (system_admin only) ────────────── */
      if (req.method === 'PATCH' && /^\/api\/users\/[^/]+\/password$/.test(url.pathname)) {
        if (me.role !== 'system_admin') return send(res, 403, { error: 'FORBIDDEN' });
        const id = sanitize(url.pathname.split('/')[3], 50);
        const u  = db.prepare('SELECT * FROM users WHERE id = ? AND deleted_at IS NULL').get(id);
        if (!u) return send(res, 404, { error: 'USER_NOT_FOUND' });
        const b = await bodyJSON(req);
        const newPwd = sanitize(b.password, 200);
        if (newPwd.length < 8) return send(res, 400, { error: 'WEAK_PASSWORD' });
        db.prepare(`
          UPDATE users SET password = ?, force_password_change = 1,
          last_password_change = '', updated_at = ? WHERE id = ?
        `).run(hashPassword(newPwd), now(), id);
        logEvent(db, 'user.password_reset', 'user', id, me, { targetUsername: u.username }, 'system');
        const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
        return send(res, 200, { user: publicUser(updated) });
      }

      /* ── USERS: DELETE (soft) — must be exactly /api/users/:id ── */
      if (req.method === 'DELETE' && url.pathname.startsWith('/api/users/')
          && url.pathname.split('/').length === 4) {
        if (!canManageUsers(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        const id = sanitize(url.pathname.split('/').pop(), 50);
        const u  = db.prepare('SELECT * FROM users WHERE id = ? AND deleted_at IS NULL').get(id);
        if (!u) return send(res, 404, { error: 'USER_NOT_FOUND' });
        if (u.username === 'admin') return send(res, 403, { error: 'CANNOT_DELETE_SYSADMIN' });
        if (id === me.id) return send(res, 403, { error: 'CANNOT_DELETE_SELF' });
        db.prepare('UPDATE users SET deleted_at = ?, updated_at = ?, active = 0 WHERE id = ?').run(now(), now(), id);
        db.prepare('DELETE FROM assignments WHERE worker_id = ?').run(id);
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
        return send(res, 200, { ok: true });
      }

      /* ── TICKETS: CREATE ────────────────────────────────────── */
      if (req.method === 'POST' && url.pathname === '/api/tickets') {
        if (!canCreateTickets(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        const b   = await bodyJSON(req);
        const loc = db.prepare('SELECT * FROM locations WHERE id = ? AND deleted_at IS NULL').get(b.locationId);
        if (!loc) return send(res, 400, { error: 'MISSING_LOCATION' });
        // Worker is optional — auto-assign if not provided
        let worker = null;
        if (b.assignedTo) {
          worker = db.prepare('SELECT * FROM users WHERE id = ? AND active = 1 AND deleted_at IS NULL').get(b.assignedTo);
          if (!worker) return send(res, 400, { error: 'WORKER_NOT_FOUND' });
        } else {
          const auto = autoAssign(loc.id, db);
          if (auto) worker = db.prepare('SELECT * FROM users WHERE id = ?').get(auto.id);
        }
        const id            = newId('t');
        const ts            = now();
        const priority      = ['high','medium','low'].includes(b.priority) ? b.priority : 'medium';
        const category      = sanitize(b.category || 'general', 50);
        const slaDeadline   = computeSlaDeadline(category);
        const initialStatus = worker ? 'assigned' : 'submitted';
        db.prepare(`
          INSERT INTO tickets (id,title,description,location_id,location_name_ar,location_name_en,
            assigned_to,assigned_to_name,created_by,created_by_id,status,priority,
            category,reference_no,notes,sla_deadline,created_at,updated_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `).run(id, sanitize(b.title, 200) || 'بلاغ نظافة',
               sanitize(b.description, 1000), loc.id, loc.name_ar, loc.name_en,
               worker?.id || null, worker?.name || '',
               me.name, me.id, initialStatus, priority, category, '', '', slaDeadline, ts, ts);
        const ticket = ticketRow(db.prepare(`
          SELECT t.*, NULL AS photo_files FROM tickets t WHERE t.id = ?
        `).get(id));
        broadcast('ticket_created', { ticket });
        logEvent(db, 'ticket.submitted', 'ticket', id, me, { category, status: initialStatus, locationId: loc.id });
        return send(res, 200, { ticket });
      }

      /* ── TICKETS: COMPLETE ──────────────────────────────────── */
      if (req.method === 'POST' && url.pathname === '/api/tickets/complete') {
        const b = await bodyJSON(req);
        const t = db.prepare('SELECT * FROM tickets WHERE id = ? AND deleted_at IS NULL').get(b.id);
        if (!t) return send(res, 404, { error: 'TICKET_NOT_FOUND' });
        if (me.role === 'cleaner' && t.assigned_to !== me.id) return send(res, 403, { error: 'FORBIDDEN' });
        if (!(TICKET_TRANSITIONS[t.status] || []).includes('waiting_verification')) {
          return send(res, 400, { error: 'INVALID_TRANSITION' });
        }
        processPhotos(b.photos, me.id, null, t.id);
        const completionMins = Math.round((Date.now() - new Date(t.created_at).getTime()) / 60_000);
        const slaBreached    = t.sla_deadline && new Date(t.sla_deadline) < new Date() ? 1 : (t.sla_breached || 0);
        const completedTs    = now();
        db.prepare(`
          UPDATE tickets SET status='waiting_verification', notes=?, updated_at=?,
            completion_time_mins=?, sla_breached=? WHERE id=?
        `).run(sanitize(b.notes, 1000), completedTs, completionMins, slaBreached, t.id);
        const ticket = ticketRow(db.prepare(`
          SELECT t.*, GROUP_CONCAT(p.filename) AS photo_files
          FROM tickets t LEFT JOIN photos p ON p.ticket_id=t.id AND p.deleted_at IS NULL
          WHERE t.id=? GROUP BY t.id
        `).get(t.id));
        broadcast('ticket_waiting_verification', { ticket });
        logEvent(db, 'ticket.waiting_verification', 'ticket', t.id, me, { completionMins });
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
        if (b.status !== undefined) {
          if (!TICKET_STATUSES.includes(b.status)) return send(res, 400, { error: 'INVALID_STATUS' });
          if (b.status !== t.status) {
            if (!(TICKET_TRANSITIONS[t.status] || []).includes(b.status)) {
              return send(res, 400, { error: 'INVALID_TRANSITION' });
            }
            sets.push('status = ?'); vals.push(b.status);
            const ts = now();
            if (b.status === 'completed')  { sets.push('completed_at = ?'); vals.push(ts); }
            if (b.status === 'accepted')   { sets.push('accepted_at = ?');  vals.push(ts); }
            if (b.status === 'in_progress'){ sets.push('started_at = ?');   vals.push(ts); }
            if (b.status === 'cancelled')  { sets.push('cancelled_at = ?'); vals.push(ts); }
          }
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
        return send(res, 200, { ticket });
      }

      /* ── TICKETS: DELETE (soft) ─────────────────────────────── */
      if (req.method === 'DELETE' && url.pathname.startsWith('/api/tickets/')) {
        if (!['system_admin','cleaning_manager'].includes(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        const id = sanitize(url.pathname.split('/').pop(), 50);
        const t  = db.prepare('SELECT 1 FROM tickets WHERE id = ? AND deleted_at IS NULL').get(id);
        if (!t) return send(res, 404, { error: 'TICKET_NOT_FOUND' });
        db.prepare('UPDATE tickets SET deleted_at = ?, updated_at = ? WHERE id = ?').run(now(), now(), id);
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
        // Support before/after typed photos, fallback to legacy `photos` as 'general'
        if (Array.isArray(b.beforePhotos) && b.beforePhotos.length) {
          processPhotosTyped(b.beforePhotos, me.id, id, null, 'before');
        }
        if (Array.isArray(b.afterPhotos) && b.afterPhotos.length) {
          processPhotosTyped(b.afterPhotos, me.id, id, null, 'after');
        }
        if (!b.beforePhotos && !b.afterPhotos) {
          processPhotos(b.photos, me.id, id, null);
        }
        const report = reportRow(db.prepare(`
          SELECT r.*,
            GROUP_CONCAT(p.filename)   AS photo_files,
            GROUP_CONCAT(p.photo_type) AS photo_types
          FROM reports r LEFT JOIN photos p ON p.report_id=r.id AND p.deleted_at IS NULL
          WHERE r.id=? GROUP BY r.id
        `).get(id));
        broadcast('report_created', { report });
        logEvent(db, 'report.created', 'report', id, me, { locationId: loc.id, photoCount: report.photos.length });
        return send(res, 200, { report });
      }

      /* ── REPORTS: REVIEW ────────────────────────────────────── */
      if (req.method === 'POST' && url.pathname === '/api/reports/review') {
        if (!canReview(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        const b = await bodyJSON(req);
        const r = db.prepare('SELECT * FROM reports WHERE id = ? AND deleted_at IS NULL').get(b.id);
        if (!r) return send(res, 404, { error: 'REPORT_NOT_FOUND' });
        if (!REPORT_REVIEW_STATUSES.includes(b.status)) return send(res, 400, { error: 'INVALID_STATUS' });
        if (r.approval_status !== 'pending') return send(res, 400, { error: 'ALREADY_REVIEWED' });
        const status   = b.status;
        const reviewTs = now();
        db.prepare(`
          UPDATE reports SET approval_status=?, approved_by=?, approved_at=?, review_note=?, updated_at=? WHERE id=?
        `).run(status, me.name, reviewTs, sanitize(b.note, 500), reviewTs, b.id);
        db.prepare(`
          INSERT INTO approval_history
            (entity_type, entity_id, level, approver_id, approver_role, action, notes, created_at)
          VALUES ('report', ?, 1, ?, ?, ?, ?, ?)
        `).run(b.id, me.id, me.role, status, sanitize(b.note || '', 500), reviewTs);
        const report = reportRow(db.prepare(`
          SELECT r.*, GROUP_CONCAT(p.filename) AS photo_files, GROUP_CONCAT(p.photo_type) AS photo_types
          FROM reports r LEFT JOIN photos p ON p.report_id=r.id AND p.deleted_at IS NULL
          WHERE r.id=? GROUP BY r.id
        `).get(b.id));
        broadcast('report_reviewed', { report, reviewedBy: me.name });
        const reviewEventMap = { approved: 'report.approved', rejected: 'report.rejected', needs_recleaning: 'report.reclean_required' };
        logEvent(db, reviewEventMap[status] || 'report.reviewed', 'report', b.id, me, { status, note: b.note || '' });
        return send(res, 200, { report });
      }

      /* ── REPORTS: DELETE (soft) ─────────────────────────────── */
      if (req.method === 'DELETE' && url.pathname.startsWith('/api/reports/')) {
        if (!canDelete(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        const id = sanitize(url.pathname.split('/').pop(), 50);
        const r  = db.prepare('SELECT 1 FROM reports WHERE id = ? AND deleted_at IS NULL').get(id);
        if (!r) return send(res, 404, { error: 'REPORT_NOT_FOUND' });
        db.prepare('UPDATE reports SET deleted_at = ?, updated_at = ? WHERE id = ?').run(now(), now(), id);
        return send(res, 200, { ok: true });
      }

      /* ── WORKSPACE SWITCH ───────────────────────────────────── */
      if (req.method === 'POST' && url.pathname === '/api/workspace') {
        const b = await bodyJSON(req);
        const workspace = sanitize(b.workspace || '', 50);
        if (!workspace || !me._roles || !me._roles.includes(workspace))
          return send(res, 403, { error: 'ROLE_NOT_ALLOWED' });
        const token = parseCookies(req)[SESSION_COOKIE];
        db.prepare('UPDATE sessions SET active_workspace = ? WHERE token = ?').run(workspace, token);
        const updatedMe = { ...me, role: workspace };
        return send(res, 200, buildBootstrap(updatedMe));
      }

      /* ── USER ROLES: ADD ────────────────────────────────────── */
      if (req.method === 'POST' && /^\/api\/users\/[^/]+\/roles$/.test(url.pathname)) {
        if (!canManageUsers(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        const userId = url.pathname.split('/')[3];
        const u = db.prepare('SELECT 1 FROM users WHERE id = ? AND deleted_at IS NULL').get(userId);
        if (!u) return send(res, 404, { error: 'USER_NOT_FOUND' });
        const b    = await bodyJSON(req);
        const role = sanitize(b.role || '', 50);
        if (!role || !ALLOWED_ROLES.includes(role)) return send(res, 400, { error: 'INVALID_ROLE' });
        if (!allowedRoleEditor(me.role, role)) return send(res, 403, { error: 'ROLE_NOT_ALLOWED' });
        db.prepare('INSERT OR IGNORE INTO user_roles (user_id,role,module,created_at) VALUES (?,?,?,?)')
          .run(userId, role, 'cleaning', now());
        return send(res, 200, { ok: true });
      }

      /* ── USER ROLES: REMOVE ─────────────────────────────────── */
      if (req.method === 'DELETE' && /^\/api\/users\/[^/]+\/roles\/[^/]+$/.test(url.pathname)) {
        if (!canManageUsers(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        const parts  = url.pathname.split('/');
        const userId = parts[3];
        const role   = parts[5];
        if (!role || !ALLOWED_ROLES.includes(role)) return send(res, 400, { error: 'INVALID_ROLE' });
        const cnt = db.prepare('SELECT COUNT(*) AS c FROM user_roles WHERE user_id = ?').get(userId).c;
        if (cnt <= 1) return send(res, 400, { error: 'CANNOT_REMOVE_LAST_ROLE' });
        db.prepare('DELETE FROM user_roles WHERE user_id = ? AND role = ?').run(userId, role);
        return send(res, 200, { ok: true });
      }

      /* ── SLA REPORT ─────────────────────────────────────────── */
      if (req.method === 'GET' && url.pathname === '/api/sla-report') {
        if (!canReview(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        const days = Math.min(parseInt(url.searchParams.get('days') || '30', 10), 365);
        const from = new Date(Date.now() - days * 86400_000).toISOString();
        const rows = db.prepare(`
          SELECT category,
            COUNT(*) AS total,
            SUM(CASE WHEN sla_breached=1 THEN 1 ELSE 0 END) AS breached,
            AVG(CASE WHEN completion_time_mins IS NOT NULL THEN completion_time_mins ELSE NULL END) AS avg_completion_mins
          FROM tickets
          WHERE created_at >= ? AND deleted_at IS NULL
          GROUP BY category
        `).all(from);
        const categories = rows.map(r => ({
          category:       r.category,
          total:          r.total,
          breached:       r.breached,
          complianceRate: r.total > 0 ? Math.round((r.total - r.breached) / r.total * 100) : 100,
          avgCompletionMins: r.avg_completion_mins ? Math.round(r.avg_completion_mins) : null,
          slaMins:        slaMins(r.category)
        }));
        return send(res, 200, { categories, days, generatedAt: now() });
      }

      /* ── EMPLOYEE ORDER: CREATE (employee portal) ───────────── */
      if (req.method === 'POST' && url.pathname === '/api/order') {
        if (me.role !== 'employee') return send(res, 403, { error: 'FORBIDDEN' });
        const b   = await bodyJSON(req);
        const loc = db.prepare('SELECT * FROM locations WHERE id = ? AND deleted_at IS NULL').get(sanitize(b.locationId, 80));
        if (!loc) return send(res, 404, { error: 'LOCATION_NOT_FOUND' });
        const VALID_CATS = ['general','spill','restroom','meeting_room','emergency'];
        const category   = VALID_CATS.includes(b.category) ? b.category : 'general';
        const autoPriority = { emergency: 'high', spill: 'high', meeting_room: 'high', restroom: 'medium', general: 'medium' };
        const priority   = autoPriority[category] || ((['high','medium','low'].includes(b.priority)) ? b.priority : 'medium');
        const refNo      = generateRefNo(db);
        const CAT_TITLES = { general:'طلب تنظيف', spill:'بلاغ انسكاب', restroom:'مشكلة دورة مياه', meeting_room:'تنظيف قاعة اجتماع', emergency:'تنظيف طارئ' };
        const title      = sanitize(b.title || '', 200) || CAT_TITLES[category] || 'طلب تنظيف';
        const worker = autoAssign(loc.id, db);
        const workerUser = worker ? db.prepare('SELECT * FROM users WHERE id = ?').get(worker.id) : null;
        const id          = newId('t');
        const ts          = now();
        const slaDeadline = computeSlaDeadline(category);
        const orderStatus = workerUser ? 'assigned' : 'submitted';
        db.prepare(`
          INSERT INTO tickets (id,title,description,location_id,location_name_ar,location_name_en,
            assigned_to,assigned_to_name,created_by,created_by_id,status,priority,
            category,reference_no,notes,sla_deadline,created_at,updated_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `).run(id, title, sanitize(b.description, 1000),
               loc.id, loc.name_ar, loc.name_en,
               workerUser?.id || null, workerUser?.name || '',
               me.name, me.id, orderStatus, priority, category, refNo, '', slaDeadline, ts, ts);
        // Optional photo
        if (b.photo) {
          processPhotosTyped([b.photo], me.id, null, id, 'general');
        }
        const ticket = ticketRow(db.prepare('SELECT t.*, NULL AS photo_files FROM tickets t WHERE t.id = ?').get(id));
        broadcast('ticket_created', { ticket });
        logEvent(db, 'ticket.submitted', 'ticket', id, me, { category, refNo, status: orderStatus, locationId: loc.id });
        return send(res, 200, { ticket, autoAssigned: !!workerUser });
      }

      /* ── PERFORMANCE METRICS (supervisor/manager) ────────────── */
      if (req.method === 'GET' && url.pathname === '/api/performance') {
        if (!canReview(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        const workers = db.prepare(
          "SELECT * FROM users WHERE role='cleaner' AND active=1 AND deleted_at IS NULL"
        ).all();
        const now30 = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
        const nowStr = now();
        const metrics = workers.map(w => {
          const reports30 = db.prepare(
            "SELECT * FROM reports WHERE worker_id=? AND created_at>=? AND deleted_at IS NULL ORDER BY created_at DESC"
          ).all(w.id, now30);
          const total = db.prepare("SELECT COUNT(*) AS c FROM reports WHERE worker_id=? AND deleted_at IS NULL").get(w.id).c;
          const reviewed = reports30.filter(r => r.approval_status !== 'pending');
          const approved = reviewed.filter(r => r.approval_status === 'approved').length;
          const approvalRate = reviewed.length > 0 ? Math.round(approved / reviewed.length * 100) : null;
          const avgRatingSup = (() => {
            const rated = reports30.filter(r => r.rating_supervisor != null);
            return rated.length ? Math.round(rated.reduce((s,r) => s + r.rating_supervisor, 0) / rated.length * 10) / 10 : null;
          })();
          const avgRatingMgr = (() => {
            const rated = reports30.filter(r => r.rating_manager != null);
            return rated.length ? Math.round(rated.reduce((s,r) => s + r.rating_manager, 0) / rated.length * 10) / 10 : null;
          })();
          const openTickets = db.prepare(
            "SELECT COUNT(*) AS c FROM tickets WHERE assigned_to=? AND status NOT IN ('completed','rejected','cancelled') AND deleted_at IS NULL"
          ).get(w.id).c;
          const locCount = db.prepare(
            "SELECT COUNT(*) AS c FROM assignments WHERE worker_id=?"
          ).get(w.id).c;
          // Quality score (client-side formula mirror)
          const avgQuality = reports30.length ? Math.round(
            reports30.reduce((sum, r) => {
              const photos = (r.photo_files || '').split(',').filter(Boolean).length;
              const tasks  = JSON.parse(r.tasks || '[]').length;
              return sum + Math.min(100, (photos >= 2 ? 45 : photos ? 25 : 0) + (tasks >= 4 ? 45 : tasks * 8) + (r.notes ? 10 : 0));
            }, 0) / reports30.length
          ) : 0;
          // Workload score: open_tickets / max(1, assigned_locations)
          const workloadScore = Math.round(openTickets / Math.max(1, locCount) * 100);
          // Month reports
          const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0);
          const thisMonth = db.prepare(
            "SELECT COUNT(*) AS c FROM reports WHERE worker_id=? AND created_at>=? AND deleted_at IS NULL"
          ).get(w.id, monthStart.toISOString()).c;
          return {
            id: w.id, name: w.name, username: w.username, employeeNo: w.employee_no || '',
            total, thisMonth, reportsLast30: reports30.length,
            approvalRate, avgQuality, avgRatingSupervisor: avgRatingSup, avgRatingManager: avgRatingMgr,
            openTickets, locCount, workloadScore
          };
        });
        return send(res, 200, { metrics, generatedAt: now() });
      }

      /* ── REPORT RATING (cleaning_manager only — same-module rating governance) ── */
      if (req.method === 'POST' && url.pathname === '/api/reports/rate') {
        if (me.role !== 'cleaning_manager') return send(res, 403, { error: 'FORBIDDEN' });
        const b    = await bodyJSON(req);
        const rpt  = db.prepare('SELECT 1 FROM reports WHERE id = ? AND deleted_at IS NULL').get(b.id);
        if (!rpt) return send(res, 404, { error: 'REPORT_NOT_FOUND' });
        const value = parseFloat(b.value);
        if (isNaN(value) || value < 1 || value > 5) return send(res, 400, { error: 'INVALID_RATING' });
        const col = b.ratingType === 'manager' ? 'rating_manager' : 'rating_supervisor';
        db.prepare(`UPDATE reports SET ${col} = ?, updated_at = ? WHERE id = ?`).run(value, now(), b.id);
        return send(res, 200, { ok: true });
      }

      /* ── HOSPITALITY: CREATE ORDER ────────────────────────────── */
      if (req.method === 'POST' && url.pathname === '/api/hospitality/orders') {
        if (!canHospitalityCreate(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        const b   = await bodyJSON(req);
        const loc = db.prepare('SELECT * FROM locations WHERE id = ? AND deleted_at IS NULL').get(sanitize(b.locationId, 80));
        if (!loc) return send(res, 404, { error: 'LOCATION_NOT_FOUND' });
        const kitchenId = sanitize(b.kitchenId, 80);
        if (!kitchenId) return send(res, 400, { error: 'MISSING_FIELDS' });
        const kitchenInfo = resolveKitchenAssignment(db, kitchenId);
        if (!kitchenInfo) return send(res, 404, { error: 'KITCHEN_NOT_FOUND' });
        const { kitchen, assignedTo, assignedToName } = kitchenInfo;
        const orderType = sanitize(b.orderType || 'general', 50) || 'general';
        const items = Array.isArray(b.items) ? b.items.slice(0, 20).map(i => sanitize(String(i), 100)) : [];
        const refNo = generateRefNo(db, 'HSP');
        const id    = newId('h');
        const ts    = now();
        const slaDeadline = new Date(Date.now() + HOSPITALITY_SLA_MINS * 60_000).toISOString();
        db.prepare(`
          INSERT INTO hospitality_orders (id,reference_no,order_type,items,location_id,location_name_ar,location_name_en,
            requested_by,requested_by_id,assigned_to,assigned_to_name,
            kitchen_id,kitchen_name_ar,kitchen_name_en,status,notes,sla_deadline,created_at,updated_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `).run(id, refNo, orderType, JSON.stringify(items), loc.id, loc.name_ar, loc.name_en,
               me.name, me.id, assignedTo, assignedToName,
               kitchen.id, kitchen.name_ar, kitchen.name_en, 'submitted', sanitize(b.notes, 1000), slaDeadline, ts, ts);
        const order = hospitalityOrderRow(db.prepare('SELECT * FROM hospitality_orders WHERE id = ?').get(id));
        broadcast('hospitality_order_created', { order });
        logEvent(db, 'hospitality.submitted', 'hospitality_order', id, me, { refNo, orderType, locationId: loc.id }, 'hospitality');
        return send(res, 200, { order });
      }

      /* ── HOSPITALITY: LIST ORDERS (scoped by role) ────────────── */
      if (req.method === 'GET' && url.pathname === '/api/hospitality/orders') {
        if (!canHospitalityAccess(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        const orders = hospitalityOrdersForRole(me, dbHospitalityOrders());
        return send(res, 200, { orders });
      }

      /* ── HOSPITALITY: ASSIGN ORDER TO WORKER ──────────────────── */
      if (req.method === 'POST' && /^\/api\/hospitality\/orders\/[^/]+\/assign$/.test(url.pathname)) {
        if (!canHospitalityAssign(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        const id    = url.pathname.split('/')[4];
        const order = db.prepare('SELECT * FROM hospitality_orders WHERE id = ? AND deleted_at IS NULL').get(id);
        if (!order) return send(res, 404, { error: 'NOT_FOUND' });
        if (HOSPITALITY_TERMINAL.includes(order.status)) return send(res, 400, { error: 'INVALID_TRANSITION' });
        const b      = await bodyJSON(req);
        const worker = db.prepare(
          "SELECT * FROM users WHERE id = ? AND role='hospitality_worker' AND active=1 AND deleted_at IS NULL"
        ).get(sanitize(b.workerId, 80));
        if (!worker) return send(res, 404, { error: 'WORKER_NOT_FOUND' });
        const ts = now();
        db.prepare('UPDATE hospitality_orders SET assigned_to=?, assigned_to_name=?, updated_at=? WHERE id=?')
          .run(worker.id, worker.name, ts, id);
        const updated = hospitalityOrderRow(db.prepare('SELECT * FROM hospitality_orders WHERE id = ?').get(id));
        broadcast('hospitality_order_updated', { order: updated });
        logEvent(db, 'hospitality.assigned', 'hospitality_order', id, me, { workerId: worker.id, workerName: worker.name }, 'hospitality');
        return send(res, 200, { order: updated });
      }

      /* ── HOSPITALITY: UPDATE ORDER STATUS ─────────────────────── */
      if (req.method === 'PUT' && /^\/api\/hospitality\/orders\/[^/]+$/.test(url.pathname)) {
        const id    = url.pathname.split('/')[4];
        const order = db.prepare('SELECT * FROM hospitality_orders WHERE id = ? AND deleted_at IS NULL').get(id);
        if (!order) return send(res, 404, { error: 'NOT_FOUND' });
        const b = await bodyJSON(req);
        const newStatus = b.status;
        if (!HOSPITALITY_STATUSES.includes(newStatus)) return send(res, 400, { error: 'INVALID_STATUS' });
        if (HOSPITALITY_TERMINAL.includes(order.status)) return send(res, 400, { error: 'INVALID_TRANSITION' });

        let allowed;
        if (canHospitalityOverride(me.role)) {
          allowed = HOSPITALITY_TRANSITIONS[order.status] || [];
        } else if (me.role === 'hospitality_supervisor') {
          allowed = HOSPITALITY_SUPERVISOR_TRANSITIONS[order.status] || [];
        } else if (me.role === 'hospitality_worker') {
          if (order.assigned_to !== me.id) return send(res, 403, { error: 'FORBIDDEN' });
          allowed = HOSPITALITY_WORKER_TRANSITIONS[order.status] || [];
        } else if (me.role === 'employee') {
          if (order.requested_by_id !== me.id) return send(res, 403, { error: 'FORBIDDEN' });
          allowed = HOSPITALITY_EMPLOYEE_TRANSITIONS[order.status] || [];
        } else {
          return send(res, 403, { error: 'FORBIDDEN' });
        }
        if (!allowed.includes(newStatus)) return send(res, 400, { error: 'INVALID_TRANSITION' });

        const ts = now();
        const TIMESTAMP_COL = { accepted: 'accepted_at', ready: 'ready_at', delivered: 'delivered_at', completed: 'completed_at', cancelled: 'cancelled_at', rejected: 'rejected_at' };
        const fields = ['status=?', 'updated_at=?'];
        const params = [newStatus, ts];
        if (TIMESTAMP_COL[newStatus]) { fields.push(`${TIMESTAMP_COL[newStatus]}=?`); params.push(ts); }
        if (b.notes !== undefined) { fields.push('notes=?'); params.push(sanitize(b.notes, 1000)); }
        params.push(id);
        db.prepare(`UPDATE hospitality_orders SET ${fields.join(',')} WHERE id=?`).run(...params);

        const updated = hospitalityOrderRow(db.prepare('SELECT * FROM hospitality_orders WHERE id = ?').get(id));
        broadcast('hospitality_order_updated', { order: updated });
        logEvent(db, 'hospitality.status_changed', 'hospitality_order', id, me, { from: order.status, to: newStatus }, 'hospitality');
        return send(res, 200, { order: updated });
      }

      /* ── HOSPITALITY: PERFORMANCE / SLA SUMMARY ───────────────── */
      if (req.method === 'GET' && url.pathname === '/api/hospitality/performance') {
        if (!canHospitalityReview(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        const all = dbHospitalityOrders();
        const byStatus = {};
        for (const s of HOSPITALITY_STATUSES) byStatus[s] = 0;
        for (const o of all) byStatus[o.status] = (byStatus[o.status] || 0) + 1;
        const completedOrders = all.filter(o => o.status === 'completed' && o.completedAt);
        const avgCompletionMins = completedOrders.length
          ? Math.round(completedOrders.reduce((sum, o) => sum + (new Date(o.completedAt) - new Date(o.createdAt)) / 60000, 0) / completedOrders.length)
          : null;
        const overdue = all.filter(o => !HOSPITALITY_TERMINAL.includes(o.status) && o.slaDeadline && new Date(o.slaDeadline) < new Date()).length;
        const workers = db.prepare(
          "SELECT id,name FROM users WHERE role='hospitality_worker' AND active=1 AND deleted_at IS NULL"
        ).all();
        const workerStats = workers.map(w => ({
          workerId:  w.id,
          name:      w.name,
          completed: all.filter(o => o.assignedTo === w.id && o.status === 'completed').length,
          open:      all.filter(o => o.assignedTo === w.id && !HOSPITALITY_TERMINAL.includes(o.status)).length
        }));
        return send(res, 200, { byStatus, avgCompletionMins, overdue, totalOrders: all.length, workers: workerStats, generatedAt: now() });
      }

      /* ── HOSPITALITY MENU: LIST (admin / hospitality_manager — incl. inactive) ── */
      if (req.method === 'GET' && url.pathname === '/api/hospitality/menu') {
        if (!canManageHospitalityMenu(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        return send(res, 200, { items: dbMenuItems(false) });
      }

      /* ── HOSPITALITY MENU: CREATE ITEM ─────────────────────────── */
      if (req.method === 'POST' && url.pathname === '/api/hospitality/menu') {
        if (!canManageHospitalityMenu(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        const b = await bodyJSON(req);
        const nameAr = sanitize(b.nameAr, 100);
        const nameEn = sanitize(b.nameEn, 100);
        if (!nameAr && !nameEn) return send(res, 400, { error: 'MISSING_FIELDS' });
        let imageFile = '';
        if (b.image) {
          imageFile = storeMenuImage(b.image);
          if (!imageFile) return send(res, 400, { error: 'INVALID_IMAGE' });
        }
        const id = newId('mi');
        const ts = now();
        db.prepare(`
          INSERT INTO hospitality_menu_items
            (id,name_ar,name_en,description_ar,description_en,category,image_path,is_active,sort_order,created_at,updated_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,?)
        `).run(id, nameAr, nameEn, sanitize(b.descriptionAr, 300), sanitize(b.descriptionEn, 300),
               sanitize(b.category, 50) || 'other', imageFile, 1, parseInt(b.sortOrder, 10) || 0, ts, ts);
        const item = menuItemRow(db.prepare('SELECT * FROM hospitality_menu_items WHERE id=?').get(id));
        logEvent(db, 'hospitality.menu_item_created', 'hospitality_menu_item', id, me, { nameAr, nameEn }, 'hospitality');
        broadcast('hospitality_menu_updated', { item });
        return send(res, 200, { item });
      }

      /* ── HOSPITALITY MENU: UPDATE ITEM (incl. soft-disable via isActive) ── */
      if (req.method === 'PUT' && /^\/api\/hospitality\/menu\/[^/]+$/.test(url.pathname)) {
        if (!canManageHospitalityMenu(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        const id = url.pathname.split('/')[4];
        const existing = db.prepare('SELECT * FROM hospitality_menu_items WHERE id = ? AND deleted_at IS NULL').get(id);
        if (!existing) return send(res, 404, { error: 'NOT_FOUND' });
        const b = await bodyJSON(req);
        const fields = [], params = [];
        if (b.nameAr        !== undefined) { fields.push('name_ar=?');        params.push(sanitize(b.nameAr, 100)); }
        if (b.nameEn        !== undefined) { fields.push('name_en=?');        params.push(sanitize(b.nameEn, 100)); }
        if (b.descriptionAr !== undefined) { fields.push('description_ar=?'); params.push(sanitize(b.descriptionAr, 300)); }
        if (b.descriptionEn !== undefined) { fields.push('description_en=?'); params.push(sanitize(b.descriptionEn, 300)); }
        if (b.category      !== undefined) { fields.push('category=?');       params.push(sanitize(b.category, 50) || 'other'); }
        if (b.sortOrder     !== undefined) { fields.push('sort_order=?');     params.push(parseInt(b.sortOrder, 10) || 0); }
        if (b.isActive      !== undefined) { fields.push('is_active=?');      params.push(b.isActive ? 1 : 0); }
        if (b.image) {
          const imageFile = storeMenuImage(b.image);
          if (!imageFile) return send(res, 400, { error: 'INVALID_IMAGE' });
          fields.push('image_path=?'); params.push(imageFile);
          if (existing.image_path) deleteMenuImage(existing.image_path);
        } else if (b.image === '') {
          fields.push('image_path=?'); params.push('');
          if (existing.image_path) deleteMenuImage(existing.image_path);
        }
        if (!fields.length) return send(res, 400, { error: 'NO_FIELDS' });
        fields.push('updated_at=?'); params.push(now());
        params.push(id);
        db.prepare(`UPDATE hospitality_menu_items SET ${fields.join(',')} WHERE id=?`).run(...params);
        const item = menuItemRow(db.prepare('SELECT * FROM hospitality_menu_items WHERE id=?').get(id));
        logEvent(db, 'hospitality.menu_item_updated', 'hospitality_menu_item', id, me, { isActive: item.isActive }, 'hospitality');
        broadcast('hospitality_menu_updated', { item });
        return send(res, 200, { item });
      }

      /* ── HOSPITALITY KITCHENS: LIST (system_admin / hospitality_manager — incl. inactive) ── */
      if (req.method === 'GET' && url.pathname === '/api/hospitality/kitchens') {
        if (!canManageHospitalityKitchens(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        return send(res, 200, { kitchens: dbKitchens(false) });
      }

      /* ── HOSPITALITY KITCHENS: CREATE ────────────────────────── */
      if (req.method === 'POST' && url.pathname === '/api/hospitality/kitchens') {
        if (!canManageHospitalityKitchens(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        const b = await bodyJSON(req);
        const nameAr = sanitize(b.nameAr, 100);
        const nameEn = sanitize(b.nameEn, 100);
        if (!nameAr && !nameEn) return send(res, 400, { error: 'MISSING_FIELDS' });
        let responsibleWorkerId = '';
        if (b.responsibleWorkerId) {
          const worker = db.prepare(
            "SELECT id FROM users WHERE id = ? AND role = 'hospitality_worker' AND active = 1 AND deleted_at IS NULL"
          ).get(sanitize(b.responsibleWorkerId, 80));
          if (!worker) return send(res, 400, { error: 'WORKER_NOT_FOUND' });
          responsibleWorkerId = worker.id;
        }
        const id = newId('kit');
        const ts = now();
        db.prepare(`
          INSERT INTO hospitality_kitchens
            (id,name_ar,name_en,location_name,responsible_worker_id,is_active,sort_order,created_at,updated_at)
          VALUES (?,?,?,?,?,?,?,?,?)
        `).run(id, nameAr, nameEn, sanitize(b.locationName, 150), responsibleWorkerId || null, 1, parseInt(b.sortOrder, 10) || 0, ts, ts);
        const kitchen = kitchenRow(db.prepare(
          'SELECT k.*, u.name AS responsible_worker_name FROM hospitality_kitchens k LEFT JOIN users u ON u.id = k.responsible_worker_id WHERE k.id=?'
        ).get(id));
        logEvent(db, 'hospitality.kitchen_created', 'hospitality_kitchen', id, me, { nameAr, nameEn }, 'hospitality');
        broadcast('hospitality_kitchen_updated', { kitchen });
        return send(res, 200, { kitchen });
      }

      /* ── HOSPITALITY KITCHENS: UPDATE (incl. soft-disable via isActive) ── */
      if (req.method === 'PUT' && /^\/api\/hospitality\/kitchens\/[^/]+$/.test(url.pathname)) {
        if (!canManageHospitalityKitchens(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        const id = url.pathname.split('/')[4];
        const existing = db.prepare('SELECT * FROM hospitality_kitchens WHERE id = ? AND deleted_at IS NULL').get(id);
        if (!existing) return send(res, 404, { error: 'NOT_FOUND' });
        const b = await bodyJSON(req);
        const fields = [], params = [];
        if (b.nameAr        !== undefined) { fields.push('name_ar=?');       params.push(sanitize(b.nameAr, 100)); }
        if (b.nameEn        !== undefined) { fields.push('name_en=?');       params.push(sanitize(b.nameEn, 100)); }
        if (b.locationName  !== undefined) { fields.push('location_name=?'); params.push(sanitize(b.locationName, 150)); }
        if (b.sortOrder     !== undefined) { fields.push('sort_order=?');    params.push(parseInt(b.sortOrder, 10) || 0); }
        if (b.isActive      !== undefined) { fields.push('is_active=?');     params.push(b.isActive ? 1 : 0); }
        if (b.responsibleWorkerId !== undefined) {
          if (b.responsibleWorkerId) {
            const worker = db.prepare(
              "SELECT id FROM users WHERE id = ? AND role = 'hospitality_worker' AND active = 1 AND deleted_at IS NULL"
            ).get(sanitize(b.responsibleWorkerId, 80));
            if (!worker) return send(res, 400, { error: 'WORKER_NOT_FOUND' });
            fields.push('responsible_worker_id=?'); params.push(worker.id);
          } else {
            fields.push('responsible_worker_id=?'); params.push(null);
          }
        }
        if (!fields.length) return send(res, 400, { error: 'NO_FIELDS' });
        fields.push('updated_at=?'); params.push(now());
        params.push(id);
        db.prepare(`UPDATE hospitality_kitchens SET ${fields.join(',')} WHERE id=?`).run(...params);
        const kitchen = kitchenRow(db.prepare(
          'SELECT k.*, u.name AS responsible_worker_name FROM hospitality_kitchens k LEFT JOIN users u ON u.id = k.responsible_worker_id WHERE k.id=?'
        ).get(id));
        logEvent(db, 'hospitality.kitchen_updated', 'hospitality_kitchen', id, me, { isActive: kitchen.isActive }, 'hospitality');
        broadcast('hospitality_kitchen_updated', { kitchen });
        return send(res, 200, { kitchen });
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

    /* ── MENU ITEM IMAGES — public, no auth (product photos only) ── */
    if (url.pathname.startsWith('/menu-images/')) {
      const fname = path.basename(url.pathname);
      if (!/^[a-f0-9]{32}\.(jpg|png|webp)$/.test(fname))
        return send(res, 403, 'Forbidden', 'text/plain');
      const fp = path.join(MENU_IMAGES_DIR, fname);
      if (!fp.startsWith(MENU_IMAGES_DIR) || !fs.existsSync(fp))
        return send(res, 404, 'Not found', 'text/plain');
      const ct = fname.endsWith('.png') ? 'image/png' : fname.endsWith('.webp') ? 'image/webp' : 'image/jpeg';
      setSecurityHeaders(res);
      res.writeHead(200, { 'Content-Type': ct, 'Cache-Control': 'public, max-age=86400' });
      res.end(fs.readFileSync(fp));
      return;
    }

    /* ── HEALTH CHECK ──────────────────────────────────────── */
    if (url.pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, db: !!process.env.DB_PATH, ts: Date.now() }));
      return;
    }

    /* ── PUBLIC HOSPITALITY REQUEST PAGE — SPA route, no auth ── */
    if (url.pathname === '/order/hospitality' || url.pathname.startsWith('/order/hospitality/')) {
      url.pathname = '/index.html';
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
    // HTML and app JS/CSS: never cache — always serve fresh on redeploy.
    // Static assets (fonts, icons, QR lib) get a 1-hour cache.
    const noCache = ['.html','.js','.css'].includes(ext);
    const headers = {
      'Content-Type': types[ext] || 'application/octet-stream',
      'Cache-Control': noCache ? 'no-store' : 'public, max-age=3600'
    };
    res.writeHead(200, headers);
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
    admin:       process.env.ADMIN_PASSWORD           ||
                 process.env.DEMO_ADMIN_PASSWORD      || rndPwd(),
    fm:          process.env.DEMO_FM_PASSWORD         || rndPwd(),
    manager:     process.env.DEMO_MANAGER_PASSWORD    || rndPwd(),
    supervisor:  process.env.DEMO_SUPERVISOR_PASSWORD || rndPwd(),
    worker:      process.env.DEMO_WORKER_PASSWORD     || rndPwd(),
    hospitality: process.env.DEMO_HOSPITALITY_PASSWORD || rndPwd()
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
      ['u-w7','عامل 7','worker7',pw.worker,'cleaner'],
      ['u-emp1','موظف 1','employee1',pw.worker,'employee'],
      ['u-emp2','موظف 2','employee2',pw.worker,'employee'],
      ['u-hosp-mgr','مدير الضيافة','hosp-manager',pw.hospitality,'hospitality_manager'],
      ['u-hosp-sup','مشرف الضيافة','hosp-supervisor',pw.hospitality,'hospitality_supervisor'],
      ['u-hosp-w1','عامل ضيافة 1','hosp-worker1',pw.hospitality,'hospitality_worker'],
      ['u-hosp-w2','عامل ضيافة 2','hosp-worker2',pw.hospitality,'hospitality_worker']
    ].forEach(([id,name,username,pass,role]) => {
      insUser.run(id,name,username,hashPassword(pass),role,ts,ts);
      const module = role.startsWith('hospitality_') ? 'hospitality' : 'cleaning';
      try {
        db.prepare('INSERT OR IGNORE INTO user_roles (user_id,role,module,created_at) VALUES (?,?,?,?)')
          .run(id, role, module, ts);
      } catch {}
    });
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
       assigned_to,assigned_to_name,created_by,created_by_id,status,priority,notes,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?,'مدير النظافة','u-clean-manager','assigned','high','',?,?)
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
  console.log(`║   employee1-2: ${pw.worker.padEnd(42)}║`);
  console.log(`║   hosp-*     : ${pw.hospitality.padEnd(42)}║`);
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
  const dbPath = process.env.DB_PATH || 'data.db';
  const hasPersistentVolume = process.env.DB_PATH && process.env.DB_PATH.startsWith('/');
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║   REGA Facility Care — PROTOTYPE / نسخة تجريبية          ║');
  console.log('║   بيانات غير حقيقية — Demo Data Only                     ║');
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log(`║   Port    : ${String(PORT).padEnd(47)}║`);
  console.log(`║   Database: ${String(dbPath).padEnd(47)}║`);
  console.log(`║   Uploads : ${String(UPLOADS_DIR).slice(0, 47).padEnd(47)}║`);
  console.log(`║   Users   : ${String(userCount).padEnd(47)}║`);
  console.log('╚══════════════════════════════════════════════════════════╝');
  if(!hasPersistentVolume){
    console.log('');
    console.log('⚠️  WARNING: DB_PATH not set — using ephemeral local storage.');
    console.log('   On Railway/cloud: set DB_PATH to a persistent volume path');
    console.log('   e.g. DB_PATH=/data/rega.db to prevent data loss on redeploy.');
  }
  console.log('');
});
