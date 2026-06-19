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
