'use strict';

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

module.exports = {
  canManageGlobalUsers,
  canManageModuleTeam,
  canEditModuleRole,
  canViewExecutiveReports,
  canManageSystemSettings,
  canManageFacilities
};

