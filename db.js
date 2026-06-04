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
  `
};

module.exports = { getDb };
