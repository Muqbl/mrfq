'use strict';
/**
 * Inventory Foundation smoke tests — Phase 2
 * Covers 10 scenarios: auth, CRUD warehouses, CRUD items, balances, movements, low-stock flag.
 * Run: node --test test/smoke-inventory.test.js
 */
const test   = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const path   = require('node:path');
const fs     = require('node:fs');
const os     = require('node:os');

const ROOT = path.join(__dirname, '..');
const PORT = 4100;
const BASE = `http://127.0.0.1:${PORT}`;

const TMP_DIR     = fs.mkdtempSync(path.join(os.tmpdir(), 'mrfq-inv-'));
const DB_PATH     = path.join(TMP_DIR, 'test.db');
const UPLOADS_DIR = path.join(TMP_DIR, 'uploads');

const PASSWORDS = {
  admin: 'AdminInv123!', fm: 'FmInv123!',
  manager: 'MgrInv123!', supervisor: 'SupInv123!',
  worker: 'WrkInv123!', hospitality: 'HospInv123!'
};

let serverProc;
let warehouseId, itemId;

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
    try { const res = await fetch(BASE + '/health'); if (res.ok) return; } catch {}
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
      DB_PATH,
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

/* ── 1. Non-inventory role is rejected ─────────────────────────── */
test('inventory: cleaner cannot access inventory APIs', async () => {
  // worker3 is a cleaner — cannot access inventory
  const api = await login('worker3', PASSWORDS.worker);
  const r = await api('/api/inventory/warehouses');
  assert.equal(r.status, 403, 'cleaner should be forbidden');
  assert.equal(r.body?.error, 'FORBIDDEN');
});

/* ── 2. Admin can list warehouses (empty initially) ─────────────── */
test('inventory: admin can list warehouses', async () => {
  const api = await login('admin', PASSWORDS.admin);
  const r = await api('/api/inventory/warehouses');
  assert.equal(r.status, 200);
  assert.ok(Array.isArray(r.body.warehouses), 'response.warehouses should be array');
});

/* ── 3. Admin creates a warehouse ───────────────────────────────── */
test('inventory: admin creates warehouse', async () => {
  const api = await login('admin', PASSWORDS.admin);
  const r = await api('/api/inventory/warehouses', {
    method: 'POST',
    body: JSON.stringify({ nameAr: 'مستودع رئيسي', nameEn: 'Main Warehouse', code: 'WH-MAIN', type: 'central', status: 'active' })
  });
  assert.equal(r.status, 200, `create warehouse failed: ${JSON.stringify(r.body)}`);
  assert.ok(r.body.warehouse?.id, 'response.warehouse.id should exist');
  assert.equal(r.body.warehouse.code, 'WH-MAIN');
  warehouseId = r.body.warehouse.id;
});

/* ── 4. Duplicate warehouse code is rejected ────────────────────── */
test('inventory: duplicate warehouse code rejected', async () => {
  const api = await login('admin', PASSWORDS.admin);
  const r = await api('/api/inventory/warehouses', {
    method: 'POST',
    body: JSON.stringify({ nameAr: 'ثانوي', nameEn: 'Secondary', code: 'WH-MAIN', type: 'branch' })
  });
  assert.equal(r.status, 409, 'duplicate code should return 409');
});

/* ── 5. FM creates an inventory item ────────────────────────────── */
test('inventory: FM creates inventory item', async () => {
  const api = await login('fm', PASSWORDS.fm);
  const r = await api('/api/inventory/items', {
    method: 'POST',
    body: JSON.stringify({
      nameAr: 'مناشف ورقية', nameEn: 'Paper Towels',
      sku: 'SKU-PAPER-001', category: 'consumable',
      unit: 'roll', moduleScope: 'cleaning',
      minStockLevel: 10, reorderLevel: 20
    })
  });
  assert.equal(r.status, 200, `create item failed: ${JSON.stringify(r.body)}`);
  assert.ok(r.body.item?.id, 'response.item.id should exist');
  assert.equal(r.body.item.sku, 'SKU-PAPER-001');
  itemId = r.body.item.id;
});

/* ── 6. FM can read balances (empty before any movement) ─────────── */
test('inventory: balances empty before movement', async () => {
  assert.ok(warehouseId, 'warehouseId must be set by test 3');
  assert.ok(itemId, 'itemId must be set by test 5');
  const api = await login('fm', PASSWORDS.fm);
  const r = await api(`/api/inventory/balances?warehouse_id=${warehouseId}&item_id=${itemId}`);
  assert.equal(r.status, 200);
  assert.ok(Array.isArray(r.body.balances), 'response.balances should be array');
  assert.equal(r.body.balances.length, 0);
});

/* ── 7. Opening balance movement creates stock_balance row ──────── */
test('inventory: opening_balance movement creates balance', async () => {
  assert.ok(warehouseId, 'warehouseId must be set by test 3');
  assert.ok(itemId, 'itemId must be set by test 5');
  const api = await login('admin', PASSWORDS.admin);
  const r = await api('/api/inventory/movements', {
    method: 'POST',
    body: JSON.stringify({ warehouseId, itemId, movementType: 'opening_balance', quantity: 50, notes: 'initial stock' })
  });
  assert.equal(r.status, 200, `movement failed: ${JSON.stringify(r.body)}`);
  assert.ok(r.body.movement?.id, 'response.movement.id should exist');
  assert.equal(r.body.balance.quantityOnHand, 50);
});

/* ── 8. Issue movement reduces available and sets lowStock flag ──── */
test('inventory: issue movement reduces balance', async () => {
  assert.ok(warehouseId, 'warehouseId must be set by test 3');
  assert.ok(itemId, 'itemId must be set by test 5');
  const api = await login('admin', PASSWORDS.admin);
  const r = await api('/api/inventory/movements', {
    method: 'POST',
    body: JSON.stringify({ warehouseId, itemId, movementType: 'issue', quantity: 45 })
  });
  assert.equal(r.status, 200, `issue failed: ${JSON.stringify(r.body)}`);
  assert.equal(r.body.balance.quantityOnHand, 5);
  assert.equal(r.body.balance.lowStock, true, 'lowStock should be true when below minLevel=10');
});

/* ── 9. Insufficient stock is rejected ──────────────────────────── */
test('inventory: issue beyond available returns INSUFFICIENT_STOCK', async () => {
  assert.ok(warehouseId, 'warehouseId must be set by test 3');
  assert.ok(itemId, 'itemId must be set by test 5');
  const api = await login('admin', PASSWORDS.admin);
  const r = await api('/api/inventory/movements', {
    method: 'POST',
    body: JSON.stringify({ warehouseId, itemId, movementType: 'issue', quantity: 100 })
  });
  assert.equal(r.status, 400);
  assert.equal(r.body?.error, 'INSUFFICIENT_STOCK');
});

/* ── 10. Bootstrap includes inventory data for admin ─────────────── */
test('inventory: bootstrap includes inventory for admin', async () => {
  const api = await login('admin', PASSWORDS.admin);
  const r = await api('/api/bootstrap');
  assert.equal(r.status, 200);
  assert.ok(r.body.inventory, 'bootstrap should include inventory key');
  assert.ok(Array.isArray(r.body.inventory.warehouses), 'inventory.warehouses should be array');
  assert.ok(Array.isArray(r.body.inventory.inventoryItems), 'inventory.inventoryItems should be array');
  assert.ok(Array.isArray(r.body.inventory.stockBalances), 'inventory.stockBalances should be array');
});
