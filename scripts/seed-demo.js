#!/usr/bin/env node
/**
 * seed-demo.js — creates demo users and baseline data in the SQLite database.
 *
 * Passwords are taken from environment variables.
 * If an env var is absent, a cryptographically random password is generated
 * and printed to stdout ONCE. It is never written to disk or source code.
 *
 * Usage:
 *   node scripts/seed-demo.js
 *
 * Or with custom passwords (optional):
 *   DEMO_ADMIN_PASSWORD=MyS3cure! node scripts/seed-demo.js
 *
 * All environment variables (optional):
 *   DEMO_ADMIN_PASSWORD
 *   DEMO_FM_PASSWORD
 *   DEMO_MANAGER_PASSWORD
 *   DEMO_SUPERVISOR_PASSWORD
 *   DEMO_WORKER_PASSWORD
 *   DB_PATH   (path to data.db — defaults to ../data.db)
 */
'use strict';
// Load .env if it exists (optional — no dotenv dependency)
const envPath = require('path').join(__dirname, '..', '.env');
if (require('fs').existsSync(envPath)) {
  require('fs').readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, '');
  });
}

const crypto = require('crypto');
const path   = require('path');

// Resolve DB path before requiring db module
process.env.DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data.db');
const { getDb } = require('../db');

/* ── Password helpers ───────────────────────────────────────── */
function hashPassword(plain) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(plain, salt, 64).toString('hex');
  return `$scrypt$${salt}$${hash}`;
}
function randomPassword() {
  // 16 URL-safe random chars — e.g. "aB3-kZ7_qR2-mN9_"
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
  let pwd = '';
  while (pwd.length < 16) {
    const byte = crypto.randomBytes(1)[0];
    if (byte < chars.length * Math.floor(256 / chars.length))
      pwd += chars[byte % chars.length];
  }
  return pwd;
}

/* ── Resolve or generate passwords ─────────────────────────── */
function resolvePassword(envKey) {
  return process.env[envKey] || null;
}

const passwords = {
  admin:      resolvePassword('DEMO_ADMIN_PASSWORD')      || randomPassword(),
  fm:         resolvePassword('DEMO_FM_PASSWORD')         || randomPassword(),
  manager:    resolvePassword('DEMO_MANAGER_PASSWORD')    || randomPassword(),
  supervisor: resolvePassword('DEMO_SUPERVISOR_PASSWORD') || randomPassword(),
  worker:     resolvePassword('DEMO_WORKER_PASSWORD')     || randomPassword(),
};

/* ── Demo data ──────────────────────────────────────────────── */
const now = () => new Date().toISOString();

const DEMO_USERS = [
  { id:'u-admin',         name:'مدير النظام',   username:'admin',       password: passwords.admin,      role:'system_admin'        },
  { id:'u-fm',            name:'مدير المرافق',  username:'fm',          password: passwords.fm,         role:'facility_manager'    },
  { id:'u-clean-manager', name:'مدير النظافة',  username:'manager',     password: passwords.manager,    role:'cleaning_manager'    },
  { id:'u-s1',            name:'مشرف 1',        username:'supervisor1', password: passwords.supervisor,  role:'cleaning_supervisor' },
  { id:'u-s2',            name:'مشرف 2',        username:'supervisor2', password: passwords.supervisor,  role:'cleaning_supervisor' },
  { id:'u-w3',            name:'عامل 3',        username:'worker3',     password: passwords.worker,     role:'cleaner'             },
  { id:'u-w4',            name:'عامل 4',        username:'worker4',     password: passwords.worker,     role:'cleaner'             },
  { id:'u-w5',            name:'عامل 5',        username:'worker5',     password: passwords.worker,     role:'cleaner'             },
  { id:'u-w6',            name:'عامل 6',        username:'worker6',     password: passwords.worker,     role:'cleaner'             },
  { id:'u-w7',            name:'عامل 7',        username:'worker7',     password: passwords.worker,     role:'cleaner'             },
];

const DEMO_LOCATIONS = [
  { id:'wc-gf-a',      type:'restroom',     name_ar:'دورة مياه - الدور الأرضي - منطقة A',   name_en:'Restroom - Ground Floor - Zone A',    floor:'GF', zone:'GF', priority:'medium' },
  { id:'wc-gf-b',      type:'restroom',     name_ar:'دورة مياه - الدور الأرضي - منطقة B',   name_en:'Restroom - Ground Floor - Zone B',    floor:'GF', zone:'GF', priority:'medium' },
  { id:'wc-mz-a',      type:'restroom',     name_ar:'دورة مياه - الميزانين - منطقة A',      name_en:'Restroom - Mezzanine - Zone A',       floor:'MZ', zone:'MZ', priority:'medium' },
  { id:'wc-01-a',      type:'restroom',     name_ar:'دورة مياه - الدور الأول - منطقة A',    name_en:'Restroom - First Floor - Zone A',     floor:'01', zone:'1F', priority:'medium' },
  { id:'lobby-gf',     type:'lobby',        name_ar:'الردهة الرئيسية - الدور الأرضي',       name_en:'Main Lobby - Ground Floor',           floor:'GF', zone:'GF', priority:'high'   },
  { id:'pantry-05',    type:'pantry',       name_ar:'منطقة الضيافة - الدور الخامس',         name_en:'Pantry Area - Fifth Floor',           floor:'05', zone:'5F', priority:'medium' },
  { id:'meeting-08-a', type:'meeting_room', name_ar:'قاعة اجتماع - الدور الثامن - A',       name_en:'Meeting Room - Eighth Floor - A',     floor:'08', zone:'8F', priority:'high'   },
  { id:'corridor-04',  type:'corridor',     name_ar:'ممرات الدور الرابع',                   name_en:'Fourth Floor Corridors',              floor:'04', zone:'4F', priority:'low'    },
  { id:'prayer-mz',    type:'prayer_room',  name_ar:'مصلى الميزانين',                       name_en:'Mezzanine Prayer Room',               floor:'MZ', zone:'MZ', priority:'high'   },
];

const DEMO_ZONES = ['GF','MZ','1F','2F','3F','4F','5F','6F','7F','8F','B1','B2'];

const DEMO_ASSIGNMENTS = [
  { workerId:'u-w3', locationIds:['wc-gf-a','lobby-gf'] },
  { workerId:'u-w4', locationIds:['wc-gf-b','corridor-04'] },
  { workerId:'u-w5', locationIds:['wc-mz-a','prayer-mz'] },
  { workerId:'u-w6', locationIds:['wc-01-a','pantry-05'] },
  { workerId:'u-w7', locationIds:['meeting-08-a'] },
];

/* ── Seed ───────────────────────────────────────────────────── */
function seed() {
  const db = getDb();
  const ts = now();

  console.log('\n[seed] Starting demo data seed…');

  const insUser = db.prepare(`
    INSERT OR IGNORE INTO users
      (id,name,username,password,role,active,employee_no,
       force_password_change,last_password_change,created_at,updated_at)
    VALUES (?,?,?,?,?,1,'',1,'',?,?)
  `);
  const insLoc = db.prepare(`
    INSERT OR IGNORE INTO locations
      (id,type,name_ar,name_en,floor,zone,priority,active,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,1,?,?)
  `);
  const insZone = db.prepare('INSERT OR IGNORE INTO zones (name) VALUES (?)');
  const insAssign = db.prepare(
    'INSERT OR IGNORE INTO assignments (worker_id,location_id,created_at) VALUES (?,?,?)'
  );

  db.transaction(() => {
    // Users
    for (const u of DEMO_USERS) {
      insUser.run(u.id, u.name, u.username, hashPassword(u.password), u.role, ts, ts);
    }

    // Locations
    for (const l of DEMO_LOCATIONS) {
      insLoc.run(l.id, l.type, l.name_ar, l.name_en, l.floor, l.zone, l.priority, ts, ts);
    }

    // Zones
    for (const z of DEMO_ZONES) insZone.run(z);

    // Assignments
    for (const a of DEMO_ASSIGNMENTS) {
      for (const lid of a.locationIds) insAssign.run(a.workerId, lid, ts);
    }

    // Demo ticket
    db.prepare(`
      INSERT OR IGNORE INTO tickets
        (id,title,description,location_id,location_name_ar,location_name_en,
         assigned_to,assigned_to_name,created_by,status,priority,notes,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?,'مدير النظافة','assigned','high','',?,?)
    `).run(
      't-demo-1',
      'تنظيف عاجل لمنطقة الضيافة',
      'وجود بقايا قهوة على الطاولة — بيانات تجريبية',
      'pantry-05','منطقة الضيافة - الدور الخامس','Pantry Area - Fifth Floor',
      'u-w6','عامل 6', ts, ts
    );
  })();

  const seeded = db.prepare('SELECT COUNT(*) AS c FROM users WHERE deleted_at IS NULL').get().c;
  console.log(`[seed] ✓ ${seeded} users in database`);

  // Print credentials — only place passwords appear (never in source)
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║          DEMO CREDENTIALS — نسخة تجريبية فقط            ║');
  console.log('║     ⚠ هذه كلمات مرور مؤقتة — يجب تغييرها عند الدخول    ║');
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log(`║  admin      / ${passwords.admin.padEnd(42)}║`);
  console.log(`║  fm         / ${passwords.fm.padEnd(42)}║`);
  console.log(`║  manager    / ${passwords.manager.padEnd(42)}║`);
  console.log(`║  supervisor1/ ${passwords.supervisor.padEnd(42)}║`);
  console.log(`║  supervisor2/ ${passwords.supervisor.padEnd(42)}║`);
  console.log(`║  worker3-7  / ${passwords.worker.padEnd(42)}║`);
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log('║  All accounts require password change on first login.    ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');
}

seed();
