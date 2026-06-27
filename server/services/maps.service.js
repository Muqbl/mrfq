'use strict';

const FLOOR_ASSETS = Object.freeze([
  { id: 'GF', labelAr: 'الدور الأرضي', labelEn: 'Ground Floor', svg: '/floors/01_GF.svg' },
  { id: 'MF', labelAr: 'دور الميزانين', labelEn: 'Mezzanine', svg: '/floors/02_MF.svg' },
  { id: '1F', labelAr: 'الدور الأول', labelEn: 'First Floor', svg: '/floors/03_1F.svg' },
  { id: '2F', labelAr: 'الدور الثاني', labelEn: 'Second Floor', svg: '/floors/04_2F.svg' },
  { id: '3F', labelAr: 'الدور الثالث', labelEn: 'Third Floor', svg: '/floors/05_3F.svg' },
  { id: '4F', labelAr: 'الدور الرابع', labelEn: 'Fourth Floor', svg: '/floors/06_4F.svg' },
  { id: '5F', labelAr: 'الدور الخامس', labelEn: 'Fifth Floor', svg: '/floors/08_5F.svg' },
  { id: '6F', labelAr: 'الدور السادس', labelEn: 'Sixth Floor', svg: '/floors/09_6F.svg' },
  { id: '7F', labelAr: 'الدور السابع', labelEn: 'Seventh Floor', svg: '/floors/10_7F.svg' },
  { id: '8F', labelAr: 'الدور الثامن', labelEn: 'Eighth Floor', svg: '/floors/11_8F.svg' }
]);

const VALID_LAYERS = new Set(['cleaning', 'maintenance', 'hospitality', 'safety', 'cameras', 'groups']);
const TERMINAL_TICKET = new Set(['completed', 'rejected', 'cancelled']);
const TERMINAL_HOSPITALITY = new Set(['completed', 'cancelled', 'rejected']);
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';
const EASTERN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

function normalizeCode(value) {
  return String(value || '')
    .replace(/[٠-٩]/g, digit => String(ARABIC_DIGITS.indexOf(digit)))
    .replace(/[۰-۹]/g, digit => String(EASTERN_DIGITS.indexOf(digit)))
    .replace(/[–—]/g, '-')
    .trim()
    .toUpperCase();
}

function codeVariants(value) {
  const normalized = normalizeCode(value);
  const arabic = normalized.replace(/\d/g, digit => ARABIC_DIGITS[Number(digit)]);
  const eastern = normalized.replace(/\d/g, digit => EASTERN_DIGITS[Number(digit)]);
  return [...new Set([normalized, arabic, eastern].filter(Boolean))];
}

function codeWhere(column, values) {
  const variants = codeVariants(values);
  return { clause: `${column} IN (${variants.map(() => '?').join(',')})`, values: variants };
}

function typeFromCode(code) {
  const body = normalizeCode(code).replace(/^(GF|MF|B1|B2|\dF)-/, '');
  const match = body.match(/^([A-Za-z]+)/);
  return match ? match[1].toUpperCase() : '';
}

function floorRows(db) {
  const counts = db.prepare('SELECT floor, COUNT(*) count FROM map_points GROUP BY floor').all()
    .reduce((acc, row) => ({ ...acc, [row.floor]: row.count }), {});
  return FLOOR_ASSETS.map(floor => ({
    floor: floor.id,
    labelAr: floor.labelAr,
    labelEn: floor.labelEn,
    svg: floor.svg,
    pointCount: counts[floor.id] || 0
  }));
}

function normalizePoint(raw, fallbackFloor = '') {
  const floor = normalizeCode(raw.floor || fallbackFloor);
  const code = normalizeCode(raw.code);
  const layer = String(raw.layer || 'cleaning').trim().toLowerCase();
  const x = Number(raw.x);
  const y = Number(raw.y);
  return {
    floor,
    code,
    layer: VALID_LAYERS.has(layer) ? layer : 'cleaning',
    type: String(raw.type || typeFromCode(code)).trim().toUpperCase(),
    x: Number.isFinite(x) ? Math.max(0, Math.min(100, x)) : 0,
    y: Number.isFinite(y) ? Math.max(0, Math.min(100, y)) : 0
  };
}

function pointRows(db, floor) {
  const normalizedFloor = normalizeCode(floor);
  return db.prepare(`
    SELECT id,floor,code,x,y,layer,type,created_at,updated_at
    FROM map_points
    WHERE floor = ?
    ORDER BY layer, code
  `).all(normalizedFloor);
}

function replaceFloorPoints(db, floor, rawPoints) {
  const normalizedFloor = normalizeCode(floor);
  const points = (Array.isArray(rawPoints) ? rawPoints : [])
    .map(point => normalizePoint(point, normalizedFloor))
    .filter(point => point.floor === normalizedFloor && point.code && point.x >= 0 && point.y >= 0);
  const ts = new Date().toISOString();
  const del = db.prepare('DELETE FROM map_points WHERE floor = ?');
  const ins = db.prepare(`
    INSERT INTO map_points (floor,code,x,y,layer,type,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?)
    ON CONFLICT(floor, code, layer) DO UPDATE SET
      x=excluded.x,
      y=excluded.y,
      type=excluded.type,
      updated_at=excluded.updated_at
  `);
  db.transaction(() => {
    del.run(normalizedFloor);
    for (const point of points) {
      ins.run(point.floor, point.code, point.x, point.y, point.layer, point.type, ts, ts);
    }
  })();
  return pointRows(db, normalizedFloor);
}

function locationByCode(db, code) {
  const lookup = codeWhere('l.id', code);
  return db.prepare(`
    SELECT l.*, s.id space_id
    FROM locations l
    LEFT JOIN location_space_map m ON m.location_id = l.id
    LEFT JOIN spaces s ON s.id = m.space_id
    WHERE ${lookup.clause} AND l.deleted_at IS NULL
  `).get(...lookup.values);
}

function groupByCode(db, code) {
  const lookup = codeWhere('g.id', code);
  return db.prepare(`
    SELECT g.*,
      (SELECT COUNT(*) FROM location_group_members gm JOIN locations l ON l.id=gm.location_id AND l.deleted_at IS NULL WHERE gm.group_id=g.id) member_count
    FROM location_groups g
    WHERE ${lookup.clause} AND g.deleted_at IS NULL
  `).get(...lookup.values);
}

function statusLevel({ cleaning, maintenance, hospitality, safety, cameras, group }) {
  const levels = [cleaning?.level, maintenance?.level, hospitality?.level, safety?.level, cameras?.level, group?.level].filter(Boolean);
  if (levels.includes('critical')) return 'critical';
  if (levels.includes('warn')) return 'warn';
  if (levels.includes('active')) return 'active';
  return 'ok';
}

function cleaningStatus(db, location) {
  if (!location) return null;
  const lookup = codeWhere('location_id', location.id);
  const open = db.prepare(`
    SELECT COUNT(*) count,
      SUM(CASE WHEN sla_breached=1 THEN 1 ELSE 0 END) breached
    FROM tickets
    WHERE ${lookup.clause} AND module='cleaning' AND deleted_at IS NULL
      AND status NOT IN ('completed','rejected','cancelled')
  `).get(...lookup.values);
  const pending = db.prepare(`
    SELECT COUNT(*) count FROM reports
    WHERE ${lookup.clause} AND module='cleaning' AND deleted_at IS NULL
      AND approval_status IN ('pending','pending_approval')
  `).get(...lookup.values);
  const last = db.prepare(`
    SELECT created_at FROM reports
    WHERE ${lookup.clause} AND module='cleaning' AND deleted_at IS NULL
    ORDER BY created_at DESC LIMIT 1
  `).get(...lookup.values);
  const frequency = Number(db.prepare("SELECT value FROM settings WHERE key='frequency_minutes'").get()?.value || 120);
  const due = !last?.created_at || Date.now() - new Date(last.created_at).getTime() > frequency * 60_000;
  const level = open.breached ? 'critical' : open.count || pending.count || due ? 'warn' : 'ok';
  return {
    level,
    openTickets: open.count || 0,
    slaBreaches: open.breached || 0,
    pendingReports: pending.count || 0,
    lastReportAt: last?.created_at || '',
    due
  };
}

function maintenanceStatus(db, location) {
  if (!location) return null;
  const lookup = codeWhere('location_id', location.id);
  const rows = db.prepare(`
    SELECT status,sla_breached FROM tickets
    WHERE ${lookup.clause} AND module='maintenance' AND deleted_at IS NULL
  `).all(...lookup.values);
  const active = rows.filter(row => !TERMINAL_TICKET.has(row.status));
  const breached = active.filter(row => row.sla_breached === 1).length;
  return {
    level: breached ? 'critical' : active.length ? 'warn' : 'ok',
    openTickets: active.length,
    slaBreaches: breached
  };
}

function hospitalityStatus(db, location) {
  if (!location) return null;
  const table = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='hospitality_orders'").get();
  if (!table) return { level: 'ok', openOrders: 0, slaBreaches: 0 };
  const lookup = codeWhere('location_id', location.id);
  const rows = db.prepare(`
    SELECT status,sla_breached,sla_deadline FROM hospitality_orders
    WHERE ${lookup.clause} AND deleted_at IS NULL
  `).all(...lookup.values);
  const active = rows.filter(row => !TERMINAL_HOSPITALITY.has(row.status));
  const breached = active.filter(row => row.sla_breached === 1 || (row.sla_deadline && new Date(row.sla_deadline) < new Date())).length;
  return {
    level: breached ? 'critical' : active.length ? 'active' : 'ok',
    openOrders: active.length,
    slaBreaches: breached
  };
}

function assetStatus(db, location, pointType) {
  if (!location) return null;
  const table = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='maintenance_assets'").get();
  if (!table) return { level: 'ok', count: 0, down: 0 };
  const lookup = codeWhere('location_id', location.id);
  const rows = db.prepare(`
    SELECT status,criticality,category FROM maintenance_assets
    WHERE ${lookup.clause} AND deleted_at IS NULL
  `).all(...lookup.values);
  const relevant = pointType === 'FS'
    ? rows.filter(row => String(row.category || '').toLowerCase().includes('fire') || String(row.category || '').includes('طف'))
    : pointType === 'CAM'
      ? rows.filter(row => String(row.category || '').toLowerCase().includes('cam') || String(row.category || '').includes('كام'))
    : rows;
  const down = relevant.filter(row => ['down', 'out_of_service'].includes(String(row.status || '').toLowerCase())).length;
  return { level: down ? 'critical' : relevant.length ? 'ok' : 'ok', count: relevant.length, down };
}

function pointStatus(db, point) {
  const location = locationByCode(db, point.code);
  const group = !location ? groupByCode(db, point.code) : null;
  const pointType = typeFromCode(point.code);
  const isSafetyPoint = point.layer === 'safety' || pointType === 'FS';
  const isCameraPoint = point.layer === 'cameras' || pointType === 'CAM';
  const isGroupPoint = point.layer === 'groups' || !!group;
  const modules = {
    cleaning: !isSafetyPoint && !isCameraPoint && !isGroupPoint ? cleaningStatus(db, location) : null,
    maintenance: !isSafetyPoint && !isCameraPoint && !isGroupPoint ? maintenanceStatus(db, location) : null,
    hospitality: !isSafetyPoint && !isCameraPoint && !isGroupPoint ? hospitalityStatus(db, location) : null,
    safety: isSafetyPoint ? assetStatus(db, location, 'FS') : null,
    cameras: isCameraPoint ? assetStatus(db, location, 'CAM') : null,
    groups: group ? { level: group.member_count > 1 ? 'active' : 'warn', memberCount: group.member_count || 0 } : null
  };
  const activeModules = Object.fromEntries(Object.entries(modules).filter(([, value]) => value));
  return {
    ...point,
    location: location ? {
      id: location.id,
      nameAr: location.name_ar || '',
      nameEn: location.name_en || '',
      type: location.type || '',
      floor: location.floor || '',
      zone: location.zone || '',
      priority: location.priority || ''
    } : null,
    group: group ? {
      id: group.id,
      nameAr: group.name_ar || '',
      nameEn: group.name_en || '',
      type: group.type || '',
      floor: group.floor || '',
      memberCount: group.member_count || 0
    } : null,
    modules: activeModules,
    level: statusLevel(activeModules),
    missingLocation: !location && !group
  };
}

function statusRows(db, floor, layers = []) {
  const wanted = new Set((layers || []).map(layer => String(layer).trim().toLowerCase()).filter(Boolean));
  const points = pointRows(db, floor).filter(point => !wanted.size || wanted.has(point.layer));
  const rows = points.map(point => pointStatus(db, point));
  const summary = rows.reduce((acc, point) => {
    acc.total += 1;
    acc[point.level] = (acc[point.level] || 0) + 1;
    acc.layers[point.layer] = (acc.layers[point.layer] || 0) + 1;
    return acc;
  }, { total: 0, ok: 0, active: 0, warn: 0, critical: 0, layers: {} });
  return { floor: normalizeCode(floor), points: rows, summary };
}

module.exports = { FLOOR_ASSETS, floorRows, pointRows, replaceFloorPoints, statusRows, typeFromCode, normalizeCode };
