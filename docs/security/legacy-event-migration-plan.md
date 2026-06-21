# Legacy Event Attribute Migration Plan

Date: 2026-06-19

Baseline: 297 first-party event attributes in `public/app.js` (288 click, 6 change, 1 input, 2 load). The literal repository grep reports 279 matching lines, including one minified vendor line. `public/html5-qrcode.min.js` is self-hosted third-party code and is excluded from first-party remediation.

| File | Count | Event Type | Current Pattern | Target Pattern | Risk | Migration Status |
|---|---:|---|---|---|---|---|
| `public/app.js` | 288 | `click` | Generated `onclick` function calls, modal closes, view switches, and a small number of compound statements | Delegated `data-action` plus escaped `data-*` arguments | Medium; broad workflow surface | Inventory complete; migrate low-risk buttons first |
| `public/app.js` | 6 | `change` | Select/file/checkbox handlers | Delegated `change` listener and typed actions | Low | Inventory complete |
| `public/app.js` | 1 | `input` | Filter/search action | Delegated `input` listener | Low | Inventory complete |
| `public/app.js` | 2 | `load` | Generated image fallback behavior | Explicit image listener or safe CSS fallback | Medium | Inventory complete |
| `public/html5-qrcode.min.js` | 5 string occurrences | click/load | Vendored minified implementation strings | Keep vendored file unchanged; constrain with self-hosted CSP | Third-party maintenance risk | Excluded and documented |

Migration order:

1. Simple buttons and modal-close actions.
2. Filters, inputs, selects, and file controls.
3. Tabs, navigation, and workspace switches.
4. Modal and overlay actions.
5. Simple form actions.
6. Compound state mutations, camera/QR flows, and printable-window controls after focused regression verification.

Rules:

- Preserve appearance and workflow behavior.
- Escape all API/DB/user values before insertion into `data-*` attributes.
- Prefer explicit action dispatch; do not use `eval`, `Function`, or executable handler strings.
- Leave risky items documented rather than introducing a generic code interpreter.

## Phase 3 migration result

- Initial first-party attribute count: 297.
- Final first-party attribute count after the safe migration batch: 119.
- Converted count: 178 (59.9%).
- Remaining count: 119 (`onclick`: 117, `onload`: 2).
- `onchange`, `oninput`, `onsubmit`, and `onkeyup` remaining: 0.
- Literal repository grep after migration: 115 matching lines, including the single minified vendor line; multiple attributes can exist on one source line.

The converted batch covers 171 simple click calls plus seven input/change controls. Click actions use a delegated listener, an explicit function-name allowlist, JSON-encoded arguments, and HTML escaping. Input/change controls use explicit named actions. No executable strings, `eval`, or `Function` constructor were introduced.

The remaining first-party items are compound state mutations, propagation-dependent controls, dynamic action fragments, generated image fallback handlers, camera/gallery flows, and printable-window controls. Converting these safely requires explicit workflow-specific actions and browser regression coverage. They remain intentionally documented rather than being routed through a generic JavaScript-string interpreter.
