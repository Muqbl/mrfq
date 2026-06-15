'use strict';
/**
 * Smoke tests for Phase 4c — admin password reset + public hospitality request flow.
 * Spawns an isolated server against a temp SQLite DB/uploads dir.
 *
 * Run: node --test test/smoke-phase4c.test.js
 */
const test   = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const path   = require('node:path');
const fs     = require('node:fs');
const os     = require('node:os');

const ROOT = path.join(__dirname, '..');
const PORT = 3997;
const BASE = `http://127.0.0.1:${PORT}`;

const TMP_DIR     = fs.mkdtempSync(path.join(os.tmpdir(), 'mrfq-smoke-4c-'));
const DB_PATH     = path.join(TMP_DIR, 'test.db');
const UPLOADS_DIR = path.join(TMP_DIR, 'uploads');

const PASSWORDS = {
  admin: 'AdminTest123!', fm: 'FmTest123!', manager: 'MgrTest123!',
  supervisor: 'SupTest123!', worker: 'WorkerTest123!', hospitality: 'HospTest123!'
};

let serverProc;

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
      DEMO_WORKER_PASSWORD: PASSWORDS.worker,
      DEMO_HOSPITALITY_PASSWORD: PASSWORDS.hospitality
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  await waitForServer();
});

test.after(() => {
  serverProc.kill();
  fs.rmSync(TMP_DIR, { recursive: true, force: true });
});

/* ── 1. Admin password reset endpoint ────────────────────────── */
let targetUserId;

test('admin creates a target user for password reset', async () => {
  const admin = await login('admin', PASSWORDS.admin);
  const r = await admin('/api/users', { method: 'POST', body: JSON.stringify({
    username: 'pwreset-user', name: 'Pw Reset User', password: 'OldPassw0rd!', role: 'employee'
  }) });
  assert.equal(r.status, 200, JSON.stringify(r.body));
  targetUserId = r.body.user.id;
});

test('system_admin can reset a user password', async () => {
  const admin = await login('admin', PASSWORDS.admin);
  const r = await admin(`/api/users/${targetUserId}/password`, {
    method: 'PATCH', body: JSON.stringify({ password: 'NewPassw0rd!' })
  });
  assert.equal(r.status, 200, JSON.stringify(r.body));
  assert.equal(r.body.user.forcePasswordChange, true);
});

test('user can login with the new password', async () => {
  const u = await login('pwreset-user', 'NewPassw0rd!');
  void u;
});

test('weak password is rejected', async () => {
  const admin = await login('admin', PASSWORDS.admin);
  const r = await admin(`/api/users/${targetUserId}/password`, {
    method: 'PATCH', body: JSON.stringify({ password: 'short' })
  });
  assert.equal(r.status, 400);
  assert.equal(r.body.error, 'WEAK_PASSWORD');
});

test('facility_manager cannot reset passwords', async () => {
  const fm = await login('fm', PASSWORDS.fm);
  const r = await fm(`/api/users/${targetUserId}/password`, {
    method: 'PATCH', body: JSON.stringify({ password: 'AnotherPass1!' })
  });
  assert.equal(r.status, 403);
});

test('cleaning_manager cannot reset passwords', async () => {
  const manager = await login('manager', PASSWORDS.manager);
  const r = await manager(`/api/users/${targetUserId}/password`, {
    method: 'PATCH', body: JSON.stringify({ password: 'AnotherPass1!' })
  });
  assert.equal(r.status, 403);
});

test('hospitality_manager cannot reset passwords', async () => {
  const admin = await login('admin', PASSWORDS.admin);
  const created = await admin('/api/users', { method: 'POST', body: JSON.stringify({
    username: 'hosp-mgr-4c', name: 'Hosp Manager 4c', password: 'HmgrTest123!', role: 'hospitality_manager'
  }) });
  assert.equal(created.status, 200, JSON.stringify(created.body));

  const hospMgr = await login('hosp-mgr-4c', 'HmgrTest123!');
  const r = await hospMgr(`/api/users/${targetUserId}/password`, {
    method: 'PATCH', body: JSON.stringify({ password: 'AnotherPass1!' })
  });
  assert.equal(r.status, 403);
});

/* ── 2. Public hospitality request flow (no login) ───────────── */
let publicOrderRefNo;

test('public can submit a hospitality order without login', async () => {
  const pub = client();
  const r = await pub('/api/public/hospitality/orders', { method: 'POST', body: JSON.stringify({
    requesterName: 'زائر تجريبي', requesterPhone: '0500000001',
    locationId: 'lobby-gf', kitchenId: 'kit-main', orderType: 'coffee', items: ['قهوة'], notes: 'بدون سكر'
  }) });
  assert.equal(r.status, 200, JSON.stringify(r.body));
  assert.equal(r.body.order.status, 'submitted');
  assert.ok(r.body.order.referenceNo.startsWith('HSP-'));
  publicOrderRefNo = r.body.order.referenceNo;
});

test('public order requires name and phone', async () => {
  const pub = client();
  const r = await pub('/api/public/hospitality/orders', { method: 'POST', body: JSON.stringify({
    locationId: 'lobby-gf', orderType: 'coffee'
  }) });
  assert.equal(r.status, 400);
  assert.equal(r.body.error, 'MISSING_FIELDS');
});

test('requester can fetch own orders by phone', async () => {
  const pub = client();
  const r = await pub('/api/public/hospitality/orders?phone=0500000001');
  assert.equal(r.status, 200);
  assert.ok(r.body.orders.some(o => o.referenceNo === publicOrderRefNo));
});

test('other phone numbers do not see this order', async () => {
  const pub = client();
  const r = await pub('/api/public/hospitality/orders?phone=0599999999');
  assert.equal(r.status, 200);
  assert.ok(!r.body.orders.some(o => o.referenceNo === publicOrderRefNo));
});

test('public endpoint does not require session cookie / unauthenticated', async () => {
  const pub = client();
  const r = await pub('/api/public/hospitality/orders?phone=0500000001');
  assert.equal(r.status, 200);
});

/* ── 3. Supervisor sees the public order and can manage it ───── */
test('hospitality_supervisor sees the public-submitted order', async () => {
  const supervisor = await login('hosp-supervisor', PASSWORDS.hospitality);
  const r = await supervisor('/api/hospitality/orders');
  assert.equal(r.status, 200);
  const order = r.body.orders.find(o => o.referenceNo === publicOrderRefNo);
  assert.ok(order, 'public order should be visible to supervisor');
  assert.equal(order.requesterName, 'زائر تجريبي');
  assert.equal(order.requesterPhone, '0500000001');
});
