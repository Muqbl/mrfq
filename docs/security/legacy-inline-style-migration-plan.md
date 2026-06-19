# Legacy Inline Style Migration Plan

Date: 2026-06-19

Initial count: 225 first-party inline style attributes in `public/app.js` (218 matching source lines).

| File | Count | Style Purpose | Can Convert To Class | Target Class | Risk | Status |
|---|---:|---|---|---|---|---|
| `public/app.js` | 88+ | Repeated margins, spacing, muted labels, typography | Yes | `u-mt-*`, `u-mb-*`, `text-*`, `layout-*` | Low | Convert first |
| `public/app.js` | 45+ | Flex/grid alignment, visibility, empty states | Yes | `layout-*`, `is-hidden`, `is-visible` | Low | Convert first |
| `public/app.js` | 30+ | Fixed image, icon, spinner, and success-state dimensions | Yes | Semantic size/state classes | Low | Convert after utility batch |
| `public/app.js` | ~35 | Runtime percentage widths/heights and chart bars | Not directly | Typed CSS custom-property/class API | Medium | Document until renderer-specific migration |
| `public/app.js` | ~20 | Runtime theme/status colors and borders | Partly | `status-normal`, `status-watch`, `status-hot`, `status-critical` plus semantic variants | Medium | Convert bounded enums; leave calculated colors documented |
| `public/app.js` | 3 | Mobile navigation item count custom property | Not directly | Layout modifier or typed custom-property setter | Medium | Retain temporarily |

Required shared classes include `is-hidden`, `is-visible`, `is-loading`, `is-disabled`, status level classes, and compact/expanded layout modifiers. Static declarations will be removed in bulk only when the generated markup remains visually equivalent. Dynamic styles remain explicit and documented rather than converted to arbitrary class names.
