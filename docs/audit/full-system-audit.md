# MRFQ Full System Audit

Date: 2026-06-19  
Timezone: Asia/Riyadh  
Baseline: `b0feb39` with 116 passing tests.

## Structure and architecture

The repository began as a dependency-light Node.js and SQLite prototype. Presentation lived mainly in `public/app.js` (7,060 lines) and `public/styles.css` (2,612 lines); the application/API layer lived mainly in `server.js` (3,151 lines); migrations and the data connection lived in `db.js` (619 lines). The data and HTTP boundaries were real, but routing, authorization, validation, rendering, and business rules were concentrated in three large files.

The stabilization introduces `server/config`, `server/middleware`, `server/routes`, `server/services`, `public/js/core`, `public/js/platform`, and `public/css`. The legacy entry files remain for compatibility and must continue to be reduced in later releases.

## Pages and interfaces

| Area | Interfaces found | State |
|---|---|---|
| Authentication | Login, forced password change, workspace selection | Operational |
| Employee | Service selection, cleaning request, maintenance request, hospitality cart/order, history | Operational |
| Cleaning worker | Assigned work, camera/photos, report completion | Operational |
| Cleaning supervisor | Requests, assignment, verification, team, reports, SLA | Operational |
| Cleaning manager | Dashboard, requests, reports, performance, team | Operational |
| Maintenance | Worker, supervisor, manager, work orders, assets, schedules, parts | Operational with remaining UX refinement |
| Hospitality | Employee ordering, worker flow, supervisor, manager, products, categories, kitchens | Operational with remaining kitchen-capacity refinement |
| Facility manager | Cross-module dashboard, modules, locations, facilities, reports, assets, maps | Operational foundation |
| System admin | Modules, global users, roles, settings, health/activity, facilities | Operational |
| Planned modules | Security, Safety, Visitors, Projects, Contracts | Explicitly planned; not presented as complete |

## APIs

Existing APIs cover authentication, bootstrap, users/roles, locations/zones/assignments, cleaning tickets/reports, maintenance work orders/reports/assets/schedules/parts, hospitality orders/menu/categories/kitchens, SLA, performance, events, comments, recurring tasks, CSV export, and settings.

Added platform APIs:

- Facilities hierarchy: `/api/facilities`, `/api/facilities/:id/buildings`, `/api/buildings/:id/floors`, `/api/floors/:id/zones`, `/api/zones/:id/spaces`.
- Space detail: `/api/spaces/:id/overview|requests|assets|performance`.
- Operational heatmap: `/api/facilities/heatmap`.
- Module registry: `/api/modules`.
- Supervisor, manager, and facility-manager report endpoints under `/api/reports/...`.

## Data tables

Core tables include users, roles, sessions, settings, locations, assignments, tickets, reports, photos, events, approvals, comments, recurring tasks, facilities, buildings, hospitality orders/menu/kitchens, and maintenance assets/assignees/schedules/parts.

Migration v22-v23 adds floors, facility zones, spaces, location-to-space mapping, space assignments, location metrics, module registry, `space_id` links, and synchronization triggers. Legacy `locations` remains intact.

## Roles and scope

Roles found: system admin, facility manager, cleaning manager/supervisor/worker, maintenance manager/supervisor/worker, hospitality manager/supervisor/worker, and employee. The original combined `canManageUsers` rule was ambiguous. Stabilization separates global-user, module-team, executive-report, system-setting, and facility permissions. Module managers remain limited to their module role set and module-scoped bootstrap data.

## Module status

| Module | Status | Evidence / gap |
|---|---|---|
| Cleaning | Operational reference | Complete request → assignment → work → verification → report/SLA path covered by tests |
| Maintenance | Operational | Work orders, multi-technician assignment, parts decrement, preventive schedule, verification covered by tests |
| Hospitality | Operational | Cart/order, kitchen routing, worker states, supervisor completion, menu management covered by tests |
| Facilities & Spaces | Operational foundation | Hierarchy, mapping, space overview, requests/assets/performance APIs and UI added |
| Heatmap | Operational foundation | Weighted volume/SLA/severity/recurrence/delay calculation and UI grid added |
| Assets | Partial | Maintenance assets work; broader lifecycle/QR remains future work |
| Reports | Operational foundation | Existing SLA/performance plus new role-based endpoints; PDF remains planned |
| Security / Safety / Visitors / Projects / Contracts | Planned | Registry entries explicitly report `planned` and 0 completion |

## Security findings

- Positive baseline: scrypt passwords, HttpOnly/Strict cookies, prepared statements, magic-byte image validation, size limits, session expiry, login throttling, security headers, role-scoped payloads, and event logging.
- Fixed: explicit same-origin/Fetch Metadata CSRF boundary; separated RBAC capabilities; centralized permissions; clean artifact exclusions.
- Remaining: CSP still needs inline script/style removal before `unsafe-inline` can be eliminated; rate limiting should be moved to shared/persistent storage for horizontal production scaling; upload malware scanning is not present.

## Responsive findings

The existing CSS already supported safe areas, mobile bottom navigation, tablet rules, desktop sidebar, modal adaptation, and table overflow. Automated browser inspection verified login and Facilities & Spaces at 375, 390, 430, 768, 1024, 1366, and 1440 pixels without horizontal document overflow. Full manual device testing and assistive-technology testing remain release gates.

## Linkage and facility findings

Operational requests already linked to legacy locations. The missing central Space entity was the major gap. v22-v23 preserves legacy IDs while mapping tickets, reports, hospitality orders, and maintenance assets to spaces. New inserts are synchronized by database triggers.

## Performance and file-size findings

The largest maintainability risk is parse/render scope in the three legacy monoliths. The new modules establish extraction boundaries, but further function migration is still required. SQLite and synchronous queries are appropriate for the prototype load, not yet proven for high concurrent production traffic.

## Legacy identity scan

The requested case-insensitive scan for the historical terms `REGA`, `rega`, `الهيئة`, `العقار`, and `Real Estate` returned no matches in working source files at baseline. This audit records the scan terms only as evidence. No official logo or official-party identity was found.

