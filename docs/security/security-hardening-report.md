# Security Hardening Report

Date: 2026-06-19

| Control | Result | Evidence / remaining work |
|---|---|---|
| Sessions | Hardened | Database sessions; HttpOnly; SameSite=Strict; Secure when HTTPS; explicit expiry |
| CSRF | Hardened foundation | Mutations reject cross-site Fetch Metadata and mismatched Origin; browser API sends a custom same-origin header |
| CSP | Inline allowances closed | Scripts and styles are self-hosted; inline elements/attributes are denied; object embedding is denied; the sole external exception is a QR image origin. |
| Rate limiting | Partial | Login/public routes throttled in process; mutating-route and distributed limiting remain production work |
| Uploads | Hardened foundation | Base64 pattern, size, count, magic bytes, generated filename, bounded path, allowed MIME types |
| Validation | Improved | Central sanitation and state machines; new platform routes validate names/IDs; schema library extraction remains future work |
| XSS | Partial | Existing `esc()` pattern and new facilities renderer escape dynamic values; legacy template audit should continue |
| SQL | Hardened | Prepared statements for values; no user-value SQL concatenation found |
| Audit | Operational | Event log captures workflow/security actions; retention and tamper-evident export remain future work |
| Secrets | Hardened | Environment variables and safe `.env.example`; runtime secrets/databases ignored and excluded from delivery |
| RBAC | Hardened | Global users, module teams, executive reports, system settings, and facilities are separate capabilities |

Production deployment must enable HTTPS, use persistent rate-limit/session infrastructure if horizontally scaled, remove CSP inline allowances, and add security monitoring and backup/restore exercises.

## Phase 4 CSP status

- Reduced and closed for inline execution: yes.
- `unsafe-inline` remains: no.
- First-party event attributes, style attributes, and CSSOM inline assignments: zero.
- Generated inline `<script>` and `<style>` fragments: zero; print styles are self-hosted.
- Attribute policies: `script-src-attr 'none'`, `style-src-attr 'none'`.
- Additional controls: `object-src 'none'`, `form-action 'self'`, and HTTPS-only `upgrade-insecure-requests`.
- External exception: `https://api.qrserver.com` is allowed only by `img-src` for facility QR images; it cannot provide scripts or styles.

Phase 4 closes CSP inline allowances. Production certification still depends on physical browser/device QA, production CSP reporting/monitoring, broader load/endurance evidence, and backup/restore validation.
