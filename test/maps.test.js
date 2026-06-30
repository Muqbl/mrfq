'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const Database = require('better-sqlite3');
const { normalizeCode, statusRows, assignEmployees } = require('../server/services/maps.service');

test('map code normalization accepts Arabic and Persian digits', () => {
  assert.equal(normalizeCode('MF-WS-٠١'), 'MF-WS-01');
  assert.equal(normalizeCode('mf-ws-۰۲'), 'MF-WS-02');
  assert.equal(normalizeCode(' 4f–cam–03 '), '4F-CAM-03');
});

function mapDb() {
  const db = new Database(':memory:');
  db.exec(`
    CREATE TABLE settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
    INSERT INTO settings VALUES ('frequency_minutes','120');

    CREATE TABLE locations (
      id TEXT PRIMARY KEY, type TEXT NOT NULL DEFAULT 'other',
      name_ar TEXT NOT NULL DEFAULT '', name_en TEXT NOT NULL DEFAULT '',
      floor TEXT NOT NULL DEFAULT '', zone TEXT NOT NULL DEFAULT '',
      priority TEXT NOT NULL DEFAULT 'medium', active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT '', updated_at TEXT NOT NULL DEFAULT '',
      deleted_at TEXT
    );
    CREATE TABLE location_space_map (location_id TEXT PRIMARY KEY, space_id TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT '');
    CREATE TABLE spaces (
      id TEXT PRIMARY KEY, zone_id TEXT NOT NULL DEFAULT '',
      code TEXT NOT NULL DEFAULT '', legacy_location_id TEXT,
      name_ar TEXT NOT NULL DEFAULT '', name_en TEXT NOT NULL DEFAULT '',
      deleted_at TEXT
    );
    CREATE TABLE facility_zones (id TEXT PRIMARY KEY, floor_id TEXT NOT NULL DEFAULT '', name_ar TEXT NOT NULL DEFAULT '', name_en TEXT NOT NULL DEFAULT '');
    CREATE TABLE floors (id TEXT PRIMARY KEY, building_id TEXT NOT NULL DEFAULT '', name_ar TEXT NOT NULL DEFAULT '', name_en TEXT NOT NULL DEFAULT '');
    CREATE TABLE buildings (id TEXT PRIMARY KEY, facility_id TEXT NOT NULL DEFAULT '', name_ar TEXT NOT NULL DEFAULT '', name_en TEXT NOT NULL DEFAULT '');
    CREATE TABLE facilities (id TEXT PRIMARY KEY, name_ar TEXT NOT NULL DEFAULT '', name_en TEXT NOT NULL DEFAULT '');
    CREATE TABLE location_groups (id TEXT PRIMARY KEY, name_ar TEXT NOT NULL DEFAULT '', name_en TEXT NOT NULL DEFAULT '', type TEXT NOT NULL DEFAULT '', floor TEXT NOT NULL DEFAULT '', deleted_at TEXT);
    CREATE TABLE location_group_members (group_id TEXT NOT NULL, location_id TEXT NOT NULL);

    CREATE TABLE users (
      id TEXT PRIMARY KEY, name TEXT NOT NULL DEFAULT '', username TEXT NOT NULL DEFAULT '',
      role TEXT NOT NULL DEFAULT '', employee_no TEXT NOT NULL DEFAULT '',
      active INTEGER NOT NULL DEFAULT 1, space_id TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL DEFAULT '', deleted_at TEXT
    );
    CREATE TABLE space_assignments (
      id TEXT PRIMARY KEY, space_id TEXT NOT NULL DEFAULT '', user_id TEXT NOT NULL DEFAULT '',
      assignment_type TEXT NOT NULL DEFAULT '', module TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT '', deleted_at TEXT
    );
    CREATE TABLE map_point_occupants (
      id TEXT PRIMARY KEY, floor TEXT NOT NULL DEFAULT '', code TEXT NOT NULL,
      user_id TEXT NOT NULL DEFAULT '', name TEXT NOT NULL DEFAULT '',
      occupant_type TEXT NOT NULL DEFAULT 'employee', note TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT '', updated_at TEXT NOT NULL DEFAULT '', deleted_at TEXT
    );

    CREATE TABLE map_points (
      id INTEGER PRIMARY KEY AUTOINCREMENT, floor TEXT NOT NULL, code TEXT NOT NULL,
      x REAL NOT NULL, y REAL NOT NULL, layer TEXT NOT NULL DEFAULT 'cleaning',
      type TEXT NOT NULL DEFAULT '', point_kind TEXT NOT NULL DEFAULT 'location',
      created_at TEXT NOT NULL DEFAULT '', updated_at TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE tickets (
      id TEXT PRIMARY KEY, location_id TEXT NOT NULL, module TEXT NOT NULL DEFAULT 'cleaning',
      status TEXT NOT NULL DEFAULT 'submitted', sla_breached INTEGER NOT NULL DEFAULT 0,
      deleted_at TEXT
    );
    CREATE TABLE reports (
      id TEXT PRIMARY KEY, location_id TEXT NOT NULL, module TEXT NOT NULL DEFAULT 'cleaning',
      approval_status TEXT NOT NULL DEFAULT 'pending', created_at TEXT NOT NULL DEFAULT '',
      deleted_at TEXT
    );
  `);
  return db;
}

test('map status creates auto point for open cross-module tickets', () => {
  const db = mapDb();
  db.prepare("INSERT INTO locations (id,name_ar,floor) VALUES ('MF-WS-77','مكتب صيانة','MF')").run();
  db.prepare("INSERT INTO tickets (id,location_id,module,status) VALUES ('t-1','MF-WS-77','maintenance','submitted')").run();

  const maintenance = statusRows(db, 'MF', ['maintenance']);
  assert.equal(maintenance.points.length, 1);
  assert.equal(maintenance.points[0].code, 'MF-WS-77');
  assert.equal(maintenance.points[0].source, 'auto');
  assert.equal(maintenance.points[0].modules.maintenance.openTickets, 1);
  assert.ok(maintenance.points[0].visibleLayers.includes('maintenance'));

  const cleaning = statusRows(db, 'MF', ['cleaning']);
  assert.equal(cleaning.points.some(point => point.code === 'MF-WS-77'), false);
});

test('map status creates auto point for pending cleaning reports', () => {
  const db = mapDb();
  db.prepare("INSERT INTO locations (id,name_ar,floor) VALUES ('MF-BR-22','دورة مياه','MF')").run();
  db.prepare("INSERT INTO reports (id,location_id,module,approval_status,created_at) VALUES ('r-1','MF-BR-22','cleaning','pending','2026-06-29T08:00:00.000Z')").run();

  const status = statusRows(db, 'MF', ['cleaning']);
  assert.equal(status.points.length, 1);
  assert.equal(status.points[0].code, 'MF-BR-22');
  assert.equal(status.points[0].source, 'auto');
  assert.equal(status.points[0].modules.cleaning.pendingReports, 1);
  assert.equal(status.summary.sources.auto, 1);
  assert.equal(status.summary.layers.cleaning, 1);
});

test('manual location points stay fixed without being counted as cleaning activity', () => {
  const db = mapDb();
  db.prepare("INSERT INTO locations (id,name_ar,floor) VALUES ('MF-WS-01','مكتب موظف','MF')").run();
  db.prepare("INSERT INTO map_points (floor,code,x,y,layer,type,point_kind) VALUES ('MF','MF-WS-01',50,50,'cleaning','WS','employee')").run();

  const status = statusRows(db, 'MF', ['cleaning']);
  assert.equal(status.points.length, 1);
  assert.equal(status.points[0].code, 'MF-WS-01');
  assert.equal(status.points[0].source, 'manual');
  assert.equal(status.points[0].pointKind, 'employee');
  assert.deepEqual(status.points[0].operationalLayers, []);
  assert.equal(status.points[0].level, 'ok');
  assert.equal(status.summary.layers.cleaning || 0, 0);
});

test('map assignments accept free-form point occupants without system users', () => {
  const db = mapDb();
  db.prepare("INSERT INTO map_points (floor,code,x,y,layer,type,point_kind) VALUES ('MF','MF-WS-35',41.2,75.2,'cleaning','WS','employee')").run();

  const saved = assignEmployees(db, 'MF', 'MF-WS-35', [], [
    { name: 'أحمد المتعاقد', occupantType: 'contractor', note: 'وردية صباحية' }
  ]);
  assert.equal(saved.employees.length, 1);
  assert.equal(saved.employees[0].name, 'أحمد المتعاقد');
  assert.equal(saved.employees[0].occupantType, 'contractor');

  const status = statusRows(db, 'MF', []);
  assert.equal(status.points[0].employees[0].name, 'أحمد المتعاقد');
  assert.equal(status.points[0].employees[0].source, 'free');
  assert.equal(status.points[0].pointKind, 'employee');
});

test('map assignments accept system admin as a point occupant', () => {
  const db = mapDb();
  db.prepare("INSERT INTO locations (id,name_ar,floor) VALUES ('MF-WS-18','مكتب مدير النظام','MF')").run();
  db.prepare("INSERT INTO spaces (id,code,name_ar) VALUES ('space-admin','MF-WS-18','مكتب مدير النظام')").run();
  db.prepare("INSERT INTO location_space_map (location_id,space_id) VALUES ('MF-WS-18','space-admin')").run();
  db.prepare("INSERT INTO map_points (floor,code,x,y,layer,type,point_kind) VALUES ('MF','MF-WS-18',45,45,'cleaning','WS','employee')").run();
  db.prepare("INSERT INTO users (id,name,username,role,active) VALUES ('u-admin','مدير النظام','admin','system_admin',1)").run();

  const saved = assignEmployees(db, 'MF', 'MF-WS-18', ['u-admin'], []);
  assert.equal(saved.employees.length, 1);
  assert.equal(saved.employees[0].id, 'u-admin');
  assert.equal(saved.employees[0].name, 'مدير النظام');
  assert.equal(saved.employees[0].role, 'system_admin');

  const status = statusRows(db, 'MF', []);
  assert.equal(status.points[0].employees[0].id, 'u-admin');
  assert.equal(status.points[0].pointKind, 'employee');
});
