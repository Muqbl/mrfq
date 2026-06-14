'use strict';
/**
 * Smoke tests for Phase 4d — hospitality public menu ordering + product management.
 * Spawns an isolated server against a temp SQLite DB/uploads dir.
 *
 * Run: node --test test/smoke-phase4d.test.js
 */
const test   = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const path   = require('node:path');
const fs     = require('node:fs');
const os     = require('node:os');

const ROOT = path.join(__dirname, '..');
const PORT = 3996;
const BASE = `http://127.0.0.1:${PORT}`;

const TMP_DIR     = fs.mkdtempSync(path.join(os.tmpdir(), 'rega-smoke-4d-'));
const DB_PATH     = path.join(TMP_DIR, 'test.db');
const UPLOADS_DIR = path.join(TMP_DIR, 'uploads');

const PASSWORDS = {
  admin: 'AdminTest123!', manager: 'MgrTest123!', hospitality: 'HospTest123!'
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
      DEMO_MANAGER_PASSWORD: PASSWORDS.manager,
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

/* ── 1. Public menu ──────────────────────────────────────────── */
test('public can fetch active menu items without login', async () => {
  const pub = client();
  const r = await pub('/api/public/hospitality/menu');
  assert.equal(r.status, 200);
  assert.ok(Array.isArray(r.body.items));
  assert.ok(r.body.items.length >= 6);
  assert.ok(r.body.items.every(i => i.isActive === true));
  assert.ok(r.body.items.some(i => i.id === 'mi-arabic-coffee'));
});

/* ── 2. Public order via the new "menu" order type ───────────── */
let publicOrderRefNo;

test('public can submit a menu-style order with cart items', async () => {
  const pub = client();
  const r = await pub('/api/public/hospitality/orders', { method: 'POST', body: JSON.stringify({
    requesterName: 'زائر القائمة', requesterPhone: '0500000099',
    locationId: 'lobby-gf', orderType: 'menu', items: ['Arabic Coffee ×2', 'Dates ×1'], notes: ''
  }) });
  assert.equal(r.status, 200, JSON.stringify(r.body));
  assert.equal(r.body.order.orderType, 'menu');
  assert.deepEqual(r.body.order.items, ['Arabic Coffee ×2', 'Dates ×1']);
  publicOrderRefNo = r.body.order.referenceNo;
});

test('hospitality_supervisor sees the menu order with its items', async () => {
  const supervisor = await login('hosp-supervisor', PASSWORDS.hospitality);
  const r = await supervisor('/api/hospitality/orders');
  assert.equal(r.status, 200);
  const order = r.body.orders.find(o => o.referenceNo === publicOrderRefNo);
  assert.ok(order, 'menu order should be visible to supervisor');
  assert.deepEqual(order.items, ['Arabic Coffee ×2', 'Dates ×1']);
});

/* ── 3. Menu management — access control ─────────────────────── */
test('GET /api/hospitality/menu requires system_admin or hospitality_manager', async () => {
  const manager = await login('manager', PASSWORDS.manager);
  const r = await manager('/api/hospitality/menu');
  assert.equal(r.status, 403);
});

test('hospitality_manager can list all menu items including inactive', async () => {
  const hospMgr = await login('hosp-manager', PASSWORDS.hospitality);
  const r = await hospMgr('/api/hospitality/menu');
  assert.equal(r.status, 200);
  assert.ok(r.body.items.length >= 6);
});

/* ── 4. Create / update / disable a product ───────────────────── */
let newItemId;

test('hospitality_manager can create a new menu item', async () => {
  const hospMgr = await login('hosp-manager', PASSWORDS.hospitality);
  const r = await hospMgr('/api/hospitality/menu', { method: 'POST', body: JSON.stringify({
    nameAr: 'عصير تفاح', nameEn: 'Apple Juice', category: 'cold_drinks', sortOrder: 7
  }) });
  assert.equal(r.status, 200, JSON.stringify(r.body));
  assert.equal(r.body.item.nameEn, 'Apple Juice');
  assert.equal(r.body.item.isActive, true);
  newItemId = r.body.item.id;
});

test('new item appears in public menu', async () => {
  const pub = client();
  const r = await pub('/api/public/hospitality/menu');
  assert.ok(r.body.items.some(i => i.id === newItemId));
});

test('hospitality_manager can update and deactivate the item', async () => {
  const hospMgr = await login('hosp-manager', PASSWORDS.hospitality);
  const r = await hospMgr(`/api/hospitality/menu/${newItemId}`, { method: 'PUT', body: JSON.stringify({
    isActive: false
  }) });
  assert.equal(r.status, 200, JSON.stringify(r.body));
  assert.equal(r.body.item.isActive, false);
});

test('deactivated item is hidden from public menu but visible to manager', async () => {
  const pub = client();
  const pubRes = await pub('/api/public/hospitality/menu');
  assert.ok(!pubRes.body.items.some(i => i.id === newItemId));

  const hospMgr = await login('hosp-manager', PASSWORDS.hospitality);
  const mgrRes = await hospMgr('/api/hospitality/menu');
  const item = mgrRes.body.items.find(i => i.id === newItemId);
  assert.ok(item, 'manager should still see disabled item');
  assert.equal(item.isActive, false);
});

test('creating a menu item without any name is rejected', async () => {
  const hospMgr = await login('hosp-manager', PASSWORDS.hospitality);
  const r = await hospMgr('/api/hospitality/menu', { method: 'POST', body: JSON.stringify({
    category: 'snacks'
  }) });
  assert.equal(r.status, 400);
  assert.equal(r.body.error, 'MISSING_FIELDS');
});

/* ── 5. system_admin also has full access ─────────────────────── */
test('system_admin can manage menu items', async () => {
  const admin = await login('admin', PASSWORDS.admin);
  const r = await admin('/api/hospitality/menu');
  assert.equal(r.status, 200);
  assert.ok(r.body.items.some(i => i.id === newItemId));
});
