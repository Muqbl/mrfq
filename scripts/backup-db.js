'use strict';

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const source = path.resolve(process.env.DB_PATH || path.join(__dirname, '..', 'data.db'));
const backupDir = path.resolve(process.env.BACKUP_DIR || path.join(__dirname, '..', 'backups'));
const retention = Math.max(1, Number.parseInt(process.env.BACKUP_RETENTION, 10) || 14);

if (!fs.existsSync(source)) throw new Error(`Database not found: ${source}`);
fs.mkdirSync(backupDir, { recursive: true });

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const target = path.join(backupDir, `mrfq-${stamp}.db`);
const db = new Database(source, { readonly: true });

db.backup(target).then(() => {
  db.close();
  const files = fs.readdirSync(backupDir)
    .filter(name => /^mrfq-.*\.db$/.test(name))
    .map(name => ({ name, time: fs.statSync(path.join(backupDir, name)).mtimeMs }))
    .sort((a, b) => b.time - a.time);
  files.slice(retention).forEach(file => fs.rmSync(path.join(backupDir, file.name)));
  console.log(target);
}).catch(error => {
  db.close();
  console.error(error.message);
  process.exitCode = 1;
});
