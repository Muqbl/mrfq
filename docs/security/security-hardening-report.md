# Security Hardening Report

Date: 2026-06-19

| Control | Result | Evidence / remaining work |
|---|---|---|
| Sessions | Hardened | Database sessions; HttpOnly; SameSite=Strict; Secure when HTTPS; explicit expiry |
| CSRF | Hardened foundation | Mutations reject cross-site Fetch Metadata and mismatched Origin; browser API sends a custom same-origin header |
| CSP | Reduced, partial | Executable script elements now use `script-src 'self'` without inline permission. Legacy event attributes are isolated under `script-src-attr 'unsafe-inline'`; legacy style elements/attributes still require inline permission. |
| Rate limiting | Partial | Login/public routes throttled in process; mutating-route and distributed limiting remain production work |
| Uploads | Hardened foundation | Base64 pattern, size, count, magic bytes, generated filename, bounded path, allowed MIME types |
| Validation | Improved | Central sanitation and state machines; new platform routes validate names/IDs; schema library extraction remains future work |
| XSS | Partial | Existing `esc()` pattern and new facilities renderer escape dynamic values; legacy template audit should continue |
| SQL | Hardened | Prepared statements for values; no user-value SQL concatenation found |
| Audit | Operational | Event log captures workflow/security actions; retention and tamper-evident export remain future work |
| Secrets | Hardened | Environment variables and safe `.env.example`; runtime secrets/databases ignored and excluded from delivery |
| RBAC | Hardened | Global users, module teams, executive reports, system settings, and facilities are separate capabilities |

Production deployment must enable HTTPS, use persistent rate-limit/session infrastructure if horizontally scaled, remove CSP inline allowances, and add security monitoring and backup/restore exercises.

## Phase 3 CSP status

- Reduced: yes.
- `unsafe-inline` remains: yes, in `script-src-attr`, `style-src`, `style-src-elem`, and `style-src-attr`.
- Reason: the Phase 3 baseline contained 297 first-party event attributes and 225 inline style attributes. The first safe migration batch reduced these to 119 event attributes and 91 style attributes. Removing the remaining allowances would still break compound workflow controls, charts, heatmap/dashboard presentation, and legacy modals.
- Completed in Phase 3: 178 event attributes moved to delegated explicit actions; 134 static styles moved to CSS classes; external Google font origins were removed because all fonts are self-hosted.
- Next required step: replace the remaining compound generated event attributes with workflow-specific delegated actions, migrate component-specific and typed dynamic styles, then remove `script-src-attr` and all style inline allowances. A nonce is not sufficient for event attributes.

The Phase 2 change prevents an injected inline `<script>` element from executing while preserving the legacy event-attribute compatibility boundary. CSP is not reported as fully closed.
