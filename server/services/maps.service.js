'use strict';

const crypto = require('crypto');

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
const OPERATIONAL_LAYERS = new Set(['cleaning', 'maintenance', 'hospitality', 'safety', 'cameras']);
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

function pointKindFromCode(code, layer = '') {
  const normalized = normalizeCode(code);
  const type = typeFromCode(code);
  if (layer === 'groups' || /-G\d+/i.test(normalized)) return 'group';
  if (layer === 'cameras' || type === 'CAM') return 'camera';
  if (layer === 'safety' || ['FS', 'FE', 'EXT'].includes(type)) return 'safety';
  if (['WS', 'GM', 'M'].includes(type)) return 'employee';
  if (['BR', 'WC'].includes(type)) return 'restroom';
  if (['MR'].includes(type)) return 'room';
  if (['K', 'CS', 'SR'].includes(type)) return 'location';
  return 'location';
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
    pointKind: String(raw.pointKind || raw.point_kind || pointKindFromCode(code, layer)).trim().toLowerCase() || 'location',
    type: String(raw.type || typeFromCode(code)).trim().toUpperCase(),
    x: Number.isFinite(x) ? Math.max(0, Math.min(100, x)) : 0,
    y: Number.isFinite(y) ? Math.max(0, Math.min(100, y)) : 0
  };
}

function pointRows(db, floor) {
  const normalizedFloor = normalizeCode(floor);
  return db.prepare(`
    SELECT id,floor,code,x,y,layer,type,point_kind pointKind,created_at,updated_at
    FROM map_points
    WHERE floor = ?
    ORDER BY layer, code
  `).all(normalizedFloor);
}

function tableExists(db, table) {
  return !!db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(table);
}

function wantedLayers(layers = []) {
  return new Set((layers || []).map(layer => String(layer).trim().toLowerCase()).filter(Boolean));
}

function activeLayerSet(wanted) {
  return wanted.size ? wanted : new Set(['cleaning', 'maintenance', 'hospitality', 'safety', 'cameras', 'groups']);
}

function autoCoordinate(floor, code) {
  const hash = crypto.createHash('sha1').update(`${floor}:${code}`).digest();
  const cols = 12;
  const rows = 8;
  const slot = hash[0] + (hash[1] << 8);
  const col = slot % cols;
  const row = Math.floor(slot / cols) % rows;
  const jitterX = ((hash[2] / 255) - 0.5) * 3;
  const jitterY = ((hash[3] / 255) - 0.5) * 3;
  return {
    x: Math.max(5, Math.min(95, 8 + col * (84 / (cols - 1)) + jitterX)),
    y: Math.max(7, Math.min(93, 10 + row * (78 / (rows - 1)) + jitterY))
  };
}

function layerFromModules(modules) {
  const priority = ['cleaning', 'maintenance', 'hospitality', 'safety', 'cameras', 'groups'];
  return priority.find(layer => modules.has(layer)) || 'cleaning';
}

function moduleHasActivity(module, status) {
  if (!status) return false;
  if (module === 'cleaning') return !!(status.openTickets || status.pendingReports || status.slaBreaches);
  if (module === 'maintenance') return !!(status.openTickets || status.slaBreaches);
  if (module === 'hospitality') return !!(status.openOrders || status.slaBreaches);
  if (module === 'safety' || module === 'cameras') return !!(status.down || status.slaBreaches);
  return false;
}

function operationalModules(modules, wanted = new Set()) {
  return Object.fromEntries(Object.entries(modules || {})
    .filter(([module, status]) => OPERATIONAL_LAYERS.has(module))
    .filter(([module, status]) => !wanted.size || wanted.has(module))
    .filter(([module, status]) => moduleHasActivity(module, status)));
}

function collectAutoOperationalPoints(db, floor, layers = []) {
  const normalizedFloor = normalizeCode(floor);
  const wanted = wantedLayers(layers);
  const active = activeLayerSet(wanted);
  const byCode = new Map();
  const add = (code, module) => {
    const normalizedCode = normalizeCode(code);
    if (!normalizedCode || !active.has(module)) return;
    const entry = byCode.get(normalizedCode) || new Set();
    entry.add(module);
    byCode.set(normalizedCode, entry);
  };
  const ticketModules = ['cleaning', 'maintenance', 'hospitality'].filter(module => active.has(module));
  if (ticketModules.length) {
    db.prepare(`
      SELECT DISTINCT l.id code, t.module
      FROM tickets t
      JOIN locations l ON l.id = t.location_id AND l.deleted_at IS NULL
      WHERE l.floor = ?
        AND t.deleted_at IS NULL
        AND t.status NOT IN ('completed','rejected','cancelled')
        AND t.module IN (${ticketModules.map(() => '?').join(',')})
    `).all(normalizedFloor, ...ticketModules).forEach(row => add(row.code, row.module));
  }
  const reportModules = ['cleaning', 'maintenance', 'hospitality'].filter(module => active.has(module));
  if (reportModules.length) {
    db.prepare(`
      SELECT DISTINCT l.id code, r.module
      FROM reports r
      JOIN locations l ON l.id = r.location_id AND l.deleted_at IS NULL
      WHERE l.floor = ?
        AND r.deleted_at IS NULL
        AND r.approval_status IN ('pending','pending_approval','needs_recleaning')
        AND r.module IN (${reportModules.map(() => '?').join(',')})
    `).all(normalizedFloor, ...reportModules).forEach(row => add(row.code, row.module));
  }
  if (active.has('hospitality') && tableExists(db, 'hospitality_orders')) {
    db.prepare(`
      SELECT DISTINCT l.id code
      FROM hospitality_orders h
      JOIN locations l ON l.id = h.location_id AND l.deleted_at IS NULL
      WHERE l.floor = ?
        AND h.deleted_at IS NULL
        AND h.status NOT IN ('completed','cancelled','rejected')
    `).all(normalizedFloor).forEach(row => add(row.code, 'hospitality'));
  }
  if ((active.has('maintenance') || active.has('safety') || active.has('cameras')) && tableExists(db, 'maintenance_assets')) {
    db.prepare(`
      SELECT DISTINCT l.id code, a.category, a.status
      FROM maintenance_assets a
      JOIN locations l ON l.id = a.location_id AND l.deleted_at IS NULL
      WHERE l.floor = ?
        AND a.deleted_at IS NULL
        AND lower(COALESCE(a.status,'')) IN ('down','out_of_service','needs_repair','critical')
    `).all(normalizedFloor).forEach(row => {
      const category = String(row.category || '').toLowerCase();
      if (category.includes('cam') || String(row.category || '').includes('كام')) add(row.code, 'cameras');
      else if (category.includes('fire') || String(row.category || '').includes('طف')) add(row.code, 'safety');
      else add(row.code, 'maintenance');
    });
  }
  return [...byCode.entries()].map(([code, modules]) => {
    const { x, y } = autoCoordinate(normalizedFloor, code);
    const layer = layerFromModules(modules);
    return {
      floor: normalizedFloor,
      code,
      x,
      y,
      layer,
      type: typeFromCode(code),
      source: 'auto',
      auto: true,
      visibleLayers: [...modules]
    };
  });
}

function replaceFloorPoints(db, floor, rawPoints) {
  const normalizedFloor = normalizeCode(floor);
  const points = (Array.isArray(rawPoints) ? rawPoints : [])
    .map(point => normalizePoint(point, normalizedFloor))
    .filter(point => point.floor === normalizedFloor && point.code && point.x >= 0 && point.y >= 0);
  const ts = new Date().toISOString();
  const del = db.prepare('DELETE FROM map_points WHERE floor = ?');
  const ins = db.prepare(`
    INSERT INTO map_points (floor,code,x,y,layer,type,point_kind,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?)
    ON CONFLICT(floor, code, layer) DO UPDATE SET
      x=excluded.x,
      y=excluded.y,
      type=excluded.type,
      point_kind=excluded.point_kind,
      updated_at=excluded.updated_at
  `);
  db.transaction(() => {
    del.run(normalizedFloor);
    for (const point of points) {
      ins.run(point.floor, point.code, point.x, point.y, point.layer, point.type, point.pointKind, ts, ts);
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

function spaceByCode(db, code) {
  const lookup = codeWhere('s.code', code);
  return db.prepare(`
    SELECT s.*, z.name_ar zone_name_ar, z.name_en zone_name_en,
      fl.id floor_id, fl.name_ar floor_name_ar, fl.name_en floor_name_en,
      b.id building_id, b.name_ar building_name_ar, b.name_en building_name_en,
      f.id facility_id, f.name_ar facility_name_ar, f.name_en facility_name_en
    FROM spaces s
    JOIN facility_zones z ON z.id = s.zone_id
    JOIN floors fl ON fl.id = z.floor_id
    JOIN buildings b ON b.id = fl.building_id
    JOIN facilities f ON f.id = b.facility_id
    WHERE (${lookup.clause} OR s.legacy_location_id IN (${lookup.values.map(() => '?').join(',')}))
      AND s.deleted_at IS NULL
  `).get(...lookup.values, ...lookup.values);
}

function resolveSpace(db, code) {
  const location = locationByCode(db, code);
  if (location?.space_id) return { location, spaceId: location.space_id, space: null };
  const space = spaceByCode(db, code);
  return { location, spaceId: space?.id || '', space: space || null };
}

function employeesForSpace(db, spaceId) {
  if (!spaceId) return [];
  return db.prepare(`
    SELECT DISTINCT u.id,u.name,u.username,u.role,u.employee_no,u.active
    FROM users u
    LEFT JOIN space_assignments sa ON sa.user_id = u.id AND sa.deleted_at IS NULL
    WHERE u.deleted_at IS NULL
      AND (u.space_id = ? OR sa.space_id = ?)
    ORDER BY u.name
  `).all(spaceId, spaceId).map(user => ({
    id: user.id,
    name: user.name || '',
    username: user.username || '',
    role: user.role || '',
    employeeNo: user.employee_no || '',
    active: user.active === 1 || user.active === true
  }));
}

function pointOccupants(db, floor, code) {
  if (!tableExists(db, 'map_point_occupants')) return [];
  const lookup = codeWhere('code', code);
  return db.prepare(`
    SELECT mpo.id,mpo.floor,mpo.code,mpo.user_id userId,mpo.name,mpo.occupant_type occupantType,mpo.note,
      u.username,u.role,u.employee_no employeeNo,u.active
    FROM map_point_occupants mpo
    LEFT JOIN users u ON u.id = mpo.user_id AND u.deleted_at IS NULL
    WHERE mpo.floor = ? AND ${lookup.clause} AND mpo.deleted_at IS NULL
    ORDER BY mpo.created_at, mpo.name
  `).all(normalizeCode(floor), ...lookup.values).map(row => ({
    id: row.id,
    userId: row.userId || '',
    name: row.name || '',
    occupantType: row.occupantType || 'employee',
    note: row.note || '',
    username: row.username || '',
    role: row.role || '',
    employeeNo: row.employeeNo || '',
    active: row.active === 1 || row.active === true,
    source: row.userId ? 'user' : 'free'
  }));
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
  const resolved = resolveSpace(db, point.code);
  const location = resolved.location;
  const space = resolved.space;
  const spaceId = resolved.spaceId;
  const group = !location && !space ? groupByCode(db, point.code) : null;
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
  const employees = employeesForSpace(db, spaceId);
  const occupants = pointOccupants(db, point.floor, point.code);
  const employeeRows = [
    ...employees.map(user => ({ ...user, occupantType: 'employee', source: 'user' })),
    ...occupants
  ];
  const missingLocation = !location && !space && !group;
  const pointKind = group
    ? 'group'
    : employeeRows.length
      ? 'employee'
      : point.pointKind || pointKindFromCode(point.code, point.layer);
  return {
    ...point,
    source: point.source || 'manual',
    auto: point.auto === true,
    pointKind,
    location: location ? {
      id: location.id,
      spaceId: location.space_id || '',
      nameAr: location.name_ar || '',
      nameEn: location.name_en || '',
      type: location.type || '',
      floor: location.floor || '',
      zone: location.zone || '',
      priority: location.priority || ''
    } : null,
    space: space ? {
      id: space.id,
      code: space.code || '',
      nameAr: space.name_ar || '',
      nameEn: space.name_en || '',
      legacyLocationId: space.legacy_location_id || '',
      floorId: space.floor_id || '',
      floorNameAr: space.floor_name_ar || '',
      floorNameEn: space.floor_name_en || '',
      facilityId: space.facility_id || '',
      facilityNameAr: space.facility_name_ar || '',
      facilityNameEn: space.facility_name_en || ''
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
    employees: employeeRows,
    occupants,
    level: missingLocation ? 'missing' : statusLevel(activeModules),
    missingLocation
  };
}

function statusRows(db, floor, layers = []) {
  const wanted = wantedLayers(layers);
  const manualPoints = pointRows(db, floor).map(point => ({ ...point, source: 'manual', auto: false }));
  const manualCodes = new Set(manualPoints.map(point => normalizeCode(point.code)));
  const autoPoints = collectAutoOperationalPoints(db, floor, layers)
    .filter(point => !manualCodes.has(normalizeCode(point.code)));
  const rows = [...manualPoints, ...autoPoints]
    .map(point => {
      const row = pointStatus(db, point);
      const activeOperationalModules = operationalModules(row.modules, wanted);
      const triggerLayers = point.visibleLayers || [];
      row.operationalLayers = Object.keys(activeOperationalModules);
      row.visibleLayers = row.operationalLayers;
      row.level = row.missingLocation ? 'missing' : statusLevel(activeOperationalModules);
      if (point.auto && triggerLayers.length && !row.operationalLayers.length) row.visibleLayers = triggerLayers.filter(layer => !wanted.size || wanted.has(layer));
      return row;
    });
  const summary = rows.reduce((acc, point) => {
    acc.total += 1;
    acc[point.level] = (acc[point.level] || 0) + 1;
    acc.pointKinds[point.pointKind] = (acc.pointKinds[point.pointKind] || 0) + 1;
    for (const layer of point.operationalLayers || []) {
      acc.layers[layer] = (acc.layers[layer] || 0) + 1;
    }
    acc.sources[point.source] = (acc.sources[point.source] || 0) + 1;
    return acc;
  }, { total: 0, ok: 0, active: 0, warn: 0, critical: 0, layers: {}, pointKinds: {}, sources: { manual: 0, auto: 0 } });
  return { floor: normalizeCode(floor), points: rows, summary };
}

function auditRows(db, floor) {
  const rows = pointRows(db, floor).map(point => pointStatus(db, point));
  const byPointKind = rows.reduce((acc, point) => {
    const key = point.pointKind || 'location';
    acc[key] = acc[key] || { total: 0, linked: 0, missing: 0 };
    acc[key].total += 1;
    if (point.missingLocation) acc[key].missing += 1;
    else acc[key].linked += 1;
    return acc;
  }, {});
  const missing = rows
    .filter(point => point.missingLocation)
    .map(point => ({ code: point.code, floor: point.floor, pointKind: point.pointKind || 'location', layer: point.layer, type: point.type }));
  return {
    floor: normalizeCode(floor),
    summary: {
      total: rows.length,
      linked: rows.length - missing.length,
      missing: missing.length,
      byPointKind,
      byLayer: byPointKind
    },
    missing
  };
}

function normalizeOccupants(occupants = []) {
  return (Array.isArray(occupants) ? occupants : [])
    .map(item => ({
      name: String(item?.name || '').trim().slice(0, 120),
      occupantType: String(item?.occupantType || item?.type || 'employee').trim().toLowerCase().slice(0, 40) || 'employee',
      note: String(item?.note || '').trim().slice(0, 160)
    }))
    .filter(item => item.name);
}

function assignEmployees(db, floor, code, userIds = [], occupants = []) {
  if (arguments.length === 3) {
    userIds = code;
    code = floor;
    floor = '';
  }
  const normalizedCode = normalizeCode(code);
  const normalizedFloor = normalizeCode(floor);
  const { spaceId } = resolveSpace(db, normalizedCode);
  const ids = [...new Set((Array.isArray(userIds) ? userIds : []).map(value => String(value || '').trim()).filter(Boolean))];
  const users = ids.length
    ? db.prepare(`
      SELECT id FROM users
      WHERE id IN (${ids.map(() => '?').join(',')})
        AND active = 1 AND deleted_at IS NULL
    `).all(...ids).map(row => row.id)
    : [];
  const freeOccupants = normalizeOccupants(occupants);
  if (!spaceId && !freeOccupants.length) return { error: 'SPACE_NOT_FOUND' };
  const ts = new Date().toISOString();
  db.transaction(() => {
    if (spaceId) {
      db.prepare("UPDATE space_assignments SET deleted_at = ? WHERE space_id = ? AND assignment_type = 'employee' AND deleted_at IS NULL").run(ts, spaceId);
      db.prepare("UPDATE users SET space_id = '', updated_at = ? WHERE space_id = ?").run(ts, spaceId);
      const insert = db.prepare(`
        INSERT INTO space_assignments (id,space_id,user_id,assignment_type,module,created_at,deleted_at)
        VALUES (?,?,?,?,?,?,NULL)
      `);
      const updateUser = db.prepare('UPDATE users SET space_id = ?, updated_at = ? WHERE id = ?');
      for (const userId of users) {
        insert.run(`spa-${crypto.randomBytes(6).toString('hex')}`, spaceId, userId, 'employee', '', ts);
        updateUser.run(spaceId, ts, userId);
      }
    }
    db.prepare('UPDATE map_point_occupants SET deleted_at = ?, updated_at = ? WHERE floor = ? AND code = ? AND deleted_at IS NULL')
      .run(ts, ts, normalizedFloor, normalizedCode);
    const insertOccupant = db.prepare(`
      INSERT INTO map_point_occupants (id,floor,code,user_id,name,occupant_type,note,created_at,updated_at,deleted_at)
      VALUES (?,?,?,?,?,?,?,?,?,NULL)
    `);
    for (const occupant of freeOccupants) {
      insertOccupant.run(`mpo-${crypto.randomBytes(6).toString('hex')}`, normalizedFloor, normalizedCode, '', occupant.name, occupant.occupantType, occupant.note, ts, ts);
    }
  })();
  return { spaceId, employees: [...employeesForSpace(db, spaceId), ...pointOccupants(db, normalizedFloor, normalizedCode)] };
}

module.exports = { FLOOR_ASSETS, floorRows, pointRows, replaceFloorPoints, statusRows, auditRows, assignEmployees, typeFromCode, normalizeCode };
