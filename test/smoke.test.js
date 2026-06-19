'use strict';
/**
 * Smoke + role + state-machine tests for the MRFQ Cleaning module.
 * Spawns the server against an isolated temp SQLite DB/uploads dir,
 * exercises the closing-plan checklist end to end, then tears down.
 *
 * Run: node --test test/smoke.test.js
 */
const test   = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const path   = require('node:path');
const fs     = require('node:fs');
const os     = require('node:os');

const ROOT = path.join(__dirname, '..');
const PORT = 3999;
const BASE = `http://127.0.0.1:${PORT}`;

const TMP_DIR     = fs.mkdtempSync(path.join(os.tmpdir(), 'mrfq-smoke-'));
const DB_PATH     = path.join(TMP_DIR, 'test.db');
const UPLOADS_DIR = path.join(TMP_DIR, 'uploads');

const PASSWORDS = {
  admin: 'AdminTest123!', fm: 'FmTest123!', manager: 'MgrTest123!',
  supervisor: 'SupTest123!', worker: 'WorkerTest123!'
};

const TINY_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

let serverProc;
let maintenanceWorkerId;
let maintenanceTicketId;
let maintenanceWorker2Id;
let maintenanceAssetId;
let maintenancePartId;
let maintenanceScheduleId;
let maintenanceTeamOrderId;
let employeeMaintenanceTicketId;

/* ── cookie-aware fetch helper ─────────────────────────────────── */
function client() {
  let cookie = '';
  return async (p, opts = {}) => {
    const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
    if (cookie) headers['Cookie'] = cookie;
    const res = await fetch(BASE + p, { ...opts, headers, redirect: 'manual' });
    const set = res.headers.get('set-cookie');
    if (set) cookie = set.split(';')[0];
    let body = null;
    const text = await res.text();
    try { body = text ? JSON.parse(text) : null; } catch { body = text; }
    return { status: res.status, body };
  };
}

async function login(username, password) {
  const api = client();
  const r = await api('/api/login', { method: 'POST', body: JSON.stringify({ username, password }) });
  assert.equal(r.status, 200, `login ${username} failed: ${JSON.stringify(r.body)}`);
  return api;
}

async function waitForServer() {
  for (let i = 0; i < 50; i++) {
    try {
      const res = await fetch(BASE + '/health');
      if (res.ok) return;
    } catch {}
    await new Promise(r => setTimeout(r, 100));
  }
  throw new Error('server did not start in time');
}

test.before(async () => {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  serverProc = spawn('node', ['server.js'], {
    cwd: ROOT,
    env: {
      ...process.env,
      PORT: String(PORT),
      DB_PATH: DB_PATH,
      UPLOADS_PATH: UPLOADS_DIR,
      DEMO_ADMIN_PASSWORD: PASSWORDS.admin,
      DEMO_FM_PASSWORD: PASSWORDS.fm,
      DEMO_MANAGER_PASSWORD: PASSWORDS.manager,
      DEMO_SUPERVISOR_PASSWORD: PASSWORDS.supervisor,
      DEMO_WORKER_PASSWORD: PASSWORDS.worker
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  await waitForServer();
});

test.after(() => {
  serverProc.kill();
  fs.rmSync(TMP_DIR, { recursive: true, force: true });
});

/* ── 1. Login ─────────────────────────────────────────────────── */
test('login: admin succeeds and sets cookie', async () => {
  const api = client();
  const r = await api('/api/login', { method: 'POST', body: JSON.stringify({ username: 'admin', password: PASSWORDS.admin }) });
  assert.equal(r.status, 200);
  assert.equal(r.body.user.role, 'system_admin');
});

test('health endpoint reports database and storage checks', async () => {
  const res = await fetch(BASE + '/health');
  assert.equal(res.status, 200);
  const csp = res.headers.get('content-security-policy') || '';
  assert.match(csp, /default-src 'self'/);
  assert.match(csp, /script-src 'self'/);
  assert.match(csp, /script-src-attr 'unsafe-inline'/);
  assert.doesNotMatch(csp, /script-src 'self' 'unsafe-inline'/);
  assert.match(csp, /style-src 'self' 'unsafe-inline'/);
  assert.match(csp, /style-src-attr 'unsafe-inline'/);
  assert.match(csp, /font-src 'self'/);
  assert.doesNotMatch(csp, /fonts\.googleapis\.com|fonts\.gstatic\.com/);
  assert.doesNotMatch(csp, /script-src[^;]*https?:/);
  const health = await res.json();
  assert.equal(health.status, 'ok');
  assert.equal(health.checks.database, 'ok');
  assert.equal(health.checks.storage, 'ok');
  assert.ok(Number.isInteger(health.uptimeSeconds));
});

test('platform exposes facilities, spaces, module registry and operational heatmap', async () => {
  const admin = await login('admin', PASSWORDS.admin);
  const facilities = await admin('/api/facilities');
  assert.equal(facilities.status, 200);
  assert.ok(Array.isArray(facilities.body.facilities));
  assert.ok(facilities.body.facilities.length >= 1);

  const modules = await admin('/api/modules');
  assert.equal(modules.status, 200);
  assert.equal(modules.body.modules.find(m => m.id === 'security').status, 'planned');

  const heatmap = await admin('/api/facilities/heatmap');
  assert.equal(heatmap.status, 200);
  assert.ok(Array.isArray(heatmap.body.locations));
  assert.ok(heatmap.body.locations.length >= 1);
  assert.deepEqual(Object.keys(heatmap.body.summary), ['normal','watch','hot','critical']);
});

test('facility manager executive report is data-backed and role protected', async () => {
  const fm = await login('fm', PASSWORDS.fm);
  const report = await fm('/api/reports/facility-manager/executive');
  assert.equal(report.status, 200);
  assert.equal(report.body.modules.length, 3);
  const worker = await login('worker3', PASSWORDS.worker);
  const denied = await worker('/api/reports/facility-manager/executive');
  assert.equal(denied.status, 403);
});

test('cross-site authenticated mutation is rejected by CSRF boundary', async () => {
  const admin = await login('admin', PASSWORDS.admin);
  const response = await admin('/api/settings', {
    method: 'POST',
    headers: { Origin: 'https://attacker.invalid', 'Sec-Fetch-Site': 'cross-site' },
    body: JSON.stringify({ require_photo: 1 })
  });
  assert.equal(response.status, 403);
  assert.equal(response.body.error, 'CSRF_REJECTED');
});

test('login: wrong password rejected with 401', async () => {
  const api = client();
  const r = await api('/api/login', { method: 'POST', body: JSON.stringify({ username: 'admin', password: 'wrong' }) });
  assert.equal(r.status, 401);
  assert.equal(r.body.error, 'INVALID_LOGIN');
});

/* ── 2. Bootstrap ─────────────────────────────────────────────── */
test('bootstrap: returns role-scoped payload', async () => {
  const admin = await login('admin', PASSWORDS.admin);
  const r = await admin('/api/bootstrap');
  assert.equal(r.status, 200);
  assert.ok(Array.isArray(r.body.tickets));
  assert.ok(Array.isArray(r.body.users));
});

test('bootstrap: unauthenticated request rejected with 401', async () => {
  const anon = client();
  const r = await anon('/api/bootstrap');
  assert.equal(r.status, 401);
  assert.equal(r.body.error, 'UNAUTHORIZED');
});

/* ── 3. Role permissions ─────────────────────────────────────── */
test('role: worker cannot create tickets (403)', async () => {
  const worker = await login('worker3', PASSWORDS.worker);
  const r = await worker('/api/tickets', { method: 'POST', body: JSON.stringify({ locationId: 'lobby-gf', title: 'x' }) });
  assert.equal(r.status, 403);
  assert.equal(r.body.error, 'FORBIDDEN');
});

test('role: worker sees only own data in bootstrap', async () => {
  const worker = await login('worker6', PASSWORDS.worker);
  const r = await worker('/api/bootstrap');
  assert.equal(r.status, 200);
  for (const t of r.body.tickets) assert.equal(t.assignedTo, 'u-w6');
  assert.equal(r.body.users.length, 1);
});

test('role: manager can manage users, supervisor cannot', async () => {
  const manager = await login('manager', PASSWORDS.manager);
  const supervisor = await login('supervisor1', PASSWORDS.supervisor);
  const newUser = { username: 'tmpuser1', name: 'Temp', password: 'TempPass123!', role: 'cleaner' };
  const rSup = await supervisor('/api/users', { method: 'POST', body: JSON.stringify(newUser) });
  assert.equal(rSup.status, 403);
  const rMgr = await manager('/api/users', { method: 'POST', body: JSON.stringify(newUser) });
  assert.equal(rMgr.status, 200);
  tmpUserId = rMgr.body.user.id;
});

test('PUT /api/users/:id rejects invalid role (400 INVALID_ROLE)', async () => {
  const manager = await login('manager', PASSWORDS.manager);
  const r = await manager(`/api/users/${tmpUserId}`, { method: 'PUT', body: JSON.stringify({ role: 'super_admin' }) });
  assert.equal(r.status, 400);
  assert.equal(r.body.error, 'INVALID_ROLE');
});

test('PUT /api/users/:id accepts valid role', async () => {
  const manager = await login('manager', PASSWORDS.manager);
  const r = await manager(`/api/users/${tmpUserId}`, { method: 'PUT', body: JSON.stringify({ role: 'cleaning_supervisor' }) });
  assert.equal(r.status, 200);
  assert.equal(r.body.user.role, 'cleaning_supervisor');
});

/* ── 4-12. Full ticket lifecycle ─────────────────────────────── */
let ticketId, reportId, tmpUserId;

test('create cleaning ticket (manager, with worker -> auto status assigned)', async () => {
  const manager = await login('manager', PASSWORDS.manager);
  const r = await manager('/api/tickets', { method: 'POST', body: JSON.stringify({
    locationId: 'lobby-gf', title: 'بلاغ اختبار دخان', description: 'اختبار سموك', priority: 'high'
  }) });
  assert.equal(r.status, 200);
  assert.ok(r.body.ticket.id);
  // lobby-gf is assigned to u-w3 -> auto-assignment should fire
  assert.equal(r.body.ticket.status, 'assigned');
  assert.equal(r.body.ticket.assignedTo, 'u-w3');
  ticketId = r.body.ticket.id;
});

test('supervisor reassigns ticket to another worker (assigned -> assigned)', async () => {
  const supervisor = await login('supervisor1', PASSWORDS.supervisor);
  const r = await supervisor(`/api/tickets/${ticketId}`, { method: 'PUT', body: JSON.stringify({ assignedTo: 'u-w4', status: 'assigned' }) });
  assert.equal(r.status, 200);
  assert.equal(r.body.ticket.assignedTo, 'u-w4');
  assert.equal(r.body.ticket.status, 'assigned');
});

test('PUT ticket: rejects unknown status value (400 INVALID_STATUS)', async () => {
  const supervisor = await login('supervisor1', PASSWORDS.supervisor);
  const r = await supervisor(`/api/tickets/${ticketId}`, { method: 'PUT', body: JSON.stringify({ status: 'banana' }) });
  assert.equal(r.status, 400);
  assert.equal(r.body.error, 'INVALID_STATUS');
});

test('PUT ticket: rejects disallowed transition (400 INVALID_TRANSITION)', async () => {
  const supervisor = await login('supervisor1', PASSWORDS.supervisor);
  // assigned -> completed is not a direct allowed transition (must go through waiting_verification)
  const r = await supervisor(`/api/tickets/${ticketId}`, { method: 'PUT', body: JSON.stringify({ status: 'completed' }) });
  assert.equal(r.status, 400);
  assert.equal(r.body.error, 'INVALID_TRANSITION');
});

test('worker (assigned) cannot complete a ticket assigned to someone else (403)', async () => {
  const worker3 = await login('worker3', PASSWORDS.worker);
  const r = await worker3('/api/tickets/complete', { method: 'POST', body: JSON.stringify({ id: ticketId, photos: [TINY_PNG] }) });
  assert.equal(r.status, 403);
  assert.equal(r.body.error, 'FORBIDDEN');
});

test('non-cleaner roles cannot use /api/tickets/complete (403)', async () => {
  const supervisor = await login('supervisor1', PASSWORDS.supervisor);
  const rSup = await supervisor('/api/tickets/complete', { method: 'POST', body: JSON.stringify({ id: ticketId, photos: [TINY_PNG] }) });
  assert.equal(rSup.status, 403);
  assert.equal(rSup.body.error, 'FORBIDDEN');

  const manager = await login('manager', PASSWORDS.manager);
  const rMgr = await manager('/api/tickets/complete', { method: 'POST', body: JSON.stringify({ id: ticketId, photos: [TINY_PNG] }) });
  assert.equal(rMgr.status, 403);
  assert.equal(rMgr.body.error, 'FORBIDDEN');
});

test('worker completes ticket -> waiting_verification', async () => {
  const worker4 = await login('worker4', PASSWORDS.worker);
  const r = await worker4('/api/tickets/complete', { method: 'POST', body: JSON.stringify({ id: ticketId, notes: 'تم التنظيف', photos: [TINY_PNG] }) });
  assert.equal(r.status, 200);
  assert.equal(r.body.ticket.status, 'waiting_verification');
  assert.ok(r.body.ticket.photos.length >= 1);
});

test('worker submits cleaning report with before/after photos', async () => {
  const worker3 = await login('worker3', PASSWORDS.worker);
  const r = await worker3('/api/reports', { method: 'POST', body: JSON.stringify({
    locationId: 'lobby-gf', tasks: ['floor', 'mirrors'], notes: 'تقرير اختبار',
    beforePhotos: [TINY_PNG], afterPhotos: [TINY_PNG]
  }) });
  assert.equal(r.status, 200);
  assert.equal(r.body.report.approvalStatus, 'pending');
  assert.ok(r.body.report.beforePhotos.length >= 1);
  assert.ok(r.body.report.afterPhotos.length >= 1);
  reportId = r.body.report.id;
});

test('complete a ticket already awaiting verification is rejected', async () => {
  const worker4 = await login('worker4', PASSWORDS.worker);
  // ticket is now waiting_verification -> not eligible for /complete again
  const r = await worker4('/api/tickets/complete', { method: 'POST', body: JSON.stringify({ id: ticketId, photos: [TINY_PNG] }) });
  assert.equal(r.status, 400);
  assert.equal(r.body.error, 'INVALID_TRANSITION');
});

test('supervisor verifies ticket: waiting_verification -> completed', async () => {
  const supervisor = await login('supervisor1', PASSWORDS.supervisor);
  const r = await supervisor(`/api/tickets/${ticketId}`, { method: 'PUT', body: JSON.stringify({ status: 'completed' }) });
  assert.equal(r.status, 200);
  assert.equal(r.body.ticket.status, 'completed');
  assert.ok(r.body.ticket.completedAt);
});

test('PUT ticket: transition out of a terminal state is rejected', async () => {
  const supervisor = await login('supervisor1', PASSWORDS.supervisor);
  const r = await supervisor(`/api/tickets/${ticketId}`, { method: 'PUT', body: JSON.stringify({ status: 'in_progress' }) });
  assert.equal(r.status, 400);
  assert.equal(r.body.error, 'INVALID_TRANSITION');
});

/* ── Report review state machine ─────────────────────────────── */
test('report review: rejects invalid status value (400 INVALID_STATUS)', async () => {
  const supervisor = await login('supervisor1', PASSWORDS.supervisor);
  const r = await supervisor('/api/reports/review', { method: 'POST', body: JSON.stringify({ id: reportId, status: 'approved_forever' }) });
  assert.equal(r.status, 400);
  assert.equal(r.body.error, 'INVALID_STATUS');
});

test('supervisor approves report (pending -> approved)', async () => {
  const supervisor = await login('supervisor1', PASSWORDS.supervisor);
  const r = await supervisor('/api/reports/review', { method: 'POST', body: JSON.stringify({ id: reportId, status: 'approved', note: 'جيد' }) });
  assert.equal(r.status, 200);
  assert.equal(r.body.report.approvalStatus, 'approved');
});

test('report review: re-reviewing an already-reviewed report is rejected (400 ALREADY_REVIEWED)', async () => {
  const supervisor = await login('supervisor1', PASSWORDS.supervisor);
  const r = await supervisor('/api/reports/review', { method: 'POST', body: JSON.stringify({ id: reportId, status: 'rejected' }) });
  assert.equal(r.status, 400);
  assert.equal(r.body.error, 'ALREADY_REVIEWED');
});

/* ── 12b. Rating governance ─────────────────────────────────────── */
test('cleaning_supervisor can rate supervisor type', async () => {
  const supervisor = await login('supervisor1', PASSWORDS.supervisor);
  const r = await supervisor('/api/reports/rate', { method: 'POST', body: JSON.stringify({ id: reportId, ratingType: 'supervisor', value: 5 }) });
  assert.equal(r.status, 200, JSON.stringify(r.body));
});

test('cleaning_supervisor cannot rate manager type (403)', async () => {
  const supervisor = await login('supervisor1', PASSWORDS.supervisor);
  const r = await supervisor('/api/reports/rate', { method: 'POST', body: JSON.stringify({ id: reportId, ratingType: 'manager', value: 5 }) });
  assert.equal(r.status, 403);
});

test('system_admin can rate both types', async () => {
  const admin = await login('admin', PASSWORDS.admin);
  const r = await admin('/api/reports/rate', { method: 'POST', body: JSON.stringify({ id: reportId, ratingType: 'supervisor', value: 5 }) });
  assert.equal(r.status, 200, JSON.stringify(r.body));
});

test('cleaning_manager can rate manager type', async () => {
  const manager = await login('manager', PASSWORDS.manager);
  const r = await manager('/api/reports/rate', { method: 'POST', body: JSON.stringify({ id: reportId, ratingType: 'manager', value: 4 }) });
  assert.equal(r.status, 200, JSON.stringify(r.body));
});

test('cleaning_manager cannot rate supervisor type (403)', async () => {
  const manager = await login('manager', PASSWORDS.manager);
  const r = await manager('/api/reports/rate', { method: 'POST', body: JSON.stringify({ id: reportId, ratingType: 'supervisor', value: 4 }) });
  assert.equal(r.status, 403);
});

test('rating value out of range is rejected', async () => {
  const manager = await login('manager', PASSWORDS.manager);
  const r = await manager('/api/reports/rate', { method: 'POST', body: JSON.stringify({ id: reportId, ratingType: 'manager', value: 6 }) });
  assert.equal(r.status, 400);
  assert.equal(r.body.error, 'INVALID_RATING');
});

/* ── 13. SLA report ───────────────────────────────────────────── */
test('SLA report endpoint returns category breakdown', async () => {
  const manager = await login('manager', PASSWORDS.manager);
  const r = await manager('/api/sla-report');
  assert.equal(r.status, 200);
  assert.ok(Array.isArray(r.body.categories));
});

test('SLA report endpoint rejects cleaner (403)', async () => {
  const worker3 = await login('worker3', PASSWORDS.worker);
  const r = await worker3('/api/sla-report');
  assert.equal(r.status, 403);
});

/* ── 14. Performance endpoint ────────────────────────────────── */
test('performance endpoint accessible to supervisor', async () => {
  const supervisor = await login('supervisor1', PASSWORDS.supervisor);
  const r = await supervisor('/api/performance');
  assert.equal(r.status, 200);
});

test('performance endpoint rejects cleaner (403)', async () => {
  const worker3 = await login('worker3', PASSWORDS.worker);
  const r = await worker3('/api/performance');
  assert.equal(r.status, 403);
});

/* ── 15. Unauthorized access ─────────────────────────────────── */
test('protected endpoint with no session returns 401', async () => {
  const anon = client();
  const r = await anon('/api/tickets', { method: 'POST', body: JSON.stringify({ locationId: 'lobby-gf' }) });
  assert.equal(r.status, 401);
  assert.equal(r.body.error, 'UNAUTHORIZED');
});

/* ── 16. Maintenance module ──────────────────────────────────── */
test('maintenance: cleaner cannot create maintenance ticket (403)', async () => {
  const api = await login('worker3', PASSWORDS.worker);
  const r = await api('/api/maintenance-tickets', { method: 'POST', body: JSON.stringify({ locationId: 'lobby-gf', category: 'electrical', title: 'Test' }) });
  assert.equal(r.status, 403);
});

test('maintenance: admin can create maintenance ticket', async () => {
  const api  = await login('admin', PASSWORDS.admin);
  const boot = await api('/api/bootstrap');
  const locs = boot.body.locations;
  assert.ok(locs.length > 0, 'no locations');
  const locId = locs[0].id;
  const r = await api('/api/maintenance-tickets', { method: 'POST', body: JSON.stringify({ locationId: locId, category: 'electrical', title: 'كهرباء معطوبة' }) });
  assert.equal(r.status, 200);
  assert.equal(r.body.ticket.module, 'maintenance');
  assert.equal(r.body.ticket.category, 'electrical');
});

test('maintenance: ticket visible in admin bootstrap but not in cleaner bootstrap', async () => {
  const adm  = await login('admin', PASSWORDS.admin);
  const boot = await adm('/api/bootstrap');
  const locId = boot.body.locations[0].id;
  await adm('/api/maintenance-tickets', { method: 'POST', body: JSON.stringify({ locationId: locId, category: 'plumbing', title: 'Leak test' }) });

  const admBoot = await adm('/api/bootstrap');
  const maintTickets = (admBoot.body.tickets || []).filter(t => t.module === 'maintenance');
  assert.ok(maintTickets.length >= 1, 'admin should see maintenance tickets');

  const wkr = await login('worker3', PASSWORDS.worker);
  const wkrBoot = await wkr('/api/bootstrap');
  const wkrMaint = (wkrBoot.body.tickets || []).filter(t => t.module === 'maintenance');
  assert.equal(wkrMaint.length, 0, 'cleaner should not see maintenance tickets');
});

test('maintenance: cleaning tickets still scoped to cleaning_manager (not maintenance)', async () => {
  const mgr  = await login('manager', PASSWORDS.manager);
  const boot = await mgr('/api/bootstrap');
  const tickets = boot.body.tickets || [];
  const hasMaint = tickets.some(t => t.module === 'maintenance');
  assert.equal(hasMaint, false, 'cleaning_manager should not see maintenance tickets');
});

test('maintenance: invalid category falls back to general', async () => {
  const api  = await login('admin', PASSWORDS.admin);
  const boot = await api('/api/bootstrap');
  const locId = boot.body.locations[0].id;
  const r = await api('/api/maintenance-tickets', { method: 'POST', body: JSON.stringify({ locationId: locId, category: 'invalid_cat', title: 'Test' }) });
  assert.equal(r.status, 200);
  assert.equal(r.body.ticket.category, 'general', 'invalid category should fallback to general');
});

test('maintenance: maintenance-worker cannot call cleaning ticket complete (403)', async () => {
  const api = await login('worker3', PASSWORDS.worker);
  const r = await api('/api/maintenance-tickets/complete', { method: 'POST', body: JSON.stringify({ id: 'fake-id', notes: '' }) });
  assert.equal(r.status, 403);
});

test('maintenance: create roles and role-scoped bootstraps work', async () => {
  const admin = await login('admin', PASSWORDS.admin);
  for (const [username, name, role] of [
    ['maint-manager','مدير الصيانة','maintenance_manager'],
    ['maint-supervisor','مشرف الصيانة','maintenance_supervisor'],
    ['maint-worker','فني الصيانة','maintenance_worker']
  ]) {
    const created = await admin('/api/users', { method:'POST', body:JSON.stringify({ username, name, role, password:PASSWORDS.worker }) });
    assert.equal(created.status, 200);
    if (role === 'maintenance_worker') maintenanceWorkerId = created.body.user.id;
  }
  const manager = await login('maint-manager', PASSWORDS.worker);
  const supervisor = await login('maint-supervisor', PASSWORDS.worker);
  const worker = await login('maint-worker', PASSWORDS.worker);
  for (const api of [manager, supervisor, worker]) {
    const boot = await api('/api/bootstrap');
    assert.equal(boot.status, 200);
    assert.ok((boot.body.tickets||[]).every(t => t.module === 'maintenance'));
    assert.ok((boot.body.reports||[]).every(r => r.module === 'maintenance'));
  }
});

test('employee request channels can be controlled only by system admin', async () => {
  const admin = await login('admin', PASSWORDS.admin);
  const fm = await login('fm', PASSWORDS.fm);
  const disabled = await admin('/api/settings', { method:'POST', body:JSON.stringify({ employee_maintenance_requests_enabled:0 }) });
  assert.equal(disabled.status, 200);
  assert.equal(disabled.body.settings.employeeMaintenanceRequestsEnabled, false);
  const forbidden = await fm('/api/settings', { method:'POST', body:JSON.stringify({ employee_maintenance_requests_enabled:1 }) });
  assert.equal(forbidden.status, 403);
});

test('employee creates a maintenance request from the unified order endpoint', async () => {
  const employee = await login('employee1', PASSWORDS.worker);
  const boot = await employee('/api/bootstrap');
  const locationId = boot.body.locations[0].id;
  const disabled = await employee('/api/order', { method:'POST', body:JSON.stringify({
    serviceType:'maintenance', locationId, category:'hvac', description:'المكيف لا يعمل'
  }) });
  assert.equal(disabled.status, 403);
  assert.equal(disabled.body.error, 'SERVICE_DISABLED');

  const admin = await login('admin', PASSWORDS.admin);
  const enabled = await admin('/api/settings', { method:'POST', body:JSON.stringify({ employee_maintenance_requests_enabled:1 }) });
  assert.equal(enabled.status, 200);
  const created = await employee('/api/order', { method:'POST', body:JSON.stringify({
    serviceType:'maintenance', locationId, category:'hvac', description:'المكيف لا يعمل',
    assignedTo:'u-w3', technicianIds:['u-w3'], assetId:'forbidden-asset'
  }) });
  assert.equal(created.status, 200);
  assert.equal(created.body.ticket.module, 'maintenance');
  assert.equal(created.body.ticket.status, 'submitted');
  assert.equal(created.body.ticket.assignedTo, null);
  assert.match(created.body.ticket.referenceNo, /^MNT-/);
  employeeMaintenanceTicketId = created.body.ticket.id;

  const employeeAfter = await employee('/api/bootstrap');
  assert.ok(employeeAfter.body.tickets.some(t=>t.id===employeeMaintenanceTicketId));
  const maintSupervisor = await login('maint-supervisor', PASSWORDS.worker);
  const maintBoot = await maintSupervisor('/api/bootstrap');
  assert.ok(maintBoot.body.tickets.some(t=>t.id===employeeMaintenanceTicketId));
  const cleaningSupervisor = await login('supervisor1', PASSWORDS.supervisor);
  const cleaningBoot = await cleaningSupervisor('/api/bootstrap');
  assert.ok(!cleaningBoot.body.tickets.some(t=>t.id===employeeMaintenanceTicketId));
});

test('disabled cleaning request channel rejects new employee cleaning orders', async () => {
  const admin = await login('admin', PASSWORDS.admin);
  const employee = await login('employee1', PASSWORDS.worker);
  const boot = await employee('/api/bootstrap');
  await admin('/api/settings', { method:'POST', body:JSON.stringify({ employee_cleaning_requests_enabled:0 }) });
  const rejected = await employee('/api/order', { method:'POST', body:JSON.stringify({
    serviceType:'cleaning', locationId:boot.body.locations[0].id, category:'general'
  }) });
  assert.equal(rejected.status, 403);
  assert.equal(rejected.body.error, 'SERVICE_DISABLED');
  const restored = await admin('/api/settings', { method:'POST', body:JSON.stringify({ employee_cleaning_requests_enabled:1 }) });
  assert.equal(restored.status, 200);
});

test('maintenance: worker can progress only own assigned ticket', async () => {
  const manager = await login('maint-manager', PASSWORDS.worker);
  const boot = await manager('/api/bootstrap');
  const created = await manager('/api/maintenance-tickets', { method:'POST', body:JSON.stringify({
    locationId:boot.body.locations[0].id, category:'hvac', title:'HVAC test', assignedTo:maintenanceWorkerId
  }) });
  assert.equal(created.status, 200);
  maintenanceTicketId = created.body.ticket.id;

  const worker = await login('maint-worker', PASSWORDS.worker);
  const accepted = await worker(`/api/maintenance-tickets/${maintenanceTicketId}`, { method:'PUT', body:JSON.stringify({status:'accepted'}) });
  assert.equal(accepted.status, 200);
  const started = await worker(`/api/maintenance-tickets/${maintenanceTicketId}`, { method:'PUT', body:JSON.stringify({status:'in_progress'}) });
  assert.equal(started.status, 200);
  const forbiddenEdit = await worker(`/api/maintenance-tickets/${maintenanceTicketId}`, { method:'PUT', body:JSON.stringify({title:'tampered'}) });
  assert.equal(forbiddenEdit.status, 403);
  const completed = await worker('/api/maintenance-tickets/complete', { method:'POST', body:JSON.stringify({id:maintenanceTicketId,notes:'done'}) });
  assert.equal(completed.status, 200);
  assert.equal(completed.body.ticket.status, 'waiting_verification');
});

test('maintenance: supervisor verifies completed worker ticket', async () => {
  const supervisor = await login('maint-supervisor', PASSWORDS.worker);
  const verified = await supervisor(`/api/maintenance-tickets/${maintenanceTicketId}`, { method:'PUT', body:JSON.stringify({status:'completed'}) });
  assert.equal(verified.status, 200);
  assert.equal(verified.body.ticket.status, 'completed');
  const after = await supervisor('/api/bootstrap');
  assert.ok(after.body.tickets.some(t=>t.id===maintenanceTicketId&&t.status==='completed'), 'closed work order remains in supervisor history');
});

test('maintenance operations: assets, parts and second technician', async () => {
  const admin=await login('admin',PASSWORDS.admin);
  const second=await admin('/api/users',{method:'POST',body:JSON.stringify({username:'maint-worker-2',name:'فني صيانة 2',role:'maintenance_worker',password:PASSWORDS.worker})});
  assert.equal(second.status,200);maintenanceWorker2Id=second.body.user.id;
  const manager=await login('maint-manager',PASSWORDS.worker);const boot=await manager('/api/bootstrap');
  const asset=await manager('/api/maintenance/assets',{method:'POST',body:JSON.stringify({code:'AHU-001',nameAr:'وحدة مناولة الهواء',category:'hvac',locationId:boot.body.locations[0].id,serialNo:'SN-001',criticality:'critical'})});
  assert.equal(asset.status,200);maintenanceAssetId=asset.body.assets[0].id;
  const part=await manager('/api/maintenance/parts',{method:'POST',body:JSON.stringify({sku:'FLT-001',nameAr:'فلتر هواء',quantity:10,reorderLevel:2,unitCost:25})});
  assert.equal(part.status,200);maintenancePartId=part.body.parts[0].id;
});

test('maintenance supervisor assigns an employee maintenance request', async () => {
  const supervisor=await login('maint-supervisor',PASSWORDS.worker);
  const assigned=await supervisor(`/api/maintenance-tickets/${employeeMaintenanceTicketId}/team`,{method:'POST',body:JSON.stringify({technicianIds:[maintenanceWorkerId,maintenanceWorker2Id],leadTechnicianId:maintenanceWorkerId})});
  assert.equal(assigned.status,200);assert.equal(assigned.body.assignees.length,2);
  const after=await supervisor('/api/bootstrap');const order=after.body.tickets.find(t=>t.id===employeeMaintenanceTicketId);
  assert.equal(order.status,'assigned');assert.equal(order.assignedTo,maintenanceWorkerId);
});

test('maintenance operations: multi-technician work order with lead', async () => {
  const manager=await login('maint-manager',PASSWORDS.worker);const boot=await manager('/api/bootstrap');
  const created=await manager('/api/maintenance-tickets',{method:'POST',body:JSON.stringify({title:'صيانة فريق',locationId:boot.body.locations[0].id,category:'hvac',maintenanceType:'corrective',assetId:maintenanceAssetId,technicianIds:[maintenanceWorkerId,maintenanceWorker2Id],leadTechnicianId:maintenanceWorkerId})});
  assert.equal(created.status,200);maintenanceTeamOrderId=created.body.ticket.id;
  const after=await manager('/api/bootstrap');const team=after.body.maintenance.assignees.filter(a=>a.workOrderId===maintenanceTeamOrderId);
  assert.equal(team.length,2);assert.equal(team.filter(a=>a.isLead).length,1);
  const worker2=await login('maint-worker-2',PASSWORDS.worker);const workerBoot=await worker2('/api/bootstrap');
  assert.ok(workerBoot.body.tickets.some(t=>t.id===maintenanceTeamOrderId));
});

test('maintenance operations: preventive schedule generates work order', async () => {
  const supervisor=await login('maint-supervisor',PASSWORDS.worker);const boot=await supervisor('/api/bootstrap');
  const schedule=await supervisor('/api/maintenance/schedules',{method:'POST',body:JSON.stringify({titleAr:'صيانة شهرية لوحدة الهواء',locationId:boot.body.locations[0].id,assetIds:[maintenanceAssetId],category:'hvac',checklist:['فحص الفلتر','اختبار التشغيل'],frequencyUnit:'monthly',frequencyValue:1,nextRunAt:new Date(Date.now()+86400000).toISOString(),defaultTechnicianIds:[maintenanceWorkerId,maintenanceWorker2Id],leadTechnicianId:maintenanceWorkerId})});
  assert.equal(schedule.status,200);maintenanceScheduleId=schedule.body.schedules[0].id;
  const reassigned=await supervisor(`/api/maintenance/schedules/${maintenanceScheduleId}`,{method:'PUT',body:JSON.stringify({defaultTechnicianIds:[maintenanceWorkerId,maintenanceWorker2Id],leadTechnicianId:maintenanceWorker2Id})});
  assert.equal(reassigned.status,200);assert.equal(reassigned.body.schedules.find(s=>s.id===maintenanceScheduleId).leadTechnicianId,maintenanceWorker2Id);
  const run=await supervisor(`/api/maintenance/schedules/${maintenanceScheduleId}/run`,{method:'POST'});
  assert.equal(run.status,200);assert.ok(run.body.workOrderId);
  const after=await supervisor('/api/bootstrap');const generated=after.body.tickets.find(t=>t.id===run.body.workOrderId);
  assert.equal(generated.maintenanceType,'preventive');
  const team=after.body.maintenance.assignees.filter(a=>a.workOrderId===run.body.workOrderId);
  assert.equal(team.length,2);assert.equal(team.find(a=>a.isLead).technicianId,maintenanceWorker2Id);
});

test('maintenance operations: technician workflow, parts and diagnostic close', async () => {
  const worker=await login('maint-worker',PASSWORDS.worker);
  for(const status of ['accepted','diagnosing','in_progress']){
    const r=await worker(`/api/maintenance-tickets/${maintenanceTeamOrderId}`,{method:'PUT',body:JSON.stringify({status})});assert.equal(r.status,200);
  }
  const used=await worker(`/api/maintenance-tickets/${maintenanceTeamOrderId}/parts`,{method:'POST',body:JSON.stringify({partId:maintenancePartId,quantity:2})});
  assert.equal(used.status,200);assert.equal(used.body.parts.find(p=>p.id===maintenancePartId).quantity,8);
  const close=await worker('/api/maintenance-tickets/complete',{method:'POST',body:JSON.stringify({id:maintenanceTeamOrderId,diagnosis:'انسداد الفلتر',rootCause:'تراكم الغبار',downtimeMins:45,laborCost:120,vendorName:'مورد تجريبي',notes:'تم الإصلاح',beforePhotos:[TINY_PNG],afterPhotos:[TINY_PNG]})});
  assert.equal(close.status,200);assert.equal(close.body.ticket.status,'waiting_verification');assert.equal(close.body.ticket.diagnosis,'انسداد الفلتر');
  const after=await worker('/api/bootstrap');const closed=after.body.tickets.find(t=>t.id===maintenanceTeamOrderId);
  assert.equal(closed.beforePhotos.length,1);assert.equal(closed.afterPhotos.length,1);
  const createdReport=await worker('/api/maintenance-reports',{method:'POST',body:JSON.stringify({locationId:closed.locationId,tasks:['فحص التشغيل'],notes:'تقرير تقييم الفني'})});
  assert.equal(createdReport.status,200);const report=createdReport.body.report;
  const supervisor=await login('maint-supervisor',PASSWORDS.worker);
  const reviewed=await supervisor('/api/maintenance-reports/review',{method:'POST',body:JSON.stringify({id:report.id,status:'approved'})});
  assert.equal(reviewed.status,200);
  const supervisorRated=await supervisor('/api/maintenance-reports/rate',{method:'POST',body:JSON.stringify({id:report.id,ratingType:'supervisor',value:5})});
  assert.equal(supervisorRated.status,200);assert.equal(supervisorRated.body.report.ratingSupervisor,5);
  const manager=await login('maint-manager',PASSWORDS.worker);
  const managerRated=await manager('/api/maintenance-reports/rate',{method:'POST',body:JSON.stringify({id:report.id,ratingType:'manager',value:4})});
  assert.equal(managerRated.status,200);assert.equal(managerRated.body.report.ratingManager,4);
});
