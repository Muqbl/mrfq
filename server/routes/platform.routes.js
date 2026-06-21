'use strict';

const crypto = require('crypto');
const facilities = require('../services/facilities.service');
const { heatmap } = require('../services/heatmap.service');
const reports = require('../services/reports.service');
const permissions = require('../middleware/permissions');

const clean = (value, max = 100) => String(value ?? '').trim().slice(0, max);
const id = prefix => `${prefix}-${crypto.randomBytes(6).toString('hex')}`;
const moduleForRole = role => String(role).startsWith('maintenance_') ? 'maintenance' : String(role).startsWith('hospitality_') ? 'hospitality' : 'cleaning';

async function handlePlatformRoutes({ req, res, url, me, db, send, bodyJSON }) {
  const path = url.pathname;
  if (req.method === 'GET' && path === '/api/modules') {
    return send(res, 200, { modules: db.prepare('SELECT * FROM module_registry ORDER BY status, id').all() }), true;
  }
  if (req.method === 'GET' && path === '/api/facilities') {
    return send(res, 200, { facilities: facilities.facilityRows(db) }), true;
  }
  if (req.method === 'POST' && path === '/api/facilities') {
    if (!permissions.canManageFacilities(me.role)) return send(res, 403, { error: 'FORBIDDEN' }), true;
    const body = await bodyJSON(req); const nameAr = clean(body.nameAr); const nameEn = clean(body.nameEn);
    if (!nameAr && !nameEn) return send(res, 400, { error: 'MISSING_FIELDS' }), true;
    const facilityId = id('fac'); const ts = new Date().toISOString();
    db.prepare('INSERT INTO facilities (id,name_ar,name_en,active,created_at,updated_at) VALUES (?,?,?,?,?,?)').run(facilityId,nameAr,nameEn,1,ts,ts);
    return send(res, 201, { facility: db.prepare('SELECT * FROM facilities WHERE id=?').get(facilityId) }), true;
  }
  let match = path.match(/^\/api\/facilities\/([^/]+)\/buildings$/);
  if (req.method === 'GET' && match) return send(res, 200, { buildings: facilities.hierarchy(db, 'facility', clean(match[1])) }), true;
  match = path.match(/^\/api\/buildings\/([^/]+)\/floors$/);
  if (req.method === 'GET' && match) return send(res, 200, { floors: facilities.hierarchy(db, 'building', clean(match[1])) }), true;
  match = path.match(/^\/api\/floors\/([^/]+)\/zones$/);
  if (req.method === 'GET' && match) return send(res, 200, { zones: facilities.hierarchy(db, 'floor', clean(match[1])) }), true;
  match = path.match(/^\/api\/zones\/([^/]+)\/spaces$/);
  if (req.method === 'GET' && match) return send(res, 200, { spaces: facilities.hierarchy(db, 'zone', clean(match[1])) }), true;
  match = path.match(/^\/api\/spaces\/([^/]+)\/(overview|requests|assets|performance)$/);
  if (req.method === 'GET' && match) {
    const spaceId = clean(match[1]); const action = match[2]; const space = facilities.getSpace(db, spaceId);
    if (!space) return send(res, 404, { error: 'SPACE_NOT_FOUND' }), true;
    if (action === 'overview') return send(res, 200, facilities.spaceOverview(db, spaceId)), true;
    if (action === 'requests') return send(res, 200, { requests: facilities.spaceRequests(db, spaceId) }), true;
    if (action === 'assets') return send(res, 200, { assets: db.prepare('SELECT * FROM maintenance_assets WHERE space_id=? AND deleted_at IS NULL').all(spaceId) }), true;
    return send(res, 200, { metrics: db.prepare('SELECT * FROM location_metrics WHERE space_id=? ORDER BY measured_at DESC LIMIT 100').all(spaceId) }), true;
  }
  if (req.method === 'GET' && path === '/api/facilities/heatmap') {
    const filters = { facilityId:url.searchParams.get('facility_id')||'', buildingId:url.searchParams.get('building_id')||'', floorId:url.searchParams.get('floor_id')||'', module:url.searchParams.get('module')||'', from:url.searchParams.get('from')||'', to:url.searchParams.get('to')||'' };
    return send(res, 200, heatmap(db, filters)), true;
  }
  const reportRoutes = {
    '/api/reports/supervisor/daily': () => reports.supervisorDaily(db, moduleForRole(me.role)),
    '/api/reports/supervisor/team-performance': () => reports.supervisorDaily(db, moduleForRole(me.role)),
    '/api/reports/supervisor/sla': () => reports.supervisorDaily(db, moduleForRole(me.role)),
    '/api/reports/manager/operations': () => reports.managerOperations(db, moduleForRole(me.role)),
    '/api/reports/manager/performance': () => reports.managerOperations(db, moduleForRole(me.role)),
    '/api/reports/manager/monthly': () => reports.managerOperations(db, moduleForRole(me.role)),
    '/api/reports/facility-manager/executive': () => reports.executive(db),
    '/api/reports/facility-manager/cross-module-sla': () => reports.executive(db),
    '/api/reports/facility-manager/module-comparison': () => reports.executive(db),
    '/api/reports/facility-manager/heatmap-summary': () => ({ ...reports.executive(db), heatmap: heatmap(db, {}).summary })
  };
  if (req.method === 'GET' && reportRoutes[path]) {
    if (path.includes('facility-manager') && !permissions.canViewExecutiveReports(me.role)) return send(res, 403, { error: 'FORBIDDEN' }), true;
    if (path.includes('/manager/') && !['system_admin','facility_manager','cleaning_manager','maintenance_manager','hospitality_manager'].includes(me.role)) return send(res, 403, { error: 'FORBIDDEN' }), true;
    if (path.includes('/supervisor/') && !String(me.role).includes('supervisor') && !String(me.role).includes('manager') && me.role !== 'system_admin') return send(res, 403, { error: 'FORBIDDEN' }), true;
    return send(res, 200, reportRoutes[path]()), true;
  }
  return false;
}

module.exports = { handlePlatformRoutes };

