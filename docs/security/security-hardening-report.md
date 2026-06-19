# Security Hardening Report

Date: 2026-06-19

| Control | Result | Evidence / remaining work |
|---|---|---|
| Sessions | Hardened | Database sessions; HttpOnly; SameSite=Strict; Secure when HTTPS; explicit expiry |
| CSRF | Hardened foundation | Mutations reject cross-site Fetch Metadata and mismatched Origin; browser API sends a custom same-origin header |
| CSP | Partial | Restrictive default, frame, base, image, font and connection directives; inline handlers/styles still require temporary `unsafe-inline` |
| Rate limiting | Partial | Login/public routes throttled in process; mutating-route and distributed limiting remain production work |
| Uploads | Hardened foundation | Base64 pattern, size, count, magic bytes, generated filename, bounded path, allowed MIME types |
| Validation | Improved | Central sanitation and state machines; new platform routes validate names/IDs; schema library extraction remains future work |
| XSS | Partial | Existing `esc()` pattern and new facilities renderer escape dynamic values; legacy template audit should continue |
| SQL | Hardened | Prepared statements for values; no user-value SQL concatenation found |
| Audit | Operational | Event log captures workflow/security actions; retention and tamper-evident export remain future work |
| Secrets | Hardened | Environment variables and safe `.env.example`; runtime secrets/databases ignored and excluded from delivery |
| RBAC | Hardened | Global users, module teams, executive reports, system settings, and facilities are separate capabilities |

Production deployment must enable HTTPS, use persistent rate-limit/session infrastructure if horizontally scaled, remove CSP inline allowances, and add security monitoring and backup/restore exercises.

