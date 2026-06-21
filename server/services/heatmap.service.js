'use strict';

const clamp = value => Math.max(0, Math.min(100, Math.round(value)));
const levelFor = score => score <= 30 ? 'normal' : score <= 60 ? 'watch' : score <= 80 ? 'hot' : 'critical';
const priorityWeight = priority => ({ low: 10, medium: 35, high: 70, urgent: 100, critical: 100 }[priority] || 35);

function calculateSpaceScore(rows) {
  if (!rows.length) return { score: 0, level: 'normal', reasons: [] };
  const countScore = clamp(rows.length * 12.5);
  const breached = rows.filter(r => Number(r.sla_breached) === 1).length;
  const slaScore = clamp((breached / rows.length) * 100);
  const severityScore = clamp(rows.reduce((sum, r) => sum + priorityWeight(r.priority), 0) / rows.length);
  const recurringScore = clamp(Math.max(0, rows.length - 1) * 25);
  const delays = rows.map(r => Number(r.completion_time_mins || r.response_time_mins || 0));
  const delayScore = clamp(delays.reduce((a, b) => a + b, 0) / Math.max(1, delays.length) / 4.8);
  const score = clamp(countScore * .25 + slaScore * .25 + severityScore * .20 + recurringScore * .15 + delayScore * .15);
  const reasons = [];
  if (rows.length > 1) reasons.push('recurring_requests');
  if (slaScore > 0) reasons.push('sla_breaches');
  if (severityScore >= 60) reasons.push('high_priority');
  if (delayScore >= 50) reasons.push('long_resolution_time');
  return { score, level: levelFor(score), reasons };
}

function heatmap(db, filters = {}) {
  const where = [`t.deleted_at IS NULL`];
  const values = [];
  if (filters.module) { where.push('t.module=?'); values.push(filters.module); }
  if (filters.from) { where.push('t.created_at>=?'); values.push(filters.from); }
  if (filters.to) { where.push('t.created_at<=?'); values.push(filters.to); }
  const spaces = db.prepare(`
    SELECT s.id space_id,s.name_ar,s.name_en,f.id facility_id,f.name_ar facility,
      b.id building_id,b.name_ar building,fl.id floor_id,fl.name_ar floor
    FROM spaces s JOIN facility_zones z ON z.id=s.zone_id JOIN floors fl ON fl.id=z.floor_id
    JOIN buildings b ON b.id=fl.building_id JOIN facilities f ON f.id=b.facility_id
    WHERE s.deleted_at IS NULL
      AND (?='' OR f.id=?) AND (?='' OR b.id=?) AND (?='' OR fl.id=?)
    ORDER BY f.name_ar,b.name_ar,fl.level_no,s.name_ar
  `).all(filters.facilityId || '', filters.facilityId || '', filters.buildingId || '', filters.buildingId || '', filters.floorId || '', filters.floorId || '');
  const ticketStmt = db.prepare(`SELECT module,priority,sla_breached,response_time_mins,completion_time_mins FROM tickets t WHERE t.space_id=? AND ${where.join(' AND ')}`);
  const hospitalityStmt = db.prepare(`SELECT 'hospitality' module,'medium' priority,sla_breached,NULL response_time_mins,
    CASE WHEN completed_at IS NOT NULL THEN CAST((julianday(completed_at)-julianday(created_at))*1440 AS INTEGER) ELSE NULL END completion_time_mins
    FROM hospitality_orders WHERE space_id=? AND deleted_at IS NULL
      AND (?='' OR ?='hospitality') AND (?='' OR created_at>=?) AND (?='' OR created_at<=?)`);
  const locations = spaces.map(space => {
    const rows = ticketStmt.all(space.space_id, ...values);
    rows.push(...hospitalityStmt.all(space.space_id, filters.module || '', filters.module || '', filters.from || '', filters.from || '', filters.to || '', filters.to || ''));
    const modules = {};
    for (const module of ['cleaning', 'maintenance', 'hospitality']) modules[module] = calculateSpaceScore(rows.filter(r => r.module === module)).score;
    const result = calculateSpaceScore(rows);
    return { ...space, module_scores: modules, heat_score: result.score, level: result.level, reasons: result.reasons };
  });
  const summary = { normal: 0, watch: 0, hot: 0, critical: 0 };
  locations.forEach(item => { summary[item.level] += 1; });
  return { period: { from: filters.from || null, to: filters.to || null }, filters, summary, locations };
}

module.exports = { calculateSpaceScore, levelFor, heatmap };
