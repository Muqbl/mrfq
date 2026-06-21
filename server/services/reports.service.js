'use strict';

function baseMetrics(db, module = '') {
  const clause = module ? ' AND module=?' : '';
  const args = module ? [module] : [];
  const totals = db.prepare(`SELECT COUNT(*) total,
    SUM(status IN ('submitted','assigned','accepted','diagnosing','in_progress','awaiting_parts','awaiting_vendor','awaiting_permit','on_hold','waiting_verification','reclean_required')) open,
    SUM(status='completed') completed,SUM(status='waiting_verification') waiting_verification,
    SUM(status='reclean_required') returned,SUM(sla_breached=1) sla_breaches,
    AVG(CASE WHEN completion_time_mins>0 THEN completion_time_mins END) avg_completion_mins
    FROM tickets WHERE deleted_at IS NULL${clause}`).get(...args);
  const activeWorkers = db.prepare(`SELECT COUNT(*) n FROM users WHERE active=1 AND deleted_at IS NULL AND role LIKE ?`).get(module === 'maintenance' ? 'maintenance_%' : module === 'hospitality' ? 'hospitality_%' : 'clean%').n;
  const total = Number(totals.total || 0);
  return { ...totals, active_workers: activeWorkers, sla_compliance: total ? Math.round((1 - Number(totals.sla_breaches || 0) / total) * 100) : 100 };
}

function supervisorDaily(db, module) {
  return { generated_at: new Date().toISOString(), module, metrics: baseMetrics(db, module), hot_locations: topLocations(db, module), documentation_quality: approvalQuality(db, module) };
}
function topLocations(db, module = '') {
  return db.prepare(`SELECT COALESCE(NULLIF(location_name_ar,''),location_name_en) location,COUNT(*) requests,SUM(sla_breached) breaches FROM tickets WHERE deleted_at IS NULL${module ? ' AND module=?' : ''} GROUP BY location_id ORDER BY requests DESC LIMIT 10`).all(...(module ? [module] : []));
}
function approvalQuality(db, module = '') {
  return db.prepare(`SELECT COUNT(*) total,SUM(approval_status='approved') approved,SUM(approval_status IN ('rejected','needs_recleaning')) returned FROM reports WHERE deleted_at IS NULL${module ? ' AND module=?' : ''}`).get(...(module ? [module] : []));
}
function managerOperations(db, module) {
  return { generated_at: new Date().toISOString(), module, metrics: baseMetrics(db, module), top_locations: topLocations(db, module), report_quality: approvalQuality(db, module) };
}
function executive(db) {
  const modules = ['cleaning', 'maintenance', 'hospitality'].map(module => ({ module, ...baseMetrics(db, module) }));
  return { generated_at: new Date().toISOString(), modules, overall: baseMetrics(db), top_locations: topLocations(db) };
}

module.exports = { baseMetrics, supervisorDaily, managerOperations, executive };

