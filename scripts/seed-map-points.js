'use strict';

const fs = require('fs');
const path = require('path');
const { getDb } = require('../db');

const ROOT = path.join(__dirname, '..');
const FLOOR_CODES = path.join(ROOT, 'public', 'map-data', 'floor_codes.json');

function normalizeCode(value) {
  const ar = '٠١٢٣٤٥٦٧٨٩';
  const fa = '۰۱۲۳۴۵۶۷۸۹';
  return String(value || '')
    .replace(/[٠-٩]/g, digit => String(ar.indexOf(digit)))
    .replace(/[۰-۹]/g, digit => String(fa.indexOf(digit)))
    .replace(/[–—]/g, '-')
    .trim()
    .toUpperCase();
}

function typeFromCode(code) {
  const body = normalizeCode(code).replace(/^(GF|MF|B1|B2|\dF)-/, '');
  const match = body.match(/^([A-Za-z]+)/);
  return match ? match[1].toUpperCase() : '';
}

function layerForCode(code) {
  const normalized = normalizeCode(code);
  if (/-G\d+/i.test(normalized)) return 'groups';
  if (normalized.includes('-CAM-')) return 'cameras';
  if (normalized.includes('-FS-') || normalized.includes('-FE-') || normalized.includes('-EXT-')) return 'safety';
  return 'cleaning';
}

function pointKindForCode(code, layer = layerForCode(code)) {
  const normalized = normalizeCode(code);
  const type = typeFromCode(code);
  if (layer === 'groups' || /-G\d+/i.test(normalized)) return 'group';
  if (layer === 'cameras' || type === 'CAM') return 'camera';
  if (layer === 'safety' || ['FS', 'FE', 'EXT'].includes(type)) return 'safety';
  if (['WS', 'GM', 'M'].includes(type)) return 'employee';
  if (['BR', 'WC'].includes(type)) return 'restroom';
  if (type === 'MR') return 'room';
  return 'location';
}

function pointCoordinate(index, total) {
  const cols = Math.max(6, Math.ceil(Math.sqrt(total || 1) * 1.35));
  const rows = Math.max(4, Math.ceil((total || 1) / cols));
  const col = index % cols;
  const row = Math.floor(index / cols);
  const x = 6 + (cols === 1 ? 44 : col * (88 / (cols - 1)));
  const y = 8 + (rows === 1 ? 40 : row * (84 / (rows - 1)));
  return { x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) };
}

function readJsonCodes() {
  if (!fs.existsSync(FLOOR_CODES)) return new Map();
  const parsed = JSON.parse(fs.readFileSync(FLOOR_CODES, 'utf8'));
  return new Map(Object.entries(parsed.codes || {}).map(([floor, codes]) => [
    normalizeCode(floor),
    (Array.isArray(codes) ? codes : []).map(normalizeCode).filter(Boolean)
  ]));
}

function addCode(byFloor, floor, code) {
  const normalizedFloor = normalizeCode(floor);
  const normalizedCode = normalizeCode(code);
  if (!normalizedFloor || !normalizedCode) return;
  if (!byFloor.has(normalizedFloor)) byFloor.set(normalizedFloor, new Set());
  byFloor.get(normalizedFloor).add(normalizedCode);
}

function collectCodes(db) {
  const byFloor = new Map();
  for (const [floor, codes] of readJsonCodes()) {
    for (const code of codes) addCode(byFloor, floor, code);
  }
  db.prepare("SELECT floor,id FROM locations WHERE deleted_at IS NULL AND floor <> ''").all()
    .forEach(row => addCode(byFloor, row.floor, row.id));
  db.prepare("SELECT floor,id FROM location_groups WHERE deleted_at IS NULL AND floor <> ''").all()
    .forEach(row => addCode(byFloor, row.floor, row.id));
  return byFloor;
}

function seed() {
  const db = getDb();
  const byFloor = collectCodes(db);
  const ts = new Date().toISOString();
  const insert = db.prepare(`
    INSERT INTO map_points (floor,code,x,y,layer,type,point_kind,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?)
  `);
  let total = 0;
  const floors = [...byFloor.keys()].sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
  db.transaction(() => {
    db.prepare('DELETE FROM map_points').run();
    for (const floor of floors) {
      const codes = [...byFloor.get(floor)].sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
      codes.forEach((code, index) => {
        const layer = layerForCode(code);
        const { x, y } = pointCoordinate(index, codes.length);
        insert.run(floor, code, x, y, layer, typeFromCode(code), pointKindForCode(code, layer), ts, ts);
        total += 1;
      });
    }
  })();
  console.log(JSON.stringify({
    ok: true,
    floors: Object.fromEntries(floors.map(floor => [floor, byFloor.get(floor).size])),
    total
  }, null, 2));
}

seed();
