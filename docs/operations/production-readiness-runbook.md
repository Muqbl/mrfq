# Production Readiness Runbook

Date: 2026-06-21

## 1. Required environment variables

| Variable | Requirement |
|---|---|
| `PORT` | Platform-provided listener port; defaults to 3000 |
| `HTTPS=true` | Required behind the production TLS proxy; enables Secure cookies, HSTS, and CSP upgrade-insecure-requests |
| `SESSION_TIMEOUT_MS` | Explicit production session lifetime |
| `DB_PATH` | Required absolute path on a persistent encrypted volume |
| `UPLOADS_PATH` | Required absolute path on a persistent uploads volume |
| `ADMIN_PASSWORD` | Required secret at first deployment; never store in source or image |
| `BACKUP_DIR` | Backup destination on a separate durable/encrypted target or mounted backup volume |
| `BACKUP_RETENTION` | Retained snapshot count; default 14 |

Demo password variables must not be used for real production users. Secrets belong in the deployment platform secret manager and must be rotated after any suspected exposure.

## 2. Health check

- Endpoint: `GET /health`.
- Expected response: HTTP 200, `status=ok`, database/storage checks `ok`.
- Probe interval target: 30 seconds; timeout 5 seconds; alert after three consecutive failures.
- A health response does not replace authenticated workflow probes.

## 3. Logging expectations

- Capture application stdout/stderr in the platform log service.
- Include timestamp, environment, release/commit identifier, route class, response status, duration, and request correlation ID where available.
- Never log cookies, passwords, photo bodies, full personal records, or secret environment values.
- Centralize security/audit events with access controls, retention, and tamper-resistant export.

## 4. Backup strategy

- Run `DB_PATH=/persistent/data.db BACKUP_DIR=/backup/mrfq scripts/backup-db.sh` on a scheduled job.
- The wrapper requires `DB_PATH`; the Node implementation uses SQLite's online backup API and applies retention.
- Store backups separately from the live volume, encrypted in transit and at rest.
- Back up the uploads volume with the same recovery point objective and keep database/upload snapshot timestamps correlated.
- Monitor job exit status, backup age, size anomalies, and destination capacity.

## 5. Restore drill

1. Select a known backup and record its checksum, timestamp, and source release.
2. Restore into an isolated non-production directory; never overwrite the live database during a drill.
3. Set temporary `DB_PATH` and `UPLOADS_PATH` values and start the matching clean package.
4. Verify `/health`, authentication, bootstrap, representative Cleaning/Maintenance/Hospitality records, photos, reports, and audit history.
5. Run `npm test`, `npm run test:security`, and authenticated smoke checks against the isolated environment.
6. Record achieved RPO/RTO, missing uploads/records, integrity errors, and operator sign-off.
7. Destroy the isolated restored copy using the approved sensitive-data procedure.

No successful restore drill was executed in Phase 4; this remains a production blocker.

## 6. Monitoring requirements

- Availability and latency for `/health`, login, bootstrap, facility/heatmap, and report endpoints.
- HTTP 4xx/5xx rates, process restarts, event-loop delay, memory/CPU, disk capacity, SQLite lock/busy errors, and backup freshness.
- CSP violation reporting, authentication/rate-limit anomalies, upload validation failures, and privilege changes.
- Synthetic role-based workflow checks from a controlled account without operational data mutation where possible.

## 7. Alerting requirements

- Page: sustained health failure, elevated 5xx, database unavailable/corrupt, disk nearly full, backup overdue/failed, or repeated process crash.
- Ticket: p95 latency regression, unusual 401/403/rate-limit spikes, CSP violations, upload rejection spike, or capacity trend.
- Every alert requires owner, severity, routing channel, acknowledgement target, escalation path, and runbook link.

## 8. Rollback process

1. Stop new deployment traffic and preserve logs/evidence.
2. Redeploy the last verified clean package and its exact configuration schema.
3. Do not roll the database backward unless migration compatibility is verified and an approved restore is required.
4. Run health, login, bootstrap, and smoke checks.
5. Confirm CSP/security headers and upload access.
6. Document incident timeline, release hashes, data impact, and follow-up actions.

## 9. Clean package deployment

1. Verify ZIP integrity and prohibited-file/identity scans.
2. Extract into a new release directory; do not deploy over the active directory.
3. Run `npm ci --omit=dev` using the lockfile.
4. Mount persistent database/uploads and inject secrets/environment settings.
5. Start one canary instance, verify health/security headers and representative workflows.
6. Shift traffic gradually, observe metrics/logs, then retire the prior release after the rollback window.

## 10. Known production blockers

- Physical iPhone/iPad/Mac Safari/Windows browser matrix remains pending.
- Sustained endurance, mixed write/upload load, production network/TLS, and representative data-volume testing remain pending.
- Monitoring/alert rules and CSP reporting are specified but not provisioned in a real production platform.
- Backup code exists, but scheduled off-host backup and a witnessed restore drill remain pending.
- Production environment, secrets, storage encryption, scaling, and operational ownership remain unverified.
- Legacy renderer/router component extraction remains incomplete.

## 11. Go/no-go checklist

- [ ] Approved physical-device/browser matrix has no blocking issue.
- [ ] Production-like endurance and write/upload load targets pass.
- [ ] Monitoring dashboards, alerts, on-call routing, and CSP reporting are live.
- [ ] Off-host backup succeeds and restore drill meets RPO/RTO.
- [ ] Production TLS, cookies, CSP, secrets, volumes, permissions, and retention are verified.
- [ ] Clean package hash and release commit are recorded.
- [ ] Rollback is rehearsed and the prior package remains available.
- [ ] Security, operations, data owner, and product owner sign off.

Until every required item is checked, unsupervised production deployment remains **not approved**.
