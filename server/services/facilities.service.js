'use strict';

function facilityRows(db) {
  return db.prepare(`
    SELECT f.*,
      (SELECT COUNT(*) FROM buildings b WHERE b.facility_id=f.id AND b.deleted_at IS NULL) building_count,
      (SELECT COUNT(*) FROM buildings b JOIN floors fl ON fl.building_id=b.id
       JOIN facility_zones z ON z.floor_id=fl.id JOIN spaces s ON s.zone_id=z.id
       WHERE b.facility_id=f.id AND s.deleted_at IS NULL) space_count
    FROM facilities f WHERE f.deleted_at IS NULL ORDER BY f.name_ar
  `).all();
}

function hierarchy(db, kind, id) {
  const queries = {
    facility: `SELECT * FROM buildings WHERE facility_id=? AND deleted_at IS NULL ORDER BY name_ar`,
    building: `SELECT * FROM floors WHERE building_id=? AND deleted_at IS NULL ORDER BY level_no,name_ar`,
    floor: `SELECT * FROM facility_zones WHERE floor_id=? AND deleted_at IS NULL ORDER BY name_ar`,
    zone: `SELECT * FROM spaces WHERE zone_id=? AND deleted_at IS NULL ORDER BY name_ar`
  };
  return db.prepare(queries[kind]).all(id);
}

function getSpace(db, id) {
  return db.prepare(`
    SELECT s.*,z.name_ar zone_name_ar,z.name_en zone_name_en,
      fl.id floor_id,fl.name_ar floor_name_ar,fl.name_en floor_name_en,
      b.id building_id,b.name_ar building_name_ar,b.name_en building_name_en,
      f.id facility_id,f.name_ar facility_name_ar,f.name_en facility_name_en
    FROM spaces s JOIN facility_zones z ON z.id=s.zone_id
    JOIN floors fl ON fl.id=z.floor_id JOIN buildings b ON b.id=fl.building_id
    JOIN facilities f ON f.id=b.facility_id
    WHERE s.id=? AND s.deleted_at IS NULL
  `).get(id);
}

function spaceOverview(db, id) {
  const space = getSpace(db, id);
  if (!space) return null;
  const counts = {
    requests: db.prepare(`SELECT COUNT(*) n FROM tickets WHERE space_id=? AND deleted_at IS NULL`).get(id).n,
    reports: db.prepare(`SELECT COUNT(*) n FROM reports WHERE space_id=? AND deleted_at IS NULL`).get(id).n,
    assets: db.prepare(`SELECT COUNT(*) n FROM maintenance_assets WHERE space_id=? AND deleted_at IS NULL`).get(id).n,
    employees: db.prepare(`SELECT COUNT(*) n FROM space_assignments WHERE space_id=? AND deleted_at IS NULL`).get(id).n,
    hospitalityOrders: db.prepare(`SELECT COUNT(*) n FROM hospitality_orders WHERE space_id=? AND deleted_at IS NULL`).get(id).n
  };
  const lastCleaning = db.prepare(`SELECT MAX(created_at) at FROM reports WHERE space_id=? AND module='cleaning' AND deleted_at IS NULL`).get(id).at;
  const lastMaintenance = db.prepare(`SELECT MAX(updated_at) at FROM tickets WHERE space_id=? AND module='maintenance' AND deleted_at IS NULL`).get(id).at;
  return { space, counts, lastCleaning, lastMaintenance };
}

function spaceRequests(db, id) {
  const tickets = db.prepare(`SELECT id,reference_no,title,module,status,priority,sla_breached,created_at,updated_at FROM tickets WHERE space_id=? AND deleted_at IS NULL ORDER BY created_at DESC`).all(id);
  const hospitality = db.prepare(`SELECT id,reference_no,'hospitality' module,status,'medium' priority,sla_breached,created_at,updated_at FROM hospitality_orders WHERE space_id=? AND deleted_at IS NULL ORDER BY created_at DESC`).all(id);
  return [...tickets, ...hospitality].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
}

module.exports = { facilityRows, hierarchy, getSpace, spaceOverview, spaceRequests };

