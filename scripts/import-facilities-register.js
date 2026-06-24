#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { getDb } = require('../db');

const DEFAULT_CSV = path.join(__dirname, '..', 'data', 'imports', 'facilities-register.example.csv');
const CSV_ARG = process.argv[2] || process.env.FACILITIES_REGISTER_PATH || DEFAULT_CSV;
const CSV_PATH = CSV_ARG === '-' ? '-' : path.resolve(CSV_ARG);
const now = () => new Date().toISOString();

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];
    if (quoted) {
      if (ch === '"' && next === '"') { cell += '"'; i += 1; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
    else if (ch !== '\r') cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const headers = rows.shift() || [];
  return rows.filter(r => r.some(Boolean)).map(r => Object.fromEntries(headers.map((h, i) => [h, r[i] || ''])));
}

function floorLevel(code) {
  if (code === 'B2') return -2;
  if (code === 'B1') return -1;
  if (code === 'GF' || code === 'MF') return 0;
  const m = String(code || '').match(/^(\d+)F$/);
  return m ? Number(m[1]) : 0;
}

function locationType(source, symbol, englishName) {
  if (source === 'الأبواب') return 'access_point';
  if (source === 'طفايات الحريق') return 'fire_extinguisher';
  const s = String(symbol || '').toUpperCase();
  const en = String(englishName || '').toLowerCase();
  const bySymbol = {
    BR: 'restroom', T: 'restroom', AB: 'ablution',
    K: 'pantry', CP: 'coffee_point', PR: 'prayer_room',
    MR: 'meeting_room', OMR: 'meeting_room', O2O: 'meeting_room',
    WS: 'workspace', M: 'office', GM: 'office', DGM: 'office', DP: 'office',
    CEO: 'executive_office', CEOM: 'executive_office', MD: 'executive_office',
    SR: 'storage', ITS: 'storage', DC: 'data_room', CD: 'control_room', CR: 'control_room',
    WA: 'waiting_area', RA: 'reception', SCC: 'service_counter',
    SB: 'service_bar', DR: 'dressing_room', WR: 'wash_room', JR: 'janitor_room',
    SH: 'shelves', VA: 'vending_area', CA: 'catering_area', EL: 'employee_lounge',
    FA: 'facility_area', A: 'zone', B: 'zone', C: 'zone'
  };
  if (bySymbol[s]) return bySymbol[s];
  if (en.includes('toilet') || en.includes('bathroom')) return 'restroom';
  if (en.includes('kitchen')) return 'pantry';
  if (en.includes('meeting')) return 'meeting_room';
  if (en.includes('storage')) return 'storage';
  return 'other';
}

function installLocationSpaceTrigger(db) {
  db.exec(`
    DROP TRIGGER IF EXISTS trg_location_create_space;
    CREATE TRIGGER trg_location_create_space AFTER INSERT ON locations
    BEGIN
      INSERT OR IGNORE INTO spaces (id,zone_id,legacy_location_id,code,name_ar,name_en,space_type,capacity,active,created_at,updated_at)
        VALUES (
          'sp-' || NEW.id,
          COALESCE(
            (SELECT id FROM facility_zones WHERE id = NEW.building_id || '-' || NEW.floor || '-GEN'),
            (SELECT id FROM facility_zones WHERE deleted_at IS NULL ORDER BY created_at LIMIT 1)
          ),
          NEW.id,
          COALESCE(NULLIF(NEW.space,''), NEW.id),
          NEW.name_ar,
          NEW.name_en,
          NEW.type,
          0,
          NEW.active,
          NEW.created_at,
          NEW.updated_at
        );
      INSERT OR IGNORE INTO location_space_map (location_id,space_id,created_at)
        VALUES (NEW.id,'sp-' || NEW.id,NEW.created_at);
    END;
  `);
}

function dedupeByCode(rows) {
  const byCode = new Map();
  let duplicateRows = 0;

  for (const row of rows) {
    const code = String(row.code || '').trim();
    if (!code) continue;
    const existing = byCode.get(code);
    if (!existing) {
      byCode.set(code, { ...row, code });
      continue;
    }

    duplicateRows += 1;
    const existingIsDoor = existing.source_type === 'الأبواب';
    const currentIsDoor = row.source_type === 'الأبواب';
    if (existingIsDoor && !currentIsDoor) byCode.set(code, { ...row, code });
  }

  return { rows: [...byCode.values()], duplicateRows };
}

function main() {
  if (CSV_PATH !== '-' && !fs.existsSync(CSV_PATH)) {
    console.error(`CSV not found: ${CSV_PATH}`);
    console.error('Pass a secure CSV path, set FACILITIES_REGISTER_PATH, or pipe CSV via "-".');
    process.exit(1);
  }

  const csvText = CSV_PATH === '-' ? fs.readFileSync(0, 'utf8') : fs.readFileSync(CSV_PATH, 'utf8');
  const rawRows = parseCsv(csvText).filter(r => r.code);
  const { rows, duplicateRows } = dedupeByCode(rawRows);
  const db = getDb();
  const ts = now();
  installLocationSpaceTrigger(db);

  const upsertFacility = db.prepare(`
    INSERT INTO facilities (id,name_ar,name_en,active,created_at,updated_at,deleted_at)
    VALUES (?,?,?,?,?,?,NULL)
    ON CONFLICT(id) DO UPDATE SET name_ar=excluded.name_ar,name_en=excluded.name_en,active=1,updated_at=excluded.updated_at,deleted_at=NULL
  `);
  const upsertBuilding = db.prepare(`
    INSERT INTO buildings (id,facility_id,name_ar,name_en,active,created_at,updated_at,deleted_at)
    VALUES (?,?,?,?,?,?,?,NULL)
    ON CONFLICT(id) DO UPDATE SET facility_id=excluded.facility_id,name_ar=excluded.name_ar,name_en=excluded.name_en,active=1,updated_at=excluded.updated_at,deleted_at=NULL
  `);
  const upsertFloor = db.prepare(`
    INSERT INTO floors (id,building_id,name_ar,name_en,level_no,active,created_at,updated_at,deleted_at)
    VALUES (?,?,?,?,?,?,?,?,NULL)
    ON CONFLICT(id) DO UPDATE SET building_id=excluded.building_id,name_ar=excluded.name_ar,name_en=excluded.name_en,level_no=excluded.level_no,active=1,updated_at=excluded.updated_at,deleted_at=NULL
  `);
  const upsertZone = db.prepare(`
    INSERT INTO facility_zones (id,floor_id,name_ar,name_en,active,created_at,updated_at,deleted_at)
    VALUES (?,?,?,?,?,?,?,NULL)
    ON CONFLICT(id) DO UPDATE SET floor_id=excluded.floor_id,name_ar=excluded.name_ar,name_en=excluded.name_en,active=1,updated_at=excluded.updated_at,deleted_at=NULL
  `);
  const upsertLocation = db.prepare(`
    INSERT INTO locations
      (id,type,name_ar,name_en,floor,zone,priority,active,created_at,updated_at,deleted_at,facility_id,building_id,room,space)
    VALUES (?,?,?,?,?,?,?,?,?,?,NULL,?,?,?,?)
    ON CONFLICT(id) DO UPDATE SET
      type=excluded.type,name_ar=excluded.name_ar,name_en=excluded.name_en,floor=excluded.floor,zone=excluded.zone,
      priority=excluded.priority,active=1,updated_at=excluded.updated_at,deleted_at=NULL,
      facility_id=excluded.facility_id,building_id=excluded.building_id,room=excluded.room,space=excluded.space
  `);
  const upsertSpace = db.prepare(`
    INSERT INTO spaces
      (id,zone_id,legacy_location_id,code,name_ar,name_en,space_type,capacity,active,created_at,updated_at,deleted_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,NULL)
    ON CONFLICT(id) DO UPDATE SET
      zone_id=excluded.zone_id,legacy_location_id=excluded.legacy_location_id,code=excluded.code,
      name_ar=excluded.name_ar,name_en=excluded.name_en,space_type=excluded.space_type,
      active=1,updated_at=excluded.updated_at,deleted_at=NULL
  `);
  const upsertMap = db.prepare(`
    INSERT INTO location_space_map (location_id,space_id,created_at)
    VALUES (?,?,?)
    ON CONFLICT(location_id) DO UPDATE SET space_id=excluded.space_id
  `);
  const insertZoneName = db.prepare('INSERT OR IGNORE INTO zones (name, facility_id, building_id) VALUES (?,?,?)');

  db.transaction(() => {
    for (const row of rows) {
      const facilityId = row.facility_code || 'MRFQ-FAC-001';
      const buildingId = row.building_code || 'MAIN-001';
      const floorCode = row.floor_code || 'NA';
      const floorId = `${buildingId}-${floorCode}`;
      const zoneId = `${floorId}-GEN`;
      const locationId = row.code;
      const spaceId = `sp-${locationId}`;
      const type = locationType(row.source_type, row.symbol, row.english_name);
      const arBase = row.arabic_name || row.code;
      const enBase = row.english_name || row.code;
      const nameAr = `${arBase} - ${row.floor_ar || floorCode} - ${row.code}`;
      const nameEn = `${enBase} - ${row.floor_en || floorCode} - ${row.code}`;

      upsertFacility.run(facilityId, 'منشأة مرفق', 'MRFQ Facility', 1, ts, ts);
      upsertBuilding.run(buildingId, facilityId, row.building_ar || buildingId, row.building_en || buildingId, 1, ts, ts);
      upsertFloor.run(floorId, buildingId, row.floor_ar || floorCode, row.floor_en || floorCode, floorLevel(floorCode), 1, ts, ts);
      upsertZone.run(zoneId, floorId, 'المنطقة العامة', 'General Zone', 1, ts, ts);
      insertZoneName.run(floorCode, facilityId, buildingId);
      upsertLocation.run(locationId, type, nameAr, nameEn, floorCode, 'GEN', 'medium', 1, ts, ts, facilityId, buildingId, row.sequence_or_suffix || '', row.code);
      upsertSpace.run(spaceId, zoneId, locationId, row.code, nameAr, nameEn, type, 0, 1, ts, ts);
      upsertMap.run(locationId, spaceId, ts);
    }
  })();

  const importedLocations = db.prepare(`SELECT COUNT(*) AS c FROM locations WHERE deleted_at IS NULL AND facility_id = 'MRFQ-FAC-001' AND building_id = 'MAIN-001'`).get().c;
  const importedSpaces = db.prepare(`SELECT COUNT(*) AS c FROM spaces WHERE deleted_at IS NULL AND zone_id LIKE 'MAIN-001-%'`).get().c;
  console.log(JSON.stringify({
    source: CSV_PATH,
    csvRows: rawRows.length,
    uniqueCodes: rows.length,
    duplicateRowsSkipped: duplicateRows,
    importedLocations,
    importedSpaces
  }, null, 2));
}

main();
