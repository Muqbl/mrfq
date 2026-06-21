# Production Environment Verification

Date: 2026-06-21

Status: **Pending production-like environment execution.** Local/package evidence is recorded separately and must not be treated as hosting certification.

| Check | Status | Required evidence / note |
|---|---|---|
| Node version | Pending | Capture `node --version` from deployed runtime; application requires Node 20+ |
| npm version | Pending | Capture `npm --version` from build/runtime image |
| OS/runtime | Pending | Record image/OS, architecture, region and runtime/container identifier |
| Environment variables | Pending | Approved variable inventory with no values exposed |
| `SESSION_SECRET` present | N/A / review | Current design uses cryptographically random database-backed session IDs, not a signing secret; security owner must approve this design or require an explicit secret |
| Secure cookie enabled | Pending | Verify `Secure`, `HttpOnly`, `SameSite=Strict` over the real HTTPS endpoint |
| HTTPS enabled | Pending | TLS certificate/redirect/proxy verification; set `HTTPS=true` |
| Database path externalized | Pending | `DB_PATH` on persistent encrypted storage |
| Upload directory externalized | Pending | `UPLOADS_PATH` on persistent encrypted storage |
| Logs externalized | Pending | Central log destination and retention/access policy |
| Backup directory externalized | Pending | Separate encrypted/off-host `BACKUP_DIR` |
| Health endpoint reachable | Pending | External probe of `/health` and alert evidence |
| CSP header present | Local pass / production pending | Automated local header test passes; capture real response headers |
| No `unsafe-inline` | Local pass / production pending | Runtime code/package scan passes; verify deployed header |
| No `.env` in package | Pass | Clean-package prohibited scan returns zero |
| No runtime DB in package | Pass | Clean-package prohibited scan returns zero |
| No Git metadata in package | Pass | Clean-package prohibited scan returns zero |
| Railway/hosting variables configured | Pending | Hosting console/export reviewed without secret disclosure |
| Rollback plan documented | Pass | `production-readiness-runbook.md` |
| Backup restore tested | Local pass / production pending | Local isolated drill passed; off-host production-like restore remains pending |
| Monitoring configured | Pending | Live dashboards/metrics/CSP reporting evidence |
| Alert contacts configured | Pending | Named owner, on-call route, escalation and acknowledgement test |

## Verification procedure

1. Deploy the exact verified clean-package hash to a production-like isolated environment.
2. Record runtime/version/configuration metadata without secret values.
3. Verify TLS, cookies, CSP/security headers, persistent storage and external probes.
4. Run authenticated smoke and approved load tests against that environment.
5. Trigger test alerts and verify acknowledgement/escalation.
6. Execute an off-host backup and isolated restore including correlated uploads; record RPO/RTO.
7. Attach evidence and obtain security, operations, data owner and product owner sign-off.

Production environment verification is incomplete; unsupervised production deployment remains not approved.
