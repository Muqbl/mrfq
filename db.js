'use strict';
const Database = require('better-sqlite3');
const path     = require('path');
const fs       = require('fs');
const crypto   = require('crypto');

const DB_FILE = process.env.DB_PATH || path.join(__dirname, 'data.db');

let _db = null;

/** Return the singleton DB connection (opens on first call). */
function getDb() {
  if (!_db) _db = _open();
  return _db;
}

function _open() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const db = new Database(DB_FILE);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 10000');
  db.pragma('synchronous = NORMAL');

  _migrate(db);
  _seedPlanLocationGroups(db);
  _importLegacyEmployeeOffices(db);
  return db;
}

/* ═══════════════════════════════════════════════════════════════
   MIGRATIONS
   ═══════════════════════════════════════════════════════════════ */
function _migrate(db) {
  db.exec(`CREATE TABLE IF NOT EXISTS _migrations (
    version    INTEGER PRIMARY KEY,
    applied_at TEXT    NOT NULL
  )`);

  const current = db.prepare(
    'SELECT COALESCE(MAX(version), 0) AS v FROM _migrations'
  ).get().v;

  for (const [ver, sql] of Object.entries(MIGRATIONS)) {
    const v = parseInt(ver, 10);
    if (v > current) {
      db.transaction(() => {
        db.exec(sql);
        db.prepare('INSERT INTO _migrations VALUES (?, ?)').run(
          v, new Date().toISOString()
        );
      })();
      console.log(`[db] migration v${v} applied`);
    }
  }
}

const MIGRATIONS = {
  /* ── v1: full initial schema ─────────────────────────────── */
  1: `
    CREATE TABLE users (
      id                    TEXT PRIMARY KEY,
      name                  TEXT NOT NULL,
      username              TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password              TEXT NOT NULL,
      role                  TEXT NOT NULL,
      active                INTEGER NOT NULL DEFAULT 1,
      employee_no           TEXT NOT NULL DEFAULT '',
      force_password_change INTEGER NOT NULL DEFAULT 1,
      last_password_change  TEXT NOT NULL DEFAULT '',
      created_at            TEXT NOT NULL,
      updated_at            TEXT NOT NULL,
      deleted_at            TEXT
    );

    CREATE TABLE sessions (
      token         TEXT PRIMARY KEY,
      user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at    TEXT NOT NULL,
      last_activity TEXT NOT NULL,
      expires_at    TEXT NOT NULL,
      ip            TEXT NOT NULL DEFAULT '',
      user_agent    TEXT NOT NULL DEFAULT ''
    );
    CREATE INDEX idx_sessions_expires  ON sessions(expires_at);
    CREATE INDEX idx_sessions_user     ON sessions(user_id);

    CREATE TABLE settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
    INSERT INTO settings VALUES
      ('app_version',       '2.0.0'),
      ('frequency_minutes', '120'),
      ('require_photo',     '1'),
      ('prototype_mode',    '1');

    CREATE TABLE locations (
      id         TEXT PRIMARY KEY,
      type       TEXT NOT NULL DEFAULT 'other',
      name_ar    TEXT NOT NULL DEFAULT '',
      name_en    TEXT NOT NULL DEFAULT '',
      floor      TEXT NOT NULL DEFAULT '',
      zone       TEXT NOT NULL DEFAULT '',
      priority   TEXT NOT NULL DEFAULT 'medium',
      active     INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT
    );

    CREATE TABLE zones (name TEXT PRIMARY KEY);

    CREATE TABLE assignments (
      worker_id   TEXT NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
      location_id TEXT NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
      created_at  TEXT NOT NULL,
      PRIMARY KEY (worker_id, location_id)
    );
    CREATE INDEX idx_assignments_worker ON assignments(worker_id);

    CREATE TABLE tickets (
      id               TEXT PRIMARY KEY,
      title            TEXT NOT NULL,
      description      TEXT NOT NULL DEFAULT '',
      location_id      TEXT NOT NULL,
      location_name_ar TEXT NOT NULL DEFAULT '',
      location_name_en TEXT NOT NULL DEFAULT '',
      assigned_to      TEXT,
      assigned_to_name TEXT NOT NULL DEFAULT '',
      created_by       TEXT NOT NULL DEFAULT '',
      status           TEXT NOT NULL DEFAULT 'open',
      priority         TEXT NOT NULL DEFAULT 'medium',
      notes            TEXT NOT NULL DEFAULT '',
      created_at       TEXT NOT NULL,
      completed_at     TEXT,
      updated_at       TEXT NOT NULL,
      deleted_at       TEXT
    );
    CREATE INDEX idx_tickets_assigned ON tickets(assigned_to);
    CREATE INDEX idx_tickets_status   ON tickets(status);
    CREATE INDEX idx_tickets_deleted  ON tickets(deleted_at);

    CREATE TABLE reports (
      id               TEXT PRIMARY KEY,
      worker_id        TEXT NOT NULL,
      worker_name      TEXT NOT NULL DEFAULT '',
      location_id      TEXT NOT NULL,
      location_name_ar TEXT NOT NULL DEFAULT '',
      location_name_en TEXT NOT NULL DEFAULT '',
      location_type    TEXT NOT NULL DEFAULT '',
      status           TEXT NOT NULL DEFAULT 'completed',
      tasks            TEXT NOT NULL DEFAULT '[]',
      notes            TEXT NOT NULL DEFAULT '',
      approval_status  TEXT NOT NULL DEFAULT 'pending',
      approved_by      TEXT NOT NULL DEFAULT '',
      approved_at      TEXT,
      review_note      TEXT NOT NULL DEFAULT '',
      created_at       TEXT NOT NULL,
      updated_at       TEXT NOT NULL,
      deleted_at       TEXT
    );
    CREATE INDEX idx_reports_worker   ON reports(worker_id);
    CREATE INDEX idx_reports_approval ON reports(approval_status);
    CREATE INDEX idx_reports_deleted  ON reports(deleted_at);

    CREATE TABLE photos (
      id          TEXT PRIMARY KEY,
      filename    TEXT NOT NULL UNIQUE,
      mime_type   TEXT NOT NULL,
      size_bytes  INTEGER NOT NULL DEFAULT 0,
      report_id   TEXT,
      ticket_id   TEXT,
      uploaded_by TEXT NOT NULL,
      created_at  TEXT NOT NULL,
      deleted_at  TEXT
    );
    CREATE INDEX idx_photos_report ON photos(report_id);
    CREATE INDEX idx_photos_ticket ON photos(ticket_id);

  `,

  /* ── v2: employee portal, categories, reference numbers, ratings ── */
  2: `
    ALTER TABLE tickets ADD COLUMN category     TEXT NOT NULL DEFAULT 'general';
    ALTER TABLE tickets ADD COLUMN reference_no TEXT NOT NULL DEFAULT '';
    ALTER TABLE tickets ADD COLUMN created_by_id TEXT NOT NULL DEFAULT '';
    CREATE INDEX idx_tickets_category ON tickets(category);
    CREATE INDEX idx_tickets_refno    ON tickets(reference_no);
    ALTER TABLE photos  ADD COLUMN photo_type   TEXT NOT NULL DEFAULT 'general';
    ALTER TABLE reports ADD COLUMN rating_supervisor REAL;
    ALTER TABLE reports ADD COLUMN rating_manager    REAL;
  `,

  /* ── v3: multi-role, workspace, SLA ─────────────────────────── */
  3: `
    CREATE TABLE user_roles (
      user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role       TEXT NOT NULL,
      module     TEXT NOT NULL DEFAULT 'cleaning',
      created_at TEXT NOT NULL,
      PRIMARY KEY (user_id, role)
    );
    CREATE INDEX idx_user_roles_user ON user_roles(user_id);

    INSERT OR IGNORE INTO user_roles (user_id, role, module, created_at)
      SELECT id, role, 'cleaning', created_at FROM users WHERE deleted_at IS NULL;

    ALTER TABLE sessions ADD COLUMN active_workspace TEXT NOT NULL DEFAULT '';

    ALTER TABLE tickets ADD COLUMN sla_deadline         TEXT;
    ALTER TABLE tickets ADD COLUMN sla_breached         INTEGER NOT NULL DEFAULT 0;
    ALTER TABLE tickets ADD COLUMN response_time_mins   INTEGER;
    ALTER TABLE tickets ADD COLUMN completion_time_mins INTEGER;

    INSERT OR IGNORE INTO settings VALUES ('sla_emergency',    '15');
    INSERT OR IGNORE INTO settings VALUES ('sla_spill',        '30');
    INSERT OR IGNORE INTO settings VALUES ('sla_restroom',     '30');
    INSERT OR IGNORE INTO settings VALUES ('sla_meeting_room', '60');
    INSERT OR IGNORE INTO settings VALUES ('sla_general',      '240');
  `,

  /* ── v4: Status model expansion + ref-seq key migration ──── */
  4: `
    ALTER TABLE tickets ADD COLUMN accepted_at               TEXT;
    ALTER TABLE tickets ADD COLUMN started_at                TEXT;
    ALTER TABLE tickets ADD COLUMN verification_requested_at TEXT;
    ALTER TABLE tickets ADD COLUMN cancelled_at              TEXT;

    UPDATE tickets SET status = 'submitted' WHERE status = 'open';

    INSERT OR IGNORE INTO settings (key, value)
      SELECT replace(key, 'ref_seq_', 'cln_ref_seq_'), value
      FROM settings WHERE key LIKE 'ref_seq_%';
  `,

  /* ── v5: Approval history table ──────────────────────────── */
  5: `
    CREATE TABLE IF NOT EXISTS approval_history (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      entity_type   TEXT    NOT NULL DEFAULT '',
      entity_id     TEXT    NOT NULL DEFAULT '',
      level         INTEGER NOT NULL DEFAULT 1,
      approver_id   TEXT    NOT NULL DEFAULT '',
      approver_role TEXT    NOT NULL DEFAULT '',
      action        TEXT    NOT NULL DEFAULT '',
      notes         TEXT    NOT NULL DEFAULT '',
      created_at    TEXT    NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_approval_entity   ON approval_history(entity_type, entity_id);
    CREATE INDEX IF NOT EXISTS idx_approval_approver ON approval_history(approver_id);
    CREATE INDEX IF NOT EXISTS idx_approval_ts       ON approval_history(created_at);
  `,

  /* ── v6: Event log table ─────────────────────────────────── */
  6: `
    CREATE TABLE IF NOT EXISTS event_log (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type  TEXT NOT NULL,
      module      TEXT NOT NULL DEFAULT 'cleaning',
      entity_type TEXT NOT NULL DEFAULT '',
      entity_id   TEXT NOT NULL DEFAULT '',
      actor_id    TEXT NOT NULL DEFAULT '',
      actor_role  TEXT NOT NULL DEFAULT '',
      payload     TEXT NOT NULL DEFAULT '{}',
      created_at  TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_events_type   ON event_log(event_type);
    CREATE INDEX IF NOT EXISTS idx_events_entity ON event_log(entity_type, entity_id);
    CREATE INDEX IF NOT EXISTS idx_events_module ON event_log(module);
    CREATE INDEX IF NOT EXISTS idx_events_ts     ON event_log(created_at);
  `,

  /* ── v7: Attachment engine — platform entity pattern ──────── */
  7: `
    ALTER TABLE photos ADD COLUMN entity_type TEXT NOT NULL DEFAULT '';
    ALTER TABLE photos ADD COLUMN entity_id   TEXT NOT NULL DEFAULT '';

    UPDATE photos SET entity_type = 'report', entity_id = report_id
      WHERE report_id IS NOT NULL AND report_id != '';

    UPDATE photos SET entity_type = 'ticket', entity_id = ticket_id
      WHERE ticket_id IS NOT NULL AND ticket_id != '' AND entity_type = '';

    CREATE INDEX IF NOT EXISTS idx_photos_entity ON photos(entity_type, entity_id);
  `,

  /* ── v8: Location hierarchy (facility + building tables) ──── */
  8: `
    CREATE TABLE IF NOT EXISTS facilities (
      id         TEXT PRIMARY KEY,
      name_ar    TEXT NOT NULL DEFAULT '',
      name_en    TEXT NOT NULL DEFAULT '',
      active     INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT
    );

    CREATE TABLE IF NOT EXISTS buildings (
      id          TEXT PRIMARY KEY,
      facility_id TEXT REFERENCES facilities(id),
      name_ar     TEXT NOT NULL DEFAULT '',
      name_en     TEXT NOT NULL DEFAULT '',
      active      INTEGER NOT NULL DEFAULT 1,
      created_at  TEXT NOT NULL,
      updated_at  TEXT NOT NULL,
      deleted_at  TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_buildings_facility ON buildings(facility_id);

    ALTER TABLE locations ADD COLUMN facility_id TEXT;
    ALTER TABLE locations ADD COLUMN building_id TEXT;
    ALTER TABLE locations ADD COLUMN room        TEXT NOT NULL DEFAULT '';
    ALTER TABLE locations ADD COLUMN space       TEXT NOT NULL DEFAULT '';

    ALTER TABLE zones ADD COLUMN facility_id TEXT;
    ALTER TABLE zones ADD COLUMN building_id TEXT;
  `,

  /* ── v9: module column on assignments ─────────────────────── */
  9: `
    ALTER TABLE assignments ADD COLUMN module TEXT NOT NULL DEFAULT 'cleaning';

    CREATE INDEX IF NOT EXISTS idx_assignments_module ON assignments(module);
  `,

  /* ── v10: remove audit log storage ─────────────────────────── */
  10: `
    DROP INDEX IF EXISTS idx_audit_ts;
    DROP INDEX IF EXISTS idx_audit_user;
    DROP INDEX IF EXISTS idx_audit_action;
    DROP INDEX IF EXISTS idx_audit_module;
    DROP TABLE IF EXISTS audit_logs;
  `,

  /* ── v11: hospitality module — orders table ────────────────── */
  11: `
    CREATE TABLE IF NOT EXISTS hospitality_orders (
      id               TEXT PRIMARY KEY,
      reference_no     TEXT NOT NULL DEFAULT '',
      order_type       TEXT NOT NULL DEFAULT 'general',
      items            TEXT NOT NULL DEFAULT '[]',
      location_id      TEXT NOT NULL,
      location_name_ar TEXT NOT NULL DEFAULT '',
      location_name_en TEXT NOT NULL DEFAULT '',
      requested_by     TEXT NOT NULL DEFAULT '',
      requested_by_id  TEXT NOT NULL DEFAULT '',
      assigned_to      TEXT,
      assigned_to_name TEXT NOT NULL DEFAULT '',
      status           TEXT NOT NULL DEFAULT 'submitted',
      notes            TEXT NOT NULL DEFAULT '',
      sla_deadline     TEXT,
      sla_breached     INTEGER NOT NULL DEFAULT 0,
      created_at       TEXT NOT NULL,
      updated_at       TEXT NOT NULL,
      accepted_at      TEXT,
      ready_at         TEXT,
      delivered_at     TEXT,
      completed_at     TEXT,
      cancelled_at     TEXT,
      rejected_at      TEXT,
      deleted_at       TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_hosp_orders_assigned  ON hospitality_orders(assigned_to);
    CREATE INDEX IF NOT EXISTS idx_hosp_orders_status    ON hospitality_orders(status);
    CREATE INDEX IF NOT EXISTS idx_hosp_orders_requester ON hospitality_orders(requested_by_id);
    CREATE INDEX IF NOT EXISTS idx_hosp_orders_deleted   ON hospitality_orders(deleted_at);
  `,

  /* ── v12: hospitality — public requester identity ──────────── */
  12: `
    ALTER TABLE hospitality_orders ADD COLUMN requester_name  TEXT NOT NULL DEFAULT '';
    ALTER TABLE hospitality_orders ADD COLUMN requester_phone TEXT NOT NULL DEFAULT '';
    CREATE INDEX IF NOT EXISTS idx_hosp_orders_phone ON hospitality_orders(requester_phone);
  `,

  /* ── v13: hospitality — menu / products ───────────────────── */
  13: `
    CREATE TABLE IF NOT EXISTS hospitality_menu_items (
      id               TEXT PRIMARY KEY,
      name_ar          TEXT NOT NULL DEFAULT '',
      name_en          TEXT NOT NULL DEFAULT '',
      description_ar   TEXT NOT NULL DEFAULT '',
      description_en   TEXT NOT NULL DEFAULT '',
      category         TEXT NOT NULL DEFAULT 'other',
      image_path       TEXT NOT NULL DEFAULT '',
      is_active        INTEGER NOT NULL DEFAULT 1,
      sort_order       INTEGER NOT NULL DEFAULT 0,
      created_at       TEXT NOT NULL,
      updated_at       TEXT NOT NULL,
      deleted_at       TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_hosp_menu_category ON hospitality_menu_items(category);
    CREATE INDEX IF NOT EXISTS idx_hosp_menu_active   ON hospitality_menu_items(is_active);
    CREATE INDEX IF NOT EXISTS idx_hosp_menu_deleted  ON hospitality_menu_items(deleted_at);

    INSERT OR IGNORE INTO hospitality_menu_items
      (id, name_ar, name_en, description_ar, description_en, category, image_path, is_active, sort_order, created_at, updated_at)
    VALUES
      ('mi-arabic-coffee', 'قهوة عربية', 'Arabic Coffee', 'قهوة عربية تقليدية تقدم ساخنة', 'Traditional Arabic coffee, served hot', 'hot_drinks', '', 1, 1, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
      ('mi-tea', 'شاي', 'Tea', 'شاي أحمر ساخن', 'Hot black tea', 'hot_drinks', '', 1, 2, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
      ('mi-water', 'مياه معدنية', 'Bottled Water', 'زجاجة مياه معدنية', 'Bottled mineral water', 'cold_drinks', '', 1, 3, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
      ('mi-juice', 'عصير برتقال', 'Orange Juice', 'عصير برتقال طازج', 'Fresh orange juice', 'cold_drinks', '', 1, 4, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
      ('mi-dates', 'تمر', 'Dates', 'تمر سعودي فاخر', 'Premium Saudi dates', 'snacks', '', 1, 5, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
      ('mi-nuts', 'مكسرات', 'Mixed Nuts', 'تشكيلة مكسرات محمصة', 'Assorted roasted nuts', 'snacks', '', 1, 6, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z');
  `,

  /* ── v14: hospitality — kitchens + order kitchen linkage ──── */
  14: `
    CREATE TABLE IF NOT EXISTS hospitality_kitchens (
      id                    TEXT PRIMARY KEY,
      name_ar               TEXT NOT NULL DEFAULT '',
      name_en               TEXT NOT NULL DEFAULT '',
      location_name         TEXT NOT NULL DEFAULT '',
      responsible_worker_id TEXT,
      is_active             INTEGER NOT NULL DEFAULT 1,
      sort_order            INTEGER NOT NULL DEFAULT 0,
      created_at            TEXT NOT NULL,
      updated_at            TEXT NOT NULL,
      deleted_at            TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_hosp_kitchens_active  ON hospitality_kitchens(is_active);
    CREATE INDEX IF NOT EXISTS idx_hosp_kitchens_deleted ON hospitality_kitchens(deleted_at);

    INSERT OR IGNORE INTO hospitality_kitchens
      (id, name_ar, name_en, location_name, responsible_worker_id, is_active, sort_order, created_at, updated_at)
    VALUES
      ('kit-main', 'مطبخ الضيافة الرئيسي', 'Main Hospitality Kitchen', 'الدور الأرضي - المدخل الرئيسي', 'u-hosp-w1', 1, 1, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
      ('kit-exec', 'مطبخ الطابق التنفيذي', 'Executive Floor Kitchen', 'الطابق الخامس', 'u-hosp-w2', 1, 2, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z');

    ALTER TABLE hospitality_orders ADD COLUMN kitchen_id      TEXT;
    ALTER TABLE hospitality_orders ADD COLUMN kitchen_name_ar TEXT NOT NULL DEFAULT '';
    ALTER TABLE hospitality_orders ADD COLUMN kitchen_name_en TEXT NOT NULL DEFAULT '';
    CREATE INDEX IF NOT EXISTS idx_hosp_orders_kitchen ON hospitality_orders(kitchen_id);
  `,

  /* ── v16: ticket comments ────────────────────────────────── */
  16: `
    CREATE TABLE IF NOT EXISTS ticket_comments (
      id         TEXT PRIMARY KEY,
      ticket_id  TEXT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
      user_id    TEXT NOT NULL DEFAULT '',
      user_name  TEXT NOT NULL DEFAULT '',
      user_role  TEXT NOT NULL DEFAULT '',
      body       TEXT NOT NULL,
      created_at TEXT NOT NULL,
      deleted_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_comments_ticket ON ticket_comments(ticket_id);
    CREATE INDEX IF NOT EXISTS idx_comments_user   ON ticket_comments(user_id);
  `,

  /* ── v21: employee default location ─────────────────────── */
  21: `
    ALTER TABLE users ADD COLUMN default_location_id TEXT NOT NULL DEFAULT '';
  `,

  /* ── v17: recurring cleaning tasks ───────────────────────── */
  17: `
    CREATE TABLE IF NOT EXISTS recurring_tasks (
      id               TEXT PRIMARY KEY,
      location_id      TEXT NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
      location_name_ar TEXT NOT NULL DEFAULT '',
      location_name_en TEXT NOT NULL DEFAULT '',
      category         TEXT NOT NULL DEFAULT 'general',
      title_ar         TEXT NOT NULL DEFAULT '',
      frequency_mins   INTEGER NOT NULL DEFAULT 120,
      next_run_at      TEXT NOT NULL,
      last_run_at      TEXT,
      created_by       TEXT NOT NULL DEFAULT '',
      active           INTEGER NOT NULL DEFAULT 1,
      created_at       TEXT NOT NULL,
      updated_at       TEXT NOT NULL,
      deleted_at       TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_recurring_location ON recurring_tasks(location_id);
    CREATE INDEX IF NOT EXISTS idx_recurring_next     ON recurring_tasks(next_run_at);
    CREATE INDEX IF NOT EXISTS idx_recurring_active   ON recurring_tasks(active);
  `,

  /* ── v18: escalation tracking on tickets ─────────────────── */
  18: `
    ALTER TABLE tickets ADD COLUMN escalated_at     TEXT;
    ALTER TABLE tickets ADD COLUMN escalation_level INTEGER NOT NULL DEFAULT 0;
    CREATE INDEX IF NOT EXISTS idx_tickets_escalated ON tickets(escalation_level);
  `,

  /* ── v19: module column on tickets + reports for multi-module ── */
  19: `
    ALTER TABLE tickets ADD COLUMN module TEXT NOT NULL DEFAULT 'cleaning';
    ALTER TABLE reports ADD COLUMN module TEXT NOT NULL DEFAULT 'cleaning';
    CREATE INDEX IF NOT EXISTS idx_tickets_module ON tickets(module);
    CREATE INDEX IF NOT EXISTS idx_reports_module ON reports(module);
  `,

  /* ── v20: maintenance operations — assets, teams, schedules, parts ── */
  20: `
    ALTER TABLE tickets ADD COLUMN maintenance_type TEXT NOT NULL DEFAULT 'corrective';
    ALTER TABLE tickets ADD COLUMN asset_id TEXT NOT NULL DEFAULT '';
    ALTER TABLE tickets ADD COLUMN diagnosis TEXT NOT NULL DEFAULT '';
    ALTER TABLE tickets ADD COLUMN root_cause TEXT NOT NULL DEFAULT '';
    ALTER TABLE tickets ADD COLUMN downtime_mins INTEGER NOT NULL DEFAULT 0;
    ALTER TABLE tickets ADD COLUMN labor_cost REAL NOT NULL DEFAULT 0;
    ALTER TABLE tickets ADD COLUMN vendor_name TEXT NOT NULL DEFAULT '';
    ALTER TABLE tickets ADD COLUMN permit_notes TEXT NOT NULL DEFAULT '';

    CREATE TABLE maintenance_assets (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      name_ar TEXT NOT NULL DEFAULT '',
      name_en TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT 'general',
      location_id TEXT NOT NULL DEFAULT '',
      serial_no TEXT NOT NULL DEFAULT '',
      manufacturer TEXT NOT NULL DEFAULT '',
      model TEXT NOT NULL DEFAULT '',
      warranty_until TEXT,
      criticality TEXT NOT NULL DEFAULT 'medium',
      status TEXT NOT NULL DEFAULT 'operational',
      installed_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT
    );
    CREATE INDEX idx_maint_assets_location ON maintenance_assets(location_id);
    CREATE INDEX idx_maint_assets_status ON maintenance_assets(status);

    CREATE TABLE maintenance_work_order_assignees (
      work_order_id TEXT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
      technician_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      technician_name TEXT NOT NULL DEFAULT '',
      is_lead INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'assigned',
      assigned_at TEXT NOT NULL,
      accepted_at TEXT,
      completed_at TEXT,
      PRIMARY KEY (work_order_id, technician_id)
    );
    CREATE INDEX idx_maint_assignees_tech ON maintenance_work_order_assignees(technician_id);

    CREATE TABLE maintenance_schedules (
      id TEXT PRIMARY KEY,
      title_ar TEXT NOT NULL DEFAULT '',
      title_en TEXT NOT NULL DEFAULT '',
      asset_ids TEXT NOT NULL DEFAULT '[]',
      location_id TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT 'general',
      checklist TEXT NOT NULL DEFAULT '[]',
      frequency_unit TEXT NOT NULL DEFAULT 'monthly',
      frequency_value INTEGER NOT NULL DEFAULT 1,
      next_run_at TEXT NOT NULL,
      estimated_mins INTEGER NOT NULL DEFAULT 60,
      default_technician_ids TEXT NOT NULL DEFAULT '[]',
      lead_technician_id TEXT NOT NULL DEFAULT '',
      active INTEGER NOT NULL DEFAULT 1,
      created_by TEXT NOT NULL DEFAULT '',
      last_run_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT
    );
    CREATE INDEX idx_maint_schedules_next ON maintenance_schedules(next_run_at);
    CREATE INDEX idx_maint_schedules_active ON maintenance_schedules(active);

    CREATE TABLE maintenance_parts (
      id TEXT PRIMARY KEY,
      sku TEXT NOT NULL UNIQUE,
      name_ar TEXT NOT NULL DEFAULT '',
      name_en TEXT NOT NULL DEFAULT '',
      unit TEXT NOT NULL DEFAULT 'piece',
      quantity REAL NOT NULL DEFAULT 0,
      reorder_level REAL NOT NULL DEFAULT 0,
      unit_cost REAL NOT NULL DEFAULT 0,
      location TEXT NOT NULL DEFAULT '',
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT
    );

    CREATE TABLE maintenance_work_order_parts (
      id TEXT PRIMARY KEY,
      work_order_id TEXT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
      part_id TEXT NOT NULL REFERENCES maintenance_parts(id),
      part_name TEXT NOT NULL DEFAULT '',
      quantity REAL NOT NULL DEFAULT 1,
      unit_cost REAL NOT NULL DEFAULT 0,
      created_by TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL
    );
    CREATE INDEX idx_maint_parts_order ON maintenance_work_order_parts(work_order_id);
  `,

  /* ── v24: inventory foundation ──────────────────────────────── */
  24: `
    CREATE TABLE IF NOT EXISTS warehouses (
      id          TEXT PRIMARY KEY,
      name_ar     TEXT NOT NULL DEFAULT '',
      name_en     TEXT NOT NULL DEFAULT '',
      code        TEXT NOT NULL UNIQUE,
      facility_id TEXT REFERENCES facilities(id),
      building_id TEXT REFERENCES buildings(id),
      location_id TEXT REFERENCES locations(id),
      type        TEXT NOT NULL DEFAULT 'central',
      status      TEXT NOT NULL DEFAULT 'active',
      notes       TEXT NOT NULL DEFAULT '',
      created_at  TEXT NOT NULL,
      updated_at  TEXT NOT NULL,
      deleted_at  TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_warehouses_facility ON warehouses(facility_id);
    CREATE INDEX IF NOT EXISTS idx_warehouses_status   ON warehouses(status);
    CREATE INDEX IF NOT EXISTS idx_warehouses_deleted  ON warehouses(deleted_at);

    CREATE TABLE IF NOT EXISTS inventory_items (
      id              TEXT PRIMARY KEY,
      name_ar         TEXT NOT NULL DEFAULT '',
      name_en         TEXT NOT NULL DEFAULT '',
      sku             TEXT NOT NULL UNIQUE,
      category        TEXT NOT NULL DEFAULT 'general',
      unit            TEXT NOT NULL DEFAULT 'piece',
      module_scope    TEXT NOT NULL DEFAULT 'shared',
      is_consumable   INTEGER NOT NULL DEFAULT 1,
      min_stock_level REAL NOT NULL DEFAULT 0,
      reorder_level   REAL NOT NULL DEFAULT 0,
      active          INTEGER NOT NULL DEFAULT 1,
      created_at      TEXT NOT NULL,
      updated_at      TEXT NOT NULL,
      deleted_at      TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_inv_items_sku     ON inventory_items(sku);
    CREATE INDEX IF NOT EXISTS idx_inv_items_active  ON inventory_items(active);
    CREATE INDEX IF NOT EXISTS idx_inv_items_scope   ON inventory_items(module_scope);
    CREATE INDEX IF NOT EXISTS idx_inv_items_deleted ON inventory_items(deleted_at);

    CREATE TABLE IF NOT EXISTS stock_balances (
      warehouse_id      TEXT NOT NULL REFERENCES warehouses(id),
      item_id           TEXT NOT NULL REFERENCES inventory_items(id),
      quantity_on_hand  REAL NOT NULL DEFAULT 0,
      quantity_reserved REAL NOT NULL DEFAULT 0,
      min_level         REAL NOT NULL DEFAULT 0,
      updated_at        TEXT NOT NULL,
      PRIMARY KEY (warehouse_id, item_id)
    );
    CREATE INDEX IF NOT EXISTS idx_stock_bal_warehouse ON stock_balances(warehouse_id);
    CREATE INDEX IF NOT EXISTS idx_stock_bal_item      ON stock_balances(item_id);

    CREATE TABLE IF NOT EXISTS stock_movements (
      id             TEXT PRIMARY KEY,
      warehouse_id   TEXT NOT NULL REFERENCES warehouses(id),
      item_id        TEXT NOT NULL REFERENCES inventory_items(id),
      movement_type  TEXT NOT NULL,
      quantity       REAL NOT NULL,
      balance_after  REAL NOT NULL,
      reference_type TEXT NOT NULL DEFAULT 'manual',
      reference_id   TEXT NOT NULL DEFAULT '',
      notes          TEXT NOT NULL DEFAULT '',
      actor_id       TEXT NOT NULL DEFAULT '',
      created_at     TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_stock_mov_warehouse ON stock_movements(warehouse_id);
    CREATE INDEX IF NOT EXISTS idx_stock_mov_item      ON stock_movements(item_id);
    CREATE INDEX IF NOT EXISTS idx_stock_mov_type      ON stock_movements(movement_type);
    CREATE INDEX IF NOT EXISTS idx_stock_mov_ts        ON stock_movements(created_at);
  `,

  /* ── v15: hospitality — menu categories ───────────────────── */
  15: `
    CREATE TABLE IF NOT EXISTS hospitality_menu_categories (
      id          TEXT PRIMARY KEY,
      name_ar     TEXT NOT NULL DEFAULT '',
      name_en     TEXT NOT NULL DEFAULT '',
      slug        TEXT NOT NULL UNIQUE,
      is_active   INTEGER NOT NULL DEFAULT 1,
      sort_order  INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT NOT NULL,
      updated_at  TEXT NOT NULL,
      deleted_at  TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_hosp_menucat_active  ON hospitality_menu_categories(is_active);
    CREATE INDEX IF NOT EXISTS idx_hosp_menucat_deleted ON hospitality_menu_categories(deleted_at);

    INSERT OR IGNORE INTO hospitality_menu_categories
      (id, name_ar, name_en, slug, is_active, sort_order, created_at, updated_at)
    VALUES
      ('cat-hot-drinks',  'مشروبات ساخنة', 'Hot Drinks', 'hot_drinks',  1, 1,  '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
      ('cat-cold-drinks', 'مشروبات بارده', 'Cold Drinks', 'cold_drinks', 1, 2,  '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
      ('cat-snacks',      'وجبات خفيفة',   'Snacks',      'snacks',      1, 3,  '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
      ('cat-other',       'أخرى',          'Other',       'other',       1, 99, '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z');
  `
,

  /* ── v22: facilities & spaces platform layer ─────────────── */
  22: `
    CREATE TABLE IF NOT EXISTS floors (
      id TEXT PRIMARY KEY, building_id TEXT NOT NULL REFERENCES buildings(id),
      name_ar TEXT NOT NULL DEFAULT '', name_en TEXT NOT NULL DEFAULT '',
      level_no INTEGER NOT NULL DEFAULT 0, active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_floors_building ON floors(building_id);

    CREATE TABLE IF NOT EXISTS facility_zones (
      id TEXT PRIMARY KEY, floor_id TEXT NOT NULL REFERENCES floors(id),
      name_ar TEXT NOT NULL DEFAULT '', name_en TEXT NOT NULL DEFAULT '',
      active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL, deleted_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_facility_zones_floor ON facility_zones(floor_id);

    CREATE TABLE IF NOT EXISTS spaces (
      id TEXT PRIMARY KEY, zone_id TEXT NOT NULL REFERENCES facility_zones(id),
      legacy_location_id TEXT, code TEXT NOT NULL DEFAULT '',
      name_ar TEXT NOT NULL DEFAULT '', name_en TEXT NOT NULL DEFAULT '',
      space_type TEXT NOT NULL DEFAULT 'other', capacity INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL, deleted_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_spaces_zone ON spaces(zone_id);
    CREATE INDEX IF NOT EXISTS idx_spaces_legacy ON spaces(legacy_location_id);

    CREATE TABLE IF NOT EXISTS location_space_map (
      location_id TEXT PRIMARY KEY REFERENCES locations(id),
      space_id TEXT NOT NULL REFERENCES spaces(id), created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS space_assignments (
      id TEXT PRIMARY KEY, space_id TEXT NOT NULL REFERENCES spaces(id),
      user_id TEXT NOT NULL REFERENCES users(id),
      assignment_type TEXT NOT NULL DEFAULT 'employee', module TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL, deleted_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_space_assignments_space ON space_assignments(space_id);
    CREATE INDEX IF NOT EXISTS idx_space_assignments_user ON space_assignments(user_id);
    CREATE TABLE IF NOT EXISTS location_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT, space_id TEXT NOT NULL REFERENCES spaces(id),
      module TEXT NOT NULL DEFAULT 'cleaning', metric_key TEXT NOT NULL,
      metric_value REAL NOT NULL DEFAULT 0, measured_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_location_metrics_space ON location_metrics(space_id, measured_at);

    ALTER TABLE tickets ADD COLUMN space_id TEXT NOT NULL DEFAULT '';
    ALTER TABLE reports ADD COLUMN space_id TEXT NOT NULL DEFAULT '';
    ALTER TABLE hospitality_orders ADD COLUMN space_id TEXT NOT NULL DEFAULT '';
    ALTER TABLE maintenance_assets ADD COLUMN space_id TEXT NOT NULL DEFAULT '';
    ALTER TABLE users ADD COLUMN space_id TEXT NOT NULL DEFAULT '';

    CREATE TABLE IF NOT EXISTS module_registry (
      id TEXT PRIMARY KEY, name_ar TEXT NOT NULL, name_en TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'planned', completion INTEGER NOT NULL DEFAULT 0,
      scope_ar TEXT NOT NULL DEFAULT '', scope_en TEXT NOT NULL DEFAULT '',
      facility_linked INTEGER NOT NULL DEFAULT 1
    );
    INSERT OR REPLACE INTO module_registry VALUES
      ('cleaning','النظافة','Cleaning','operational',95,'إدارة دورة النظافة','Cleaning operations lifecycle',1),
      ('maintenance','الصيانة','Maintenance','operational',90,'أوامر العمل والأصول والصيانة الوقائية','Work orders, assets and preventive maintenance',1),
      ('hospitality','الضيافة','Hospitality','operational',90,'طلبات الضيافة والمطابخ','Hospitality orders and kitchens',1),
      ('security','الأمن','Security','planned',0,'الحوادث والدوريات الأمنية','Security incidents and patrols',1),
      ('safety','السلامة','Safety','planned',0,'حوادث السلامة والتصاريح','Safety incidents and permits',1),
      ('visitors','خدمة العملاء والزوار','Customer Service / Visitors','planned',0,'الزوار وتجربة المستفيد','Visitors and customer experience',1),
      ('projects','المشاريع','Projects','planned',0,'متابعة مشاريع المرافق','Facilities projects tracking',1),
      ('contracts','العقود','Contracts','planned',0,'إدارة عقود التشغيل','Operations contracts management',1);

    INSERT OR IGNORE INTO facilities VALUES ('fac-demo','مرفق تجريبي','Demo Facility',1,'2026-01-01T00:00:00.000Z','2026-01-01T00:00:00.000Z',NULL);
    INSERT OR IGNORE INTO buildings VALUES ('bld-demo','fac-demo','المبنى التجريبي','Demo Building',1,'2026-01-01T00:00:00.000Z','2026-01-01T00:00:00.000Z',NULL);
    INSERT OR IGNORE INTO floors VALUES ('flr-demo','bld-demo','الدور العام','General Floor',0,1,'2026-01-01T00:00:00.000Z','2026-01-01T00:00:00.000Z',NULL);
    INSERT OR IGNORE INTO facility_zones VALUES ('fzn-demo','flr-demo','المنطقة العامة','General Zone',1,'2026-01-01T00:00:00.000Z','2026-01-01T00:00:00.000Z',NULL);
    INSERT OR IGNORE INTO spaces
      SELECT 'sp-' || id,'fzn-demo',id,id,name_ar,name_en,type,0,active,created_at,updated_at,NULL
      FROM locations WHERE deleted_at IS NULL;
    INSERT OR IGNORE INTO location_space_map
      SELECT id,'sp-' || id,'2026-01-01T00:00:00.000Z' FROM locations WHERE deleted_at IS NULL;
    UPDATE tickets SET space_id=COALESCE((SELECT space_id FROM location_space_map m WHERE m.location_id=tickets.location_id),'') WHERE space_id='';
    UPDATE reports SET space_id=COALESCE((SELECT space_id FROM location_space_map m WHERE m.location_id=reports.location_id),'') WHERE space_id='';
    UPDATE hospitality_orders SET space_id=COALESCE((SELECT space_id FROM location_space_map m WHERE m.location_id=hospitality_orders.location_id),'') WHERE space_id='';
    UPDATE maintenance_assets SET space_id=COALESCE((SELECT space_id FROM location_space_map m WHERE m.location_id=maintenance_assets.location_id),'') WHERE space_id='';
  `,
  /* ── v23: keep legacy locations and spaces synchronized ───── */
  23: `
    INSERT OR IGNORE INTO spaces
      SELECT 'sp-' || id,'fzn-demo',id,id,name_ar,name_en,type,0,active,created_at,updated_at,NULL
      FROM locations WHERE deleted_at IS NULL;
    INSERT OR IGNORE INTO location_space_map
      SELECT id,'sp-' || id,'2026-01-01T00:00:00.000Z' FROM locations WHERE deleted_at IS NULL;

    CREATE TRIGGER IF NOT EXISTS trg_location_create_space AFTER INSERT ON locations
    BEGIN
      INSERT OR IGNORE INTO spaces (id,zone_id,legacy_location_id,code,name_ar,name_en,space_type,capacity,active,created_at,updated_at)
        VALUES ('sp-' || NEW.id,'fzn-demo',NEW.id,NEW.id,NEW.name_ar,NEW.name_en,NEW.type,0,NEW.active,NEW.created_at,NEW.updated_at);
      INSERT OR IGNORE INTO location_space_map (location_id,space_id,created_at)
        VALUES (NEW.id,'sp-' || NEW.id,NEW.created_at);
    END;
    CREATE TRIGGER IF NOT EXISTS trg_ticket_space AFTER INSERT ON tickets WHEN NEW.space_id=''
    BEGIN UPDATE tickets SET space_id=COALESCE((SELECT space_id FROM location_space_map WHERE location_id=NEW.location_id),'') WHERE id=NEW.id; END;
    CREATE TRIGGER IF NOT EXISTS trg_report_space AFTER INSERT ON reports WHEN NEW.space_id=''
    BEGIN UPDATE reports SET space_id=COALESCE((SELECT space_id FROM location_space_map WHERE location_id=NEW.location_id),'') WHERE id=NEW.id; END;
    CREATE TRIGGER IF NOT EXISTS trg_hospitality_space AFTER INSERT ON hospitality_orders WHEN NEW.space_id=''
    BEGIN UPDATE hospitality_orders SET space_id=COALESCE((SELECT space_id FROM location_space_map WHERE location_id=NEW.location_id),'') WHERE id=NEW.id; END;
    CREATE TRIGGER IF NOT EXISTS trg_asset_space AFTER INSERT ON maintenance_assets WHEN NEW.space_id=''
    BEGIN UPDATE maintenance_assets SET space_id=COALESCE((SELECT space_id FROM location_space_map WHERE location_id=NEW.location_id),'') WHERE id=NEW.id; END;
  `,
  /* ── v25: cleaning supervisor routing and scoped assignments ── */
  25: `
    ALTER TABLE tickets ADD COLUMN supervisor_id TEXT NOT NULL DEFAULT '';
    ALTER TABLE tickets ADD COLUMN supervisor_name TEXT NOT NULL DEFAULT '';
    ALTER TABLE assignments ADD COLUMN supervisor_id TEXT NOT NULL DEFAULT '';
    CREATE INDEX IF NOT EXISTS idx_tickets_supervisor ON tickets(supervisor_id);
    CREATE INDEX IF NOT EXISTS idx_assignments_supervisor ON assignments(supervisor_id);
  `,
  /* ── v26: editable location groups for plan-based QR/assignment ─ */
  26: `
    CREATE TABLE IF NOT EXISTS location_groups (
      id         TEXT PRIMARY KEY,
      name_ar    TEXT NOT NULL DEFAULT '',
      name_en    TEXT NOT NULL DEFAULT '',
      floor      TEXT NOT NULL DEFAULT '',
      type       TEXT NOT NULL DEFAULT 'group',
      active     INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_location_groups_floor ON location_groups(floor);
    CREATE INDEX IF NOT EXISTS idx_location_groups_deleted ON location_groups(deleted_at);

    CREATE TABLE IF NOT EXISTS location_group_members (
      group_id    TEXT NOT NULL REFERENCES location_groups(id) ON DELETE CASCADE,
      location_id TEXT NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
      created_at  TEXT NOT NULL,
      PRIMARY KEY (group_id, location_id)
    );
    CREATE INDEX IF NOT EXISTS idx_location_group_members_location ON location_group_members(location_id);
  `,
  /* ── v27: interactive facility map points ─────────────────── */
  27: `
    CREATE TABLE IF NOT EXISTS map_points (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      floor      TEXT NOT NULL,
      code       TEXT NOT NULL,
      x          REAL NOT NULL,
      y          REAL NOT NULL,
      layer      TEXT NOT NULL DEFAULT 'cleaning',
      type       TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(floor, code, layer)
    );
    CREATE INDEX IF NOT EXISTS idx_map_points_floor ON map_points(floor);
    CREATE INDEX IF NOT EXISTS idx_map_points_code ON map_points(code);
    CREATE INDEX IF NOT EXISTS idx_map_points_layer ON map_points(layer);
  `,
  /* ── v28: stable map point identity separate from module state ─ */
  28: `
    ALTER TABLE map_points ADD COLUMN point_kind TEXT NOT NULL DEFAULT 'location';
    UPDATE map_points SET point_kind = CASE
      WHEN layer='groups' OR code LIKE '%-G%' THEN 'group'
      WHEN layer='cameras' OR code LIKE '%-CAM-%' THEN 'camera'
      WHEN layer='safety' OR code LIKE '%-FS-%' OR code LIKE '%-FE-%' OR code LIKE '%-EXT-%' THEN 'safety'
      WHEN code LIKE '%-WS-%' OR code LIKE '%-GM-%' OR code LIKE '%-M-%' THEN 'employee'
      WHEN code LIKE '%-BR-%' OR code LIKE '%-WC-%' THEN 'restroom'
      WHEN code LIKE '%-MR-%' THEN 'room'
      ELSE 'location'
    END
    WHERE point_kind='' OR point_kind='location';
    CREATE INDEX IF NOT EXISTS idx_map_points_kind ON map_points(point_kind);
  `,
  /* ── v29: free-form occupants for map points ──────────────── */
  29: `
    CREATE TABLE IF NOT EXISTS map_point_occupants (
      id            TEXT PRIMARY KEY,
      floor         TEXT NOT NULL DEFAULT '',
      code          TEXT NOT NULL,
      user_id       TEXT NOT NULL DEFAULT '',
      name          TEXT NOT NULL DEFAULT '',
      occupant_type TEXT NOT NULL DEFAULT 'employee',
      note          TEXT NOT NULL DEFAULT '',
      created_at    TEXT NOT NULL,
      updated_at    TEXT NOT NULL,
      deleted_at    TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_map_point_occupants_code ON map_point_occupants(code);
    CREATE INDEX IF NOT EXISTS idx_map_point_occupants_floor_code ON map_point_occupants(floor, code);
    CREATE INDEX IF NOT EXISTS idx_map_point_occupants_user ON map_point_occupants(user_id);
  `,
  /* ── v30: flexible operational module links for locations ─── */
  30: `
    ALTER TABLE locations ADD COLUMN service_modules TEXT NOT NULL DEFAULT '';
    UPDATE locations SET service_modules = CASE
      WHEN id LIKE '%-CAM-%' THEN 'maintenance'
      WHEN id LIKE '%-FS-%' OR id LIKE '%-FE-%' OR id LIKE '%-EXT-%' THEN 'maintenance,safety'
      WHEN type IN ('lobby','pantry','meeting_room','office') THEN 'cleaning,maintenance,hospitality'
      WHEN type IN ('restroom','prayer_room','corridor','entrance','parking','outdoor') THEN 'cleaning,maintenance'
      ELSE 'cleaning,maintenance'
    END
    WHERE service_modules = '';
    CREATE INDEX IF NOT EXISTS idx_locations_service_modules ON locations(service_modules);
  `,
  /* ── v31: browser push subscriptions for PWA notifications ── */
  31: `
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id         TEXT PRIMARY KEY,
      user_id    TEXT NOT NULL,
      endpoint   TEXT NOT NULL UNIQUE,
      p256dh     TEXT NOT NULL,
      auth       TEXT NOT NULL,
      user_agent TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON push_subscriptions(user_id);
    CREATE INDEX IF NOT EXISTS idx_push_subscriptions_active ON push_subscriptions(deleted_at);
  `,

  /* ── v32: utility bills (water / electricity) dashboard ──────── */
  32: `
    CREATE TABLE IF NOT EXISTS utility_bills (
      id            TEXT PRIMARY KEY,
      utility       TEXT NOT NULL DEFAULT 'water',   -- water | electricity
      building_type TEXT NOT NULL DEFAULT 'sub',     -- sub | main
      beneficiary   TEXT NOT NULL DEFAULT '',
      customer_no   TEXT NOT NULL DEFAULT '',
      invoice_no    TEXT NOT NULL DEFAULT '',
      period_from   TEXT NOT NULL DEFAULT '',
      period_to     TEXT NOT NULL DEFAULT '',
      amount_before REAL NOT NULL DEFAULT 0,
      tax           REAL NOT NULL DEFAULT 0,
      created_by    TEXT NOT NULL DEFAULT '',
      created_at    TEXT NOT NULL,
      updated_at    TEXT NOT NULL,
      deleted_at    TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_utility_bills_active  ON utility_bills(deleted_at);
    CREATE INDEX IF NOT EXISTS idx_utility_bills_utility ON utility_bills(utility);
  `,
};

function _range(prefix, start, end) {
  const width = String(end).length;
  const out = [];
  for (let i = start; i <= end; i += 1) out.push(`${prefix}${String(i).padStart(width, '0')}`);
  return out;
}

function _seedPlanLocationGroups(db) {
  const seeded = db.prepare("SELECT value FROM settings WHERE key='plan_location_groups_seeded'").get();
  if (seeded?.value === '1') return;
  const ts = '2026-06-25T00:00:00.000Z';
  const groups = [
    ['GF-WS-G01','مجموعة مكاتب GF 01','Ground floor workstation group 01','GF','workstation',_range('GF-WS-',1,4)],
    ['GF-WS-G02','مجموعة مكاتب GF 02','Ground floor workstation group 02','GF','workstation',_range('GF-WS-',5,12)],
    ['GF-WS-G03','مجموعة مكاتب GF 03','Ground floor workstation group 03','GF','workstation',_range('GF-WS-',13,20)],
    ['GF-BR-01','دورة مياه GF 01','Ground floor bathroom 01','GF','bathroom',['GF-BR-01','GF-BR-01-A','GF-BR-01-B']],
    ['GF-BR-02','دورة مياه GF 02','Ground floor bathroom 02','GF','bathroom',['GF-BR-02','GF-BR-02-A','GF-BR-02-B','GF-BR-02-C']],
    ['GF-K-G01','مطابخ الدور الأرضي','Ground floor kitchens','GF','kitchen',['GF-K-01','GF-K-02']],
    ['GF-CS-G01','خدمة العملاء الدور الأرضي','Ground floor customer service','GF','service',_range('GF-CS-',1,5)],
    ['GF-MR-G01','غرف اجتماع GF 01','Ground floor meeting rooms 01','GF','meeting_room',_range('GF-MR-',1,4)],

    ['MF-WS-G01','مجموعة مكاتب MF 01','Mezzanine workstation group 01','MF','workstation',_range('MF-WS-',1,6)],
    ['MF-WS-G02','مجموعة مكاتب MF 02','Mezzanine workstation group 02','MF','workstation',_range('MF-WS-',7,12)],
    ['MF-WS-G03','مجموعة مكاتب MF 03','Mezzanine workstation group 03','MF','workstation',_range('MF-WS-',13,18)],
    ['MF-WS-G04','مجموعة مكاتب MF 04','Mezzanine workstation group 04','MF','workstation',_range('MF-WS-',19,24)],
    ['MF-WS-G05','مجموعة مكاتب MF 05','Mezzanine workstation group 05','MF','workstation',_range('MF-WS-',25,32)],
    ['MF-WS-G06','مجموعة مكاتب MF 06','Mezzanine workstation group 06','MF','workstation',_range('MF-WS-',33,40)],

    ['1F-WS-G01','مجموعة مكاتب 1F 01','First floor workstation group 01','1F','workstation',[..._range('1F-WS-',1,4),..._range('1F-WS-',9,12)]],
    ['1F-WS-G02','مجموعة مكاتب 1F 02','First floor workstation group 02','1F','workstation',[..._range('1F-WS-',5,8),..._range('1F-WS-',13,16)]],
    ['1F-WS-G03','مجموعة مكاتب 1F 03','First floor workstation group 03','1F','workstation',_range('1F-WS-',17,24)],
    ['1F-WS-G04','مجموعة مكاتب 1F 04','First floor workstation group 04','1F','workstation',_range('1F-WS-',25,28)],
    ['1F-WS-G05','مجموعة مكاتب 1F 05','First floor workstation group 05','1F','workstation',_range('1F-WS-',29,32)],
    ['1F-WS-G06','مجموعة مكاتب 1F 06','First floor workstation group 06','1F','workstation',_range('1F-WS-',33,36)],
    ['1F-WS-G07','مجموعة مكاتب 1F 07','First floor workstation group 07','1F','workstation',_range('1F-WS-',37,40)],

    ['2F-WS-G01','مجموعة مكاتب 2F 01','Second floor workstation group 01','2F','workstation',_range('2F-WS-',1,6)],
    ['2F-WS-G02','مجموعة مكاتب 2F 02','Second floor workstation group 02','2F','workstation',_range('2F-WS-',7,12)],
    ['2F-WS-G03','مجموعة مكاتب 2F 03','Second floor workstation group 03','2F','workstation',_range('2F-WS-',13,18)],
    ['2F-WS-G04','مجموعة مكاتب 2F 04','Second floor workstation group 04','2F','workstation',_range('2F-WS-',19,23)],

    ['3F-WS-G01','مجموعة مكاتب 3F 01','Third floor workstation group 01','3F','workstation',_range('3F-WS-',1,4)],
    ['3F-WS-G02','مجموعة مكاتب 3F 02','Third floor workstation group 02','3F','workstation',_range('3F-WS-',5,8)],
    ['3F-WS-G03','مجموعة مكاتب 3F 03','Third floor workstation group 03','3F','workstation',_range('3F-WS-',9,12)],
    ['3F-WS-G04','مجموعة مكاتب 3F 04','Third floor workstation group 04','3F','workstation',_range('3F-WS-',13,20)],
    ['3F-WS-G05','مجموعة مكاتب 3F 05','Third floor workstation group 05','3F','workstation',_range('3F-WS-',21,24)],
    ['3F-WS-G06','مجموعة مكاتب 3F 06','Third floor workstation group 06','3F','workstation',_range('3F-WS-',25,30)],
    ['3F-WS-G07','مجموعة مكاتب 3F 07','Third floor workstation group 07','3F','workstation',_range('3F-WS-',31,34)],
    ['3F-WS-G08','مجموعة مكاتب 3F 08','Third floor workstation group 08','3F','workstation',_range('3F-WS-',35,38)],

    ...Array.from({ length: 9 }, (_, i) => {
      const start = i * 6 + 1;
      const end = start + 5;
      return [`4F-WS-G${String(i + 1).padStart(2, '0')}`,`مجموعة مكاتب 4F ${String(i + 1).padStart(2, '0')}`,`Fourth floor workstation group ${String(i + 1).padStart(2, '0')}`,'4F','workstation',_range('4F-WS-',start,end)];
    }),

    ['5F-WS-G01','مجموعة مكاتب 5F 01','Fifth floor workstation group 01','5F','workstation',_range('5F-WS-',62,67)],
    ['5F-WS-G02','مجموعة مكاتب 5F 02','Fifth floor workstation group 02','5F','workstation',_range('5F-WS-',68,73)],

    ['7F-WS-G01','مجموعة مكاتب 7F 01','Seventh floor workstation group 01','7F','workstation',_range('7F-WS-',23,30)],
    ['7F-WS-G02','مجموعة مكاتب 7F 02','Seventh floor workstation group 02','7F','workstation',_range('7F-WS-',41,44)],

    ['8F-WA-G01','منطقة انتظار الدور الثامن','Eighth floor waiting area','8F','waiting',['8F-WA','8F-WA-A','8F-WA-B']],
    ['8F-CEO-G01','جناح الرئيس التنفيذي','CEO suite','8F','office',['8F-CEO','8F-CEO-B','8F-CEO-C','8F-CEO-D']],
    ['8F-MR-G01','غرف اجتماع 8F 01','Eighth floor meeting rooms 01','8F','meeting_room',['8F-MR-01','8F-MR-1','8F-MR-1/A','8F-MR-1/B']],
    ['8F-MR-G02','غرف اجتماع 8F 02','Eighth floor meeting rooms 02','8F','meeting_room',['8F-MR-02','8F-MR-2','8F-MR-2/A','8F-MR-2/B']]
  ];

  const insertGroup = db.prepare(`
    INSERT OR IGNORE INTO location_groups (id,name_ar,name_en,floor,type,active,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?)
  `);
  const insertMember = db.prepare(`
    INSERT OR IGNORE INTO location_group_members (group_id,location_id,created_at)
    SELECT ?, id, ? FROM locations WHERE id = ? AND deleted_at IS NULL
  `);
  db.transaction(() => {
    for (const [id, nameAr, nameEn, floor, type, members] of groups) {
      if (members.length < 2) continue;
      insertGroup.run(id, nameAr, nameEn, floor, type, 1, ts, ts);
      for (const locationId of members) insertMember.run(id, ts, locationId);
    }
    db.prepare("INSERT OR REPLACE INTO settings (key,value) VALUES ('plan_location_groups_seeded','1')").run();
  })();
}

function _normalizeLegacyMapCode(value) {
  const arabicDigits = '٠١٢٣٤٥٦٧٨٩';
  const easternDigits = '۰۱۲۳۴۵۶۷۸۹';
  return String(value || '')
    .replace(/[٠-٩]/g, digit => String(arabicDigits.indexOf(digit)))
    .replace(/[۰-۹]/g, digit => String(easternDigits.indexOf(digit)))
    .replace(/[–—]/g, '-')
    .trim()
    .toUpperCase();
}

function _legacyOccupantMeta(status = '') {
  const value = String(status || '').trim().toLowerCase();
  if (['متدرب', 'trainee'].includes(value)) return { occupantType: 'trainee', note: '' };
  if (['متعاقد', 'contractor', 'مقاول'].includes(value)) return { occupantType: 'employee', note: 'contractor' };
  if (['استشاري', 'أستشاري', 'إستشاري', 'consultant'].includes(value)) return { occupantType: 'employee', note: 'consultant' };
  return { occupantType: 'employee', note: 'authority' };
}

function _importLegacyEmployeeOffices(db) {
  const imported = db.prepare("SELECT value FROM settings WHERE key='legacy_employee_offices_imported'").get();
  if (imported?.value === '1') return;

  const sourcePath = path.join(__dirname, 'public', 'map-data', 'employee_offices.json');
  if (!fs.existsSync(sourcePath)) return;

  let payload;
  try {
    payload = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
  } catch {
    return;
  }

  const employeesByCode = payload?.employeesByCode || {};
  const activeOccupants = db.prepare(`
    SELECT 1 FROM map_point_occupants
    WHERE floor = ? AND code = ? AND deleted_at IS NULL
    LIMIT 1
  `);
  const insertOccupant = db.prepare(`
    INSERT OR IGNORE INTO map_point_occupants
      (id,floor,code,user_id,name,occupant_type,note,created_at,updated_at,deleted_at)
    VALUES (?,?,?,?,?,?,?,?,?,NULL)
  `);
  const ts = new Date().toISOString();

  db.transaction(() => {
    for (const [rawCode, occupants] of Object.entries(employeesByCode)) {
      const code = _normalizeLegacyMapCode(rawCode);
      const floor = code.split('-')[0] || '';
      if (!code || !floor || activeOccupants.get(floor, code)) continue;

      (Array.isArray(occupants) ? occupants : []).forEach((occupant, index) => {
        const name = String(occupant?.name || '').trim();
        if (!name || name === 'لم يحدد بعد') return;
        const { occupantType, note } = _legacyOccupantMeta(occupant?.status);
        const digest = crypto.createHash('sha1')
          .update(`${floor}:${code}:${name}:${occupant?.sourceRow || index}`)
          .digest('hex')
          .slice(0, 16);
        insertOccupant.run(`legacy-${digest}`, floor, code, '', name, occupantType, note, ts, ts);
      });
    }
    db.prepare("INSERT OR REPLACE INTO settings (key,value) VALUES ('legacy_employee_offices_imported','1')").run();
  })();
}

module.exports = { getDb };
