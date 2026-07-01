(function (global) {
  'use strict';
  const ADMIN_COORDINATOR_ROLE = 'system_administrative_coordinator';
  const moduleTeams = Object.freeze({
    cleaning_manager: ['cleaning_supervisor', 'cleaner'],
    maintenance_manager: ['maintenance_supervisor', 'maintenance_worker'],
    hospitality_manager: ['hospitality_supervisor', 'hospitality_worker']
  });
  const canManageGlobalUsers = role => role === 'system_admin';
  const canManageModuleTeam = role => Boolean(moduleTeams[role]);
  const canManageFacilities = role => ['system_admin', 'facility_manager'].includes(role);
  global.MRFQPermissions = Object.freeze({
    ADMIN_COORDINATOR_ROLE,
    canManageGlobalUsers,
    canManageModuleTeam,
    canViewExecutiveReports: role => ['system_admin', 'facility_manager'].includes(role),
    canManageSystemSettings: role => role === 'system_admin',
    canManageFacilities,
    canViewUsers: role => canManageGlobalUsers(role) || canManageModuleTeam(role),
    canViewFacilities: role => canManageFacilities(role) || role === ADMIN_COORDINATOR_ROLE,
    canViewAuditLog: role => ['system_admin', ADMIN_COORDINATOR_ROLE].includes(role),
    canExportReports: role => [
      'system_admin',
      'facility_manager',
      'cleaning_manager',
      'cleaning_supervisor',
      'maintenance_manager',
      'maintenance_supervisor',
      ADMIN_COORDINATOR_ROLE
    ].includes(role)
  });
})(window);
