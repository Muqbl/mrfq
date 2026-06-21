# Three-Layer Architecture

## 1. Presentation layer

`public/` contains the Arabic-first RTL application. `public/js/core/api.js` is the new fetch boundary; permissions, routing, and state have explicit core modules. `public/js/platform/facilities.js` owns the Facilities & Spaces renderer. `public/css/app.css` is the stylesheet entry point and imports responsive design-system slices plus the compatibility stylesheet.

## 2. Application/API layer

`server.js` remains the HTTP entry and compatibility router. Extracted platform work lives under:

- `server/config/` for environment configuration.
- `server/middleware/` for security and permissions.
- `server/routes/` for platform route dispatch.
- `server/services/` for facilities, heatmap, and reports rules.

The extraction is deliberately incremental to preserve the tested cleaning, maintenance, and hospitality workflows. New functionality must be added to these directories; legacy route blocks should be moved by bounded workflow in subsequent releases.

## 3. Data layer

`db.js` owns the SQLite connection and ordered migrations. Repositories are not yet fully extracted. Migrations v22-v23 introduce the facility hierarchy and compatibility triggers. All current SQL uses prepared statements for user values.

## Dependency direction

Presentation calls HTTP APIs. Routes authenticate/authorize and delegate to services. Services query the passed database connection. The data layer does not import presentation or route code.

