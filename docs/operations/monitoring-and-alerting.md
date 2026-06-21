# Monitoring and Alerting Readiness

Date: 2026-06-21

Status: specification complete; production dashboards, alert rules, notification routes, and on-call ownership are not provisioned in this local phase.

## 1. Health endpoint

`GET /health` already returns safe operational fields: HTTP health status, application version, mode, uptime seconds, timestamp, database connectivity, and storage status. It exposes no credential, session identifier, path, or secret. Probe every 30 seconds with a 5-second timeout and alert after three consecutive failures.

## 2. Required metrics

| Metric | Source / expectation |
|---|---|
| Uptime | Health response and process/runtime platform |
| Response time p95 | Reverse proxy/APM, split by route class |
| Error rate | HTTP 5xx/total, with 4xx tracked separately |
| Failed logins | Authentication security events |
| Upload failures | Validation/storage errors, without logging payloads |
| Database errors | SQLite busy/locked/connectivity/integrity events |
| Slow queries | Timed repository/service operations with sanitized labels |
| Disk usage | Database, uploads, logs and backup volumes |
| Memory usage | RSS/heap and restart/OOM events |
| CPU usage | Instance/container CPU saturation |
| Active sessions | Count only; no session identifiers |
| Request volume | Requests per minute by route class/status |
| SLA background job | Last successful execution, duration and failures |
| Backup freshness | Last success, age, size and destination capacity |
| CSP violations | Production report endpoint/collector, grouped without sensitive page data |

## 3. Alert thresholds

- Critical: health unavailable for 90 seconds; database unavailable; repeated crash/OOM; backup overdue by two schedules; disk above 90%; restore drill failure.
- High: 5xx rate above 2% for 5 minutes; p95 above 1 second for 10 minutes; SQLite busy/locked spike; uploads persistently failing.
- Warning: disk above 80%; p95 above 500 ms; suspicious failed-login/rate-limit spike; new CSP violation; backup size/freshness anomaly.
- Every rule requires a named owner, severity, paging/ticket route, acknowledgement target, escalation path and runbook link.

## 4. Log policy

- Never log passwords, reset values, session cookies, authorization values, secrets, raw image bodies, or full personal/operational records.
- Use timestamps, release commit, environment, request correlation ID, sanitized route label, status, duration and actor ID only where required by audit policy.
- Restrict log access, encrypt transport/storage, define retention and support tamper-resistant audit export.

## 5. Incident response

1. Detect and acknowledge through health/metric/security alert.
2. Triage scope, release, environment, affected roles/data and ongoing risk.
3. Contain by disabling traffic/function, rotating secrets or isolating storage as appropriate.
4. Roll back to the last verified clean package while preserving evidence.
5. Restore only from a verified backup under the approved restore procedure.
6. Verify health, security headers, authentication and representative workflows.
7. Complete post-incident review with timeline, root cause, data impact, corrective actions and owners.

Monitoring readiness remains **pending operational provisioning** until the production-like hosting environment demonstrates live metrics, alerts and contacts.
