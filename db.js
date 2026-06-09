'use strict';
const Database = require('better-sqlite3');
const path     = require('path');
const fs       = require('fs');

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

    CREATE TABLE audit_logs (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      ts          TEXT    NOT NULL,
      action      TEXT    NOT NULL,
      user_id     TEXT    NOT NULL DEFAULT '',
      username    TEXT    NOT NULL DEFAULT '',
      role        TEXT    NOT NULL DEFAULT '',
      ip          TEXT    NOT NULL DEFAULT '',
      user_agent  TEXT    NOT NULL DEFAULT '',
      target_type TEXT    NOT NULL DEFAULT '',
      target_id   TEXT    NOT NULL DEFAULT '',
      result      TEXT    NOT NULL DEFAULT 'success',
      extra       TEXT    NOT NULL DEFAULT '{}'
    );
    CREATE INDEX idx_audit_ts     ON audit_logs(ts);
    CREATE INDEX idx_audit_user   ON audit_logs(user_id);
    CREATE INDEX idx_audit_action ON audit_logs(action);
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

  /* ── v9: module column on assignments and audit_logs ─────── */
  9: `
    ALTER TABLE assignments ADD COLUMN module TEXT NOT NULL DEFAULT 'cleaning';
    ALTER TABLE audit_logs  ADD COLUMN module TEXT NOT NULL DEFAULT 'cleaning';

    CREATE INDEX IF NOT EXISTS idx_assignments_module ON assignments(module);
    CREATE INDEX IF NOT EXISTS idx_audit_module        ON audit_logs(module);
  `
};

module.exports = { getDb };
