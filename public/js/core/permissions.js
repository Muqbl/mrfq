(function (global) {
  'use strict';
  const moduleTeams = Object.freeze({
    cleaning_manager: ['cleaning_supervisor', 'cleaner'],
    maintenance_manager: ['maintenance_supervisor', 'maintenance_worker'],
    hospitality_manager: ['hospitality_supervisor', 'hospitality_worker']
  });
  global.MRFQPermissions = Object.freeze({
    canManageGlobalUsers: role => role === 'system_admin',
    canManageModuleTeam: role => Boolean(moduleTeams[role]),
    canViewExecutiveReports: role => ['system_admin', 'facility_manager'].includes(role),
    canManageSystemSettings: role => role === 'system_admin',
    canManageFacilities: role => ['system_admin', 'facility_manager'].includes(role)
  });
})(window);

