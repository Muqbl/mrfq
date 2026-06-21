# Phase 4 Event Migration Result

Date: 2026-06-21

- Initial first-party event attributes: 117 actionable `onclick` attributes. The Phase 3 total of 119 also included two `img.onload` DOM property listeners, which are not HTML attributes.
- Additional out-of-inventory attribute found and removed: one `onkeydown` comment-submit handler and three `onerror` image fallbacks.
- Final first-party inline event attributes: 0.
- Converted first-party `onclick` attributes: 117.
- Remaining first-party event attributes: 0.
- Raw repository grep result: one minified line in `public/html5-qrcode.min.js`; this is self-hosted vendored code and is excluded from first-party modification.

## Workflows touched

- Field tabs, mobile navigation, side navigation, and workspace switching.
- Ticket, recurring-task, location, employee-service, hospitality, maintenance, and supervisor view transitions.
- Modal closures, propagation boundaries, notification routes, galleries, photo removal, camera completion, print windows, role changes, assignment controls, and rating controls.
- Image error fallback and Enter-to-submit comment behavior.

## Implementation boundary

All migrated controls use explicit delegated or captured listeners. Action names use an allowlist, arguments are JSON serialized and HTML escaped, renderer/scope names are independently allowlisted, and no string is evaluated as JavaScript. `eval` and `Function` remain forbidden by the security scanner.

## Regression checks

- `node --check public/app.js`: passed.
- `npm run test:security`: passed with zero first-party inline handlers.
- `npm test`: 121/121 passed.
- Source-wide first-party event-attribute scan: zero.

## Risk assessment

Security risk is materially reduced and `script-src-attr 'unsafe-inline'` can be removed. Automated backend tests do not replace a focused browser walkthrough of every migrated UI control; physical-device and full browser-matrix verification remain pending.
