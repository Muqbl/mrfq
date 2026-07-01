'use strict';

const ADMIN_COORDINATOR_ROLE = 'system_administrative_coordinator';

const MODULE_TEAMS = Object.freeze({
  cleaning_manager: new Set(['cleaning_supervisor', 'cleaner']),
  maintenance_manager: new Set(['maintenance_supervisor', 'maintenance_worker']),
  hospitality_manager: new Set(['hospitality_supervisor', 'hospitality_worker'])
});

const canManageGlobalUsers = role => role === 'system_admin';
const canManageModuleTeam = role => Boolean(MODULE_TEAMS[role]);
const canEditModuleRole = (role, targetRole) => Boolean(MODULE_TEAMS[role]?.has(targetRole));
const canViewExecutiveReports = role => ['system_admin', 'facility_manager'].includes(role);
const canManageSystemSettings = role => role === 'system_admin';
const canManageFacilities = role => ['system_admin', 'facility_manager'].includes(role);
const canViewUsers = role => canManageGlobalUsers(role) || canManageModuleTeam(role) || role === ADMIN_COORDINATOR_ROLE;
const canViewFacilities = role => canManageFacilities(role) || role === ADMIN_COORDINATOR_ROLE;
const canViewAuditLog = role => ['system_admin', ADMIN_COORDINATOR_ROLE].includes(role);
const canExportReports = role => [
  'system_admin',
  'facility_manager',
  'cleaning_manager',
  'cleaning_supervisor',
  'maintenance_manager',
  'maintenance_supervisor',
  ADMIN_COORDINATOR_ROLE
].includes(role);

module.exports = {
  ADMIN_COORDINATOR_ROLE,
  canManageGlobalUsers,
  canManageModuleTeam,
  canEditModuleRole,
  canViewExecutiveReports,
  canManageSystemSettings,
  canManageFacilities,
  canViewUsers,
  canViewFacilities,
  canViewAuditLog,
  canExportReports
};
