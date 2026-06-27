'use strict';
/**
 * Smoke tests for Phase 4a — Hospitality Backend Foundation.
 * Spawns an isolated server against a temp SQLite DB/uploads dir,
 * exercises roles, order lifecycle, status machine and permissions,
 * then tears down.
 *
 * Run: node --test test/smoke-hospitality.test.js
 */
const test   = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const path   = require('node:path');
const fs     = require('node:fs');
const os     = require('node:os');

const ROOT = path.join(__dirname, '..');
const PORT = 3998;
const BASE = `http://127.0.0.1:${PORT}`;

const TMP_DIR     = fs.mkdtempSync(path.join(os.tmpdir(), 'mrfq-smoke-hosp-'));
const DB_PATH     = path.join(TMP_DIR, 'test.db');
const UPLOADS_DIR = path.join(TMP_DIR, 'uploads');

const PASSWORDS = {
  admin: 'AdminTest123!', fm: 'FmTest123!', manager: 'MgrTest123!',
  supervisor: 'SupTest123!', worker: 'WorkerTest123!'
};

let serverProc;

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

/* ── 1. Create hospitality demo users (admin only) ───────────── */
const HOSP_USERS = {
  employee:   { username: 'hosp-emp1', name: 'Employee One', password: 'EmpTest123!', role: 'employee' },
  manager:    { username: 'hosp-mgr1', name: 'Hosp Manager', password: 'HmgrTest123!', role: 'hospitality_manager' },
  supervisor: { username: 'hosp-sup1', name: 'Hosp Supervisor', password: 'HsupTest123!', role: 'hospitality_supervisor' },
  worker:     { username: 'hosp-wkr1', name: 'Hosp Worker', password: 'HwkrTest123!', role: 'hospitality_worker' }
};

test('admin can create hospitality role users', async () => {
  const admin = await login('admin', PASSWORDS.admin);
  for (const u of Object.values(HOSP_USERS)) {
    const r = await admin('/api/users', { method: 'POST', body: JSON.stringify(u) });
    assert.equal(r.status, 200, `create ${u.username} failed: ${JSON.stringify(r.body)}`);
    assert.equal(r.body.user.role, u.role);
  }
  const boot = await admin('/api/bootstrap');
  const supervisor = boot.body.users.find(u => u.username === HOSP_USERS.supervisor.username);
  const worker = boot.body.users.find(u => u.username === HOSP_USERS.worker.username);
  assert.ok(supervisor, 'hospitality supervisor user not found');
  assert.ok(worker, 'hospitality worker user not found');
  const scoped = await admin('/api/assignments', { method: 'POST', body: JSON.stringify({
    module: 'hospitality',
    workerId: worker.id,
    supervisorId: supervisor.id,
    locationIds: ['lobby-gf']
  }) });
  assert.equal(scoped.status, 200, JSON.stringify(scoped.body));
});

test('cleaning_supervisor cannot create hospitality role users', async () => {
  const admin = await login('admin', PASSWORDS.admin);
  // ensure cleaning supervisor exists from seed
  const supervisor = await login('supervisor1', PASSWORDS.supervisor);
  const r = await supervisor('/api/users', { method: 'POST', body: JSON.stringify(
    { username: 'hosp-illegal', name: 'Nope', password: 'NopeTest123!', role: 'hospitality_worker' }
  ) });
  assert.equal(r.status, 403);
  void admin;
});

/* ── 2. Create order (employee) ──────────────────────────────── */
let orderId;

test('employee creates a hospitality order (status=submitted)', async () => {
  const employee = await login(HOSP_USERS.employee.username, HOSP_USERS.employee.password);
  const r = await employee('/api/hospitality/orders', { method: 'POST', body: JSON.stringify({
    locationId: 'lobby-gf', kitchenId: 'kit-main', orderType: 'beverage', items: ['قهوة', 'ماء'], notes: 'طلب اختباري'
  }) });
  assert.equal(r.status, 200, JSON.stringify(r.body));
  assert.equal(r.body.order.status, 'submitted');
  assert.ok(r.body.order.referenceNo.startsWith('HSP-'));
  orderId = r.body.order.id;
});

test('cleaning_manager cannot create hospitality orders', async () => {
  const manager = await login('manager', PASSWORDS.manager);
  const r = await manager('/api/hospitality/orders', { method: 'POST', body: JSON.stringify({
    locationId: 'lobby-gf', orderType: 'general'
  }) });
  assert.equal(r.status, 403);
});

/* ── 3. List orders — role scoping ───────────────────────────── */
test('cleaner cannot access hospitality orders', async () => {
  const worker = await login('worker6', PASSWORDS.worker);
  const r = await worker('/api/hospitality/orders');
  assert.equal(r.status, 403);
});

test('hospitality_supervisor sees all orders', async () => {
  const supervisor = await login(HOSP_USERS.supervisor.username, HOSP_USERS.supervisor.password);
  const r = await supervisor('/api/hospitality/orders');
  assert.equal(r.status, 200);
  assert.ok(r.body.orders.some(o => o.id === orderId));
});

test('hospitality order exposes a role-scoped activity timeline', async () => {
  const supervisor = await login(HOSP_USERS.supervisor.username, HOSP_USERS.supervisor.password);
  const orders = await supervisor('/api/hospitality/orders');
  assert.equal(orders.status, 200);
  const activity = await supervisor(`/api/hospitality/orders/${orders.body.orders[0].id}/activity`);
  assert.equal(activity.status, 200);
  assert.ok(activity.body.events.some(e => e.eventType === 'hospitality.submitted'));
});

test('employee bootstrap only shows own orders', async () => {
  const employee = await login(HOSP_USERS.employee.username, HOSP_USERS.employee.password);
  const r = await employee('/api/bootstrap');
  assert.equal(r.status, 200);
  for (const o of r.body.hospitalityOrders) assert.equal(o.requestedById, r.body.user.id);
  assert.ok(r.body.hospitalityOrders.some(o => o.id === orderId));
});

/* ── 4. Assignment ────────────────────────────────────────────── */
test('hospitality_supervisor assigns order to hospitality_worker', async () => {
  const supervisor = await login(HOSP_USERS.supervisor.username, HOSP_USERS.supervisor.password);
  // get worker id
  const admin = await login('admin', PASSWORDS.admin);
  const boot = await admin('/api/bootstrap');
  const worker = boot.body.users.find(u => u.username === HOSP_USERS.worker.username);
  assert.ok(worker, 'hospitality worker user not found');

  const r = await supervisor(`/api/hospitality/orders/${orderId}/assign`, {
    method: 'POST', body: JSON.stringify({ workerId: worker.id })
  });
  assert.equal(r.status, 200, JSON.stringify(r.body));
  assert.equal(r.body.order.assignedTo, worker.id);
});

test('hospitality_worker bootstrap shows only assigned orders', async () => {
  const worker = await login(HOSP_USERS.worker.username, HOSP_USERS.worker.password);
  const r = await worker('/api/bootstrap');
  assert.equal(r.status, 200);
  assert.ok(r.body.hospitalityOrders.some(o => o.id === orderId));
  for (const o of r.body.hospitalityOrders) assert.equal(o.assignedTo, r.body.user.id);
});

/* ── 5. Status machine — invalid transitions ─────────────────── */
test('reject unknown status value', async () => {
  const supervisor = await login(HOSP_USERS.supervisor.username, HOSP_USERS.supervisor.password);
  const r = await supervisor(`/api/hospitality/orders/${orderId}`, {
    method: 'PUT', body: JSON.stringify({ status: 'bogus' })
  });
  assert.equal(r.status, 400);
  assert.equal(r.body.error, 'INVALID_STATUS');
});

test('worker cannot jump ahead: submitted -> ready rejected', async () => {
  const worker = await login(HOSP_USERS.worker.username, HOSP_USERS.worker.password);
  const r = await worker(`/api/hospitality/orders/${orderId}`, {
    method: 'PUT', body: JSON.stringify({ status: 'ready' })
  });
  assert.equal(r.status, 400);
  assert.equal(r.body.error, 'INVALID_TRANSITION');
});

/* ── 6. Status machine — happy path lifecycle ────────────────── */
test('supervisor: submitted -> accepted', async () => {
  const supervisor = await login(HOSP_USERS.supervisor.username, HOSP_USERS.supervisor.password);
  const r = await supervisor(`/api/hospitality/orders/${orderId}`, {
    method: 'PUT', body: JSON.stringify({ status: 'accepted' })
  });
  assert.equal(r.status, 200, JSON.stringify(r.body));
  assert.equal(r.body.order.status, 'accepted');
  assert.ok(r.body.order.acceptedAt);
});

test('worker: accepted -> preparing -> ready -> out_for_delivery -> delivered', async () => {
  const worker = await login(HOSP_USERS.worker.username, HOSP_USERS.worker.password);
  for (const status of ['preparing', 'ready', 'out_for_delivery', 'delivered']) {
    const r = await worker(`/api/hospitality/orders/${orderId}`, {
      method: 'PUT', body: JSON.stringify({ status })
    });
    assert.equal(r.status, 200, `${status}: ${JSON.stringify(r.body)}`);
    assert.equal(r.body.order.status, status);
  }
});

test('worker cannot complete the order (delivered -> completed not in worker scope)', async () => {
  const worker = await login(HOSP_USERS.worker.username, HOSP_USERS.worker.password);
  const r = await worker(`/api/hospitality/orders/${orderId}`, {
    method: 'PUT', body: JSON.stringify({ status: 'completed' })
  });
  assert.equal(r.status, 400);
  assert.equal(r.body.error, 'INVALID_TRANSITION');
});

test('supervisor: delivered -> completed', async () => {
  const supervisor = await login(HOSP_USERS.supervisor.username, HOSP_USERS.supervisor.password);
  const r = await supervisor(`/api/hospitality/orders/${orderId}`, {
    method: 'PUT', body: JSON.stringify({ status: 'completed' })
  });
  assert.equal(r.status, 200, JSON.stringify(r.body));
  assert.equal(r.body.order.status, 'completed');
  assert.ok(r.body.order.completedAt);
});

test('terminal status cannot be changed', async () => {
  const supervisor = await login(HOSP_USERS.supervisor.username, HOSP_USERS.supervisor.password);
  const r = await supervisor(`/api/hospitality/orders/${orderId}`, {
    method: 'PUT', body: JSON.stringify({ status: 'preparing' })
  });
  assert.equal(r.status, 400);
  assert.equal(r.body.error, 'INVALID_TRANSITION');
});

/* ── 7. Employee self-cancel ─────────────────────────────────── */
let secondOrderId;

test('employee creates a second order and cancels it', async () => {
  const employee = await login(HOSP_USERS.employee.username, HOSP_USERS.employee.password);
  const created = await employee('/api/hospitality/orders', { method: 'POST', body: JSON.stringify({
    locationId: 'lobby-gf', kitchenId: 'kit-main', orderType: 'general'
  }) });
  assert.equal(created.status, 200);
  secondOrderId = created.body.order.id;

  const r = await employee(`/api/hospitality/orders/${secondOrderId}`, {
    method: 'PUT', body: JSON.stringify({ status: 'cancelled' })
  });
  assert.equal(r.status, 200, JSON.stringify(r.body));
  assert.equal(r.body.order.status, 'cancelled');
});

test('employee cannot modify another employee order', async () => {
  const admin = await login('admin', PASSWORDS.admin);
  const created = await admin('/api/hospitality/orders', { method: 'POST', body: JSON.stringify({
    locationId: 'lobby-gf', kitchenId: 'kit-main', orderType: 'general'
  }) });
  assert.equal(created.status, 200);
  const otherOrderId = created.body.order.id;

  const employee = await login(HOSP_USERS.employee.username, HOSP_USERS.employee.password);
  const r = await employee(`/api/hospitality/orders/${otherOrderId}`, {
    method: 'PUT', body: JSON.stringify({ status: 'cancelled' })
  });
  assert.equal(r.status, 403);
});

/* ── 8. Performance / SLA summary ────────────────────────────── */
test('hospitality_manager can view performance summary', async () => {
  const manager = await login(HOSP_USERS.manager.username, HOSP_USERS.manager.password);
  const r = await manager('/api/hospitality/performance');
  assert.equal(r.status, 200);
  assert.ok(r.body.byStatus.completed >= 1);
  assert.equal(typeof r.body.totalOrders, 'number');
});

test('cleaner cannot view hospitality performance', async () => {
  const worker = await login('worker6', PASSWORDS.worker);
  const r = await worker('/api/hospitality/performance');
  assert.equal(r.status, 403);
});

/* ── 9. Assign rejects terminal orders / unknown workers ─────── */
test('assign rejects a non hospitality_worker user', async () => {
  const admin = await login('admin', PASSWORDS.admin);
  const created = await admin('/api/hospitality/orders', { method: 'POST', body: JSON.stringify({
    locationId: 'lobby-gf', kitchenId: 'kit-main', orderType: 'general'
  }) });
  const newId = created.body.order.id;

  const supervisor = await login(HOSP_USERS.supervisor.username, HOSP_USERS.supervisor.password);
  const boot = await admin('/api/bootstrap');
  const cleaner = boot.body.users.find(u => u.username === 'worker6');
  const r = await supervisor(`/api/hospitality/orders/${newId}/assign`, {
    method: 'POST', body: JSON.stringify({ workerId: cleaner.id })
  });
  assert.equal(r.status, 404);
  assert.equal(r.body.error, 'WORKER_NOT_FOUND');
});

/* ── 10. Public-flow order ownership (phone-based) ───────────── */
test('employee cancels public-flow order when phone matches', async () => {
  const cr = await fetch(BASE + '/api/public/hospitality/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requesterName: 'Phone Owner', requesterPhone: '0501122334',
      locationId: 'lobby-gf', kitchenId: 'kit-main', orderType: 'general'
    })
  });
  assert.equal(cr.status, 200);
  const publicId = (await cr.json()).order.id;

  const employee = await login(HOSP_USERS.employee.username, HOSP_USERS.employee.password);
  const r = await employee(`/api/hospitality/orders/${publicId}`, {
    method: 'PUT', body: JSON.stringify({ status: 'cancelled', requesterPhone: '0501122334' })
  });
  assert.equal(r.status, 200, JSON.stringify(r.body));
  assert.equal(r.body.order.status, 'cancelled');
});

test('employee blocked from public-flow order when phone does not match', async () => {
  const cr = await fetch(BASE + '/api/public/hospitality/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requesterName: 'Other Person', requesterPhone: '0509988776',
      locationId: 'lobby-gf', kitchenId: 'kit-main', orderType: 'general'
    })
  });
  assert.equal(cr.status, 200);
  const otherId = (await cr.json()).order.id;

  const employee = await login(HOSP_USERS.employee.username, HOSP_USERS.employee.password);
  const r = await employee(`/api/hospitality/orders/${otherId}`, {
    method: 'PUT', body: JSON.stringify({ status: 'cancelled', requesterPhone: '0501122334' })
  });
  assert.equal(r.status, 403);
});

test('sanitizePhone rejects short numbers (public order returns 400)', async () => {
  const r = await fetch(BASE + '/api/public/hospitality/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requesterName: 'Test', requesterPhone: '123',
      locationId: 'lobby-gf', kitchenId: 'kit-main', orderType: 'general'
    })
  });
  assert.equal(r.status, 400);
  assert.equal((await r.json()).error, 'MISSING_FIELDS');
});
