'use strict';
const http   = require('http');
const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');
const webpush = require('web-push');
const { getDb } = require('./db');
const { isTrustedMutation } = require('./server/middleware/security');
const permissions = require('./server/middleware/permissions');
const { handlePlatformRoutes } = require('./server/routes/platform.routes');

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
const ADMIN_COORDINATOR_ROLE = permissions.ADMIN_COORDINATOR_ROLE;
const ALLOWED_ROLES      = ['system_admin','facility_manager',ADMIN_COORDINATOR_ROLE,'cleaning_manager','cleaning_supervisor','cleaner','employee','hospitality_manager','hospitality_supervisor','hospitality_worker','maintenance_manager','maintenance_supervisor','maintenance_worker'];

/* ═══════════════════════════════════════════════════════════════
   TICKET STATUS STATE MACHINE
   ═══════════════════════════════════════════════════════════════ */
const TICKET_STATUSES  = ['submitted','assigned','accepted','diagnosing','in_progress','awaiting_parts','awaiting_vendor','awaiting_permit','on_hold','waiting_verification','completed','reclean_required','rejected','cancelled'];
const TICKET_TERMINAL  = ['completed','rejected','cancelled'];
const TICKET_TRANSITIONS = {
  submitted:            ['assigned','cancelled','rejected'],
  assigned:             ['accepted','diagnosing','in_progress','waiting_verification','reclean_required','submitted','cancelled','rejected'],
  accepted:             ['diagnosing','in_progress','waiting_verification','cancelled','rejected'],
  diagnosing:           ['in_progress','awaiting_parts','awaiting_vendor','awaiting_permit','on_hold','waiting_verification','cancelled','rejected'],
  in_progress:          ['awaiting_parts','awaiting_vendor','awaiting_permit','on_hold','waiting_verification','cancelled','rejected'],
  awaiting_parts:       ['in_progress','on_hold','cancelled'],
  awaiting_vendor:      ['in_progress','on_hold','cancelled'],
  awaiting_permit:      ['in_progress','on_hold','cancelled'],
  on_hold:              ['diagnosing','in_progress','awaiting_parts','awaiting_vendor','awaiting_permit','cancelled'],
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
  const csp = [
    "default-src 'self'",
    "script-src 'self'",
    "script-src-elem 'self'",
    "script-src-attr 'none'",
    "style-src 'self'",
    "style-src-elem 'self'",
    "style-src-attr 'none'",
    "object-src 'none'",
    "img-src 'self' data: blob: https://api.qrserver.com",
    "font-src 'self'",
    "connect-src 'self'",
    "media-src 'self' blob:",
    "worker-src 'self' blob:",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'"
  ];
  if (IS_HTTPS) csp.push('upgrade-insecure-requests');
  res.setHeader('Content-Security-Policy', csp.join('; '));
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
  const p = normalizeDigits(sanitize(v, 20)).replace(/[^0-9+]/g, '');
  if (!p || p.length < 9) return null;
  return p;
}
function normalizeLocationId(v) {
  return normalizeDigits(sanitize(v, 80)).replace(/[–—]/g, '-').trim();
}
function locationIdVariants(v) {
  const normalized = normalizeLocationId(v);
  return [...new Set([normalized, normalized.toUpperCase()].filter(Boolean))];
}
function getLocationByAnyId(db, id, activeOnly = false) {
  const ids = locationIdVariants(id);
  if (!ids.length) return null;
  return db.prepare(`
    SELECT * FROM locations
    WHERE id IN (${ids.map(() => '?').join(',')})
      ${activeOnly ? 'AND active = 1' : ''}
      AND deleted_at IS NULL
  `).get(...ids);
}

function normalizeServiceModules(value, fallbackType = '', fallbackId = '') {
  const allowed = new Set(['cleaning', 'maintenance', 'hospitality', 'safety', 'security']);
  const raw = Array.isArray(value)
    ? value
    : String(value || '').split(',');
  const modules = [...new Set(raw.map(v => sanitize(v, 30).toLowerCase()).filter(v => allowed.has(v)))];
  if (modules.length) return modules;
  const id = String(fallbackId || '').toUpperCase();
  const type = String(fallbackType || '').toLowerCase();
  if (id.includes('-CAM-')) return ['maintenance'];
  if (id.includes('-FS-') || id.includes('-FE-') || id.includes('-EXT-')) return ['maintenance', 'safety'];
  if (['office', 'meeting_room', 'lobby', 'pantry'].includes(type)) return ['cleaning', 'maintenance', 'hospitality'];
  if (['restroom', 'pantry', 'prayer_room', 'corridor', 'lobby', 'entrance', 'parking', 'outdoor'].includes(type)) return ['cleaning', 'maintenance'];
  return ['cleaning', 'maintenance'];
}

function serviceModulesText(value, fallbackType = '', fallbackId = '') {
  return normalizeServiceModules(value, fallbackType, fallbackId).join(',');
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

const PHOTO_TYPE_WHITELIST = ['before', 'after', 'general', 'escalation'];

/** Like processPhotos but sets photo_type after storing. */
function processPhotosTyped(raw, uploadedBy, reportId = null, ticketId = null, photoType = 'general') {
  const safeType = PHOTO_TYPE_WHITELIST.includes(photoType) ? photoType : 'general';
  if (!Array.isArray(raw)) return [];
  const db = getDb();
  return raw.slice(0, MAX_PHOTOS)
    .map(d => {
      const p = storePhoto(d, uploadedBy, reportId, ticketId);
      if (p) {
        db.prepare('UPDATE photos SET photo_type = ? WHERE id = ?').run(safeType, p.id);
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
    defaultLocationId:   u.default_location_id || '',
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
  space:      l.space || '',
  serviceModules: normalizeServiceModules(l.service_modules, l.type, l.id)
} : null;

const mapLocationGroup = g => g ? {
  id:         g.id,
  nameAr:     g.name_ar,
  nameEn:     g.name_en,
  floor:      g.floor,
  type:       g.type,
  active:     g.active === 1 || g.active === true,
  memberIds:  g.memberIds || []
} : null;

function canManageGlobalUsers(role) { return permissions.canManageGlobalUsers(role); }
function canManageModuleTeam(role) { return permissions.canManageModuleTeam(role); }
function canManageUsers(role) { return canManageGlobalUsers(role) || canManageModuleTeam(role); }
function canViewUsers(role) { return permissions.canViewUsers(role); }
function canManageSystem(role){ return permissions.canManageSystemSettings(role); }
function canManageFacilities(role){ return permissions.canManageFacilities(role); }
function canViewFacilities(role){ return permissions.canViewFacilities(role); }
function canViewAuditLog(role){ return permissions.canViewAuditLog(role); }
function canExportReports(role){ return permissions.canExportReports(role); }
function canCreateTickets(role){ return ['system_admin','facility_manager','cleaning_manager','cleaning_supervisor'].includes(role); }
function canReview(role)       { return ['system_admin','facility_manager','cleaning_manager','cleaning_supervisor'].includes(role); }
function canDelete(role)       { return ['system_admin','facility_manager','cleaning_manager'].includes(role); }
function allowedRoleEditor(editorRole, targetRole) {
  if (editorRole === 'system_admin') return true;
  return permissions.canEditModuleRole(editorRole, targetRole);
}

function moduleForRole(role) {
  if (['system_admin', 'facility_manager', ADMIN_COORDINATOR_ROLE, 'employee'].includes(role)) return 'system';
  if (String(role || '').startsWith('maintenance_')) return 'maintenance';
  if (String(role || '').startsWith('hospitality_')) return 'hospitality';
  return 'cleaning';
}

function rolesForUserId(db, userId) {
  const user = db.prepare('SELECT role FROM users WHERE id = ? AND deleted_at IS NULL').get(userId);
  if (!user) return [];
  const rows = db.prepare('SELECT role FROM user_roles WHERE user_id = ?').all(userId);
  return rows.length ? rows.map(r => r.role) : [user.role];
}

function userHasRole(db, userId, role) {
  return rolesForUserId(db, userId).includes(role);
}

function userRowHasAnyRole(user, roles) {
  const owned = user?._roles?.length ? user._roles : [user?.role].filter(Boolean);
  return roles.some(role => owned.includes(role));
}

/* ── Hospitality permissions ─────────────────────────────────── */
function canHospitalityOverride(role) { return ['system_admin','facility_manager','hospitality_manager'].includes(role); }
function canHospitalityAssign(role)   { return ['system_admin','facility_manager','hospitality_manager','hospitality_supervisor'].includes(role); }
function canHospitalityReview(role)   { return ['system_admin','facility_manager','hospitality_manager','hospitality_supervisor'].includes(role); }
function canHospitalityCreate(role)   { return ['employee','system_admin','facility_manager','hospitality_manager','hospitality_supervisor'].includes(role); }
function canHospitalityAccess(role)   { return ['system_admin','facility_manager','hospitality_manager','hospitality_supervisor','hospitality_worker','employee'].includes(role); }
function canManageHospitalityMenu(role) { return ['system_admin','hospitality_manager'].includes(role); }
function canManageHospitalityKitchens(role) { return ['system_admin','hospitality_manager'].includes(role); }

/* ── Inventory permissions ───────────────────────────────────── */
function canInventory(role) { return ['system_admin','facility_manager'].includes(role); }

/* ── Maintenance permissions ─────────────────────────────────── */
function canMaintenanceAccess(role)  { return ['system_admin','facility_manager','maintenance_manager','maintenance_supervisor','maintenance_worker','employee'].includes(role); }
function canMaintenanceCreate(role)  { return ['system_admin','facility_manager','maintenance_manager','maintenance_supervisor'].includes(role); }
function canMaintenanceAssign(role)  { return ['system_admin','facility_manager','maintenance_manager','maintenance_supervisor'].includes(role); }
function canMaintenanceReview(role)  { return ['system_admin','facility_manager','maintenance_manager','maintenance_supervisor'].includes(role); }
function canMaintenanceDelete(role)  { return ['system_admin','facility_manager','maintenance_manager'].includes(role); }

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
function dbLocationGroups() {
  const db = getDb();
  db.prepare(`
    UPDATE location_groups
    SET active = 0, deleted_at = COALESCE(deleted_at, ?), updated_at = ?
    WHERE deleted_at IS NULL
      AND (
        SELECT COUNT(*)
        FROM location_group_members gm
        JOIN locations l ON l.id = gm.location_id
        WHERE gm.group_id = location_groups.id AND l.deleted_at IS NULL
      ) < 2
  `).run(now(), now());
  const groups = db.prepare('SELECT * FROM location_groups WHERE deleted_at IS NULL ORDER BY floor, id').all();
  const members = db.prepare(`
    SELECT group_id, location_id
    FROM location_group_members gm
    JOIN locations l ON l.id = gm.location_id
    WHERE l.deleted_at IS NULL
    ORDER BY group_id, location_id
  `).all();
  const memberMap = {};
  members.forEach(row => {
    if (!memberMap[row.group_id]) memberMap[row.group_id] = [];
    memberMap[row.group_id].push(row.location_id);
  });
  return groups.map(g => mapLocationGroup({ ...g, memberIds: memberMap[g.id] || [] }));
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
    prototypeMode:    s.prototype_mode    === '1',
    employeeCleaningRequestsEnabled: s.employee_cleaning_requests_enabled !== '0',
    employeeMaintenanceRequestsEnabled: s.employee_maintenance_requests_enabled !== '0',
    employeeHospitalityRequestsEnabled: s.employee_hospitality_requests_enabled !== '0',
    cleaningRestroomHourly: {
      enabled: s.cleaning_restroom_hourly_enabled !== '0',
      startHour: Math.max(0, Math.min(23, parseInt(s.cleaning_restroom_hourly_start_hour, 10) || 7)),
      endHour: Math.max(0, Math.min(23, parseInt(s.cleaning_restroom_hourly_end_hour, 10) || 14))
    },
    slaMins: {
      emergency:    parseInt(s.sla_mins_emergency,   10) || SLA_MINS.emergency,
      spill:        parseInt(s.sla_mins_spill,        10) || SLA_MINS.spill,
      restroom:     parseInt(s.sla_mins_restroom,     10) || SLA_MINS.restroom,
      meeting_room: parseInt(s.sla_mins_meeting_room, 10) || SLA_MINS.meeting_room,
      general:      parseInt(s.sla_mins_general,      10) || SLA_MINS.general
    }
  };
}
function dbAssignments() {
  const rows = getDb().prepare('SELECT worker_id, location_id, supervisor_id, module FROM assignments').all();
  const map  = {};
  rows.forEach(r => {
    const module = r.module || 'cleaning';
    const key = `${module}:${r.worker_id}`;
    if (!map[key]) map[key] = { workerId: r.worker_id, module, locationIds: [], supervisorId: r.supervisor_id || '' };
    map[key].locationIds.push(r.location_id);
    if (r.supervisor_id) map[key].supervisorId = r.supervisor_id;
  });
  return Object.values(map);
}
function dbTickets()  {
  return getDb().prepare(`
    SELECT t.*, GROUP_CONCAT(p.filename) AS photo_files,
      GROUP_CONCAT(p.photo_type) AS photo_types
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
function dbRecurringTasks() {
  return getDb().prepare(
    'SELECT * FROM recurring_tasks WHERE deleted_at IS NULL ORDER BY created_at DESC'
  ).all().map(r => ({
    id:             r.id,
    locationId:     r.location_id,
    locationNameAr: r.location_name_ar,
    locationNameEn: r.location_name_en,
    category:       r.category,
    titleAr:        r.title_ar,
    frequencyMins:  r.frequency_mins,
    nextRunAt:      r.next_run_at,
    lastRunAt:      r.last_run_at || '',
    createdBy:      r.created_by,
    active:         r.active === 1,
    createdAt:      r.created_at,
    updatedAt:      r.updated_at
  }));
}

function safeJson(value, fallback = []) {
  try { return JSON.parse(value || JSON.stringify(fallback)); } catch { return fallback; }
}

function dbMaintenanceAssets() {
  return getDb().prepare(`
    SELECT a.*, l.name_ar AS location_name_ar, l.name_en AS location_name_en
    FROM maintenance_assets a
    LEFT JOIN locations l ON l.id=a.location_id
    WHERE a.deleted_at IS NULL ORDER BY a.created_at DESC
  `).all().map(a => ({
    id:a.id, code:a.code, nameAr:a.name_ar, nameEn:a.name_en, category:a.category,
    locationId:a.location_id, locationNameAr:a.location_name_ar||'', locationNameEn:a.location_name_en||'',
    serialNo:a.serial_no, manufacturer:a.manufacturer, model:a.model,
    warrantyUntil:a.warranty_until||'', criticality:a.criticality, status:a.status,
    installedAt:a.installed_at||'', createdAt:a.created_at, updatedAt:a.updated_at
  }));
}

function dbMaintenanceAssignees(workOrderIds = null) {
  const db = getDb();
  const rows = db.prepare(`SELECT * FROM maintenance_work_order_assignees ORDER BY is_lead DESC, assigned_at`).all();
  const allowed = workOrderIds ? new Set(workOrderIds) : null;
  return rows.filter(r => !allowed || allowed.has(r.work_order_id)).map(r => ({
    workOrderId:r.work_order_id, technicianId:r.technician_id, technicianName:r.technician_name,
    isLead:r.is_lead===1, status:r.status, assignedAt:r.assigned_at,
    acceptedAt:r.accepted_at||'', completedAt:r.completed_at||''
  }));
}

function dbMaintenanceSchedules() {
  return getDb().prepare(`
    SELECT * FROM maintenance_schedules WHERE deleted_at IS NULL ORDER BY next_run_at
  `).all().map(s => ({
    id:s.id, titleAr:s.title_ar, titleEn:s.title_en, assetIds:safeJson(s.asset_ids),
    locationId:s.location_id, category:s.category, checklist:safeJson(s.checklist),
    frequencyUnit:s.frequency_unit, frequencyValue:s.frequency_value, nextRunAt:s.next_run_at,
    estimatedMins:s.estimated_mins, defaultTechnicianIds:safeJson(s.default_technician_ids),
    leadTechnicianId:s.lead_technician_id, active:s.active===1, createdBy:s.created_by,
    lastRunAt:s.last_run_at||'', createdAt:s.created_at, updatedAt:s.updated_at
  }));
}

function dbMaintenanceParts() {
  return getDb().prepare(`SELECT * FROM maintenance_parts WHERE deleted_at IS NULL ORDER BY name_ar`).all().map(p => ({
    id:p.id, sku:p.sku, nameAr:p.name_ar, nameEn:p.name_en, unit:p.unit,
    quantity:p.quantity, reorderLevel:p.reorder_level, unitCost:p.unit_cost,
    location:p.location, active:p.active===1, lowStock:p.quantity<=p.reorder_level,
    createdAt:p.created_at, updatedAt:p.updated_at
  }));
}

function dbMaintenanceOrderParts(workOrderIds = null) {
  const rows = getDb().prepare(`SELECT * FROM maintenance_work_order_parts ORDER BY created_at`).all();
  const allowed = workOrderIds ? new Set(workOrderIds) : null;
  return rows.filter(r => !allowed || allowed.has(r.work_order_id)).map(r => ({
    id:r.id, workOrderId:r.work_order_id, partId:r.part_id, partName:r.part_name,
    quantity:r.quantity, unitCost:r.unit_cost, totalCost:r.quantity*r.unit_cost,
    createdBy:r.created_by, createdAt:r.created_at
  }));
}

function dbUtilityBills() {
  return getDb().prepare(`SELECT * FROM utility_bills WHERE deleted_at IS NULL ORDER BY created_at`).all().map(b => ({
    id:b.id, utility:b.utility, buildingType:b.building_type, beneficiary:b.beneficiary,
    customerNo:b.customer_no, invoiceNo:b.invoice_no, periodFrom:b.period_from, periodTo:b.period_to,
    amountBefore:b.amount_before, tax:b.tax, total:b.amount_before + b.tax,
    createdBy:b.created_by, createdAt:b.created_at, updatedAt:b.updated_at
  }));
}

function maintenancePayload(me, tickets) {
  const ids = tickets.map(t => t.id);
  return {
    assets: dbMaintenanceAssets(),
    schedules: dbMaintenanceSchedules(),
    parts: dbMaintenanceParts(),
    assignees: dbMaintenanceAssignees(ids),
    orderParts: dbMaintenanceOrderParts(ids),
    utilityBills: dbUtilityBills()
  };
}

/* ── Inventory row mappers ───────────────────────────────────── */
function warehouseRow(r) {
  if (!r) return null;
  return {
    id: r.id, nameAr: r.name_ar, nameEn: r.name_en, code: r.code,
    facilityId: r.facility_id || '', buildingId: r.building_id || '',
    locationId: r.location_id || '', type: r.type,
    status: r.status, notes: r.notes,
    createdAt: r.created_at, updatedAt: r.updated_at
  };
}
function inventoryItemRow(r) {
  if (!r) return null;
  return {
    id: r.id, nameAr: r.name_ar, nameEn: r.name_en, sku: r.sku,
    category: r.category, unit: r.unit, moduleScope: r.module_scope,
    isConsumable: r.is_consumable === 1,
    minStockLevel: r.min_stock_level, reorderLevel: r.reorder_level,
    active: r.active === 1, createdAt: r.created_at, updatedAt: r.updated_at
  };
}
function stockBalanceRow(r) {
  if (!r) return null;
  const avail = r.quantity_on_hand - r.quantity_reserved;
  return {
    warehouseId: r.warehouse_id, itemId: r.item_id,
    quantityOnHand: r.quantity_on_hand,
    quantityReserved: r.quantity_reserved,
    quantityAvailable: avail,
    minLevel: r.min_level, updatedAt: r.updated_at,
    lowStock: avail <= r.min_level
  };
}
function stockMovementRow(r) {
  if (!r) return null;
  return {
    id: r.id, warehouseId: r.warehouse_id, itemId: r.item_id,
    movementType: r.movement_type, quantity: r.quantity,
    balanceAfter: r.balance_after, referenceType: r.reference_type,
    referenceId: r.reference_id, notes: r.notes,
    actorId: r.actor_id, createdAt: r.created_at
  };
}
function dbWarehouses(status, facilityId, buildingId, type) {
  const db = getDb();
  let sql = 'SELECT * FROM warehouses WHERE deleted_at IS NULL';
  const params = [];
  if (status)     { sql += ' AND status=?';      params.push(status); }
  if (facilityId) { sql += ' AND facility_id=?'; params.push(facilityId); }
  if (buildingId) { sql += ' AND building_id=?'; params.push(buildingId); }
  if (type)       { sql += ' AND type=?';        params.push(type); }
  sql += ' ORDER BY name_ar';
  return db.prepare(sql).all(...params).map(warehouseRow);
}
function dbInventoryItems(active, moduleScope, category) {
  const db = getDb();
  let sql = 'SELECT * FROM inventory_items WHERE deleted_at IS NULL';
  const params = [];
  if (active !== undefined) { sql += ' AND active=?'; params.push(active ? 1 : 0); }
  if (moduleScope) { sql += ' AND module_scope=?'; params.push(moduleScope); }
  if (category)    { sql += ' AND category=?';     params.push(category); }
  sql += ' ORDER BY name_ar';
  return db.prepare(sql).all(...params).map(inventoryItemRow);
}
function dbStockBalances(warehouseId, itemId, lowStock) {
  const db = getDb();
  let sql = 'SELECT * FROM stock_balances';
  const params = [];
  const conds = [];
  if (warehouseId) { conds.push('warehouse_id=?'); params.push(warehouseId); }
  if (itemId)      { conds.push('item_id=?');      params.push(itemId); }
  if (conds.length) sql += ' WHERE ' + conds.join(' AND ');
  sql += ' ORDER BY updated_at DESC';
  const rows = db.prepare(sql).all(...params).map(stockBalanceRow);
  if (lowStock) return rows.filter(r => r.lowStock);
  return rows;
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
  const sql = activeOnly
    ? `SELECT mi.* FROM hospitality_menu_items mi
       LEFT JOIN hospitality_menu_categories c ON c.slug = mi.category AND c.deleted_at IS NULL
       WHERE mi.deleted_at IS NULL AND mi.is_active = 1 AND (c.is_active = 1 OR c.id IS NULL)
       ORDER BY mi.sort_order ASC, mi.created_at ASC`
    : `SELECT * FROM hospitality_menu_items WHERE deleted_at IS NULL
       ORDER BY sort_order ASC, created_at ASC`;
  return getDb().prepare(sql).all().map(menuItemRow);
}

/** Map DB hospitality_menu_categories row → frontend camelCase */
function menuCategoryRow(r) {
  if (!r) return null;
  return {
    id:        r.id,
    nameAr:    r.name_ar,
    nameEn:    r.name_en,
    slug:      r.slug,
    isActive:  r.is_active === 1,
    sortOrder: r.sort_order,
    createdAt: r.created_at,
    updatedAt: r.updated_at
  };
}
function dbMenuCategories(activeOnly = false) {
  const sql = `SELECT * FROM hospitality_menu_categories WHERE deleted_at IS NULL
    ${activeOnly ? 'AND is_active = 1' : ''}
    ORDER BY sort_order ASC, created_at ASC`;
  return getDb().prepare(sql).all().map(menuCategoryRow);
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
  const photoFiles = r.photo_files ? r.photo_files.split(',') : [];
  const photoTypes = r.photo_types ? r.photo_types.split(',') : [];
  const photos = photoFiles.map(f => `/uploads/${f}`);
  const beforePhotos = photoFiles.filter((_,i)=>(photoTypes[i]||'general')==='before').map(f=>`/uploads/${f}`);
  const afterPhotos = photoFiles.filter((_,i)=>(photoTypes[i]||'general')==='after').map(f=>`/uploads/${f}`);
  return {
    id:             r.id,
    title:          r.title,
    description:    r.description,
    locationId:     r.location_id,
    locationNameAr: r.location_name_ar,
    locationNameEn: r.location_name_en,
    assignedTo:     r.assigned_to,
    assignedToName: r.assigned_to_name,
    supervisorId:   r.supervisor_id || '',
    supervisorName: r.supervisor_name || '',
    createdBy:      r.created_by,
    createdById:    r.created_by_id || '',
    status:         r.status,
    priority:       r.priority,
    category:       r.category || 'general',
    maintenanceType:r.maintenance_type || 'corrective',
    assetId:        r.asset_id || '',
    diagnosis:      r.diagnosis || '',
    rootCause:      r.root_cause || '',
    downtimeMins:   r.downtime_mins || 0,
    laborCost:      r.labor_cost || 0,
    vendorName:     r.vendor_name || '',
    permitNotes:    r.permit_notes || '',
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
    escalatedAt:                 r.escalated_at || '',
    escalationLevel:             r.escalation_level || 0,
    responseTimeMins:            r.response_time_mins  ?? null,
    completionTimeMins:          r.completion_time_mins ?? null,
    module:                      r.module || 'cleaning',
    photos,
    beforePhotos,
    afterPhotos
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
  const escalationPhotos = allPhotos
    .filter((_, i) => (allTypes[i] || 'general') === 'escalation')
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
    referenceNo:      r.reference_no || '',
    createdAt:        r.created_at,
    approvalStatus:   r.approval_status,
    approvedBy:       r.approved_by,
    approvedAt:       r.approved_at || '',
    reviewNote:       r.review_note,
    ratingSupervisor: r.rating_supervisor ?? null,
    ratingManager:    r.rating_manager    ?? null,
    module:           r.module || 'cleaning',
    photos,
    beforePhotos,
    afterPhotos,
    escalationPhotos
  };
}

function reportQualityScore(r) {
  if (!r) return null;
  const approval = r.approval_status || 'pending';
  const photoFiles = (r.photo_files || '').split(',').filter(Boolean);
  const photoTypes = (r.photo_types || '').split(',');
  const hasRequiredPhoto = photoFiles.some((_, i) => {
    const type = photoTypes[i] || 'general';
    return type === 'after' || type === 'general';
  });
  if (!hasRequiredPhoto || approval === 'pending') return null;

  const photoScore = 25;
  const reviewScore = approval === 'approved' ? 45 : approval === 'needs_recleaning' ? 15 : 0;
  let tasks = [];
  try { tasks = JSON.parse(r.tasks || '[]'); } catch { tasks = []; }
  const expectedTasks = r.location_type === 'restroom' ? 6 : 5;
  const taskScore = expectedTasks ? Math.round(Math.min(tasks.length, expectedTasks) / expectedTasks * 20) : (tasks.length ? 20 : 0);
  const needsDocumentation = approval !== 'approved' || r.status === 'needs_followup';
  const documentationScore = needsDocumentation
    ? ((r.notes || r.review_note) ? 10 : 0)
    : 10;
  return Math.max(0, Math.min(100, photoScore + reviewScore + taskScore + documentationScore));
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

function maintenanceTicketsForRole(me, allTickets) {
  const maintenanceTickets = allTickets.filter(t => t.module === 'maintenance');
  if (me.role === 'maintenance_supervisor') {
    return moduleTicketsForSupervisor(me, allTickets, dbAssignments(), 'maintenance');
  }
  if (me.role !== 'maintenance_worker') return maintenanceTickets;
  const assignedIds = new Set(getDb().prepare(
    'SELECT work_order_id FROM maintenance_work_order_assignees WHERE technician_id=?'
  ).all(me.id).map(r => r.work_order_id));
  return maintenanceTickets.filter(t => t.assignedTo === me.id || assignedIds.has(t.id));
}

function supervisorScope(supervisorId, module, assignments = dbAssignments(), options = {}) {
  const scoped = assignments.filter(a => a.supervisorId === supervisorId && (a.module || 'cleaning') === module);
  return {
    enabled: options.strict ? true : scoped.length > 0,
    workerIds: new Set(scoped.map(a => a.workerId)),
    locationIds: new Set(scoped.flatMap(a => a.locationIds || []))
  };
}

function cleaningSupervisorScope(supervisorId, assignments = dbAssignments(), options = {}) {
  return supervisorScope(supervisorId, 'cleaning', assignments, options);
}

function activeUserWithRole(db, userId, role) {
  const id = sanitize(userId || '', 50);
  if (!id) return null;
  const user = db.prepare('SELECT * FROM users WHERE id = ? AND active = 1 AND deleted_at IS NULL').get(id);
  return user && userHasRole(db, id, role) ? user : null;
}

function cleaningAssignment(db, workerId, locationId = '') {
  const worker = sanitize(workerId || '', 50);
  const loc = sanitize(locationId || '', 80);
  if (!worker) return null;
  if (loc) {
    return db.prepare(`
      SELECT * FROM assignments
      WHERE worker_id = ? AND location_id = ? AND (module IS NULL OR module = 'cleaning')
      LIMIT 1
    `).get(worker, loc) || null;
  }
  return db.prepare(`
    SELECT * FROM assignments
    WHERE worker_id = ? AND (module IS NULL OR module = 'cleaning')
    LIMIT 1
  `).get(worker) || null;
}

function workerInCleaningSupervisorScope(db, supervisorId, workerId, locationId = '') {
  const supervisor = sanitize(supervisorId || '', 50);
  const worker = sanitize(workerId || '', 50);
  const loc = sanitize(locationId || '', 80);
  if (!supervisor || !worker) return false;
  const row = db.prepare(`
    SELECT 1 FROM assignments
    WHERE worker_id = ?
      AND supervisor_id = ?
      ${loc ? 'AND location_id = ?' : ''}
      AND (module IS NULL OR module = 'cleaning')
    LIMIT 1
  `);
  return !!(loc ? row.get(worker, supervisor, loc) : row.get(worker, supervisor));
}

function cleaningTicketsForSupervisor(me, allTickets, assignments) {
  const cleaningTickets = allTickets.filter(t => t.module === 'cleaning');
  const scope = cleaningSupervisorScope(me.id, assignments, { strict: true });
  // A supervisor only sees a ticket once a manager has routed it to them
  // (supervisorId === me.id) or it is already assigned to one of their workers.
  // Unrouted requests stay with the manager queue.
  if (!scope.enabled) return cleaningTickets.filter(t => t.supervisorId === me.id);
  return cleaningTickets.filter(t =>
    t.supervisorId === me.id ||
    scope.workerIds.has(t.assignedTo)
  );
}

function cleaningReportsForSupervisor(me, allReports, assignments) {
  const cleaningReports = allReports.filter(r => r.module === 'cleaning');
  const scope = cleaningSupervisorScope(me.id, assignments, { strict: true });
  return cleaningReports.filter(r => scope.workerIds.has(r.workerId) || scope.locationIds.has(r.locationId));
}

function moduleTicketsForSupervisor(me, allTickets, assignments, module) {
  const tickets = allTickets.filter(t => t.module === module);
  const scope = supervisorScope(me.id, module, assignments, { strict: true });
  return tickets.filter(t => scope.workerIds.has(t.assignedTo) || scope.locationIds.has(t.locationId));
}

function moduleReportsForSupervisor(me, allReports, assignments, module) {
  const reports = allReports.filter(r => r.module === module);
  const scope = supervisorScope(me.id, module, assignments, { strict: true });
  return reports.filter(r => scope.workerIds.has(r.workerId) || scope.locationIds.has(r.locationId));
}

function hospitalityOrdersForSupervisor(me, allOrders, assignments) {
  const scope = supervisorScope(me.id, 'hospitality', assignments, { strict: true });
  return allOrders.filter(o => scope.workerIds.has(o.assignedTo) || scope.locationIds.has(o.locationId));
}

function canActOnCleaningTicket(me, ticket) {
  if (['system_admin','facility_manager','cleaning_manager'].includes(me.role)) return true;
  if (me.role !== 'cleaning_supervisor') return false;
  // A supervisor acts only on tickets routed to them, or within their scope.
  // Unrouted requests are handled by the manager until forwarded.
  if (ticket.supervisor_id === me.id) return true;
  const scope = cleaningSupervisorScope(me.id, dbAssignments(), { strict: true });
  return scope.enabled && scope.workerIds.has(ticket.assigned_to);
}

function buildBootstrap(me) {
  const users       = dbUsers();
  const locations   = dbLocs();
  const locationGroups = dbLocationGroups();
  const zones       = dbZones();
  const assignments = dbAssignments();
  const settings    = dbSettings();
  const allTickets  = dbTickets();
  const allReports  = dbReports();
  const visibleMaintenanceTickets = maintenanceTicketsForRole(me, allTickets);
  const allHospitalityOrders = dbHospitalityOrders();
  const visibleHospitalityOrders = me.role === 'hospitality_supervisor'
    ? hospitalityOrdersForSupervisor(me, allHospitalityOrders, assignments)
    : hospitalityOrdersForRole(me, allHospitalityOrders);
  const allRecurringTasks    = ['system_admin','facility_manager','cleaning_manager','cleaning_supervisor',ADMIN_COORDINATOR_ROLE].includes(me.role)
    ? dbRecurringTasks() : [];
  const cleaningAutoRestroom = ['system_admin','facility_manager','cleaning_manager','cleaning_supervisor',ADMIN_COORDINATOR_ROLE].includes(me.role)
    ? cleaningRestroomAutoStatus(getDb()) : null;

  const maintenance = ['system_admin','facility_manager','maintenance_manager','maintenance_supervisor','maintenance_worker',ADMIN_COORDINATOR_ROLE].includes(me.role)
    ? maintenancePayload(me, visibleMaintenanceTickets) : {};
  const base = { user: publicUser(me), locations, locationGroups, zones, settings, recurringTasks: allRecurringTasks, cleaningAutoRestroom, maintenance };
  const hospitalityOrders = visibleHospitalityOrders;

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
    const myAssign = assignments.find(a => a.workerId === me.id && (a.module || 'cleaning') === 'cleaning');
    return {
      ...base,
      users:       [publicUser(me)],
      assignments: myAssign ? [myAssign] : [],
      tickets:     allTickets.filter(t => t.assignedTo === me.id && t.module === 'cleaning'),
      reports:     allReports.filter(r => r.workerId  === me.id && r.module === 'cleaning'),
      hospitalityOrders
    };
  }
  if (me.role === 'cleaning_supervisor') {
    const scope = cleaningSupervisorScope(me.id, assignments, { strict: true });
    const usersForSupervisor = users.filter(u => u.id === me.id || scope.workerIds.has(u.id));
    return {
      ...base,
      users:       usersForSupervisor.map(publicUser),
      assignments: assignments.filter(a => a.supervisorId === me.id && (a.module || 'cleaning') === 'cleaning'),
      tickets:     cleaningTicketsForSupervisor(me, allTickets, assignments),
      reports:     cleaningReportsForSupervisor(me, allReports, assignments),
      hospitalityOrders
    };
  }
  if (me.role === 'maintenance_worker') {
    const myAssign = assignments.find(a => a.workerId === me.id && a.module === 'maintenance');
    return {
      ...base,
      users:       [publicUser(me)],
      assignments: myAssign ? [myAssign] : [],
      tickets:     visibleMaintenanceTickets,
      reports:     allReports.filter(r => r.workerId  === me.id && r.module === 'maintenance'),
      hospitalityOrders: []
    };
  }
  if (me.role === 'maintenance_supervisor') {
    const scope = supervisorScope(me.id, 'maintenance', assignments, { strict: true });
    const usersForSupervisor = users.filter(u => u.id === me.id || scope.workerIds.has(u.id));
    return {
      ...base,
      users:       usersForSupervisor.map(publicUser),
      assignments: assignments.filter(a => a.supervisorId === me.id && a.module === 'maintenance'),
      tickets:     moduleTicketsForSupervisor(me, allTickets, assignments, 'maintenance'),
      reports:     moduleReportsForSupervisor(me, allReports, assignments, 'maintenance'),
      hospitalityOrders: []
    };
  }
  if (me.role === 'maintenance_manager') {
    return {
      ...base,
      users:       users.filter(u => userRowHasAnyRole(u, ['maintenance_worker','maintenance_supervisor','maintenance_manager'])).map(publicUser),
      assignments,
      tickets:     allTickets.filter(t => t.module === 'maintenance'),
      reports:     allReports.filter(r => r.module === 'maintenance'),
      hospitalityOrders: []
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
    const scope = me.role === 'hospitality_supervisor'
      ? supervisorScope(me.id, 'hospitality', assignments, { strict: true })
      : { enabled: false, workerIds: new Set() };
    const usersForHospitality = me.role === 'hospitality_supervisor'
      ? users.filter(u => u.id === me.id || scope.workerIds.has(u.id))
      : users.filter(u => userRowHasAnyRole(u, ['hospitality_worker','hospitality_supervisor','hospitality_manager']));
    return {
      ...base,
      users:       usersForHospitality.map(publicUser),
      assignments: me.role === 'hospitality_supervisor'
        ? assignments.filter(a => a.supervisorId === me.id && a.module === 'hospitality')
        : assignments,
      tickets:     [],
      reports:     [],
      hospitalityOrders
    };
  }
  if (me.role === 'cleaning_manager') {
    return {
      ...base,
      users:       users.filter(u => userRowHasAnyRole(u, ['cleaner','cleaning_supervisor','cleaning_manager'])).map(publicUser),
      assignments,
      tickets:     allTickets.filter(t => t.module === 'cleaning'),
      reports:     allReports.filter(r => r.module === 'cleaning'),
      hospitalityOrders
    };
  }
  if (me.role === ADMIN_COORDINATOR_ROLE) {
    return {
      ...base,
      users:       [],
      assignments,
      tickets:     allTickets,
      reports:     allReports,
      hospitalityOrders,
      inventory:   {}
    };
  }
  // system_admin / facility_manager — full view across all modules
  const inventory = {
    warehouses:     dbWarehouses(),
    inventoryItems: dbInventoryItems(),
    stockBalances:  dbStockBalances()
  };
  return {
    ...base,
    users:       users.map(publicUser),
    assignments,
    tickets:     allTickets,
    reports:     allReports,
    hospitalityOrders,
    inventory
  };
}

/* ═══════════════════════════════════════════════════════════════
   SSE CLIENTS  (in-memory — reconnects after restart are fine)
   ═══════════════════════════════════════════════════════════════ */
const sseClients = new Set();
function canReceiveTicketEvent(user, ticket) {
  if (!ticket || !user) return false;
  if (['system_admin','facility_manager',ADMIN_COORDINATOR_ROLE].includes(user.role)) return true;
  if (user.role === 'employee') return ticket.createdById === user.id;
  if (ticket.module === 'maintenance') {
    if (user.role === 'maintenance_manager') return true;
    if (user.role === 'maintenance_supervisor') {
      return moduleTicketsForSupervisor(user, [ticket], dbAssignments(), 'maintenance').length > 0;
    }
    return user.role === 'maintenance_worker' && (ticket.assignedTo === user.id || !!getDb().prepare(
        'SELECT 1 FROM maintenance_work_order_assignees WHERE work_order_id=? AND technician_id=?'
      ).get(ticket.id,user.id));
  }
  if (user.role === 'cleaning_manager') return true;
  if (user.role === 'cleaning_supervisor') return cleaningTicketsForSupervisor(user, [ticket], dbAssignments()).length > 0;
  return user.role === 'cleaner' && ticket.assignedTo === user.id;
}
function canReceiveReportEvent(user, report) {
  if (!report || !user) return false;
  if (['system_admin','facility_manager',ADMIN_COORDINATOR_ROLE].includes(user.role)) return true;
  if (report.module === 'maintenance') {
    if (user.role === 'maintenance_manager') return true;
    if (user.role === 'maintenance_supervisor') {
      return moduleReportsForSupervisor(user, [report], dbAssignments(), 'maintenance').length > 0;
    }
    return user.role === 'maintenance_worker' && report.workerId === user.id;
  }
  if (user.role === 'cleaning_manager') return true;
  if (user.role === 'cleaning_supervisor') {
    return cleaningReportsForSupervisor(user, [report], dbAssignments()).length > 0;
  }
  return user.role === 'cleaner' && report.workerId === user.id;
}

function isRestroomLocation(loc) {
  const id = String(loc?.id || '').toLowerCase();
  const type = String(loc?.type || '').toLowerCase();
  const name = `${loc?.name_ar || ''} ${loc?.name_en || ''}`.toLowerCase();
  return type === 'restroom' || type === 'bathroom' || id.includes('-wc-') || id.includes('-br-') ||
    name.includes('restroom') || name.includes('bathroom') || name.includes('دورة مياه');
}

function parentRestroomId(locationId) {
  const id = String(locationId || '').trim();
  const m = /^(.+-(?:BR|WC)-\d+)-[A-Z]$/i.exec(id);
  return m ? m[1] : '';
}

function hourlyRestroomReportLocations(db, locations) {
  const byId = new Map(locations.map(loc => [String(loc.id || '').toUpperCase(), loc]));
  const excludedUnitIds = new Set();
  const groups = db.prepare(`
    SELECT g.id AS group_id, gm.location_id
    FROM location_groups g
    JOIN location_group_members gm ON gm.group_id = g.id
    WHERE g.active = 1
      AND g.deleted_at IS NULL
      AND lower(g.type) IN ('restroom','bathroom')
  `).all();
  for (const row of groups) {
    const groupId = String(row.group_id || '').toUpperCase();
    const memberId = String(row.location_id || '').toUpperCase();
    if (groupId && memberId && groupId !== memberId && byId.has(groupId)) {
      excludedUnitIds.add(memberId);
    }
  }
  for (const loc of locations) {
    const parentId = parentRestroomId(loc.id).toUpperCase();
    if (!parentId) continue;
    const parent = byId.get(parentId);
    if (parent && isRestroomLocation(parent)) excludedUnitIds.add(String(loc.id || '').toUpperCase());
  }
  return locations.filter(loc => isRestroomLocation(loc) && !excludedUnitIds.has(String(loc.id || '').toUpperCase()));
}

function hourlyRestroomParentLocation(db, locationId) {
  const id = String(locationId || '').trim();
  if (!id) return null;
  const groupRow = db.prepare(`
    SELECT parent.*
    FROM location_group_members gm
    JOIN location_groups g ON g.id = gm.group_id
      AND g.active = 1
      AND g.deleted_at IS NULL
      AND lower(g.type) IN ('restroom','bathroom')
    JOIN locations parent ON parent.id = g.id
      AND parent.active = 1
      AND parent.deleted_at IS NULL
    WHERE gm.location_id = ?
      AND UPPER(g.id) != UPPER(gm.location_id)
    LIMIT 1
  `).get(id);
  if (groupRow && isRestroomLocation(groupRow)) return groupRow;

  const parentId = parentRestroomId(id);
  if (!parentId || parentId.toUpperCase() === id.toUpperCase()) return null;
  const parent = db.prepare(`
    SELECT * FROM locations
    WHERE UPPER(id) = UPPER(?)
      AND active = 1
      AND deleted_at IS NULL
    LIMIT 1
  `).get(parentId);
  return parent && isRestroomLocation(parent) ? parent : null;
}
function ensureVapidKeys(db = getDb()) {
  const subject = process.env.VAPID_SUBJECT || 'mailto:admin@mrfq.local';
  // Prefer keys from environment variables so they stay stable across redeploys
  // even when the database is recreated. Persist them into settings so the rest
  // of the system has a single consistent source of truth.
  const envPublic = process.env.VAPID_PUBLIC_KEY;
  const envPrivate = process.env.VAPID_PRIVATE_KEY;
  if (envPublic && envPrivate) {
    const publicKeyRow = db.prepare("SELECT value FROM settings WHERE key='push_vapid_public_key'").get();
    const privateKeyRow = db.prepare("SELECT value FROM settings WHERE key='push_vapid_private_key'").get();
    if (publicKeyRow?.value !== envPublic || privateKeyRow?.value !== envPrivate) {
      db.prepare('INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)').run('push_vapid_public_key', envPublic);
      db.prepare('INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)').run('push_vapid_private_key', envPrivate);
    }
    webpush.setVapidDetails(subject, envPublic, envPrivate);
    return { publicKey: envPublic, privateKey: envPrivate };
  }
  const publicKeyRow = db.prepare("SELECT value FROM settings WHERE key='push_vapid_public_key'").get();
  const privateKeyRow = db.prepare("SELECT value FROM settings WHERE key='push_vapid_private_key'").get();
  if (publicKeyRow?.value && privateKeyRow?.value) {
    webpush.setVapidDetails(subject, publicKeyRow.value, privateKeyRow.value);
    return { publicKey: publicKeyRow.value, privateKey: privateKeyRow.value };
  }
  const keys = webpush.generateVAPIDKeys();
  db.prepare('INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)').run('push_vapid_public_key', keys.publicKey);
  db.prepare('INSERT OR REPLACE INTO settings (key,value) VALUES (?,?)').run('push_vapid_private_key', keys.privateKey);
  webpush.setVapidDetails(subject, keys.publicKey, keys.privateKey);
  return keys;
}
function canReceiveHospitalityOrderEvent(user, order) {
  if (!order || !user) return false;
  if (['system_admin','facility_manager','hospitality_manager','hospitality_supervisor'].includes(user.role)) return true;
  if (user.role === 'hospitality_worker') return order.assignedTo === user.id;
  if (user.role === 'employee') return order.requestedById === user.id;
  return false;
}
function pushAudienceUsers(db, event, payload) {
  const rows = db.prepare('SELECT * FROM users WHERE active=1 AND deleted_at IS NULL').all().map(publicUser);
  if (payload?.workerOnly && payload?.ticket) return rows.filter(user => user.id === payload.ticket.assignedTo);
  if (payload?.ticket) return rows.filter(user => canReceiveTicketEvent(user, payload.ticket));
  if (payload?.report) return rows.filter(user => canReceiveReportEvent(user, payload.report));
  if (payload?.order) return rows.filter(user => canReceiveHospitalityOrderEvent(user, payload.order));
  return ['hospitality_menu_updated','hospitality_menu_category_updated','hospitality_kitchen_updated'].includes(event)
    ? rows.filter(user => ['system_admin','facility_manager','hospitality_manager','hospitality_supervisor'].includes(user.role))
    : [];
}
function pushNotice(event, payload) {
  if (payload?.ticket) {
    return {
      title: event === 'ticket_waiting_verification' ? 'بلاغ بانتظار التحقق' : 'بلاغ جديد',
      body: payload.ticket.title || payload.ticket.referenceNo || 'تم تحديث بلاغ',
      tag: `ticket-${payload.ticket.id || event}`,
      url: '/?notify=ticket'
    };
  }
  if (payload?.report) {
    const status = payload.report.approvalStatus || '';
    const title = event === 'report_note_added'
      ? 'ملاحظة على التقرير'
      : event === 'report_reviewed'
      ? (status === 'approved' ? 'تم اعتماد التقرير' : status === 'needs_recleaning' ? 'مطلوب إعادة العمل' : 'تم رفض التقرير')
      : 'تقرير جديد';
    return {
      title,
      body: payload.report.locationNameAr || payload.report.locationNameEn || 'تم تحديث تقرير',
      tag: `report-${payload.report.id || event}`,
      url: '/?notify=report'
    };
  }
  if (payload?.order) {
    return {
      title: event === 'hospitality_order_created' ? 'طلب ضيافة جديد' : 'تحديث طلب ضيافة',
      body: payload.order.referenceNo || payload.order.requesterName || payload.order.status || 'تم تحديث طلب ضيافة',
      tag: `hospitality-${payload.order.id || event}`,
      url: '/?notify=hospitality'
    };
  }
  return null;
}
function savePushSubscription(db, userId, raw, userAgent = '') {
  const endpoint = sanitize(raw?.endpoint, 1000);
  const p256dh = sanitize(raw?.keys?.p256dh, 300);
  const auth = sanitize(raw?.keys?.auth, 300);
  if (!endpoint || !p256dh || !auth) return false;
  const ts = now();
  db.prepare(`
    INSERT INTO push_subscriptions (id,user_id,endpoint,p256dh,auth,user_agent,created_at,updated_at,deleted_at)
    VALUES (?,?,?,?,?,?,?,?,NULL)
    ON CONFLICT(endpoint) DO UPDATE SET
      user_id=excluded.user_id,p256dh=excluded.p256dh,auth=excluded.auth,user_agent=excluded.user_agent,
      updated_at=excluded.updated_at,deleted_at=NULL
  `).run(newId('push'), userId, endpoint, p256dh, auth, sanitize(userAgent, 300), ts, ts);
  return true;
}
function broadcastPush(event, payload) {
  const notice = pushNotice(event, payload);
  if (!notice) return;
  try {
    const db = getDb();
    ensureVapidKeys(db);
    const userIds = pushAudienceUsers(db, event, payload).map(user => user.id);
    if (!userIds.length) return;
    const subscriptions = db.prepare(`
      SELECT * FROM push_subscriptions
      WHERE deleted_at IS NULL AND user_id IN (${userIds.map(() => '?').join(',')})
    `).all(...userIds);
    const body = JSON.stringify({
      ...notice,
      icon: '/assets/logos/mrfq-logo-icon-light-v4.svg',
      badge: '/assets/logos/mrfq-favicon.svg',
      dir: 'rtl',
      lang: 'ar',
      timestamp: Date.now()
    });
    for (const sub of subscriptions) {
      const subscription = { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } };
      webpush.sendNotification(subscription, body).catch(error => {
        // 404/410: endpoint gone. 403: VAPID credentials no longer match this
        // subscription (e.g. keys rotated) — it can never succeed again, so retire it.
        if ([403, 404, 410].includes(error?.statusCode)) {
          try { db.prepare('UPDATE push_subscriptions SET deleted_at=?,updated_at=? WHERE id=?').run(now(), now(), sub.id); } catch {}
        } else {
          console.error('[push]', error?.message || error);
        }
      });
    }
  } catch (error) {
    console.error('[push]', error?.message || error);
  }
}
function broadcast(event, payload) {
  const msg = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const c of sseClients) {
    if (payload?.workerOnly && payload?.ticket && c.user.id !== payload.ticket.assignedTo) continue;
    if (payload?.ticket && !canReceiveTicketEvent(c.user, payload.ticket)) continue;
    if (payload?.report && !canReceiveReportEvent(c.user, payload.report)) continue;
    try { c.res.write(msg); } catch { sseClients.delete(c); }
  }
  broadcastPush(event, payload);
}

/* ═══════════════════════════════════════════════════════════════
   CSV helper
   ═══════════════════════════════════════════════════════════════ */
function csvCell(v) { return '"' + String(v ?? '').replace(/"/g, '""') + '"'; }

/* ═══════════════════════════════════════════════════════════════
   REFERENCE NUMBER GENERATOR  (CLN-YYYY-XXXXXX)
   ═══════════════════════════════════════════════════════════════ */
function generateRefNo(db, prefix = 'CLN') {
  const upper = String(prefix || 'CLN').toUpperCase();
  const year = new Date().getFullYear();
  const key  = `${upper.toLowerCase()}_ref_seq_${year}`;
  const row  = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  let maxSeq = parseInt(row?.value || '0', 10) || 0;
  const like = `${upper}-${year}-%`;
  const refs = db.prepare(`
    SELECT reference_no FROM tickets WHERE reference_no LIKE ?
    UNION ALL
    SELECT reference_no FROM reports WHERE reference_no LIKE ?
    UNION ALL
    SELECT reference_no FROM hospitality_orders WHERE reference_no LIKE ?
  `).all(like, like, like);
  for (const ref of refs) {
    const seq = parseInt(String(ref.reference_no || '').split('-').pop(), 10);
    if (Number.isFinite(seq) && seq > maxSeq) maxSeq = seq;
  }
  const nextSeq = maxSeq + 1;
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, String(nextSeq));
  return `${upper}-${year}-${String(nextSeq).padStart(6, '0')}`;
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

function slaMins(category) {
  try {
    const row = getDb().prepare('SELECT value FROM settings WHERE key = ?').get(`sla_mins_${category}`);
    if (row && Number.isFinite(Number(row.value)) && Number(row.value) > 0) return Number(row.value);
  } catch {}
  return SLA_MINS[category] || SLA_MINS.general;
}

function computeSlaDeadline(category) {
  return new Date(Date.now() + slaMins(category) * 60_000).toISOString();
}

/* ── Maintenance SLA ──────────────────────────────────────────── */
const MAINT_SLA_MINS = { electrical: 60, plumbing: 60, hvac: 240, civil: 480, general: 240 };

function maintSlaMins(category) {
  try {
    const row = getDb().prepare('SELECT value FROM settings WHERE key = ?').get(`maint_sla_mins_${category}`);
    if (row && Number.isFinite(Number(row.value)) && Number(row.value) > 0) return Number(row.value);
  } catch {}
  return MAINT_SLA_MINS[category] || MAINT_SLA_MINS.general;
}

function computeMaintSlaDeadline(category) {
  return new Date(Date.now() + maintSlaMins(category) * 60_000).toISOString();
}

const MAINT_RATING_RULES = {
  maintenance_manager:    'manager',
  maintenance_supervisor: 'supervisor',
  system_admin:           null
};

function normalizeMaintenanceTeam(db, technicianIds, leadTechnicianId = '') {
  const ids = [...new Set((technicianIds || []).map(id=>sanitize(id,50)).filter(Boolean))].slice(0,20);
  const technicians = ids.map(id => db.prepare(
    "SELECT id,name FROM users WHERE id=? AND active=1 AND deleted_at IS NULL"
  ).get(id)).filter(Boolean);
  if (technicians.length !== ids.length || ids.some(id => !userHasRole(db, id, 'maintenance_worker'))) throw new Error('WORKER_NOT_FOUND');
  const requestedLead=sanitize(leadTechnicianId,50);
  const lead=ids.includes(requestedLead)?requestedLead:(ids[0]||'');
  return { ids, technicians, lead };
}

function setMaintenanceTeam(db, workOrderId, technicianIds, leadTechnicianId = '') {
  const { technicians, lead }=normalizeMaintenanceTeam(db,technicianIds,leadTechnicianId);
  db.prepare('DELETE FROM maintenance_work_order_assignees WHERE work_order_id=?').run(workOrderId);
  const insert = db.prepare(`
    INSERT INTO maintenance_work_order_assignees
      (work_order_id,technician_id,technician_name,is_lead,status,assigned_at)
    VALUES (?,?,?,?,?,?)
  `);
  technicians.forEach(t => insert.run(workOrderId,t.id,t.name,t.id===lead?1:0,'assigned',now()));
  const leadUser = technicians.find(t => t.id === lead);
  db.prepare('UPDATE tickets SET assigned_to=?,assigned_to_name=?,status=?,updated_at=? WHERE id=?').run(
    leadUser?.id||null, leadUser?.name||'', technicians.length?'assigned':'submitted', now(), workOrderId
  );
  return dbMaintenanceAssignees([workOrderId]);
}

function nextScheduleAt(fromIso, unit, value) {
  const d = new Date(fromIso || Date.now());
  const n = Math.max(1, parseInt(value,10)||1);
  if (unit === 'daily') d.setUTCDate(d.getUTCDate()+n);
  else if (unit === 'weekly') d.setUTCDate(d.getUTCDate()+7*n);
  else if (unit === 'quarterly') d.setUTCMonth(d.getUTCMonth()+3*n);
  else if (unit === 'yearly') d.setUTCFullYear(d.getUTCFullYear()+n);
  else d.setUTCMonth(d.getUTCMonth()+n);
  return d.toISOString();
}

function generateScheduledMaintenance(db, schedule, actor = null) {
  const assets = safeJson(schedule.asset_ids);
  const assetId = assets[0] || '';
  const asset = assetId ? db.prepare('SELECT * FROM maintenance_assets WHERE id=? AND deleted_at IS NULL').get(assetId) : null;
  const loc = db.prepare('SELECT * FROM locations WHERE id=? AND deleted_at IS NULL').get(schedule.location_id || asset?.location_id);
  if (!loc) throw new Error('MISSING_LOCATION');
  const id = newId('mt'); const ts = now(); const refNo = generateRefNo(db,'MNT');
  const title = schedule.title_ar || schedule.title_en || 'صيانة دورية';
  db.prepare(`
    INSERT INTO tickets (id,title,description,location_id,location_name_ar,location_name_en,
      created_by,created_by_id,status,priority,category,reference_no,notes,sla_deadline,module,
      maintenance_type,asset_id,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(id,title,'',loc.id,loc.name_ar,loc.name_en,actor?.name||'النظام',actor?.id||'',
    'submitted','medium',schedule.category,refNo,'',computeMaintSlaDeadline(schedule.category),
    'maintenance','preventive',assetId,ts,ts);
  const techIds = safeJson(schedule.default_technician_ids);
  if (techIds.length) setMaintenanceTeam(db,id,techIds,schedule.lead_technician_id);
  const next = nextScheduleAt(schedule.next_run_at,schedule.frequency_unit,schedule.frequency_value);
  db.prepare('UPDATE maintenance_schedules SET last_run_at=?,next_run_at=?,updated_at=? WHERE id=?').run(ts,next,ts,schedule.id);
  return id;
}

function currentRiyadhSlot(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Riyadh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hour12: false
  }).formatToParts(date).reduce((acc, part) => {
    if (part.type !== 'literal') acc[part.type] = part.value;
    return acc;
  }, {});
  return { date: `${parts.year}-${parts.month}-${parts.day}`, hour: Number(parts.hour) };
}

function hourlyRestroomTicketDescription(slotKey = '') {
  const match = /^(\d{4}-\d{2}-\d{2})T(\d{2})$/.exec(String(slotKey || ''));
  const time = match ? `${match[2]}:00` : '';
  return time
    ? `تقرير تلقائي مجدول لدورة المياه - الساعة ${time}`
    : 'تقرير تلقائي مجدول لدورة المياه';
}

function cleaningRestroomHourlySettings(db) {
  const rows = db.prepare(`
    SELECT key, value FROM settings
    WHERE key IN (
      'cleaning_restroom_hourly_enabled',
      'cleaning_restroom_hourly_start_hour',
      'cleaning_restroom_hourly_end_hour'
    )
  `).all();
  const s = Object.fromEntries(rows.map(r => [r.key, r.value]));
  return {
    enabled: s.cleaning_restroom_hourly_enabled !== '0',
    startHour: Math.max(0, Math.min(23, parseInt(s.cleaning_restroom_hourly_start_hour, 10) || 7)),
    endHour: Math.max(0, Math.min(23, parseInt(s.cleaning_restroom_hourly_end_hour, 10) || 14))
  };
}

function cleaningRestroomCandidateLocations(db) {
  return hourlyRestroomReportLocations(db, db.prepare(`
    SELECT * FROM locations
    WHERE active = 1 AND deleted_at IS NULL
      AND (
        type IN ('restroom','bathroom')
        OR lower(id) LIKE '%-wc-%'
        OR lower(id) LIKE '%-br-%'
        OR name_ar LIKE '%دورة مياه%'
        OR lower(name_en) LIKE '%restroom%'
        OR lower(name_en) LIKE '%bathroom%'
      )
    ORDER BY floor, zone, name_ar
  `).all());
}

function cleaningRestroomAutoStatus(db) {
  const settings = cleaningRestroomHourlySettings(db);
  const ready = [];
  const missing = [];
  for (const loc of cleaningRestroomCandidateLocations(db)) {
    const route = autoAssignCleaningRoute(loc.id, db, { requireSupervisor: true });
    const item = {
      locationId: loc.id,
      locationNameAr: loc.name_ar,
      locationNameEn: loc.name_en,
      floor: loc.floor,
      workerId: route?.id || '',
      workerName: route?.name || '',
      supervisorId: route?.supervisorId || '',
      supervisorName: route?.supervisorName || ''
    };
    if (route) ready.push(item);
    else missing.push({ ...item, reason: 'missing_worker_or_supervisor' });
  }
  let lastRuns = [];
  try {
    lastRuns = db.prepare(`
      SELECT * FROM cleaning_auto_runs
      WHERE run_type = 'restroom_hourly'
      ORDER BY created_at DESC
      LIMIT 20
    `).all().map(row => ({
      id: row.id,
      slotKey: row.slot_key,
      status: row.status,
      generatedCount: row.generated_count,
      skippedCount: row.skipped_count,
      skipped: safeJson(row.skipped_payload),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
  } catch {}
  return { settings, ready, missing, lastRuns };
}

function generateHourlyRestroomCleaningTickets(db) {
  syncAutoRestroomTicketDescriptions(db);
  syncAutoRestroomTicketGroups(db);
  syncAutoRestroomTicketRoutes(db);
  const slot = currentRiyadhSlot();
  const autoSettings = cleaningRestroomHourlySettings(db);
  if (!autoSettings.enabled || slot.hour < autoSettings.startHour || slot.hour > autoSettings.endHour) return;
  const slotKey = `${slot.date}T${String(slot.hour).padStart(2, '0')}`;
  const last = db.prepare("SELECT value FROM settings WHERE key='cleaning_restroom_hourly_report_last_slot'").get();
  if (last?.value === slotKey) return;

  const locations = cleaningRestroomCandidateLocations(db);
  if (!locations.length) {
    db.prepare("INSERT OR REPLACE INTO settings (key,value) VALUES ('cleaning_restroom_hourly_report_last_slot',?)").run(slotKey);
    return;
  }

  const ts = now();
  const inserted = [];
  const skipped = [];
  const insert = db.prepare(`
    INSERT INTO tickets
      (id,title,description,location_id,location_name_ar,location_name_en,
       assigned_to,assigned_to_name,supervisor_id,supervisor_name,created_by,created_by_id,status,priority,category,
       reference_no,notes,sla_deadline,created_at,updated_at,module)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `);
  for (const loc of locations) {
    const assignment = autoAssignCleaningRoute(loc.id, db, { requireSupervisor: true });
    if (!assignment) {
      skipped.push({ locationId: loc.id, locationNameAr: loc.name_ar, locationNameEn: loc.name_en, reason: 'missing_worker_or_supervisor' });
      continue;
    }
    const exists = db.prepare(`
      SELECT 1 FROM tickets
      WHERE location_id=? AND category='restroom' AND module='cleaning'
        AND created_by_id='system-hourly-restroom' AND notes=?
        AND deleted_at IS NULL
      LIMIT 1
    `).get(loc.id, slotKey);
    if (exists) continue;
    const id = newId('t');
    insert.run(
      id,
      'تقرير نظافة دورة مياه',
      hourlyRestroomTicketDescription(slotKey),
      loc.id,
      loc.name_ar,
      loc.name_en,
      assignment.id,
      assignment.name,
      assignment.supervisorId || '',
      assignment.supervisorName || '',
      'النظام',
      'system-hourly-restroom',
      'assigned',
      'medium',
      'restroom',
      generateRefNo(db),
      slotKey,
      computeSlaDeadline('restroom'),
      ts,
      ts,
      'cleaning'
    );
    const ticket = ticketRow(db.prepare(`
      SELECT t.*, NULL AS photo_files, NULL AS photo_types FROM tickets t WHERE t.id=?
    `).get(id));
    inserted.push(ticket);
  }

  db.prepare("INSERT OR REPLACE INTO settings (key,value) VALUES ('cleaning_restroom_hourly_report_last_slot',?)").run(slotKey);
  try {
    db.prepare(`
      INSERT OR REPLACE INTO cleaning_auto_runs
        (id,slot_key,run_type,status,generated_count,skipped_count,skipped_payload,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?)
    `).run(
      `car-${slotKey.replace(/[^0-9A-Za-z]/g, '')}`,
      slotKey,
      'restroom_hourly',
      skipped.length ? 'completed_with_skips' : 'completed',
      inserted.length,
      skipped.length,
      JSON.stringify(skipped),
      ts,
      ts
    );
  } catch (e) { console.error('[cleaning-hourly-run-log]', e.message); }
  inserted.forEach(ticket => {
    broadcast('ticket_created', { ticket, workerOnly: true });
    logEvent(db, 'ticket.auto_restroom_hourly', 'ticket', ticket.id, { id: '', role: 'system' }, {
      slot: slotKey,
      locationId: ticket.locationId,
      assignedTo: ticket.assignedTo,
      supervisorId: ticket.supervisorId
    });
  });
  if (inserted.length) console.log(`[cleaning-hourly] generated ${inserted.length} restroom tickets for ${slotKey}`);
}

function syncAutoRestroomTicketDescriptions(db) {
  const result = db.prepare(`
    UPDATE tickets
    SET description = CASE
          WHEN notes GLOB '????-??-??T??'
            THEN 'تقرير تلقائي مجدول لدورة المياه - الساعة ' || substr(notes, 12, 2) || ':00'
          ELSE 'تقرير تلقائي مجدول لدورة المياه'
        END,
        updated_at = ?
    WHERE module = 'cleaning'
      AND category = 'restroom'
      AND created_by_id = 'system-hourly-restroom'
      AND (
        description LIKE 'تقرير تلقائي لدورة المياه - %'
        OR description = 'تقرير تلقائي مجدول لدورة المياه'
      )
      AND deleted_at IS NULL
  `).run(now());
  if (result.changes) console.log(`[cleaning-hourly] normalized ${result.changes} restroom ticket descriptions`);
}

function syncAutoRestroomTicketGroups(db) {
  const rows = db.prepare(`
    SELECT id, location_id, notes
    FROM tickets
    WHERE module = 'cleaning'
      AND category = 'restroom'
      AND created_by_id = 'system-hourly-restroom'
      AND status NOT IN ('completed','rejected','cancelled')
      AND deleted_at IS NULL
    ORDER BY created_at ASC
    LIMIT 500
  `).all();
  if (!rows.length) return;

  const findExisting = db.prepare(`
    SELECT id
    FROM tickets
    WHERE id != ?
      AND location_id = ?
      AND category = 'restroom'
      AND module = 'cleaning'
      AND created_by_id = 'system-hourly-restroom'
      AND notes = ?
      AND deleted_at IS NULL
    LIMIT 1
  `);
  const softDelete = db.prepare('UPDATE tickets SET deleted_at=?, updated_at=? WHERE id=?');
  const updateToParent = db.prepare(`
    UPDATE tickets
    SET location_id=?,
        location_name_ar=?,
        location_name_en=?,
        assigned_to=?,
        assigned_to_name=?,
        supervisor_id=?,
        supervisor_name=?,
        updated_at=?
    WHERE id=?
  `);

  const ts = now();
  let changed = 0;
  for (const row of rows) {
    const parent = hourlyRestroomParentLocation(db, row.location_id);
    if (!parent) continue;
    const parentId = parent.id;
    if (String(parentId).toUpperCase() === String(row.location_id || '').toUpperCase()) continue;
    const existing = findExisting.get(row.id, parentId, row.notes || '');
    if (existing) {
      softDelete.run(ts, ts, row.id);
      changed += 1;
      continue;
    }
    const route = autoAssignCleaningRoute(parentId, db, { requireSupervisor: true }) || {};
    updateToParent.run(
      parentId,
      parent.name_ar,
      parent.name_en,
      route.id || '',
      route.name || '',
      route.supervisorId || '',
      route.supervisorName || '',
      ts,
      row.id
    );
    changed += 1;
  }
  if (changed) console.log(`[cleaning-hourly] normalized ${changed} restroom unit tickets to group tickets`);
}

function autoAssignCleaningRoute(locationId, db, opts = {}) {
  const route = db.prepare(`
    SELECT a.worker_id AS id, u.name,
      a.supervisor_id AS supervisorId,
      COALESCE(s.name, '') AS supervisorName,
      (SELECT COUNT(*) FROM tickets
       WHERE assigned_to = a.worker_id
         AND module = 'cleaning'
         AND status NOT IN ('completed','rejected','cancelled')
         AND deleted_at IS NULL) AS open_count
    FROM assignments a
    JOIN users u ON u.id = a.worker_id
      AND u.active = 1 AND u.deleted_at IS NULL
      AND (
        u.role = 'cleaner'
        OR EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role = 'cleaner')
      )
    LEFT JOIN users s ON s.id = a.supervisor_id
      AND s.active = 1 AND s.deleted_at IS NULL
      AND (
        s.role = 'cleaning_supervisor'
        OR EXISTS (SELECT 1 FROM user_roles sr WHERE sr.user_id = s.id AND sr.role = 'cleaning_supervisor')
      )
    WHERE a.location_id = ?
      AND (a.module IS NULL OR a.module = 'cleaning')
    ORDER BY open_count ASC, CASE WHEN a.supervisor_id != '' THEN 0 ELSE 1 END
    LIMIT 1
  `).get(locationId) || null;
  if (opts.requireSupervisor && (!route?.id || !route.supervisorId || !route.supervisorName)) return null;
  return route;
}

function syncAutoRestroomTicketRoutes(db) {
  const rows = db.prepare(`
    SELECT id, location_id
    FROM tickets
    WHERE module = 'cleaning'
      AND category = 'restroom'
      AND created_by_id = 'system-hourly-restroom'
      AND status NOT IN ('completed','rejected','cancelled')
      AND deleted_at IS NULL
      AND (supervisor_id = '' OR supervisor_id IS NULL OR assigned_to IS NULL OR assigned_to = '')
    LIMIT 200
  `).all();
  if (!rows.length) return;
  const update = db.prepare(`
    UPDATE tickets
    SET assigned_to = COALESCE(NULLIF(assigned_to, ''), ?),
        assigned_to_name = CASE WHEN assigned_to IS NULL OR assigned_to = '' THEN ? ELSE assigned_to_name END,
        supervisor_id = CASE WHEN supervisor_id IS NULL OR supervisor_id = '' THEN ? ELSE supervisor_id END,
        supervisor_name = CASE WHEN supervisor_id IS NULL OR supervisor_id = '' THEN ? ELSE supervisor_name END,
        updated_at = ?
    WHERE id = ?
  `);
  const ts = now();
  for (const row of rows) {
    const route = autoAssignCleaningRoute(row.location_id, db, { requireSupervisor: true });
    if (!route) continue;
    update.run(route.id, route.name, route.supervisorId || '', route.supervisorName || '', ts, row.id);
  }
}

// Periodic SLA breach check, escalation, and recurring tasks — every 5 minutes
setInterval(() => {
  try {
    const db = getDb();
    const ts = now();
    generateHourlyRestroomCleaningTickets(db);

    // 1. Mark newly breached tickets
    db.prepare(
      "UPDATE tickets SET sla_breached=1,updated_at=? WHERE sla_deadline < ? AND status NOT IN ('completed','rejected','cancelled') AND sla_breached=0 AND deleted_at IS NULL"
    ).run(ts, ts);

    // 2. First escalation: breach overdue > 30 min
    const esc1 = new Date(Date.now() - 30 * 60_000).toISOString();
    db.prepare(
      "UPDATE tickets SET escalation_level=1,escalated_at=?,updated_at=? WHERE sla_breached=1 AND escalation_level=0 AND sla_deadline < ? AND status NOT IN ('completed','rejected','cancelled') AND deleted_at IS NULL"
    ).run(ts, ts, esc1);

    // 3. Second escalation: breach overdue > 90 min
    const esc2 = new Date(Date.now() - 90 * 60_000).toISOString();
    db.prepare(
      "UPDATE tickets SET escalation_level=2,escalated_at=?,updated_at=? WHERE sla_breached=1 AND escalation_level=1 AND sla_deadline < ? AND status NOT IN ('completed','rejected','cancelled') AND deleted_at IS NULL"
    ).run(ts, ts, esc2);

    // 4. Run due recurring tasks
    const dueTasks = db.prepare(
      "SELECT * FROM recurring_tasks WHERE active=1 AND deleted_at IS NULL AND next_run_at <= ?"
    ).all(ts);
    for (const task of dueTasks) {
      try {
        const route = autoAssignCleaningRoute(task.location_id, db, { requireSupervisor: true });
        const nextRun = new Date(Date.now() + task.frequency_mins * 60_000).toISOString();
        if (!route) {
          db.prepare('UPDATE recurring_tasks SET last_run_at=?,next_run_at=?,updated_at=? WHERE id=?')
            .run(ts, nextRun, ts, task.id);
          logEvent(db, 'ticket.recurring_skipped', 'recurring_task', task.id, { id: '', role: 'system' }, {
            locationId: task.location_id,
            reason: 'missing_worker_or_supervisor'
          });
          console.log(`[recurring] skipped task ${task.id}: missing worker/supervisor route`);
          continue;
        }
        const id        = newId('t');
        const refNo     = generateRefNo(db);
        const slaDeadline = new Date(Date.now() + slaMins(task.category) * 60_000).toISOString();
        db.prepare(`
          INSERT INTO tickets
            (id,title,description,location_id,location_name_ar,location_name_en,
             assigned_to,assigned_to_name,supervisor_id,supervisor_name,
             created_by,created_by_id,status,priority,category,reference_no,sla_deadline,created_at,updated_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `).run(
          id, task.title_ar, 'مهمة دورية تلقائية',
          task.location_id, task.location_name_ar, task.location_name_en,
          route.id, route.name, route.supervisorId, route.supervisorName,
          'system', '', 'assigned', 'medium', task.category,
          refNo, slaDeadline, ts, ts
        );
        db.prepare('UPDATE recurring_tasks SET last_run_at=?,next_run_at=?,updated_at=? WHERE id=?')
          .run(ts, nextRun, ts, task.id);
        console.log(`[recurring] ticket ${id} (${refNo}) from task ${task.id}`);
      } catch (e) { console.error('[recurring]', e.message); }
    }

    // 5. Generate preventive work orders from due maintenance schedules
    const dueMaintenance = db.prepare(
      "SELECT * FROM maintenance_schedules WHERE active=1 AND deleted_at IS NULL AND next_run_at <= ?"
    ).all(ts);
    for (const schedule of dueMaintenance) {
      try {
        const id = generateScheduledMaintenance(db, schedule);
        console.log(`[maintenance-schedule] work order ${id} from schedule ${schedule.id}`);
      } catch (e) { console.error('[maintenance-schedule]', e.message); }
    }
  } catch (e) { console.error('[sla-check]', e.message); }
}, 300_000);

setTimeout(() => {
  try { generateHourlyRestroomCleaningTickets(getDb()); }
  catch (e) { console.error('[cleaning-hourly-startup]', e.message); }
}, 5_000);

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
      AND a.module = 'cleaning'
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
      let dbStatus='ok',storageStatus='ok';
      try { getDb().prepare('SELECT 1 AS ok').get(); } catch { dbStatus='error'; }
      try { fs.mkdirSync(UPLOADS_DIR,{recursive:true}); fs.accessSync(UPLOADS_DIR,fs.constants.R_OK|fs.constants.W_OK); } catch { storageStatus='error'; }
      const healthy=dbStatus==='ok'&&storageStatus==='ok';
      return send(res, healthy?200:503, {
        status:healthy?'ok':'degraded',version:'2.0.0',mode:'prototype',
        uptimeSeconds:Math.floor(process.uptime()),timestamp:now(),
        checks:{database:dbStatus,storage:storageStatus},
        memory:{rssMb:Math.round(process.memoryUsage().rss/1048576)}
      });
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
        const client = { res, user: publicUser(me) };
        sseClients.add(client);
        const hb = setInterval(() => {
          try { res.write(': hb\n\n'); } catch { clearInterval(hb); sseClients.delete(client); }
        }, 25_000);
        req.on('close', () => { clearInterval(hb); sseClients.delete(client); });
        return;
      }

      /* ── PUSH NOTIFICATIONS ────────────────────────────────── */
      if (req.method === 'GET' && url.pathname === '/api/push/public-key') {
        const me = sessionGetUser(req);
        if (!me) return send(res, 401, { error: 'UNAUTHORIZED' });
        const keys = ensureVapidKeys(getDb());
        return send(res, 200, { publicKey: keys.publicKey });
      }

      if (req.method === 'POST' && url.pathname === '/api/push/subscribe') {
        const me = sessionGetUser(req);
        if (!me) return send(res, 401, { error: 'UNAUTHORIZED' });
        if (!isTrustedMutation(req)) return send(res, 403, { error: 'FORBIDDEN' });
        const b = await bodyJSON(req);
        const ok = savePushSubscription(getDb(), me.id, b.subscription, ua);
        return ok ? send(res, 200, { ok: true }) : send(res, 400, { error: 'INVALID_SUBSCRIPTION' });
      }

      if (req.method === 'POST' && url.pathname === '/api/push/test') {
        const me = sessionGetUser(req);
        if (!me) return send(res, 401, { error: 'UNAUTHORIZED' });
        if (!isTrustedMutation(req)) return send(res, 403, { error: 'FORBIDDEN' });
        const db = getDb();
        ensureVapidKeys(db);
        const subscriptions = db.prepare(`
          SELECT * FROM push_subscriptions
          WHERE user_id = ? AND deleted_at IS NULL
        `).all(me.id);
        const payload = JSON.stringify({
          title: 'اختبار إشعارات مِرفق',
          body: `تم إرسال اختبار إلى ${me.name || me.username}`,
          icon: '/assets/logos/mrfq-logo-icon-light-v4.svg',
          badge: '/assets/logos/mrfq-favicon.svg',
          dir: 'rtl',
          lang: 'ar',
          tag: `push-test-${me.id}`,
          url: '/',
          timestamp: Date.now()
        });
        const results = await Promise.allSettled(subscriptions.map(sub => webpush.sendNotification({
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth }
        }, payload)));
        results.forEach((result, index) => {
          const statusCode = result.reason?.statusCode;
          if (result.status === 'rejected' && [403, 404, 410].includes(statusCode)) {
            try {
              db.prepare('UPDATE push_subscriptions SET deleted_at=?,updated_at=? WHERE id=?')
                .run(now(), now(), subscriptions[index].id);
            } catch {}
          }
        });
        return send(res, 200, {
          subscriptions: subscriptions.length,
          sent: results.filter(result => result.status === 'fulfilled').length,
          failed: results.filter(result => result.status === 'rejected').length
        });
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
        const items = Array.isArray(b.items) ? b.items.slice(0, 20).map(i => sanitize(String(i), 200)) : [];
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

      /* ── PUBLIC: HOSPITALITY MENU CATEGORIES (no login required) ── */
      if (req.method === 'GET' && url.pathname === '/api/public/hospitality/menu-categories') {
        return send(res, 200, { categories: dbMenuCategories(true) });
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
      if (!isTrustedMutation(req)) return send(res, 403, { error: 'CSRF_REJECTED' });

      if (await handlePlatformRoutes({ req, res, url, me, db, send, bodyJSON })) return;

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
        if (!canReview(me.role) && !canExportReports(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        const reports = dbReports();
        const rows = [
          ['id','reference_no','worker','location','status','approval','created_at','notes'],
          ...reports.map(r => [
            r.id, r.reference_no || '', r.worker_name, r.location_name_en || r.location_name_ar,
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
            .run(id, role, moduleForRole(role), ts);
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
        if (b.role && !ALLOWED_ROLES.includes(b.role)) return send(res, 400, { error: 'INVALID_ROLE' });
        if (b.role && !allowedRoleEditor(me.role, b.role)) return send(res, 403, { error: 'ROLE_NOT_ALLOWED' });
        const sets = [];
        const vals = [];
        if (b.name)       { sets.push('name = ?');        vals.push(sanitize(b.name, 100)); }
        if (b.username)   { sets.push('username = ?');    vals.push(sanitizeUsername(b.username)); }
        if (b.role)       { sets.push('role = ?');        vals.push(sanitize(b.role, 50)); }
        if (b.employeeNo !== undefined) { sets.push('employee_no = ?'); vals.push(sanitize(b.employeeNo, 50)); }
        if (b.defaultLocationId !== undefined) { sets.push('default_location_id = ?'); vals.push(sanitize(b.defaultLocationId, 80)); }
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
        if (!canManageFacilities(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
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
        const serviceModules = serviceModulesText(b.serviceModules, loc.type, loc.id);
        db.prepare(`
          INSERT INTO locations (id,type,name_ar,name_en,floor,zone,priority,active,created_at,updated_at,service_modules)
          VALUES (?,?,?,?,?,?,?,?,?,?,?)
        `).run(loc.id,loc.type,loc.name_ar,loc.name_en,loc.floor,loc.zone,loc.priority,loc.active,ts,ts,serviceModules);
        return send(res, 200, { location: mapLocation({ ...loc, service_modules: serviceModules }) });
      }

      /* ── LOCATIONS: UPDATE ──────────────────────────────────── */
      if (req.method === 'PUT' && url.pathname.startsWith('/api/locations/')) {
        if (!canManageFacilities(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
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
        if (b.serviceModules !== undefined) {
          sets.push('service_modules = ?');
          vals.push(serviceModulesText(b.serviceModules, b.type || loc.type, id));
        }
        if (b.active !== undefined) { sets.push('active = ?'); vals.push(b.active ? 1 : 0); }
        sets.push('updated_at = ?'); vals.push(now()); vals.push(id);
        if (sets.length > 1) db.prepare(`UPDATE locations SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
        const updated = db.prepare('SELECT * FROM locations WHERE id = ?').get(id);
        return send(res, 200, { location: mapLocation(updated) });
      }

      /* ── LOCATIONS: DELETE (soft) ───────────────────────────── */
      if (req.method === 'DELETE' && url.pathname.startsWith('/api/locations/')) {
        if (!canManageFacilities(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        const id = decodeURIComponent(url.pathname.split('/').pop());
        db.prepare('UPDATE locations SET deleted_at = ?, updated_at = ? WHERE id = ?').run(now(), now(), id);
        db.prepare('DELETE FROM assignments WHERE location_id = ?').run(id);
        return send(res, 200, { ok: true });
      }

      /* ── LOCATION GROUPS: CREATE/UPDATE/DELETE ─────────────── */
      if (req.method === 'POST' && url.pathname === '/api/location-groups') {
        if (!canManageFacilities(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        const b = await bodyJSON(req);
        const groupId = sanitize(b.id || ('grp-' + crypto.randomBytes(4).toString('hex')), 80)
          .replace(/[^a-zA-Z0-9\-_]/g, '');
        if (!groupId) return send(res, 400, { error: 'MISSING_GROUP_ID' });
        if (db.prepare('SELECT 1 FROM location_groups WHERE id = ?').get(groupId))
          return send(res, 409, { error: 'GROUP_ID_EXISTS' });
        const memberIds = Array.isArray(b.memberIds) ? [...new Set(b.memberIds.map(x => sanitize(x, 80)).filter(Boolean))] : [];
        const existing = new Set(db.prepare(`SELECT id FROM locations WHERE deleted_at IS NULL`).all().map(r => r.id));
        const validMemberIds = memberIds.filter(id => existing.has(id));
        if (validMemberIds.length < 2) return send(res, 400, { error: 'GROUP_REQUIRES_MULTIPLE_LOCATIONS' });
        const ts = now();
        db.transaction(() => {
          db.prepare(`
            INSERT INTO location_groups (id,name_ar,name_en,floor,type,active,created_at,updated_at)
            VALUES (?,?,?,?,?,?,?,?)
          `).run(groupId, sanitize(b.nameAr, 200), sanitize(b.nameEn, 200), sanitize(b.floor, 10), sanitize(b.type, 30) || 'group', b.active !== false ? 1 : 0, ts, ts);
          const ins = db.prepare('INSERT OR IGNORE INTO location_group_members (group_id,location_id,created_at) VALUES (?,?,?)');
          validMemberIds.forEach(locationId => ins.run(groupId, locationId, ts));
        })();
        return send(res, 200, { group: dbLocationGroups().find(g => g.id === groupId) });
      }

      if (req.method === 'PUT' && url.pathname.startsWith('/api/location-groups/')) {
        if (!canManageFacilities(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        const groupId = decodeURIComponent(url.pathname.split('/').pop());
        const group = db.prepare('SELECT * FROM location_groups WHERE id = ? AND deleted_at IS NULL').get(groupId);
        if (!group) return send(res, 404, { error: 'GROUP_NOT_FOUND' });
        const b = await bodyJSON(req);
        const memberIds = Array.isArray(b.memberIds) ? [...new Set(b.memberIds.map(x => sanitize(x, 80)).filter(Boolean))] : null;
        const existing = new Set(db.prepare(`SELECT id FROM locations WHERE deleted_at IS NULL`).all().map(r => r.id));
        const validMemberIds = memberIds ? memberIds.filter(id => existing.has(id)) : null;
        if (validMemberIds && validMemberIds.length < 2) return send(res, 400, { error: 'GROUP_REQUIRES_MULTIPLE_LOCATIONS' });
        const sets = []; const vals = [];
        if (b.nameAr !== undefined) { sets.push('name_ar = ?'); vals.push(sanitize(b.nameAr, 200)); }
        if (b.nameEn !== undefined) { sets.push('name_en = ?'); vals.push(sanitize(b.nameEn, 200)); }
        if (b.floor !== undefined)  { sets.push('floor = ?'); vals.push(sanitize(b.floor, 10)); }
        if (b.type !== undefined)   { sets.push('type = ?'); vals.push(sanitize(b.type, 30) || 'group'); }
        if (b.active !== undefined) { sets.push('active = ?'); vals.push(b.active ? 1 : 0); }
        sets.push('updated_at = ?'); vals.push(now()); vals.push(groupId);
        db.transaction(() => {
          db.prepare(`UPDATE location_groups SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
          if (validMemberIds) {
            db.prepare('DELETE FROM location_group_members WHERE group_id = ?').run(groupId);
            const ins = db.prepare('INSERT OR IGNORE INTO location_group_members (group_id,location_id,created_at) VALUES (?,?,?)');
            validMemberIds.forEach(locationId => ins.run(groupId, locationId, now()));
          }
        })();
        return send(res, 200, { group: dbLocationGroups().find(g => g.id === groupId) });
      }

      if (req.method === 'DELETE' && url.pathname.startsWith('/api/location-groups/')) {
        if (!canManageFacilities(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        const groupId = decodeURIComponent(url.pathname.split('/').pop());
        db.prepare('UPDATE location_groups SET deleted_at = ?, updated_at = ?, active = 0 WHERE id = ?').run(now(), now(), groupId);
        return send(res, 200, { ok: true });
      }

      /* ── ZONES ──────────────────────────────────────────────── */
      if (req.method === 'POST' && url.pathname === '/api/zones') {
        if (!canManageFacilities(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        const b = await bodyJSON(req);
        const z = sanitize(b.zone, 20);
        if (!z) return send(res, 400, { error: 'EMPTY' });
        db.prepare('INSERT OR IGNORE INTO zones (name) VALUES (?)').run(z);
        return send(res, 200, { zones: dbZones() });
      }
      if (req.method === 'DELETE' && url.pathname.startsWith('/api/zones/')) {
        if (!canManageFacilities(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        const z = decodeURIComponent(url.pathname.split('/').pop());
        db.prepare('DELETE FROM zones WHERE name = ?').run(z);
        return send(res, 200, { zones: dbZones() });
      }

      /* ── ASSIGNMENTS ────────────────────────────────────────── */
      if (req.method === 'POST' && url.pathname === '/api/assignments') {
        const canManageAssignments = canManageGlobalUsers(me.role) || me.role === 'facility_manager' || canManageModuleTeam(me.role);
        if (!canManageAssignments) return send(res, 403, { error: 'FORBIDDEN' });
        const b          = await bodyJSON(req);
        const workerId   = sanitize(b.workerId, 50);
        const module = ['cleaning','maintenance','hospitality'].includes(b.module) ? b.module : moduleForRole(me.role);
        const workerRoles = { cleaning:'cleaner', maintenance:'maintenance_worker', hospitality:'hospitality_worker' };
        const supervisorRoles = { cleaning:'cleaning_supervisor', maintenance:'maintenance_supervisor', hospitality:'hospitality_supervisor' };
        const worker = db.prepare('SELECT role FROM users WHERE id=? AND deleted_at IS NULL').get(workerId);
        if (!worker) return send(res, 404, { error: 'USER_NOT_FOUND' });
        const workerModuleRole = workerRoles[module];
        if (!canManageGlobalUsers(me.role) && me.role !== 'facility_manager' && !allowedRoleEditor(me.role, workerModuleRole)) return send(res, 403, { error: 'ROLE_NOT_ALLOWED' });
        if (!userHasRole(db, workerId, workerModuleRole)) return send(res, 400, { error: 'WORKER_ROLE_MISMATCH' });
        const locationIds = Array.isArray(b.locationIds)
          ? b.locationIds.map(l => sanitize(l, 80)).filter(Boolean) : [];
        const groupIds = Array.isArray(b.groupIds)
          ? b.groupIds.map(g => sanitize(g, 80)).filter(Boolean) : [];
        const groupLocationIds = groupIds.length ? db.prepare(`
          SELECT DISTINCT gm.location_id
          FROM location_group_members gm
          JOIN location_groups g ON g.id = gm.group_id
          JOIN locations l ON l.id = gm.location_id
          WHERE gm.group_id IN (${groupIds.map(() => '?').join(',')})
            AND g.active = 1 AND g.deleted_at IS NULL AND l.deleted_at IS NULL
        `).all(...groupIds).map(r => r.location_id) : [];
        const expandedLocationIds = [...new Set([...locationIds, ...groupLocationIds])];
        const supportedLocationIds = expandedLocationIds.length ? db.prepare(`
          SELECT id,type,service_modules FROM locations
          WHERE id IN (${expandedLocationIds.map(() => '?').join(',')})
            AND active = 1 AND deleted_at IS NULL
        `).all(...expandedLocationIds)
          .filter(loc => normalizeServiceModules(loc.service_modules, loc.type, loc.id).includes(module))
          .map(loc => loc.id) : [];
        if (expandedLocationIds.length && !supportedLocationIds.length) {
          return send(res, 400, { error: 'NO_SUPPORTED_LOCATIONS' });
        }
        const supervisorId = sanitize(b.supervisorId || '', 50);
        if (supervisorId) {
          const sup = db.prepare("SELECT id FROM users WHERE id=? AND active=1 AND deleted_at IS NULL").get(supervisorId);
          if (!sup || !userHasRole(db, supervisorId, supervisorRoles[module])) return send(res, 400, { error: 'SUPERVISOR_NOT_FOUND' });
        }
        db.transaction(() => {
          db.prepare('DELETE FROM assignments WHERE worker_id = ? AND module = ?').run(workerId, module);
          const ins = db.prepare('INSERT OR IGNORE INTO assignments (worker_id,location_id,created_at,supervisor_id,module) VALUES (?,?,?,?,?)');
          supportedLocationIds.forEach(lid => ins.run(workerId, lid, now(), supervisorId, module));
        })();
        return send(res, 200, { ok: true });
      }

      /* ── TICKETS: CREATE ────────────────────────────────────── */
      if (req.method === 'POST' && url.pathname === '/api/tickets') {
        if (!canCreateTickets(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        const b   = await bodyJSON(req);
        const loc = getLocationByAnyId(db, b.locationId);
        if (!loc) return send(res, 400, { error: 'MISSING_LOCATION' });
        // Worker is optional — auto-assign if not provided
        let worker = null;
        let supervisor = null;
        const supervisorId = sanitize(b.supervisorId || '', 50);
        if (supervisorId) {
          supervisor = activeUserWithRole(db, supervisorId, 'cleaning_supervisor');
          if (!supervisor) return send(res, 400, { error: 'SUPERVISOR_NOT_FOUND' });
        }
        if (b.assignedTo) {
          worker = activeUserWithRole(db, b.assignedTo, 'cleaner');
          if (!worker) return send(res, 400, { error: 'WORKER_NOT_FOUND' });
          if (!cleaningAssignment(db, worker.id)) return send(res, 403, { error: 'NOT_ASSIGNED' });
          if (supervisor && !workerInCleaningSupervisorScope(db, supervisor.id, worker.id)) {
            return send(res, 403, { error: 'WORKER_OUT_OF_SCOPE' });
          }
        } else {
          const auto = autoAssignCleaningRoute(loc.id, db, { requireSupervisor: !!supervisor });
          if (auto && (!supervisor || auto.supervisorId === supervisor.id)) {
            worker = activeUserWithRole(db, auto.id, 'cleaner');
            if (!supervisor && auto.supervisorId) supervisor = activeUserWithRole(db, auto.supervisorId, 'cleaning_supervisor');
          }
        }
        const id            = newId('t');
        const ts            = now();
        const priority      = ['high','medium','low'].includes(b.priority) ? b.priority : 'medium';
        const category      = sanitize(b.category || 'general', 50);
        const refNo         = generateRefNo(db);
        const slaDeadline   = computeSlaDeadline(category);
        const initialStatus = worker ? 'assigned' : 'submitted';
        db.prepare(`
          INSERT INTO tickets (id,title,description,location_id,location_name_ar,location_name_en,
            assigned_to,assigned_to_name,supervisor_id,supervisor_name,created_by,created_by_id,status,priority,
            category,reference_no,notes,sla_deadline,created_at,updated_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `).run(id, sanitize(b.title, 200) || 'بلاغ نظافة',
               sanitize(b.description, 1000), loc.id, loc.name_ar, loc.name_en,
               worker?.id || null, worker?.name || '',
               supervisor?.id || '', supervisor?.name || '',
               me.name, me.id, initialStatus, priority, category, refNo, '', slaDeadline, ts, ts);
        const ticket = ticketRow(db.prepare(`
          SELECT t.*, NULL AS photo_files FROM tickets t WHERE t.id = ?
        `).get(id));
        broadcast('ticket_created', { ticket });
        logEvent(db, 'ticket.submitted', 'ticket', id, me, { category, status: initialStatus, locationId: loc.id });
        return send(res, 200, { ticket });
      }

      /* ── TICKETS: COMPLETE ──────────────────────────────────── */
      if (req.method === 'POST' && url.pathname === '/api/tickets/complete') {
        if (me.role !== 'cleaner') return send(res, 403, { error: 'FORBIDDEN' });
        const b = await bodyJSON(req);
        const t = db.prepare("SELECT * FROM tickets WHERE id = ? AND module = 'cleaning' AND deleted_at IS NULL").get(b.id);
        if (!t) return send(res, 404, { error: 'TICKET_NOT_FOUND' });
        if (t.assigned_to !== me.id) return send(res, 403, { error: 'FORBIDDEN' });
        if (!(TICKET_TRANSITIONS[t.status] || []).includes('waiting_verification')) {
          return send(res, 400, { error: 'INVALID_TRANSITION' });
        }
        const rawAfterPhotos = Array.isArray(b.afterPhotos) ? b.afterPhotos : (Array.isArray(b.photos) ? b.photos : []);
        const savedPhotos = processPhotosTyped(rawAfterPhotos, me.id, null, t.id, 'after');
        if (!savedPhotos.length) return send(res, 400, { error: 'PHOTO_REQUIRED' });
        const completionMins = Math.round((Date.now() - new Date(t.created_at).getTime()) / 60_000);
        const slaBreached    = t.sla_deadline && new Date(t.sla_deadline) < new Date() ? 1 : (t.sla_breached || 0);
        const completedTs    = now();
        db.prepare(`
          UPDATE tickets SET status='waiting_verification', notes=?, verification_requested_at=?, updated_at=?,
            completion_time_mins=?, sla_breached=? WHERE id=?
        `).run(sanitize(b.notes, 1000), completedTs, completedTs, completionMins, slaBreached, t.id);
        const ticket = ticketRow(db.prepare(`
          SELECT t.*, GROUP_CONCAT(p.filename) AS photo_files
          FROM tickets t LEFT JOIN photos p ON p.ticket_id=t.id AND p.deleted_at IS NULL
          WHERE t.id=? GROUP BY t.id
        `).get(t.id));
        broadcast('ticket_waiting_verification', { ticket });
        logEvent(db, 'ticket.waiting_verification', 'ticket', t.id, me, { completionMins });
        return send(res, 200, { ticket });
      }

      /* ── TICKETS: SUPERVISOR ESCALATION ───────────────────── */
      if (req.method === 'POST' && /^\/api\/tickets\/[^/]+\/escalate$/.test(url.pathname)) {
        if (me.role !== 'cleaning_supervisor') return send(res, 403, { error: 'FORBIDDEN' });
        const id = sanitize(url.pathname.split('/')[3], 50);
        const b = await bodyJSON(req);
        const t = db.prepare("SELECT * FROM tickets WHERE id = ? AND module = 'cleaning' AND deleted_at IS NULL").get(id);
        if (!t) return send(res, 404, { error: 'TICKET_NOT_FOUND' });
        if (!canActOnCleaningTicket(me, t)) return send(res, 403, { error: 'FORBIDDEN' });
        if (t.status !== 'waiting_verification') return send(res, 400, { error: 'INVALID_TRANSITION' });
        const savedPhotos = processPhotosTyped(Array.isArray(b.photos) ? b.photos : [], me.id, null, t.id, 'escalation');
        if (!savedPhotos.length) return send(res, 400, { error: 'PHOTO_REQUIRED' });
        const note = sanitize(b.note || b.notes || '', 1000).trim();
        const ts = now();
        const slaDeadline = computeSlaDeadline(t.category || 'general');
        db.prepare(`
          UPDATE tickets
          SET status='reclean_required', escalated_at=?, escalation_level=MAX(escalation_level, 1),
              notes=?, sla_deadline=?, sla_breached=0, updated_at=?
          WHERE id=?
        `).run(ts, note, slaDeadline, ts, id);
        if (note) {
          db.prepare(
            'INSERT INTO ticket_comments (id,ticket_id,user_id,user_name,user_role,body,created_at) VALUES (?,?,?,?,?,?,?)'
          ).run(newId('c'), id, me.id, me.name, me.role, note, ts);
        }
        const ticket = ticketRow(db.prepare(`
          SELECT t.*, GROUP_CONCAT(p.filename) AS photo_files, GROUP_CONCAT(p.photo_type) AS photo_types
          FROM tickets t LEFT JOIN photos p ON p.ticket_id=t.id AND p.deleted_at IS NULL
          WHERE t.id=? GROUP BY t.id
        `).get(id));
        broadcast('ticket_escalated', { ticket });
        logEvent(db, 'ticket.escalated_by_supervisor', 'ticket', id, me, { note, photoCount: savedPhotos.length });
        return send(res, 200, { ticket });
      }

      /* ── TICKETS: UPDATE ────────────────────────────────────── */
      if (req.method === 'PUT' && url.pathname.startsWith('/api/tickets/')) {
        if (!canCreateTickets(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        const id = sanitize(url.pathname.split('/').pop(), 50);
        const b  = await bodyJSON(req);
        const t  = db.prepare("SELECT * FROM tickets WHERE id = ? AND module = 'cleaning' AND deleted_at IS NULL").get(id);
        if (!t) return send(res, 404, { error: 'TICKET_NOT_FOUND' });
        if (!canActOnCleaningTicket(me, t)) return send(res, 403, { error: 'FORBIDDEN' });
        const sets = []; const vals = [];
        const changes = {};
        if (b.title !== undefined)    { sets.push('title = ?');       vals.push(sanitize(b.title, 200)); }
        if (b.description !== undefined){ sets.push('description = ?'); vals.push(sanitize(b.description, 1000)); }
        if (['high','medium','low'].includes(b.priority)) { sets.push('priority = ?'); vals.push(b.priority); }
        if (b.status !== undefined) {
          if (!TICKET_STATUSES.includes(b.status)) return send(res, 400, { error: 'INVALID_STATUS' });
          if (me.role === 'cleaning_supervisor' && b.status === 'rejected') return send(res, 403, { error: 'ESCALATION_REQUIRED' });
          if (b.status !== t.status) {
            if (!(TICKET_TRANSITIONS[t.status] || []).includes(b.status)) {
              return send(res, 400, { error: 'INVALID_TRANSITION' });
            }
            sets.push('status = ?'); vals.push(b.status);
            changes.status = { from: t.status, to: b.status };
            const ts = now();
            if (b.status === 'completed')  { sets.push('completed_at = ?'); vals.push(ts); }
            if (b.status === 'accepted')   { sets.push('accepted_at = ?');  vals.push(ts); }
            if (b.status === 'in_progress'){ sets.push('started_at = ?');   vals.push(ts); }
            if (b.status === 'waiting_verification') { sets.push('verification_requested_at = ?'); vals.push(ts); }
            if (b.status === 'cancelled')  { sets.push('cancelled_at = ?'); vals.push(ts); }
            if (b.status === 'reclean_required') {
              sets.push('sla_deadline = ?', 'sla_breached = ?', 'escalation_level = MAX(escalation_level, 1)');
              vals.push(computeSlaDeadline(t.category || 'general'), 0);
            }
          }
        }
        if (b.assignedTo) {
          const w = activeUserWithRole(db, b.assignedTo, 'cleaner');
          if (!w) return send(res, 400, { error: 'WORKER_NOT_FOUND' });
          if (!cleaningAssignment(db, w.id)) return send(res, 403, { error: 'NOT_ASSIGNED' });
          const targetSupervisorId = sanitize(b.supervisorId !== undefined ? b.supervisorId : (t.supervisor_id || ''), 50);
          if (me.role === 'cleaning_supervisor') {
            const scope = cleaningSupervisorScope(me.id, dbAssignments(), { strict: true });
            if (!scope.workerIds.has(w.id)) return send(res, 403, { error: 'WORKER_OUT_OF_SCOPE' });
          }
          if (targetSupervisorId && !workerInCleaningSupervisorScope(db, targetSupervisorId, w.id)) {
            return send(res, 403, { error: 'WORKER_OUT_OF_SCOPE' });
          }
          sets.push('assigned_to = ?', 'assigned_to_name = ?'); vals.push(w.id, w.name);
          if (w.id !== t.assigned_to) changes.assignedTo = { from: t.assigned_to || '', to: w.id };
        }
        if (b.supervisorId !== undefined && ['system_admin','facility_manager','cleaning_manager'].includes(me.role)) {
          const supervisorId = sanitize(b.supervisorId || '', 50);
          if (!supervisorId) {
            sets.push('supervisor_id = ?', 'supervisor_name = ?'); vals.push('', '');
            if (t.supervisor_id) changes.supervisorId = { from: t.supervisor_id, to: '' };
          } else {
            const s = activeUserWithRole(db, supervisorId, 'cleaning_supervisor');
            if (!s) return send(res, 400, { error: 'SUPERVISOR_NOT_FOUND' });
            const targetWorkerId = sanitize(b.assignedTo || t.assigned_to || '', 50);
            if (targetWorkerId && !workerInCleaningSupervisorScope(db, s.id, targetWorkerId)) {
              return send(res, 403, { error: 'WORKER_OUT_OF_SCOPE' });
            }
            sets.push('supervisor_id = ?', 'supervisor_name = ?'); vals.push(s.id, s.name);
            if (s.id !== t.supervisor_id) changes.supervisorId = { from: t.supervisor_id || '', to: s.id };
          }
        }
        sets.push('updated_at = ?'); vals.push(now()); vals.push(id);
        if (sets.length > 1) db.prepare(`UPDATE tickets SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
        if (me.role === 'maintenance_worker' && b.status) {
          db.prepare(`UPDATE maintenance_work_order_assignees SET status=?,accepted_at=CASE WHEN ?='accepted' THEN ? ELSE accepted_at END
            WHERE work_order_id=? AND technician_id=?`).run(b.status,b.status,now(),id,me.id);
        }
        if (b.status === 'completed') {
          db.prepare("UPDATE maintenance_work_order_assignees SET status='completed',completed_at=? WHERE work_order_id=?").run(now(),id);
          if (t.asset_id) db.prepare("UPDATE maintenance_assets SET status='operational',updated_at=? WHERE id=?").run(now(),t.asset_id);
        } else if (b.status && ['diagnosing','in_progress','awaiting_parts','awaiting_vendor','awaiting_permit','on_hold'].includes(b.status) && t.asset_id) {
          db.prepare("UPDATE maintenance_assets SET status='maintenance',updated_at=? WHERE id=?").run(now(),t.asset_id);
        }
        const ticket = ticketRow(db.prepare(`
          SELECT t.*, GROUP_CONCAT(p.filename) AS photo_files
          FROM tickets t LEFT JOIN photos p ON p.ticket_id=t.id AND p.deleted_at IS NULL
          WHERE t.id=? GROUP BY t.id
        `).get(id));
        if (Object.keys(changes).length) {
          logEvent(db, 'ticket.updated', 'ticket', id, me, changes);
        }
        return send(res, 200, { ticket });
      }

      /* ── TICKETS: DELETE (soft) ─────────────────────────────── */
      if (req.method === 'DELETE' && url.pathname.startsWith('/api/tickets/')) {
        if (!canDelete(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        const id = sanitize(url.pathname.split('/').pop(), 50);
        const t  = db.prepare("SELECT 1 FROM tickets WHERE id = ? AND module = 'cleaning' AND deleted_at IS NULL").get(id);
        if (!t) return send(res, 404, { error: 'TICKET_NOT_FOUND' });
        db.prepare('UPDATE tickets SET deleted_at = ?, updated_at = ? WHERE id = ?').run(now(), now(), id);
        logEvent(db, 'ticket.deleted', 'ticket', id, me, { id });
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
          'SELECT location_id FROM assignments WHERE worker_id = ? AND location_id = ? AND (module IS NULL OR module = ?)'
        ).get(me.id, loc.id, 'cleaning');
        if (!asgRow) return send(res, 403, { error: 'NOT_ASSIGNED' });
        if (Array.isArray(b.beforePhotos) && b.beforePhotos.length) {
          return send(res, 400, { error: 'BEFORE_PHOTOS_NOT_ALLOWED' });
        }
        const tasks  = Array.isArray(b.tasks) ? b.tasks.map(t => sanitize(t, 200)).slice(0, 50) : [];
        const id     = newId('r');
        const ts     = now();
        const refNo  = generateRefNo(db);
        const status = ['completed','needs_followup'].includes(b.status) ? b.status : 'completed';
        // Cleaning reports are approved against after-execution evidence only.
        const afterPayload = Array.isArray(b.afterPhotos) ? b.afterPhotos : (Array.isArray(b.photos) ? b.photos : []);
        if (!afterPayload.length) return send(res, 400, { error: 'PHOTO_REQUIRED' });
        let savedAfterPhotos = [];
        try {
          db.transaction(() => {
            db.prepare(`
              INSERT INTO reports (id,worker_id,worker_name,location_id,location_name_ar,location_name_en,
                location_type,status,tasks,notes,reference_no,approval_status,created_at,updated_at)
              VALUES (?,?,?,?,?,?,?,?,?,?,?,'pending',?,?)
            `).run(id, me.id, me.name, loc.id, loc.name_ar, loc.name_en,
                   loc.type, status, JSON.stringify(tasks), sanitize(b.notes, 1000), refNo, ts, ts);
            savedAfterPhotos = processPhotosTyped(afterPayload, me.id, id, null, 'after');
            if (!savedAfterPhotos.length) throw new Error('PHOTO_REQUIRED');
          })();
        } catch (e) {
          if (e.message === 'PHOTO_REQUIRED') return send(res, 400, { error: 'PHOTO_REQUIRED' });
          throw e;
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
      if (req.method === 'POST' && /^\/api\/reports\/[^/]+\/escalate$/.test(url.pathname)) {
        if (!['system_admin','facility_manager','cleaning_manager','cleaning_supervisor'].includes(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        const id = sanitize(url.pathname.split('/')[3], 50);
        const b = await bodyJSON(req);
        const r = db.prepare("SELECT * FROM reports WHERE id = ? AND module = 'cleaning' AND deleted_at IS NULL").get(id);
        if (!r) return send(res, 404, { error: 'REPORT_NOT_FOUND' });
        if (me.role === 'cleaning_supervisor') {
          const scope = cleaningSupervisorScope(me.id, dbAssignments(), { strict: true });
          if (!scope.workerIds.has(r.worker_id) && !scope.locationIds.has(r.location_id)) {
            return send(res, 403, { error: 'FORBIDDEN' });
          }
        }
        const savedPhotos = processPhotosTyped(Array.isArray(b.photos) ? b.photos : [], me.id, id, null, 'escalation');
        if (!savedPhotos.length) return send(res, 400, { error: 'PHOTO_REQUIRED' });
        const note = sanitize(b.note || b.notes || '', 500).trim();
        const reviewTs = now();
        if (r.approval_status === 'pending') {
          db.prepare(`
            UPDATE reports SET approval_status='needs_recleaning', approved_by=?, approved_at=?, review_note=?, updated_at=? WHERE id=?
          `).run(me.name, reviewTs, note, reviewTs, id);
        } else if (note) {
          const mergedNote = [r.review_note, `${me.name}: ${note}`].filter(Boolean).join('\n');
          db.prepare('UPDATE reports SET review_note=?, updated_at=? WHERE id=?').run(mergedNote, reviewTs, id);
        } else {
          db.prepare('UPDATE reports SET updated_at=? WHERE id=?').run(reviewTs, id);
        }
        db.prepare(`
          INSERT INTO approval_history
            (entity_type, entity_id, level, approver_id, approver_role, action, notes, created_at)
          VALUES ('report', ?, 1, ?, ?, ?, ?, ?)
        `).run(id, me.id, me.role, r.approval_status === 'pending' ? 'needs_recleaning' : 'note_added', note, reviewTs);
        const report = reportRow(db.prepare(`
          SELECT r.*, GROUP_CONCAT(p.filename) AS photo_files, GROUP_CONCAT(p.photo_type) AS photo_types
          FROM reports r LEFT JOIN photos p ON p.report_id=r.id AND p.deleted_at IS NULL
          WHERE r.id=? GROUP BY r.id
        `).get(id));
        broadcast(r.approval_status === 'pending' ? 'report_reviewed' : 'report_note_added', { report, reviewedBy: me.name });
        logEvent(db, 'report.note_with_photo', 'report', id, me, {
          status: report.approvalStatus,
          note,
          photoCount: savedPhotos.length
        });
        return send(res, 200, { report });
      }

      if (req.method === 'POST' && url.pathname === '/api/reports/review') {
        if (!canReview(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        const b = await bodyJSON(req);
        const r = db.prepare("SELECT * FROM reports WHERE id = ? AND module = 'cleaning' AND deleted_at IS NULL").get(b.id);
        if (!r) return send(res, 404, { error: 'REPORT_NOT_FOUND' });
        if (me.role === 'cleaning_supervisor') {
          const scope = cleaningSupervisorScope(me.id, dbAssignments(), { strict: true });
          if (!scope.workerIds.has(r.worker_id) && !scope.locationIds.has(r.location_id)) {
            return send(res, 403, { error: 'FORBIDDEN' });
          }
        }
        if (r.approval_status !== 'pending') return send(res, 400, { error: 'ALREADY_REVIEWED' });
        if (!REPORT_REVIEW_STATUSES.includes(b.status)) return send(res, 400, { error: 'INVALID_STATUS' });
        if (me.role === 'cleaning_supervisor' && b.status === 'rejected') return send(res, 403, { error: 'ESCALATION_REQUIRED' });
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
      if (req.method === 'DELETE' && /^\/api\/reports\/[^/]+$/.test(url.pathname)) {
        if (!canDelete(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        const id = sanitize(url.pathname.split('/').pop(), 50);
        const r  = db.prepare("SELECT 1 FROM reports WHERE id = ? AND module = 'cleaning' AND deleted_at IS NULL").get(id);
        if (!r) return send(res, 404, { error: 'REPORT_NOT_FOUND' });
        db.prepare('UPDATE reports SET deleted_at = ?, updated_at = ? WHERE id = ?').run(now(), now(), id);
        logEvent(db, 'report.deleted', 'report', id, me, { id });
        return send(res, 200, { ok: true });
      }

      /* ── SETTINGS UPDATE ────────────────────────────────────── */
      if (req.method === 'POST' && url.pathname === '/api/settings') {
        if (!['system_admin', 'facility_manager'].includes(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        const b = await bodyJSON(req);
        const REQUEST_CHANNEL_KEYS = ['employee_cleaning_requests_enabled','employee_maintenance_requests_enabled','employee_hospitality_requests_enabled'];
        if (me.role !== 'system_admin' && Object.keys(b).some(k=>REQUEST_CHANNEL_KEYS.includes(k)))
          return send(res, 403, { error: 'FORBIDDEN' });
        const ALLOWED_KEYS = ['sla_mins_emergency','sla_mins_spill','sla_mins_restroom','sla_mins_meeting_room','sla_mins_general','maint_sla_mins_electrical','maint_sla_mins_plumbing','maint_sla_mins_hvac','maint_sla_mins_civil','maint_sla_mins_general','frequency_minutes','require_photo',...REQUEST_CHANNEL_KEYS];
        Object.entries(b).filter(([k]) => ALLOWED_KEYS.includes(k)).forEach(([k, v]) => {
          db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(k, String(v));
        });
        logEvent(db, 'settings.updated', 'settings', 'global', me, {});
        return send(res, 200, { ok: true, settings: dbSettings() });
      }

      /* ── CLEANING AUTO RESTROOM: STATUS ─────────────────────── */
      if (req.method === 'GET' && url.pathname === '/api/cleaning/auto-restroom/status') {
        if (!['system_admin','facility_manager','cleaning_manager','cleaning_supervisor',ADMIN_COORDINATOR_ROLE].includes(me.role))
          return send(res, 403, { error: 'FORBIDDEN' });
        return send(res, 200, { cleaningAutoRestroom: cleaningRestroomAutoStatus(db) });
      }

      /* ── TICKET ACTIVITY ───────────────────────────────────── */
      if (req.method === 'GET' && /^\/api\/tickets\/[^/]+\/activity$/.test(url.pathname)) {
        const ticketId = sanitize(url.pathname.split('/')[3], 50);
        const ticket = ticketRow(db.prepare("SELECT t.*, NULL AS photo_files, NULL AS photo_types FROM tickets t WHERE t.id=? AND deleted_at IS NULL").get(ticketId));
        if (!ticket) return send(res, 404, { error: 'TICKET_NOT_FOUND' });
        if (!canReceiveTicketEvent(publicUser(me), ticket)) return send(res, 403, { error: 'FORBIDDEN' });
        const events = db.prepare(`
          SELECT e.*, u.name AS actor_name
          FROM event_log e LEFT JOIN users u ON u.id = e.actor_id
          WHERE e.entity_type='ticket' AND e.entity_id=?
          ORDER BY e.created_at ASC LIMIT 100
        `).all(ticketId);
        return send(res, 200, { events: events.map(e => ({
          id: e.id, eventType: e.event_type, actorId: e.actor_id,
          actorName: e.actor_name || '', actorRole: e.actor_role,
          payload: JSON.parse(e.payload || '{}'), createdAt: e.created_at
        }))});
      }

      /* ── REPORT ACTIVITY ────────────────────────────────────── */
      if (req.method === 'GET' && /^\/api\/reports\/[^/]+\/activity$/.test(url.pathname)) {
        const reportId = sanitize(url.pathname.split('/')[3], 50);
        const report = reportRow(db.prepare("SELECT r.*, NULL AS photo_files, NULL AS photo_types FROM reports r WHERE r.id=? AND deleted_at IS NULL").get(reportId));
        if (!report) return send(res, 404, { error: 'REPORT_NOT_FOUND' });
        if (!canReceiveReportEvent(publicUser(me), report)) return send(res, 403, { error: 'FORBIDDEN' });
        const events = db.prepare(`
          SELECT e.*, u.name AS actor_name
          FROM event_log e LEFT JOIN users u ON u.id = e.actor_id
          WHERE e.entity_type='report' AND e.entity_id=?
          ORDER BY e.created_at ASC LIMIT 100
        `).all(reportId);
        return send(res, 200, { events: events.map(e => ({
          id: e.id, eventType: e.event_type, actorId: e.actor_id,
          actorName: e.actor_name || '', actorRole: e.actor_role,
          payload: JSON.parse(e.payload || '{}'), createdAt: e.created_at
        }))});
      }

      /* ── TICKET COMMENTS: LIST ─────────────────────────────── */
      if (req.method === 'GET' && /^\/api\/tickets\/[^/]+\/comments$/.test(url.pathname)) {
        const ticketId = sanitize(url.pathname.split('/')[3], 50);
        const rows = db.prepare(
          'SELECT * FROM ticket_comments WHERE ticket_id=? AND deleted_at IS NULL ORDER BY created_at ASC'
        ).all(ticketId);
        return send(res, 200, { comments: rows.map(r => ({
          id: r.id, ticketId: r.ticket_id, userId: r.user_id,
          userName: r.user_name, userRole: r.user_role,
          body: r.body, createdAt: r.created_at
        }))});
      }

      /* ── TICKET COMMENTS: ADD ───────────────────────────────── */
      if (req.method === 'POST' && /^\/api\/tickets\/[^/]+\/comments$/.test(url.pathname)) {
        const ticketId = sanitize(url.pathname.split('/')[3], 50);
        const t = db.prepare('SELECT 1 FROM tickets WHERE id=? AND deleted_at IS NULL').get(ticketId);
        if (!t) return send(res, 404, { error: 'TICKET_NOT_FOUND' });
        const b    = await bodyJSON(req);
        const body = sanitize(b.body || '', 1000).trim();
        if (!body) return send(res, 400, { error: 'EMPTY_BODY' });
        const id   = newId('c');
        const ts2  = now();
        db.prepare(
          'INSERT INTO ticket_comments (id,ticket_id,user_id,user_name,user_role,body,created_at) VALUES (?,?,?,?,?,?,?)'
        ).run(id, ticketId, me.id, me.name, me.role, body, ts2);
        logEvent(db, 'ticket.comment.added', 'ticket', ticketId, me, { commentId: id, body });
        return send(res, 200, { comment: { id, ticketId, userId: me.id, userName: me.name, userRole: me.role, body, createdAt: ts2 } });
      }

      /* ── TICKET COMMENTS: DELETE ────────────────────────────── */
      if (req.method === 'DELETE' && /^\/api\/comments\/[^/]+$/.test(url.pathname)) {
        const cid = sanitize(url.pathname.split('/').pop(), 50);
        const c   = db.prepare('SELECT * FROM ticket_comments WHERE id=? AND deleted_at IS NULL').get(cid);
        if (!c) return send(res, 404, { error: 'NOT_FOUND' });
        if (me.role === ADMIN_COORDINATOR_ROLE) return send(res, 403, { error: 'FORBIDDEN' });
        const canDel = c.user_id === me.id || ['system_admin','facility_manager','cleaning_manager','maintenance_manager','maintenance_supervisor'].includes(me.role);
        if (!canDel) return send(res, 403, { error: 'FORBIDDEN' });
        db.prepare('UPDATE ticket_comments SET deleted_at=? WHERE id=?').run(now(), cid);
        return send(res, 200, { ok: true });
      }

      /* ── RECURRING TASKS: LIST ──────────────────────────────── */
      if (req.method === 'GET' && url.pathname === '/api/recurring-tasks') {
        if (!['system_admin','facility_manager','cleaning_manager','cleaning_supervisor',ADMIN_COORDINATOR_ROLE].includes(me.role))
          return send(res, 403, { error: 'FORBIDDEN' });
        return send(res, 200, { recurringTasks: dbRecurringTasks() });
      }

      /* ── RECURRING TASKS: CREATE ────────────────────────────── */
      if (req.method === 'POST' && url.pathname === '/api/recurring-tasks') {
        if (!['system_admin','facility_manager','cleaning_manager'].includes(me.role))
          return send(res, 403, { error: 'FORBIDDEN' });
        const b = await bodyJSON(req);
        const loc = db.prepare('SELECT * FROM locations WHERE id=? AND active=1 AND deleted_at IS NULL').get(b.locationId);
        if (!loc) return send(res, 404, { error: 'LOCATION_NOT_FOUND' });
        const titleAr = sanitize(b.titleAr || '', 200).trim();
        if (!titleAr) return send(res, 400, { error: 'TITLE_REQUIRED' });
        const freqMins = Math.max(30, Math.min(10080, parseInt(b.frequencyMins, 10) || 120));
        const id  = newId('rt');
        const ts2 = now();
        const nextRun = new Date(Date.now() + freqMins * 60_000).toISOString();
        db.prepare(`
          INSERT INTO recurring_tasks
            (id,location_id,location_name_ar,location_name_en,category,title_ar,frequency_mins,next_run_at,created_by,active,created_at,updated_at)
          VALUES (?,?,?,?,?,?,?,?,?,1,?,?)
        `).run(id, loc.id, loc.name_ar, loc.name_en,
               ['emergency','spill','restroom','meeting_room','general'].includes(b.category) ? b.category : 'general',
               titleAr, freqMins, nextRun, me.name, ts2, ts2);
        logEvent(db, 'recurring_task.created', 'recurring_task', id, me, { locationId: loc.id, freqMins });
        return send(res, 200, { recurringTasks: dbRecurringTasks() });
      }

      /* ── RECURRING TASKS: PATCH (toggle/update) ─────────────── */
      if (req.method === 'PATCH' && /^\/api\/recurring-tasks\/[^/]+$/.test(url.pathname)) {
        if (!['system_admin','facility_manager','cleaning_manager'].includes(me.role))
          return send(res, 403, { error: 'FORBIDDEN' });
        const rtId = sanitize(url.pathname.split('/').pop(), 50);
        const rt   = db.prepare('SELECT 1 FROM recurring_tasks WHERE id=? AND deleted_at IS NULL').get(rtId);
        if (!rt) return send(res, 404, { error: 'NOT_FOUND' });
        const b = await bodyJSON(req);
        if (typeof b.active === 'boolean') {
          db.prepare('UPDATE recurring_tasks SET active=?,updated_at=? WHERE id=?').run(b.active ? 1 : 0, now(), rtId);
        }
        return send(res, 200, { recurringTasks: dbRecurringTasks() });
      }

      /* ── RECURRING TASKS: DELETE ────────────────────────────── */
      if (req.method === 'DELETE' && /^\/api\/recurring-tasks\/[^/]+$/.test(url.pathname)) {
        if (!['system_admin','facility_manager','cleaning_manager'].includes(me.role))
          return send(res, 403, { error: 'FORBIDDEN' });
        const rtId = sanitize(url.pathname.split('/').pop(), 50);
        db.prepare('UPDATE recurring_tasks SET deleted_at=?,updated_at=? WHERE id=?').run(now(), now(), rtId);
        return send(res, 200, { recurringTasks: dbRecurringTasks() });
      }

      /* ═══════════════════════════════════════════════════════
         MAINTENANCE MODULE API
         ═══════════════════════════════════════════════════════ */

      /* ── MAINTENANCE ASSETS ──────────────────────────────── */
      if (req.method === 'POST' && url.pathname === '/api/maintenance/assets') {
        if (!['system_admin','facility_manager','maintenance_manager'].includes(me.role))
          return send(res, 403, { error:'FORBIDDEN' });
        const b=await bodyJSON(req); const code=sanitize(b.code,80); const nameAr=sanitize(b.nameAr,160);
        if (!code || !nameAr) return send(res,400,{error:'MISSING_FIELDS'});
        if (db.prepare('SELECT 1 FROM maintenance_assets WHERE code=?').get(code)) return send(res,409,{error:'ASSET_CODE_EXISTS'});
        const id=newId('ma'); const ts=now();
        db.prepare(`INSERT INTO maintenance_assets
          (id,code,name_ar,name_en,category,location_id,serial_no,manufacturer,model,warranty_until,criticality,status,installed_at,created_at,updated_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
          id,code,nameAr,sanitize(b.nameEn,160),sanitize(b.category,50)||'general',sanitize(b.locationId,80),
          sanitize(b.serialNo,100),sanitize(b.manufacturer,100),sanitize(b.model,100),sanitize(b.warrantyUntil,30)||null,
          ['low','medium','high','critical'].includes(b.criticality)?b.criticality:'medium',
          ['operational','down','maintenance','retired'].includes(b.status)?b.status:'operational',
          sanitize(b.installedAt,30)||null,ts,ts);
        return send(res,200,{assets:dbMaintenanceAssets()});
      }
      if (req.method === 'PUT' && /^\/api\/maintenance\/assets\/[^/]+$/.test(url.pathname)) {
        if (!['system_admin','facility_manager','maintenance_manager'].includes(me.role)) return send(res,403,{error:'FORBIDDEN'});
        const id=sanitize(url.pathname.split('/').pop(),50); const b=await bodyJSON(req);
        const asset=db.prepare('SELECT 1 FROM maintenance_assets WHERE id=? AND deleted_at IS NULL').get(id);
        if (!asset) return send(res,404,{error:'ASSET_NOT_FOUND'});
        const fields={nameAr:'name_ar',nameEn:'name_en',category:'category',locationId:'location_id',serialNo:'serial_no',manufacturer:'manufacturer',model:'model',warrantyUntil:'warranty_until',criticality:'criticality',status:'status',installedAt:'installed_at'};
        const sets=[]; const vals=[];
        for (const [key,col] of Object.entries(fields)) if (b[key]!==undefined){sets.push(`${col}=?`);vals.push(sanitize(b[key],200));}
        sets.push('updated_at=?');vals.push(now(),id); db.prepare(`UPDATE maintenance_assets SET ${sets.join(',')} WHERE id=?`).run(...vals);
        return send(res,200,{assets:dbMaintenanceAssets()});
      }
      if (req.method === 'DELETE' && /^\/api\/maintenance\/assets\/[^/]+$/.test(url.pathname)) {
        if (!['system_admin','facility_manager','maintenance_manager'].includes(me.role)) return send(res,403,{error:'FORBIDDEN'});
        const id=sanitize(url.pathname.split('/').pop(),50);
        const asset=db.prepare('SELECT 1 FROM maintenance_assets WHERE id=? AND deleted_at IS NULL').get(id);
        if (!asset) return send(res,404,{error:'ASSET_NOT_FOUND'});
        db.prepare('UPDATE maintenance_assets SET deleted_at=?,updated_at=? WHERE id=?').run(now(),now(),id);
        logEvent(db,'asset.deleted','asset',id,me,{id},'maintenance');
        return send(res,200,{assets:dbMaintenanceAssets()});
      }

      /* ── PREVENTIVE MAINTENANCE SCHEDULES ────────────────── */
      if (req.method === 'POST' && url.pathname === '/api/maintenance/schedules') {
        if (!['system_admin','facility_manager','maintenance_manager','maintenance_supervisor'].includes(me.role)) return send(res,403,{error:'FORBIDDEN'});
        const b=await bodyJSON(req); const titleAr=sanitize(b.titleAr,200); const locationId=sanitize(b.locationId,80);
        if (!titleAr || !locationId || !b.nextRunAt) return send(res,400,{error:'MISSING_FIELDS'});
        const id=newId('ms'); const ts=now();
        const assetIds=Array.isArray(b.assetIds)?b.assetIds.map(x=>sanitize(x,50)).filter(Boolean).slice(0,100):[];
        let team;
        try { team=normalizeMaintenanceTeam(db,Array.isArray(b.defaultTechnicianIds)?b.defaultTechnicianIds:[],b.leadTechnicianId); }
        catch(e){ return send(res,400,{error:e.message}); }
        const checklist=Array.isArray(b.checklist)?b.checklist.map(x=>sanitize(x,200)).filter(Boolean).slice(0,100):[];
        db.prepare(`INSERT INTO maintenance_schedules
          (id,title_ar,title_en,asset_ids,location_id,category,checklist,frequency_unit,frequency_value,next_run_at,estimated_mins,default_technician_ids,lead_technician_id,active,created_by,created_at,updated_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
          id,titleAr,sanitize(b.titleEn,200),JSON.stringify(assetIds),locationId,
          MAINT_SLA_MINS[b.category]?b.category:'general',JSON.stringify(checklist),
          ['daily','weekly','monthly','quarterly','yearly'].includes(b.frequencyUnit)?b.frequencyUnit:'monthly',
          Math.max(1,parseInt(b.frequencyValue,10)||1),new Date(b.nextRunAt).toISOString(),
          Math.max(1,parseInt(b.estimatedMins,10)||60),JSON.stringify(team.ids),team.lead,
          b.active===false?0:1,me.id,ts,ts);
        return send(res,200,{schedules:dbMaintenanceSchedules()});
      }
      if (req.method === 'PUT' && /^\/api\/maintenance\/schedules\/[^/]+$/.test(url.pathname)) {
        if (!['system_admin','facility_manager','maintenance_manager','maintenance_supervisor'].includes(me.role)) return send(res,403,{error:'FORBIDDEN'});
        const id=sanitize(url.pathname.split('/').pop(),50); const b=await bodyJSON(req);
        const schedule=db.prepare('SELECT * FROM maintenance_schedules WHERE id=? AND deleted_at IS NULL').get(id);
        if (!schedule) return send(res,404,{error:'SCHEDULE_NOT_FOUND'});
        const sets=[];const vals=[];
        const scalar={titleAr:'title_ar',titleEn:'title_en',locationId:'location_id',category:'category',frequencyUnit:'frequency_unit',frequencyValue:'frequency_value',nextRunAt:'next_run_at',estimatedMins:'estimated_mins'};
        for(const [k,c] of Object.entries(scalar)) if(b[k]!==undefined){sets.push(`${c}=?`);vals.push(k==='frequencyValue'||k==='estimatedMins'?Number(b[k]):sanitize(b[k],200));}
        if(Array.isArray(b.assetIds)){sets.push('asset_ids=?');vals.push(JSON.stringify(b.assetIds.slice(0,100)));}
        if(Array.isArray(b.checklist)){sets.push('checklist=?');vals.push(JSON.stringify(b.checklist.slice(0,100)));}
        if(Array.isArray(b.defaultTechnicianIds)||b.leadTechnicianId!==undefined){
          const ids=Array.isArray(b.defaultTechnicianIds)?b.defaultTechnicianIds:safeJson(schedule.default_technician_ids);
          let team;try{team=normalizeMaintenanceTeam(db,ids,b.leadTechnicianId!==undefined?b.leadTechnicianId:schedule.lead_technician_id);}catch(e){return send(res,400,{error:e.message});}
          sets.push('default_technician_ids=?','lead_technician_id=?');vals.push(JSON.stringify(team.ids),team.lead);
        }
        if(typeof b.active==='boolean'){sets.push('active=?');vals.push(b.active?1:0);}
        sets.push('updated_at=?');vals.push(now(),id);db.prepare(`UPDATE maintenance_schedules SET ${sets.join(',')} WHERE id=?`).run(...vals);
        return send(res,200,{schedules:dbMaintenanceSchedules()});
      }
      if (req.method === 'DELETE' && /^\/api\/maintenance\/schedules\/[^/]+$/.test(url.pathname)) {
        if (!['system_admin','facility_manager','maintenance_manager','maintenance_supervisor'].includes(me.role)) return send(res,403,{error:'FORBIDDEN'});
        const id=sanitize(url.pathname.split('/').pop(),50);
        const schedule=db.prepare('SELECT 1 FROM maintenance_schedules WHERE id=? AND deleted_at IS NULL').get(id);
        if (!schedule) return send(res,404,{error:'SCHEDULE_NOT_FOUND'});
        db.prepare('UPDATE maintenance_schedules SET deleted_at=?,updated_at=? WHERE id=?').run(now(),now(),id);
        logEvent(db,'schedule.deleted','schedule',id,me,{id},'maintenance');
        return send(res,200,{schedules:dbMaintenanceSchedules()});
      }
      if (req.method === 'POST' && /^\/api\/maintenance\/schedules\/[^/]+\/run$/.test(url.pathname)) {
        if (!['system_admin','facility_manager','maintenance_manager','maintenance_supervisor'].includes(me.role)) return send(res,403,{error:'FORBIDDEN'});
        const id=sanitize(url.pathname.split('/')[4],50); const schedule=db.prepare('SELECT * FROM maintenance_schedules WHERE id=? AND deleted_at IS NULL').get(id);
        if(!schedule) return send(res,404,{error:'SCHEDULE_NOT_FOUND'});
        const workOrderId=generateScheduledMaintenance(db,schedule,me);
        return send(res,200,{workOrderId,schedules:dbMaintenanceSchedules()});
      }

      /* ── PARTS INVENTORY AND USAGE ────────────────────────── */
      if (req.method === 'POST' && url.pathname === '/api/maintenance/parts') {
        if (!['system_admin','facility_manager','maintenance_manager','maintenance_supervisor'].includes(me.role)) return send(res,403,{error:'FORBIDDEN'});
        const b=await bodyJSON(req);const sku=sanitize(b.sku,80);const nameAr=sanitize(b.nameAr,160);
        if(!sku||!nameAr)return send(res,400,{error:'MISSING_FIELDS'});
        if(db.prepare('SELECT 1 FROM maintenance_parts WHERE sku=?').get(sku))return send(res,409,{error:'PART_SKU_EXISTS'});
        const id=newId('mp');const ts=now();db.prepare(`INSERT INTO maintenance_parts
          (id,sku,name_ar,name_en,unit,quantity,reorder_level,unit_cost,location,active,created_at,updated_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`).run(id,sku,nameAr,sanitize(b.nameEn,160),sanitize(b.unit,30)||'piece',
          Math.max(0,Number(b.quantity)||0),Math.max(0,Number(b.reorderLevel)||0),Math.max(0,Number(b.unitCost)||0),sanitize(b.location,120),1,ts,ts);
        return send(res,200,{parts:dbMaintenanceParts()});
      }
      if (req.method === 'PUT' && /^\/api\/maintenance\/parts\/[^/]+$/.test(url.pathname)) {
        if (!['system_admin','facility_manager','maintenance_manager','maintenance_supervisor'].includes(me.role)) return send(res,403,{error:'FORBIDDEN'});
        const id=sanitize(url.pathname.split('/').pop(),50); const b=await bodyJSON(req);
        const part=db.prepare('SELECT 1 FROM maintenance_parts WHERE id=? AND deleted_at IS NULL').get(id);
        if (!part) return send(res,404,{error:'PART_NOT_FOUND'});
        const fields={nameAr:'name_ar',nameEn:'name_en',unit:'unit',quantity:'quantity',reorderLevel:'reorder_level',unitCost:'unit_cost',location:'location'};
        const sets=[]; const vals=[];
        for (const [key,col] of Object.entries(fields)) if (b[key]!==undefined) { sets.push(`${col}=?`); vals.push(['quantity','reorderLevel','unitCost'].includes(key)?Math.max(0,Number(b[key])):sanitize(b[key],200)); }
        if (!sets.length) return send(res,400,{error:'NO_FIELDS'});
        sets.push('updated_at=?'); vals.push(now(),id);
        db.prepare(`UPDATE maintenance_parts SET ${sets.join(',')} WHERE id=?`).run(...vals);
        return send(res,200,{parts:dbMaintenanceParts()});
      }
      if (req.method === 'DELETE' && /^\/api\/maintenance\/parts\/[^/]+$/.test(url.pathname)) {
        if (!['system_admin','facility_manager','maintenance_manager'].includes(me.role)) return send(res,403,{error:'FORBIDDEN'});
        const id=sanitize(url.pathname.split('/').pop(),50);
        const part=db.prepare('SELECT 1 FROM maintenance_parts WHERE id=? AND deleted_at IS NULL').get(id);
        if (!part) return send(res,404,{error:'PART_NOT_FOUND'});
        db.prepare('UPDATE maintenance_parts SET deleted_at=?,updated_at=? WHERE id=?').run(now(),now(),id);
        logEvent(db,'part.deleted','part',id,me,{id},'maintenance');
        return send(res,200,{parts:dbMaintenanceParts()});
      }
      /* ── UTILITY BILLS (water / electricity) ──────────────────── */
      if (url.pathname === '/api/maintenance/utility-bills' || /^\/api\/maintenance\/utility-bills\/[^/]+$/.test(url.pathname)) {
        const canWrite = ['system_admin','facility_manager','maintenance_manager','maintenance_supervisor'].includes(me.role);
        const normUtility = v => String(v) === 'electricity' ? 'electricity' : 'water';
        const normBuilding = v => String(v) === 'main' ? 'main' : 'sub';
        const billFrom = b => {
          const amountBefore = Math.max(0, Number(b.amountBefore) || 0);
          const tax = (b.tax === undefined || b.tax === null || b.tax === '')
            ? Math.round(amountBefore * 0.15 * 100) / 100
            : Math.max(0, Number(b.tax) || 0);
          return {
            utility: normUtility(b.utility), buildingType: normBuilding(b.buildingType),
            beneficiary: sanitize(b.beneficiary, 160), customerNo: sanitize(b.customerNo, 60),
            invoiceNo: sanitize(b.invoiceNo, 60), periodFrom: sanitize(b.periodFrom, 30),
            periodTo: sanitize(b.periodTo, 30), amountBefore, tax
          };
        };

        if (req.method === 'POST' && url.pathname === '/api/maintenance/utility-bills') {
          if (!canWrite) return send(res, 403, { error: 'FORBIDDEN' });
          const b = await bodyJSON(req);
          // Bulk import path: { bills: [...] } — upsert by invoiceNo.
          if (Array.isArray(b.bills)) {
            const ts = now();
            const upsert = db.transaction(rows => {
              for (const raw of rows) {
                const v = billFrom(raw);
                if (!v.invoiceNo && !v.amountBefore) continue;
                const existing = v.invoiceNo
                  ? db.prepare('SELECT id FROM utility_bills WHERE invoice_no=? AND deleted_at IS NULL').get(v.invoiceNo)
                  : null;
                if (existing) {
                  db.prepare(`UPDATE utility_bills SET utility=?,building_type=?,beneficiary=?,customer_no=?,
                    period_from=?,period_to=?,amount_before=?,tax=?,updated_at=? WHERE id=?`)
                    .run(v.utility, v.buildingType, v.beneficiary, v.customerNo, v.periodFrom, v.periodTo, v.amountBefore, v.tax, ts, existing.id);
                } else {
                  db.prepare(`INSERT INTO utility_bills
                    (id,utility,building_type,beneficiary,customer_no,invoice_no,period_from,period_to,amount_before,tax,created_by,created_at,updated_at)
                    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`)
                    .run(newId('ub'), v.utility, v.buildingType, v.beneficiary, v.customerNo, v.invoiceNo, v.periodFrom, v.periodTo, v.amountBefore, v.tax, me.id, ts, ts);
                }
              }
            });
            upsert(b.bills);
            return send(res, 200, { utilityBills: dbUtilityBills() });
          }
          // Single create.
          const v = billFrom(b);
          if (!v.invoiceNo || !v.amountBefore) return send(res, 400, { error: 'MISSING_FIELDS' });
          const ts = now();
          db.prepare(`INSERT INTO utility_bills
            (id,utility,building_type,beneficiary,customer_no,invoice_no,period_from,period_to,amount_before,tax,created_by,created_at,updated_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`)
            .run(newId('ub'), v.utility, v.buildingType, v.beneficiary, v.customerNo, v.invoiceNo, v.periodFrom, v.periodTo, v.amountBefore, v.tax, me.id, ts, ts);
          return send(res, 200, { utilityBills: dbUtilityBills() });
        }

        if (req.method === 'PUT' && /^\/api\/maintenance\/utility-bills\/[^/]+$/.test(url.pathname)) {
          if (!canWrite) return send(res, 403, { error: 'FORBIDDEN' });
          const id = sanitize(url.pathname.split('/').pop(), 50);
          if (!db.prepare('SELECT 1 FROM utility_bills WHERE id=? AND deleted_at IS NULL').get(id)) return send(res, 404, { error: 'BILL_NOT_FOUND' });
          const v = billFrom(await bodyJSON(req));
          db.prepare(`UPDATE utility_bills SET utility=?,building_type=?,beneficiary=?,customer_no=?,invoice_no=?,
            period_from=?,period_to=?,amount_before=?,tax=?,updated_at=? WHERE id=?`)
            .run(v.utility, v.buildingType, v.beneficiary, v.customerNo, v.invoiceNo, v.periodFrom, v.periodTo, v.amountBefore, v.tax, now(), id);
          return send(res, 200, { utilityBills: dbUtilityBills() });
        }

        if (req.method === 'DELETE' && /^\/api\/maintenance\/utility-bills\/[^/]+$/.test(url.pathname)) {
          if (!canWrite) return send(res, 403, { error: 'FORBIDDEN' });
          const id = sanitize(url.pathname.split('/').pop(), 50);
          if (!db.prepare('SELECT 1 FROM utility_bills WHERE id=? AND deleted_at IS NULL').get(id)) return send(res, 404, { error: 'BILL_NOT_FOUND' });
          db.prepare('UPDATE utility_bills SET deleted_at=?,updated_at=? WHERE id=?').run(now(), now(), id);
          return send(res, 200, { utilityBills: dbUtilityBills() });
        }
      }

      if (req.method === 'POST' && /^\/api\/maintenance-tickets\/[^/]+\/parts$/.test(url.pathname)) {
        if (!['system_admin','facility_manager','maintenance_manager','maintenance_supervisor','maintenance_worker'].includes(me.role)) return send(res,403,{error:'FORBIDDEN'});
        const orderId=sanitize(url.pathname.split('/')[3],50);const b=await bodyJSON(req);
        const order=db.prepare("SELECT 1 FROM tickets WHERE id=? AND module='maintenance' AND deleted_at IS NULL").get(orderId);
        const part=db.prepare('SELECT * FROM maintenance_parts WHERE id=? AND active=1 AND deleted_at IS NULL').get(sanitize(b.partId,50));
        const qty=Math.max(.01,Number(b.quantity)||1);if(!order||!part)return send(res,404,{error:'NOT_FOUND'});
        if(me.role==='maintenance_worker'&&!db.prepare('SELECT 1 FROM maintenance_work_order_assignees WHERE work_order_id=? AND technician_id=?').get(orderId,me.id))return send(res,403,{error:'FORBIDDEN'});
        if(part.quantity<qty)return send(res,400,{error:'INSUFFICIENT_STOCK'});
        db.transaction(()=>{db.prepare(`INSERT INTO maintenance_work_order_parts
          (id,work_order_id,part_id,part_name,quantity,unit_cost,created_by,created_at) VALUES (?,?,?,?,?,?,?,?)`)
          .run(newId('mwp'),orderId,part.id,part.name_ar,qty,part.unit_cost,me.id,now());
          db.prepare('UPDATE maintenance_parts SET quantity=quantity-?,updated_at=? WHERE id=?').run(qty,now(),part.id);})();
        return send(res,200,{parts:dbMaintenanceParts(),orderParts:dbMaintenanceOrderParts([orderId])});
      }

      /* ── MULTI-TECHNICIAN TEAM ASSIGNMENT ────────────────── */
      if (req.method === 'POST' && /^\/api\/maintenance-tickets\/[^/]+\/team$/.test(url.pathname)) {
        if (!canMaintenanceAssign(me.role)) return send(res,403,{error:'FORBIDDEN'});
        const orderId=sanitize(url.pathname.split('/')[3],50);const b=await bodyJSON(req);
        if(!db.prepare("SELECT 1 FROM tickets WHERE id=? AND module='maintenance' AND deleted_at IS NULL").get(orderId))return send(res,404,{error:'TICKET_NOT_FOUND'});
        try { const assignees=setMaintenanceTeam(db,orderId,b.technicianIds,sanitize(b.leadTechnicianId,50)); return send(res,200,{assignees}); }
        catch(e){return send(res,400,{error:e.message});}
      }

      /* ── MAINTENANCE TICKETS: CREATE ──────────────────────── */
      if (req.method === 'POST' && url.pathname === '/api/maintenance-tickets') {
        if (!canMaintenanceCreate(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        const b   = await bodyJSON(req);
        const loc = db.prepare('SELECT * FROM locations WHERE id = ? AND deleted_at IS NULL').get(b.locationId);
        if (!loc) return send(res, 400, { error: 'MISSING_LOCATION' });
        const technicianIds = Array.isArray(b.technicianIds) ? b.technicianIds.map(x=>sanitize(x,50)).filter(Boolean) : (b.assignedTo?[sanitize(b.assignedTo,50)]:[]);
        const id            = newId('mt');
        const ts            = now();
        const priority      = ['high','medium','low'].includes(b.priority) ? b.priority : 'medium';
        const category      = ['electrical','plumbing','hvac','civil','general'].includes(b.category) ? b.category : 'general';
        const maintenanceType = ['corrective','preventive','emergency'].includes(b.maintenanceType) ? b.maintenanceType : 'corrective';
        const assetId       = sanitize(b.assetId,50);
        const slaDeadline   = computeMaintSlaDeadline(category);
        const initialStatus = technicianIds.length ? 'assigned' : 'submitted';
        const refNo         = generateRefNo(db, 'MNT');
        db.prepare(`
          INSERT INTO tickets (id,title,description,location_id,location_name_ar,location_name_en,
            assigned_to,assigned_to_name,created_by,created_by_id,status,priority,
            category,reference_no,notes,sla_deadline,module,maintenance_type,asset_id,created_at,updated_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `).run(id, sanitize(b.title,200)||'طلب صيانة',
               sanitize(b.description,1000), loc.id, loc.name_ar, loc.name_en,
               null, '',
               me.name, me.id, initialStatus, priority, category, refNo, '', slaDeadline, 'maintenance', maintenanceType, assetId, ts, ts);
        if (technicianIds.length) {
          try { setMaintenanceTeam(db,id,technicianIds,sanitize(b.leadTechnicianId,50)); }
          catch(e){ db.prepare('DELETE FROM tickets WHERE id=?').run(id); return send(res,400,{error:e.message}); }
        }
        const ticket = ticketRow(db.prepare(`
          SELECT t.*, NULL AS photo_files FROM tickets t WHERE t.id = ?
        `).get(id));
        broadcast('ticket_created', { ticket });
        logEvent(db, 'ticket.submitted', 'ticket', id, me, { category, status: initialStatus, locationId: loc.id }, 'maintenance');
        return send(res, 200, { ticket });
      }

      /* ── MAINTENANCE TICKETS: COMPLETE (worker) ───────────── */
      if (req.method === 'POST' && url.pathname === '/api/maintenance-tickets/complete') {
        if (me.role !== 'maintenance_worker') return send(res, 403, { error: 'FORBIDDEN' });
        const b = await bodyJSON(req);
        const t = db.prepare("SELECT * FROM tickets WHERE id = ? AND module = 'maintenance' AND deleted_at IS NULL").get(b.id);
        if (!t) return send(res, 404, { error: 'TICKET_NOT_FOUND' });
        const isTeamMember = db.prepare('SELECT 1 FROM maintenance_work_order_assignees WHERE work_order_id=? AND technician_id=?').get(t.id,me.id);
        if (t.assigned_to !== me.id && !isTeamMember) return send(res, 403, { error: 'FORBIDDEN' });
        if (!(TICKET_TRANSITIONS[t.status]||[]).includes('waiting_verification'))
          return send(res, 400, { error: 'INVALID_TRANSITION' });
        if (Array.isArray(b.beforePhotos)) processPhotosTyped(b.beforePhotos, me.id, null, t.id, 'before');
        if (Array.isArray(b.afterPhotos)) processPhotosTyped(b.afterPhotos, me.id, null, t.id, 'after');
        if (!Array.isArray(b.beforePhotos) && !Array.isArray(b.afterPhotos)) processPhotos(b.photos, me.id, null, t.id);
        const completionMins = Math.round((Date.now() - new Date(t.created_at).getTime()) / 60_000);
        const slaBreached    = t.sla_deadline && new Date(t.sla_deadline) < new Date() ? 1 : (t.sla_breached||0);
        db.prepare(`
          UPDATE tickets SET status='waiting_verification', notes=?, diagnosis=?,root_cause=?,downtime_mins=?,labor_cost=?,vendor_name=?,permit_notes=?,updated_at=?,
            completion_time_mins=?, sla_breached=? WHERE id=?
        `).run(sanitize(b.notes,1000),sanitize(b.diagnosis,1000),sanitize(b.rootCause,1000),Math.max(0,Number(b.downtimeMins)||0),
          Math.max(0,Number(b.laborCost)||0),sanitize(b.vendorName,160),sanitize(b.permitNotes,500),now(),completionMins,slaBreached,t.id);
        db.prepare("UPDATE maintenance_work_order_assignees SET status='completed',completed_at=? WHERE work_order_id=? AND technician_id=?").run(now(),t.id,me.id);
        const ticket = ticketRow(db.prepare(`
          SELECT t.*, GROUP_CONCAT(p.filename) AS photo_files
          FROM tickets t LEFT JOIN photos p ON p.ticket_id=t.id AND p.deleted_at IS NULL
          WHERE t.id=? GROUP BY t.id
        `).get(t.id));
        broadcast('ticket_waiting_verification', { ticket });
        logEvent(db, 'ticket.waiting_verification', 'ticket', t.id, me, { completionMins }, 'maintenance');
        return send(res, 200, { ticket });
      }

      /* ── MAINTENANCE TICKETS: UPDATE ──────────────────────── */
      if (req.method === 'PUT' && url.pathname.startsWith('/api/maintenance-tickets/')) {
        if (!canMaintenanceAssign(me.role) && me.role !== 'maintenance_worker') return send(res, 403, { error: 'FORBIDDEN' });
        const id = sanitize(url.pathname.split('/').pop(), 50);
        const b  = await bodyJSON(req);
        const t  = db.prepare("SELECT * FROM tickets WHERE id = ? AND module = 'maintenance' AND deleted_at IS NULL").get(id);
        if (!t) return send(res, 404, { error: 'TICKET_NOT_FOUND' });
        if (me.role === 'maintenance_worker') {
          const isTeamMember = db.prepare('SELECT 1 FROM maintenance_work_order_assignees WHERE work_order_id=? AND technician_id=?').get(t.id,me.id);
          const allowedWorkerStatuses = ['accepted','diagnosing','in_progress','awaiting_parts','awaiting_vendor','awaiting_permit','on_hold'];
          if ((t.assigned_to !== me.id && !isTeamMember) || Object.keys(b).some(k => k !== 'status') || !allowedWorkerStatuses.includes(b.status))
            return send(res, 403, { error: 'FORBIDDEN' });
        }
        const sets = []; const vals = [];
        if (b.title !== undefined)       { sets.push('title = ?');       vals.push(sanitize(b.title,200)); }
        if (b.description !== undefined) { sets.push('description = ?'); vals.push(sanitize(b.description,1000)); }
        if (['high','medium','low'].includes(b.priority)) { sets.push('priority = ?'); vals.push(b.priority); }
        if (b.status !== undefined) {
          if (!TICKET_STATUSES.includes(b.status)) return send(res, 400, { error: 'INVALID_STATUS' });
          if (b.status !== t.status) {
            if (!(TICKET_TRANSITIONS[t.status]||[]).includes(b.status))
              return send(res, 400, { error: 'INVALID_TRANSITION' });
            sets.push('status = ?'); vals.push(b.status);
            const ts = now();
            if (b.status === 'completed')  { sets.push('completed_at = ?'); vals.push(ts); }
            if (b.status === 'accepted')   { sets.push('accepted_at = ?');  vals.push(ts); }
            if (b.status === 'in_progress'){ sets.push('started_at = ?');   vals.push(ts); }
            if (b.status === 'cancelled')  { sets.push('cancelled_at = ?'); vals.push(ts); }
          }
        }
        const maintFields={diagnosis:'diagnosis',rootCause:'root_cause',downtimeMins:'downtime_mins',laborCost:'labor_cost',vendorName:'vendor_name',permitNotes:'permit_notes',assetId:'asset_id',maintenanceType:'maintenance_type'};
        for(const [key,col] of Object.entries(maintFields)) if(b[key]!==undefined){sets.push(`${col}=?`);vals.push(['downtimeMins','laborCost'].includes(key)?Math.max(0,Number(b[key])||0):sanitize(b[key],1000));}
        if (b.assignedTo) {
          const w = db.prepare('SELECT * FROM users WHERE id = ? AND active=1 AND deleted_at IS NULL').get(b.assignedTo);
          if (!w || !userHasRole(db, w.id, 'maintenance_worker')) return send(res, 400, { error: 'WORKER_NOT_FOUND' });
          sets.push('assigned_to = ?'); sets.push('assigned_to_name = ?'); vals.push(w.id, w.name);
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

      /* ── MAINTENANCE TICKETS: DELETE ──────────────────────── */
      if (req.method === 'DELETE' && url.pathname.startsWith('/api/maintenance-tickets/')) {
        if (!canMaintenanceDelete(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        const id = sanitize(url.pathname.split('/').pop(), 50);
        const t  = db.prepare("SELECT 1 FROM tickets WHERE id = ? AND module = 'maintenance' AND deleted_at IS NULL").get(id);
        if (!t) return send(res, 404, { error: 'TICKET_NOT_FOUND' });
        db.prepare('UPDATE tickets SET deleted_at=?, updated_at=? WHERE id=?').run(now(), now(), id);
        logEvent(db, 'ticket.deleted', 'ticket', id, me, { id }, 'maintenance');
        return send(res, 200, { ok: true });
      }

      /* ── MAINTENANCE REPORTS: CREATE ──────────────────────── */
      if (req.method === 'POST' && url.pathname === '/api/maintenance-reports') {
        if (me.role !== 'maintenance_worker') return send(res, 403, { error: 'FORBIDDEN' });
        const b   = await bodyJSON(req);
        const loc = getLocationByAnyId(db, b.locationId, true);
        if (!loc) return send(res, 404, { error: 'LOCATION_NOT_FOUND' });
        const assigned = db.prepare(
          "SELECT 1 FROM assignments WHERE worker_id=? AND location_id=? AND module='maintenance'"
        ).get(me.id, loc.id);
        const hasAssignments = db.prepare(
          "SELECT 1 FROM assignments WHERE worker_id=? AND module='maintenance'"
        ).get(me.id);
        if (hasAssignments && !assigned) return send(res, 403, { error: 'NOT_ASSIGNED' });
        const tasks  = Array.isArray(b.tasks) ? b.tasks.map(t => sanitize(t,200)).slice(0,50) : [];
        const id     = newId('mr');
        const ts     = now();
        const refNo  = generateRefNo(db);
        db.prepare(`
          INSERT INTO reports (id,worker_id,worker_name,location_id,location_name_ar,location_name_en,
            location_type,status,tasks,notes,reference_no,approval_status,module,created_at,updated_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,'pending','maintenance',?,?)
        `).run(id, me.id, me.name, loc.id, loc.name_ar, loc.name_en,
               loc.type, 'completed', JSON.stringify(tasks), sanitize(b.notes,1000), refNo, ts, ts);
        if (Array.isArray(b.beforePhotos) && b.beforePhotos.length)
          processPhotosTyped(b.beforePhotos, me.id, id, null, 'before');
        if (Array.isArray(b.afterPhotos) && b.afterPhotos.length)
          processPhotosTyped(b.afterPhotos, me.id, id, null, 'after');
        if (!b.beforePhotos && !b.afterPhotos)
          processPhotos(b.photos, me.id, id, null);
        const report = reportRow(db.prepare(`
          SELECT r.*, GROUP_CONCAT(p.filename) AS photo_files, GROUP_CONCAT(p.photo_type) AS photo_types
          FROM reports r LEFT JOIN photos p ON p.report_id=r.id AND p.deleted_at IS NULL
          WHERE r.id=? GROUP BY r.id
        `).get(id));
        broadcast('report_created', { report });
        logEvent(db, 'report.created', 'report', id, me, { locationId: loc.id, photoCount: report.photos.length }, 'maintenance');
        return send(res, 200, { report });
      }

      /* ── MAINTENANCE REPORTS: REVIEW ──────────────────────── */
      if (req.method === 'POST' && url.pathname === '/api/maintenance-reports/review') {
        if (!canMaintenanceReview(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        const b = await bodyJSON(req);
        const r = db.prepare("SELECT * FROM reports WHERE id = ? AND module = 'maintenance' AND deleted_at IS NULL").get(b.id);
        if (!r) return send(res, 404, { error: 'REPORT_NOT_FOUND' });
        const validStatuses = ['approved','rejected','needs_recleaning'];
        if (!validStatuses.includes(b.status)) return send(res, 400, { error: 'INVALID_STATUS' });
        if (r.approval_status !== 'pending') return send(res, 400, { error: 'ALREADY_REVIEWED' });
        const reviewTs = now();
        db.prepare(`
          UPDATE reports SET approval_status=?, approved_by=?, approved_at=?, review_note=?, updated_at=? WHERE id=?
        `).run(b.status, me.name, reviewTs, sanitize(b.note,500), reviewTs, b.id);
        db.prepare(`
          INSERT INTO approval_history (entity_type,entity_id,level,approver_id,approver_role,action,notes,created_at)
          VALUES ('report',?,1,?,?,?,?,?)
        `).run(b.id, me.id, me.role, b.status, sanitize(b.note||'',500), reviewTs);
        const report = reportRow(db.prepare(`
          SELECT r.*, GROUP_CONCAT(p.filename) AS photo_files, GROUP_CONCAT(p.photo_type) AS photo_types
          FROM reports r LEFT JOIN photos p ON p.report_id=r.id AND p.deleted_at IS NULL
          WHERE r.id=? GROUP BY r.id
        `).get(b.id));
        broadcast('report_reviewed', { report, reviewedBy: me.name });
        const evtMap = { approved:'report.approved', rejected:'report.rejected', needs_recleaning:'report.reclean_required' };
        logEvent(db, evtMap[b.status]||'report.reviewed', 'report', b.id, me, { status: b.status }, 'maintenance');
        return send(res, 200, { report });
      }

      /* ── MAINTENANCE REPORTS: RATE ────────────────────────── */
      if (req.method === 'POST' && url.pathname === '/api/maintenance-reports/rate') {
        if (!(me.role in MAINT_RATING_RULES)) return send(res, 403, { error: 'FORBIDDEN' });
        const b         = await bodyJSON(req);
        const allowed   = MAINT_RATING_RULES[me.role];
        const requested = b.ratingType === 'manager' ? 'manager' : 'supervisor';
        if (allowed !== null && allowed !== requested) return send(res, 403, { error: 'RATING_TYPE_NOT_ALLOWED' });
        const value = parseInt(b.value, 10);
        if (!value || value < 1 || value > 5) return send(res, 400, { error: 'INVALID_RATING' });
        const r = db.prepare("SELECT * FROM reports WHERE id = ? AND module = 'maintenance' AND deleted_at IS NULL").get(b.id);
        if (!r) return send(res, 404, { error: 'REPORT_NOT_FOUND' });
        const col = requested === 'manager' ? 'rating_manager' : 'rating_supervisor';
        db.prepare(`UPDATE reports SET ${col}=?, updated_at=? WHERE id=?`).run(value, now(), b.id);
        const report = reportRow(db.prepare(`
          SELECT r.*, GROUP_CONCAT(p.filename) AS photo_files, GROUP_CONCAT(p.photo_type) AS photo_types
          FROM reports r LEFT JOIN photos p ON p.report_id=r.id AND p.deleted_at IS NULL
          WHERE r.id=? GROUP BY r.id
        `).get(b.id));
        return send(res, 200, { report });
      }

      /* ── MAINTENANCE REPORTS: DELETE ──────────────────────── */
      if (req.method === 'DELETE' && url.pathname.startsWith('/api/maintenance-reports/')) {
        if (!canMaintenanceDelete(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        const id = sanitize(url.pathname.split('/').pop(), 50);
        const r  = db.prepare("SELECT 1 FROM reports WHERE id = ? AND module = 'maintenance' AND deleted_at IS NULL").get(id);
        if (!r) return send(res, 404, { error: 'REPORT_NOT_FOUND' });
        db.prepare('UPDATE reports SET deleted_at=?, updated_at=? WHERE id=?').run(now(), now(), id);
        logEvent(db, 'report.deleted', 'report', id, me, { id }, 'maintenance');
        return send(res, 200, { ok: true });
      }

      /* ── MAINTENANCE ORDER (employee request) ─────────────── */
      if (req.method === 'POST' && url.pathname === '/api/maintenance-order') {
        if (!['employee','system_admin','facility_manager'].includes(me.role))
          return send(res, 403, { error: 'FORBIDDEN' });
        const b   = await bodyJSON(req);
        const loc = getLocationByAnyId(db, b.locationId);
        if (!loc) return send(res, 400, { error: 'MISSING_LOCATION' });
        const id          = newId('mt');
        const ts          = now();
        const category    = ['electrical','plumbing','hvac','civil','general'].includes(b.category) ? b.category : 'general';
        const slaDeadline = computeMaintSlaDeadline(category);
        const refNo       = generateRefNo(db, 'MNT');
        db.prepare(`
          INSERT INTO tickets (id,title,description,location_id,location_name_ar,location_name_en,
            created_by,created_by_id,status,priority,category,reference_no,notes,sla_deadline,module,created_at,updated_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `).run(id, sanitize(b.title,200)||'طلب صيانة', sanitize(b.description,1000)||'',
               loc.id, loc.name_ar, loc.name_en,
               me.name, me.id, 'submitted', 'medium', category, refNo, '', slaDeadline, 'maintenance', ts, ts);
        const ticket = ticketRow(db.prepare('SELECT t.*, NULL AS photo_files FROM tickets t WHERE t.id=?').get(id));
        broadcast('ticket_created', { ticket });
        logEvent(db, 'ticket.submitted', 'ticket', id, me, { category, locationId: loc.id, requester: me.id }, 'maintenance');
        return send(res, 200, { ticket });
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
          .run(userId, role, moduleForRole(role), now());
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
          WHERE created_at >= ? AND module = 'cleaning' AND deleted_at IS NULL
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
        const serviceType = b.serviceType === 'maintenance' ? 'maintenance' : 'cleaning';
        const requestSettings = dbSettings();
        if (serviceType === 'cleaning' && !requestSettings.employeeCleaningRequestsEnabled)
          return send(res, 403, { error: 'SERVICE_DISABLED' });
        if (serviceType === 'maintenance' && !requestSettings.employeeMaintenanceRequestsEnabled)
          return send(res, 403, { error: 'SERVICE_DISABLED' });
        const loc = db.prepare('SELECT * FROM locations WHERE id = ? AND deleted_at IS NULL').get(sanitize(b.locationId, 80));
        if (!loc) return send(res, 404, { error: 'LOCATION_NOT_FOUND' });
        // A cleaning request must include photo evidence of the issue.
        if (serviceType === 'cleaning' && !(typeof b.photo === 'string' && b.photo.trim()))
          return send(res, 400, { error: 'PHOTO_REQUIRED' });
        const VALID_CATS = serviceType === 'maintenance'
          ? ['electrical','plumbing','hvac','civil','general']
          : ['general','spill','restroom','meeting_room','emergency'];
        const category   = VALID_CATS.includes(b.category) ? b.category : 'general';
        const autoPriority = serviceType === 'maintenance'
          ? { electrical:'high', plumbing:'high', hvac:'high', civil:'medium', general:'medium' }
          : { emergency:'high', spill:'high', meeting_room:'high', restroom:'medium', general:'medium' };
        const priority   = autoPriority[category] || ((['high','medium','low'].includes(b.priority)) ? b.priority : 'medium');
        const refNo      = generateRefNo(db, serviceType === 'maintenance' ? 'MNT' : 'CLN');
        const CAT_TITLES = serviceType === 'maintenance'
          ? { general:'طلب صيانة', electrical:'مشكلة كهرباء', plumbing:'مشكلة سباكة', hvac:'مشكلة تكييف', civil:'أعمال مدنية' }
          : { general:'طلب تنظيف', spill:'بلاغ انسكاب', restroom:'مشكلة دورة مياه', meeting_room:'تنظيف قاعة اجتماع', emergency:'تنظيف طارئ' };
        const title      = sanitize(b.title || '', 200) || CAT_TITLES[category] || (serviceType === 'maintenance' ? 'طلب صيانة' : 'طلب تنظيف');
        const worker = null;
        const workerUser = null;
        const id          = newId('t');
        const ts          = now();
        const slaDeadline = serviceType === 'maintenance' ? computeMaintSlaDeadline(category) : computeSlaDeadline(category);
        const orderStatus = workerUser ? 'assigned' : 'submitted';
        db.prepare(`
          INSERT INTO tickets (id,title,description,location_id,location_name_ar,location_name_en,
            assigned_to,assigned_to_name,created_by,created_by_id,status,priority,
            category,reference_no,notes,sla_deadline,module,maintenance_type,created_at,updated_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        `).run(id, title, sanitize(b.description, 1000),
               loc.id, loc.name_ar, loc.name_en,
               workerUser?.id || null, workerUser?.name || '',
               me.name, me.id, orderStatus, priority, category, refNo, '', slaDeadline,
               serviceType, serviceType === 'maintenance' ? 'corrective' : 'corrective', ts, ts);
        // Optional photo
        if (b.photo) {
          processPhotosTyped([b.photo], me.id, null, id, 'general');
        }
        const ticket = ticketRow(db.prepare('SELECT t.*, NULL AS photo_files FROM tickets t WHERE t.id = ?').get(id));
        broadcast('ticket_created', { ticket });
        logEvent(db, 'ticket.submitted', 'ticket', id, me, { category, refNo, status: orderStatus, locationId: loc.id }, serviceType);
        return send(res, 200, { ticket, autoAssigned: !!workerUser });
      }

      /* ── PERFORMANCE METRICS (supervisor/manager) ────────────── */
      if (req.method === 'GET' && url.pathname === '/api/performance') {
        if (!canReview(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        let workers = db.prepare(
          "SELECT * FROM users WHERE role='cleaner' AND active=1 AND deleted_at IS NULL"
        ).all();
        if (me.role === 'cleaning_supervisor') {
          const scope = cleaningSupervisorScope(me.id, dbAssignments(), { strict: true });
          workers = workers.filter(w => scope.workerIds.has(w.id));
        }
        const now30 = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
        const nowStr = now();
        const metrics = workers.map(w => {
          const reports30 = db.prepare(`
            SELECT r.*, GROUP_CONCAT(p.filename) AS photo_files, GROUP_CONCAT(p.photo_type) AS photo_types
            FROM reports r
            LEFT JOIN photos p ON p.report_id = r.id AND p.deleted_at IS NULL
            WHERE r.worker_id=? AND r.module='cleaning' AND r.created_at>=? AND r.deleted_at IS NULL
            GROUP BY r.id
            ORDER BY r.created_at DESC
          `).all(w.id, now30);
          const total = db.prepare("SELECT COUNT(*) AS c FROM reports WHERE worker_id=? AND module='cleaning' AND deleted_at IS NULL").get(w.id).c;
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
            "SELECT COUNT(*) AS c FROM tickets WHERE assigned_to=? AND module='cleaning' AND status NOT IN ('completed','rejected','cancelled') AND deleted_at IS NULL"
          ).get(w.id).c;
          const locCount = db.prepare(
            "SELECT COUNT(*) AS c FROM assignments WHERE worker_id=? AND (module IS NULL OR module='cleaning')"
          ).get(w.id).c;
          const scoredReports = reports30.map(reportQualityScore).filter(score => score != null);
          const avgQuality = scoredReports.length
            ? Math.round(scoredReports.reduce((sum, score) => sum + score, 0) / scoredReports.length)
            : 0;
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

      /* ── REPORT RATING ─────────────────────────────────────── */
      if (req.method === 'POST' && url.pathname === '/api/reports/rate') {
        const RATING_RULES = {
          cleaning_manager:    'manager',
          cleaning_supervisor: 'supervisor',
          system_admin:        null   // null = may set either
        };
        if (!(me.role in RATING_RULES)) return send(res, 403, { error: 'FORBIDDEN' });
        const b     = await bodyJSON(req);
        const rpt   = db.prepare("SELECT 1 FROM reports WHERE id = ? AND module = 'cleaning' AND deleted_at IS NULL").get(b.id);
        if (!rpt) return send(res, 404, { error: 'REPORT_NOT_FOUND' });
        const value = parseFloat(b.value);
        if (isNaN(value) || value < 1 || value > 5) return send(res, 400, { error: 'INVALID_RATING' });
        const allowed = RATING_RULES[me.role];
        const requested = b.ratingType === 'manager' ? 'manager' : 'supervisor';
        if (allowed !== null && allowed !== requested) return send(res, 403, { error: 'RATING_TYPE_NOT_ALLOWED' });
        const col = requested === 'manager' ? 'rating_manager' : 'rating_supervisor';
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
        const items = Array.isArray(b.items) ? b.items.slice(0, 20).map(i => sanitize(String(i), 200)) : [];
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
        const allOrders = dbHospitalityOrders();
        const orders = me.role === 'hospitality_supervisor'
          ? hospitalityOrdersForSupervisor(me, allOrders, dbAssignments())
          : hospitalityOrdersForRole(me, allOrders);
        return send(res, 200, { orders });
      }

      /* ── HOSPITALITY: ORDER ACTIVITY ──────────────────────────── */
      if (req.method === 'GET' && /^\/api\/hospitality\/orders\/[^/]+\/activity$/.test(url.pathname)) {
        if (!canHospitalityAccess(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        const id=sanitize(url.pathname.split('/')[4],80);
        const order=dbHospitalityOrders().find(o=>o.id===id);
        if (!order) return send(res,404,{error:'NOT_FOUND'});
        const visibleOrders = me.role === 'hospitality_supervisor'
          ? hospitalityOrdersForSupervisor(me, [order], dbAssignments())
          : hospitalityOrdersForRole(me, [order]);
        if (!visibleOrders.length) return send(res,403,{error:'FORBIDDEN'});
        const events=db.prepare(`SELECT e.*,u.name AS actor_name FROM event_log e LEFT JOIN users u ON u.id=e.actor_id WHERE e.entity_type='hospitality_order' AND e.entity_id=? ORDER BY e.created_at ASC LIMIT 100`).all(id);
        return send(res,200,{events:events.map(e=>({id:e.id,eventType:e.event_type,actorId:e.actor_id,actorName:e.actor_name||'',actorRole:e.actor_role,payload:JSON.parse(e.payload||'{}'),createdAt:e.created_at}))});
      }

      /* ── HOSPITALITY: ASSIGN ORDER TO WORKER ──────────────────── */
      if (req.method === 'POST' && /^\/api\/hospitality\/orders\/[^/]+\/assign$/.test(url.pathname)) {
        if (!canHospitalityAssign(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        const id    = url.pathname.split('/')[4];
        const order = db.prepare('SELECT * FROM hospitality_orders WHERE id = ? AND deleted_at IS NULL').get(id);
        if (!order) return send(res, 404, { error: 'NOT_FOUND' });
        if (me.role === 'hospitality_supervisor') {
          const scope = supervisorScope(me.id, 'hospitality', dbAssignments(), { strict: true });
          if (!scope.workerIds.has(order.assigned_to) && !scope.locationIds.has(order.location_id)) {
            return send(res, 403, { error: 'FORBIDDEN' });
          }
        }
        if (HOSPITALITY_TERMINAL.includes(order.status)) return send(res, 400, { error: 'INVALID_TRANSITION' });
        const b      = await bodyJSON(req);
        const worker = db.prepare(
          "SELECT * FROM users WHERE id = ? AND active=1 AND deleted_at IS NULL"
        ).get(sanitize(b.workerId, 80));
        if (!worker || !userHasRole(db, worker.id, 'hospitality_worker')) return send(res, 404, { error: 'WORKER_NOT_FOUND' });
        if (me.role === 'hospitality_supervisor') {
          const scope = supervisorScope(me.id, 'hospitality', dbAssignments(), { strict: true });
          if (!scope.workerIds.has(worker.id)) return send(res, 403, { error: 'WORKER_OUT_OF_SCOPE' });
        }
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
        if (me.role === 'hospitality_supervisor') {
          const scope = supervisorScope(me.id, 'hospitality', dbAssignments(), { strict: true });
          if (!scope.workerIds.has(order.assigned_to) && !scope.locationIds.has(order.location_id)) {
            return send(res, 403, { error: 'FORBIDDEN' });
          }
        }

        let allowed;
        if (canHospitalityOverride(me.role)) {
          allowed = HOSPITALITY_TRANSITIONS[order.status] || [];
        } else if (me.role === 'hospitality_supervisor') {
          allowed = HOSPITALITY_SUPERVISOR_TRANSITIONS[order.status] || [];
        } else if (me.role === 'hospitality_worker') {
          if (order.assigned_to !== me.id) return send(res, 403, { error: 'FORBIDDEN' });
          allowed = HOSPITALITY_WORKER_TRANSITIONS[order.status] || [];
        } else if (me.role === 'employee') {
          const isAppOrder   = order.requested_by_id && order.requested_by_id === me.id;
          const sentPhone    = sanitizePhone(b.requesterPhone);
          const storedPhone  = sanitizePhone(order.requester_phone);
          const isPhoneMatch = sentPhone && storedPhone && sentPhone === storedPhone;
          if (!isAppOrder && !isPhoneMatch) return send(res, 403, { error: 'FORBIDDEN' });
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

      /* ── HOSPITALITY: DELETE ORDER (soft) ─────────────────────── */
      if (req.method === 'DELETE' && /^\/api\/hospitality\/orders\/[^/]+$/.test(url.pathname)) {
        if (!canHospitalityOverride(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        const id    = sanitize(url.pathname.split('/')[4], 80);
        const order = db.prepare('SELECT * FROM hospitality_orders WHERE id = ? AND deleted_at IS NULL').get(id);
        if (!order) return send(res, 404, { error: 'NOT_FOUND' });
        db.prepare('UPDATE hospitality_orders SET deleted_at=?, updated_at=? WHERE id=?').run(now(), now(), id);
        broadcast('hospitality_order_deleted', { id });
        logEvent(db, 'hospitality.deleted', 'hospitality_order', id, me, { id }, 'hospitality');
        return send(res, 200, { ok: true });
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

      /* ── HOSPITALITY MENU CATEGORIES: LIST (admin / hospitality_manager — incl. inactive) ── */
      if (req.method === 'GET' && url.pathname === '/api/hospitality/menu-categories/admin') {
        if (!canManageHospitalityMenu(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        return send(res, 200, { categories: dbMenuCategories(false) });
      }

      /* ── HOSPITALITY MENU CATEGORIES: CREATE ──────────────────── */
      if (req.method === 'POST' && url.pathname === '/api/hospitality/menu-categories') {
        if (!canManageHospitalityMenu(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        const b = await bodyJSON(req);
        const nameAr = sanitize(b.nameAr, 100);
        const nameEn = sanitize(b.nameEn, 100);
        if (!nameAr && !nameEn) return send(res, 400, { error: 'MISSING_FIELDS' });
        const slug = sanitize(b.slug, 50).toLowerCase().replace(/[^a-z0-9_]/g, '_');
        if (!slug) return send(res, 400, { error: 'MISSING_SLUG' });
        const dupe = db.prepare('SELECT id FROM hospitality_menu_categories WHERE slug = ? AND deleted_at IS NULL').get(slug);
        if (dupe) return send(res, 400, { error: 'DUPLICATE_SLUG' });
        const id = newId('cat');
        const ts = now();
        db.prepare(`
          INSERT INTO hospitality_menu_categories
            (id,name_ar,name_en,slug,is_active,sort_order,created_at,updated_at)
          VALUES (?,?,?,?,?,?,?,?)
        `).run(id, nameAr, nameEn, slug, 1, parseInt(b.sortOrder, 10) || 0, ts, ts);
        const category = menuCategoryRow(db.prepare('SELECT * FROM hospitality_menu_categories WHERE id=?').get(id));
        logEvent(db, 'hospitality.menu_category_created', 'hospitality_menu_category', id, me, { nameAr, nameEn, slug }, 'hospitality');
        broadcast('hospitality_menu_category_updated', { category });
        return send(res, 200, { category });
      }

      /* ── HOSPITALITY MENU CATEGORIES: UPDATE (incl. soft-disable via isActive) ── */
      if (req.method === 'PUT' && /^\/api\/hospitality\/menu-categories\/[^/]+$/.test(url.pathname)) {
        if (!canManageHospitalityMenu(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        const id = url.pathname.split('/')[4];
        const existing = db.prepare('SELECT * FROM hospitality_menu_categories WHERE id = ? AND deleted_at IS NULL').get(id);
        if (!existing) return send(res, 404, { error: 'NOT_FOUND' });
        const b = await bodyJSON(req);
        const fields = [], params = [];
        if (b.nameAr    !== undefined) { fields.push('name_ar=?'); params.push(sanitize(b.nameAr, 100)); }
        if (b.nameEn    !== undefined) { fields.push('name_en=?'); params.push(sanitize(b.nameEn, 100)); }
        if (b.slug      !== undefined) {
          const slug = sanitize(b.slug, 50).toLowerCase().replace(/[^a-z0-9_]/g, '_');
          if (!slug) return send(res, 400, { error: 'MISSING_SLUG' });
          const dupe = db.prepare('SELECT id FROM hospitality_menu_categories WHERE slug = ? AND id != ? AND deleted_at IS NULL').get(slug, id);
          if (dupe) return send(res, 400, { error: 'DUPLICATE_SLUG' });
          fields.push('slug=?'); params.push(slug);
        }
        if (b.sortOrder !== undefined) { fields.push('sort_order=?'); params.push(parseInt(b.sortOrder, 10) || 0); }
        if (b.isActive  !== undefined) { fields.push('is_active=?');  params.push(b.isActive ? 1 : 0); }
        if (!fields.length) return send(res, 400, { error: 'NO_FIELDS' });
        fields.push('updated_at=?'); params.push(now());
        params.push(id);
        db.prepare(`UPDATE hospitality_menu_categories SET ${fields.join(',')} WHERE id=?`).run(...params);
        const category = menuCategoryRow(db.prepare('SELECT * FROM hospitality_menu_categories WHERE id=?').get(id));
        logEvent(db, 'hospitality.menu_category_updated', 'hospitality_menu_category', id, me, { isActive: category.isActive }, 'hospitality');
        broadcast('hospitality_menu_category_updated', { category });
        return send(res, 200, { category });
      }

      /* ── HOSPITALITY MENU CATEGORIES: TOGGLE STATUS ───────────── */
      if (req.method === 'PATCH' && /^\/api\/hospitality\/menu-categories\/[^/]+\/status$/.test(url.pathname)) {
        if (!canManageHospitalityMenu(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        const id = url.pathname.split('/')[4];
        const existing = db.prepare('SELECT * FROM hospitality_menu_categories WHERE id = ? AND deleted_at IS NULL').get(id);
        if (!existing) return send(res, 404, { error: 'NOT_FOUND' });
        const b = await bodyJSON(req);
        if (b.isActive === undefined) return send(res, 400, { error: 'MISSING_FIELDS' });
        db.prepare('UPDATE hospitality_menu_categories SET is_active=?, updated_at=? WHERE id=?')
          .run(b.isActive ? 1 : 0, now(), id);
        const category = menuCategoryRow(db.prepare('SELECT * FROM hospitality_menu_categories WHERE id=?').get(id));
        logEvent(db, 'hospitality.menu_category_updated', 'hospitality_menu_category', id, me, { isActive: category.isActive }, 'hospitality');
        broadcast('hospitality_menu_category_updated', { category });
        return send(res, 200, { category });
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

      /* ══════════════════════════════════════════════════════════
         INVENTORY FOUNDATION APIs  /api/inventory/*
         ══════════════════════════════════════════════════════════ */
      if (url.pathname.startsWith('/api/inventory')) {
        if (!canInventory(me.role)) return send(res, 403, { error: 'FORBIDDEN' });
        const db = getDb();

        /* ── GET /api/inventory/warehouses ─────────────────────── */
        if (req.method === 'GET' && url.pathname === '/api/inventory/warehouses') {
          const p = url.searchParams;
          return send(res, 200, { warehouses: dbWarehouses(
            p.get('status') || '', p.get('facility_id') || '',
            p.get('building_id') || '', p.get('type') || ''
          )});
        }

        /* ── POST /api/inventory/warehouses ────────────────────── */
        if (req.method === 'POST' && url.pathname === '/api/inventory/warehouses') {
          const b = await bodyJSON(req);
          const nameAr = sanitize(b.nameAr || b.name_ar, 200);
          const nameEn = sanitize(b.nameEn || b.name_en, 200);
          if (!nameAr && !nameEn) return send(res, 400, { error: 'NAME_REQUIRED' });
          const code = sanitize(b.code, 50).toUpperCase();
          if (!code) return send(res, 400, { error: 'CODE_REQUIRED' });
          const WAREHOUSE_TYPES   = ['central','branch','kitchen','operational','module'];
          const WAREHOUSE_STATUSES = ['active','inactive'];
          const type   = WAREHOUSE_TYPES.includes(b.type)     ? b.type   : 'central';
          const status = WAREHOUSE_STATUSES.includes(b.status) ? b.status : 'active';
          if (db.prepare('SELECT 1 FROM warehouses WHERE code=? AND deleted_at IS NULL').get(code))
            return send(res, 409, { error: 'CODE_EXISTS' });
          const id = newId('wh'); const ts = now();
          db.prepare(`INSERT INTO warehouses
            (id,name_ar,name_en,code,facility_id,building_id,location_id,type,status,notes,created_at,updated_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`)
            .run(id, nameAr, nameEn, code,
              sanitize(b.facilityId||b.facility_id,80)||null,
              sanitize(b.buildingId||b.building_id,80)||null,
              sanitize(b.locationId||b.location_id,80)||null,
              type, status, sanitize(b.notes,500), ts, ts);
          logEvent(db,'inventory.warehouse_created','warehouse',id,me,{code,type},'inventory');
          return send(res, 200, { warehouse: warehouseRow(db.prepare('SELECT * FROM warehouses WHERE id=?').get(id)) });
        }

        /* ── PUT /api/inventory/warehouses/:id ─────────────────── */
        if (req.method === 'PUT' && /^\/api\/inventory\/warehouses\/[^/]+$/.test(url.pathname)) {
          const id = sanitize(url.pathname.split('/')[4], 80);
          const wh = db.prepare('SELECT * FROM warehouses WHERE id=? AND deleted_at IS NULL').get(id);
          if (!wh) return send(res, 404, { error: 'NOT_FOUND' });
          const b = await bodyJSON(req);
          const WAREHOUSE_TYPES    = ['central','branch','kitchen','operational','module'];
          const WAREHOUSE_STATUSES = ['active','inactive'];
          const fields = []; const vals = [];
          if (b.nameAr  !== undefined) { fields.push('name_ar=?');  vals.push(sanitize(b.nameAr,200)); }
          if (b.nameEn  !== undefined) { fields.push('name_en=?');  vals.push(sanitize(b.nameEn,200)); }
          if (b.notes   !== undefined) { fields.push('notes=?');    vals.push(sanitize(b.notes,500)); }
          if (b.type    !== undefined && WAREHOUSE_TYPES.includes(b.type))   { fields.push('type=?');   vals.push(b.type); }
          if (b.status  !== undefined && WAREHOUSE_STATUSES.includes(b.status)) { fields.push('status=?'); vals.push(b.status); }
          if (b.facilityId !== undefined) { fields.push('facility_id=?'); vals.push(sanitize(b.facilityId,80)||null); }
          if (b.buildingId !== undefined) { fields.push('building_id=?'); vals.push(sanitize(b.buildingId,80)||null); }
          if (!fields.length) return send(res, 400, { error: 'NO_FIELDS' });
          fields.push('updated_at=?'); vals.push(now()); vals.push(id);
          db.prepare(`UPDATE warehouses SET ${fields.join(',')} WHERE id=?`).run(...vals);
          logEvent(db,'inventory.warehouse_updated','warehouse',id,me,{},'inventory');
          return send(res, 200, { warehouse: warehouseRow(db.prepare('SELECT * FROM warehouses WHERE id=?').get(id)) });
        }

        /* ── GET /api/inventory/items ───────────────────────────── */
        if (req.method === 'GET' && url.pathname === '/api/inventory/items') {
          const p = url.searchParams;
          const activeParam = p.has('active') ? p.get('active') !== '0' : undefined;
          let items = dbInventoryItems(activeParam, p.get('module_scope')||'', p.get('category')||'');
          const q = (p.get('q')||'').toLowerCase();
          if (q) items = items.filter(i =>
            i.nameAr.includes(q) || i.nameEn.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q)
          );
          return send(res, 200, { items });
        }

        /* ── POST /api/inventory/items ──────────────────────────── */
        if (req.method === 'POST' && url.pathname === '/api/inventory/items') {
          const b = await bodyJSON(req);
          const nameAr = sanitize(b.nameAr||b.name_ar, 200);
          const nameEn = sanitize(b.nameEn||b.name_en, 200);
          if (!nameAr && !nameEn) return send(res, 400, { error: 'NAME_REQUIRED' });
          const sku = sanitize(b.sku, 80).toUpperCase();
          if (!sku) return send(res, 400, { error: 'SKU_REQUIRED' });
          if (db.prepare('SELECT 1 FROM inventory_items WHERE sku=? AND deleted_at IS NULL').get(sku))
            return send(res, 409, { error: 'SKU_EXISTS' });
          const SCOPES = ['shared','hospitality','cleaning','maintenance','safety','security'];
          const moduleScope = SCOPES.includes(b.moduleScope||b.module_scope) ? (b.moduleScope||b.module_scope) : 'shared';
          const unit = sanitize(b.unit||'piece', 50) || 'piece';
          const id = newId('ii'); const ts = now();
          db.prepare(`INSERT INTO inventory_items
            (id,name_ar,name_en,sku,category,unit,module_scope,is_consumable,min_stock_level,reorder_level,active,created_at,updated_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,1,?,?)`)
            .run(id, nameAr, nameEn, sku,
              sanitize(b.category||'general',100), unit, moduleScope,
              b.isConsumable===false ? 0 : 1,
              Math.max(0, Number(b.minStockLevel)||0),
              Math.max(0, Number(b.reorderLevel)||0),
              ts, ts);
          logEvent(db,'inventory.item_created','inventory_item',id,me,{sku,moduleScope},'inventory');
          return send(res, 200, { item: inventoryItemRow(db.prepare('SELECT * FROM inventory_items WHERE id=?').get(id)) });
        }

        /* ── PUT /api/inventory/items/:id ───────────────────────── */
        if (req.method === 'PUT' && /^\/api\/inventory\/items\/[^/]+$/.test(url.pathname)) {
          const id = sanitize(url.pathname.split('/')[4], 80);
          const item = db.prepare('SELECT * FROM inventory_items WHERE id=? AND deleted_at IS NULL').get(id);
          if (!item) return send(res, 404, { error: 'NOT_FOUND' });
          const b = await bodyJSON(req);
          const SCOPES = ['shared','hospitality','cleaning','maintenance','safety','security'];
          const fields = []; const vals = [];
          if (b.nameAr      !== undefined) { fields.push('name_ar=?');        vals.push(sanitize(b.nameAr,200)); }
          if (b.nameEn      !== undefined) { fields.push('name_en=?');        vals.push(sanitize(b.nameEn,200)); }
          if (b.category    !== undefined) { fields.push('category=?');       vals.push(sanitize(b.category,100)); }
          if (b.unit        !== undefined) { fields.push('unit=?');           vals.push(sanitize(b.unit,50)); }
          if (b.moduleScope !== undefined && SCOPES.includes(b.moduleScope)) { fields.push('module_scope=?'); vals.push(b.moduleScope); }
          if (b.isConsumable!== undefined) { fields.push('is_consumable=?');  vals.push(b.isConsumable ? 1 : 0); }
          if (b.minStockLevel !== undefined) { fields.push('min_stock_level=?'); vals.push(Math.max(0,Number(b.minStockLevel))); }
          if (b.reorderLevel  !== undefined) { fields.push('reorder_level=?');   vals.push(Math.max(0,Number(b.reorderLevel))); }
          if (b.active        !== undefined) { fields.push('active=?');          vals.push(b.active ? 1 : 0); }
          if (!fields.length) return send(res, 400, { error: 'NO_FIELDS' });
          fields.push('updated_at=?'); vals.push(now()); vals.push(id);
          db.prepare(`UPDATE inventory_items SET ${fields.join(',')} WHERE id=?`).run(...vals);
          logEvent(db,'inventory.item_updated','inventory_item',id,me,{},'inventory');
          return send(res, 200, { item: inventoryItemRow(db.prepare('SELECT * FROM inventory_items WHERE id=?').get(id)) });
        }

        /* ── GET /api/inventory/balances ────────────────────────── */
        if (req.method === 'GET' && url.pathname === '/api/inventory/balances') {
          const p = url.searchParams;
          const balances = dbStockBalances(
            p.get('warehouse_id')||'', p.get('item_id')||'',
            p.get('low_stock') === '1'
          );
          return send(res, 200, { balances });
        }

        /* ── GET /api/inventory/movements ───────────────────────── */
        if (req.method === 'GET' && url.pathname === '/api/inventory/movements') {
          const p = url.searchParams;
          let sql = 'SELECT * FROM stock_movements WHERE 1=1';
          const params = [];
          if (p.get('warehouse_id')) { sql += ' AND warehouse_id=?'; params.push(p.get('warehouse_id')); }
          if (p.get('item_id'))      { sql += ' AND item_id=?';      params.push(p.get('item_id')); }
          if (p.get('movement_type')){ sql += ' AND movement_type=?';params.push(p.get('movement_type')); }
          if (p.get('reference_type')){ sql += ' AND reference_type=?'; params.push(p.get('reference_type')); }
          sql += ' ORDER BY created_at DESC LIMIT 200';
          const movements = db.prepare(sql).all(...params).map(stockMovementRow);
          return send(res, 200, { movements });
        }

        /* ── POST /api/inventory/movements ──────────────────────── */
        if (req.method === 'POST' && url.pathname === '/api/inventory/movements') {
          const b = await bodyJSON(req);
          const warehouseId = sanitize(b.warehouseId||b.warehouse_id, 80);
          const itemId      = sanitize(b.itemId||b.item_id, 80);
          const MOVE_TYPES = ['opening_balance','receive','issue','transfer_out','transfer_in','adjustment','reservation','release_reservation'];
          const movementType = b.movementType||b.movement_type;
          if (!MOVE_TYPES.includes(movementType)) return send(res, 400, { error: 'INVALID_MOVEMENT_TYPE' });
          if (!warehouseId || !itemId) return send(res, 400, { error: 'MISSING_FIELDS' });
          if (!db.prepare('SELECT 1 FROM warehouses WHERE id=? AND deleted_at IS NULL').get(warehouseId))
            return send(res, 404, { error: 'WAREHOUSE_NOT_FOUND' });
          if (!db.prepare('SELECT 1 FROM inventory_items WHERE id=? AND deleted_at IS NULL').get(itemId))
            return send(res, 404, { error: 'ITEM_NOT_FOUND' });

          const qty = Number(b.quantity);
          if (!isFinite(qty) || qty === 0) return send(res, 400, { error: 'INVALID_QUANTITY' });
          const notes = sanitize(b.notes, 500);
          const ts = now();

          const invItem = db.prepare('SELECT min_stock_level FROM inventory_items WHERE id=?').get(itemId);
          const itemMinLevel = invItem ? invItem.min_stock_level : 0;
          let result;
          try {
            result = db.transaction(() => {
            // upsert balance row using item's min_stock_level
            db.prepare(`INSERT OR IGNORE INTO stock_balances
              (warehouse_id,item_id,quantity_on_hand,quantity_reserved,min_level,updated_at)
              VALUES (?,?,0,0,?,?)`)
              .run(warehouseId, itemId, itemMinLevel, ts);
            const bal = db.prepare('SELECT * FROM stock_balances WHERE warehouse_id=? AND item_id=?').get(warehouseId, itemId);
            let onHand   = bal.quantity_on_hand;
            let reserved = bal.quantity_reserved;
            let balanceAfter;
            const absQty = Math.abs(qty);

            if (['opening_balance','receive','transfer_in'].includes(movementType)) {
              if (absQty <= 0) throw Object.assign(new Error('QUANTITY_MUST_BE_POSITIVE'), {code:400});
              onHand += absQty;
              balanceAfter = onHand;
              db.prepare('UPDATE stock_balances SET quantity_on_hand=?,updated_at=? WHERE warehouse_id=? AND item_id=?')
                .run(onHand, ts, warehouseId, itemId);
            } else if (['issue','transfer_out'].includes(movementType)) {
              if (absQty <= 0) throw Object.assign(new Error('QUANTITY_MUST_BE_POSITIVE'), {code:400});
              if (onHand - reserved < absQty) throw Object.assign(new Error('INSUFFICIENT_STOCK'), {code:400});
              onHand -= absQty;
              balanceAfter = onHand;
              db.prepare('UPDATE stock_balances SET quantity_on_hand=?,updated_at=? WHERE warehouse_id=? AND item_id=?')
                .run(onHand, ts, warehouseId, itemId);
            } else if (movementType === 'adjustment') {
              onHand = Math.max(0, onHand + qty);
              balanceAfter = onHand;
              db.prepare('UPDATE stock_balances SET quantity_on_hand=?,updated_at=? WHERE warehouse_id=? AND item_id=?')
                .run(onHand, ts, warehouseId, itemId);
            } else if (movementType === 'reservation') {
              if (absQty <= 0) throw Object.assign(new Error('QUANTITY_MUST_BE_POSITIVE'), {code:400});
              if (onHand - reserved < absQty) throw Object.assign(new Error('INSUFFICIENT_STOCK'), {code:400});
              reserved += absQty;
              balanceAfter = reserved;
              db.prepare('UPDATE stock_balances SET quantity_reserved=?,updated_at=? WHERE warehouse_id=? AND item_id=?')
                .run(reserved, ts, warehouseId, itemId);
            } else if (movementType === 'release_reservation') {
              if (absQty <= 0) throw Object.assign(new Error('QUANTITY_MUST_BE_POSITIVE'), {code:400});
              reserved = Math.max(0, reserved - absQty);
              balanceAfter = reserved;
              db.prepare('UPDATE stock_balances SET quantity_reserved=?,updated_at=? WHERE warehouse_id=? AND item_id=?')
                .run(reserved, ts, warehouseId, itemId);
            }

            // store signed quantity
            const storedQty = ['issue','transfer_out'].includes(movementType) ? -absQty
              : movementType === 'release_reservation' ? -absQty
              : movementType === 'adjustment' ? qty
              : absQty;

            const mvId = newId('mv');
            db.prepare(`INSERT INTO stock_movements
              (id,warehouse_id,item_id,movement_type,quantity,balance_after,reference_type,reference_id,notes,actor_id,created_at)
              VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
              .run(mvId, warehouseId, itemId, movementType, storedQty, balanceAfter,
                sanitize(b.referenceType||'manual',50), sanitize(b.referenceId||'',80),
                notes, me.id, ts);

            logEvent(db,'inventory.movement','stock_movement',mvId,me,{movementType,qty:storedQty},'inventory');
            return {
              movement: stockMovementRow(db.prepare('SELECT * FROM stock_movements WHERE id=?').get(mvId)),
              balance:  stockBalanceRow(db.prepare('SELECT * FROM stock_balances WHERE warehouse_id=? AND item_id=?').get(warehouseId,itemId))
            };
          })();
          } catch (e) {
            if (e.code === 400) return send(res, 400, { error: e.message });
            throw e;
          }
          return send(res, 200, result);
        }

        return send(res, 404, { error: 'NOT_FOUND' });
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
        db.prepare('INSERT OR IGNORE INTO assignments (worker_id,location_id,created_at,supervisor_id,module) VALUES (?,?,?,?,?)').run(wid,lid,ts,wid === 'u-w5' ? 'u-s2' : 'u-s1','cleaning')
      )
    );
    [['u-hosp-w1',['lobby-gf','wc-gf-a']],['u-hosp-w2',['pantry-05','meeting-08-a']]].forEach(([wid,lids]) =>
      lids.forEach(lid =>
        db.prepare('INSERT OR IGNORE INTO assignments (worker_id,location_id,created_at,supervisor_id,module) VALUES (?,?,?,?,?)').run(wid,lid,ts,'u-hosp-sup','hospitality')
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
  console.log('║   MRFQ Facility Care — PROTOTYPE / نسخة تجريبية          ║');
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
    console.log('   e.g. DB_PATH=/data/mrfq.db to prevent data loss on redeploy.');
  }
  console.log('');
});
