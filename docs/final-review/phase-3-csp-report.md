# Phase 3 CSP Report

Date: 2026-06-19

- Initial event attributes count: 297 first-party attributes.
- Final event attributes count: 119 first-party attributes.
- Initial inline styles count: 225 first-party attributes.
- Final inline styles count: 91 first-party attributes.
- CSP before: self-hosted executable scripts; `script-src-attr 'unsafe-inline'`; inline style allowances; external Google style/font origins; bounded external QR image origin.
- CSP after: self-hosted executable scripts; `script-src-attr 'unsafe-inline'` retained; inline style allowances retained; Google style/font origins removed; bounded external QR image origin retained.
- `unsafe-inline` remains: yes.
- Reason: 119 compound event attributes and 91 inline styles remain. Removing the directives would break active legacy workflows and runtime chart/dashboard presentation.
- Executable inline script elements: blocked by `script-src 'self'` and `script-src-elem 'self'`.
- Unnecessary external script origins: none.
- Next required step: explicit delegated actions for the remaining compound handlers, component classes/typed dynamic style setters, focused browser regression, then directive removal.

CSP is reduced and more accurately scoped, but it is not fully closed.
