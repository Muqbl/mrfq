'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const Database = require('better-sqlite3');

test('database backup script creates a readable SQLite snapshot', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mrfq-backup-'));
  const source = path.join(dir, 'source.db');
  const backupDir = path.join(dir, 'backups');
  const db = new Database(source);
  db.exec('CREATE TABLE sample(id INTEGER PRIMARY KEY, value TEXT); INSERT INTO sample(value) VALUES (\'ok\')');
  db.close();

  const output = execFileSync(process.execPath, [path.join(__dirname, '..', 'scripts', 'backup-db.js')], {
    env: { ...process.env, DB_PATH: source, BACKUP_DIR: backupDir, BACKUP_RETENTION: '2' },
    encoding: 'utf8'
  }).trim();
  assert.ok(fs.existsSync(output));
  const snapshot = new Database(output, { readonly: true });
  assert.equal(snapshot.prepare('SELECT value FROM sample').get().value, 'ok');
  snapshot.close();
  fs.rmSync(dir, { recursive: true, force: true });
});
