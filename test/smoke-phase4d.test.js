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
    locationId: 'lobby-gf', kitchenId: 'kit-main', orderType: 'menu', items: ['Arabic Coffee ×2', 'Dates ×1'], notes: ''
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

/* ── 6. Kitchens — public list ─────────────────────────────────── */
test('public can fetch active kitchens without login', async () => {
  const pub = client();
  const r = await pub('/api/public/hospitality/kitchens');
  assert.equal(r.status, 200);
  assert.ok(Array.isArray(r.body.kitchens));
  assert.ok(r.body.kitchens.length >= 2);
  assert.ok(r.body.kitchens.some(k => k.id === 'kit-main'));
});

/* ── 7. Kitchen-based direct assignment ─────────────────────────── */
test('public order requires a kitchenId', async () => {
  const pub = client();
  const r = await pub('/api/public/hospitality/orders', { method: 'POST', body: JSON.stringify({
    requesterName: 'زائر بلا مطبخ', requesterPhone: '0500000098',
    locationId: 'lobby-gf', orderType: 'menu', items: ['Tea ×1'], notes: ''
  }) });
  assert.equal(r.status, 400);
  assert.equal(r.body.error, 'MISSING_FIELDS');
});

test('public order with unknown kitchenId is rejected', async () => {
  const pub = client();
  const r = await pub('/api/public/hospitality/orders', { method: 'POST', body: JSON.stringify({
    requesterName: 'زائر مطبخ غير موجود', requesterPhone: '0500000097',
    locationId: 'lobby-gf', kitchenId: 'kit-does-not-exist', orderType: 'menu', items: ['Tea ×1'], notes: ''
  }) });
  assert.equal(r.status, 404);
  assert.equal(r.body.error, 'KITCHEN_NOT_FOUND');
});

test('public order auto-assigns to the kitchen responsible worker', async () => {
  const pub = client();
  const r = await pub('/api/public/hospitality/orders', { method: 'POST', body: JSON.stringify({
    requesterName: 'زائر المطبخ الرئيسي', requesterPhone: '0500000096',
    locationId: 'lobby-gf', kitchenId: 'kit-main', orderType: 'menu', items: ['Tea ×1'], notes: ''
  }) });
  assert.equal(r.status, 200, JSON.stringify(r.body));
  const refNo = r.body.order.referenceNo;

  const supervisor = await login('hosp-supervisor', PASSWORDS.hospitality);
  const sr = await supervisor('/api/hospitality/orders');
  const order = sr.body.orders.find(o => o.referenceNo === refNo);
  assert.ok(order, 'order should be visible to supervisor');
  assert.equal(order.kitchenId, 'kit-main');
  assert.equal(order.assignedTo, 'u-hosp-w1');
  assert.equal(order.assignedToName, 'عامل ضيافة 1');
});

/* ── 8. Kitchen management — access control ───────────────────── */
test('GET /api/hospitality/kitchens requires system_admin or hospitality_manager', async () => {
  const manager = await login('manager', PASSWORDS.manager);
  const r = await manager('/api/hospitality/kitchens');
  assert.equal(r.status, 403);
});

test('hospitality_supervisor cannot manage kitchens', async () => {
  const supervisor = await login('hosp-supervisor', PASSWORDS.hospitality);
  const r = await supervisor('/api/hospitality/kitchens');
  assert.equal(r.status, 403);
});

test('hospitality_manager can list all kitchens including inactive', async () => {
  const hospMgr = await login('hosp-manager', PASSWORDS.hospitality);
  const r = await hospMgr('/api/hospitality/kitchens');
  assert.equal(r.status, 200);
  assert.ok(r.body.kitchens.length >= 2);
  const main = r.body.kitchens.find(k => k.id === 'kit-main');
  assert.equal(main.responsibleWorkerId, 'u-hosp-w1');
  assert.equal(main.responsibleWorkerName, 'عامل ضيافة 1');
});

/* ── 9. Create / update / disable a kitchen ────────────────────── */
let newKitchenId;

test('hospitality_manager can create a new kitchen', async () => {
  const hospMgr = await login('hosp-manager', PASSWORDS.hospitality);
  const r = await hospMgr('/api/hospitality/kitchens', { method: 'POST', body: JSON.stringify({
    nameAr: 'مطبخ تجريبي', nameEn: 'Test Kitchen', locationName: 'Ground Floor', responsibleWorkerId: 'u-hosp-w2'
  }) });
  assert.equal(r.status, 200, JSON.stringify(r.body));
  assert.equal(r.body.kitchen.nameEn, 'Test Kitchen');
  assert.equal(r.body.kitchen.isActive, true);
  assert.equal(r.body.kitchen.responsibleWorkerId, 'u-hosp-w2');
  newKitchenId = r.body.kitchen.id;
});

test('new kitchen appears in public kitchens list', async () => {
  const pub = client();
  const r = await pub('/api/public/hospitality/kitchens');
  assert.ok(r.body.kitchens.some(k => k.id === newKitchenId));
});

test('creating a kitchen without any name is rejected', async () => {
  const hospMgr = await login('hosp-manager', PASSWORDS.hospitality);
  const r = await hospMgr('/api/hospitality/kitchens', { method: 'POST', body: JSON.stringify({
    locationName: 'Nowhere'
  }) });
  assert.equal(r.status, 400);
  assert.equal(r.body.error, 'MISSING_FIELDS');
});

test('hospitality_manager can update and deactivate the kitchen', async () => {
  const hospMgr = await login('hosp-manager', PASSWORDS.hospitality);
  const r = await hospMgr(`/api/hospitality/kitchens/${newKitchenId}`, { method: 'PUT', body: JSON.stringify({
    isActive: false
  }) });
  assert.equal(r.status, 200, JSON.stringify(r.body));
  assert.equal(r.body.kitchen.isActive, false);
});

test('deactivated kitchen is hidden from public list but visible to manager', async () => {
  const pub = client();
  const pubRes = await pub('/api/public/hospitality/kitchens');
  assert.ok(!pubRes.body.kitchens.some(k => k.id === newKitchenId));

  const hospMgr = await login('hosp-manager', PASSWORDS.hospitality);
  const mgrRes = await hospMgr('/api/hospitality/kitchens');
  const kitchen = mgrRes.body.kitchens.find(k => k.id === newKitchenId);
  assert.ok(kitchen, 'manager should still see disabled kitchen');
  assert.equal(kitchen.isActive, false);
});

test('order via deactivated kitchen is rejected', async () => {
  const pub = client();
  const r = await pub('/api/public/hospitality/orders', { method: 'POST', body: JSON.stringify({
    requesterName: 'زائر مطبخ معطل', requesterPhone: '0500000095',
    locationId: 'lobby-gf', kitchenId: newKitchenId, orderType: 'menu', items: ['Tea ×1'], notes: ''
  }) });
  assert.equal(r.status, 404);
  assert.equal(r.body.error, 'KITCHEN_NOT_FOUND');
});

/* ── 10. system_admin also has full kitchen access ─────────────── */
test('system_admin can manage kitchens', async () => {
  const admin = await login('admin', PASSWORDS.admin);
  const r = await admin('/api/hospitality/kitchens');
  assert.equal(r.status, 200);
  assert.ok(r.body.kitchens.some(k => k.id === 'kit-main'));
});
