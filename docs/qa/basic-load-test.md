# Basic Load Test

Date: 2026-06-21

- Command: `LOAD_REQUESTS=500 LOAD_CONCURRENCY=10 npm run test:load:basic`
- Environment: isolated local Node process, temporary SQLite database/uploads, generated temporary admin password
- Base URL: `http://127.0.0.1:3100`
- Total requests: 500
- Concurrency: 10
- Passed: 500
- Failed: 0
- Status distribution: HTTP 200 = 500
- p50: 4.59 ms
- p95: 11.10 ms
- p99: 20.18 ms
- Average: 5.45 ms
- Maximum: 33.43 ms
- Elapsed: 276 ms
- Observed throughput: 1811.59 requests/second

| Endpoint | Requests | Passed | Failed |
|---|---:|---:|---:|
| `/health` | 84 | 84 | 0 |
| `/api/facilities` | 84 | 84 | 0 |
| `/api/facilities/heatmap` | 83 | 83 | 0 |
| `/api/reports/facility-manager/executive` | 83 | 83 | 0 |
| `/api/reports/facility-manager/module-comparison` | 83 | 83 | 0 |
| `/api/reports/facility-manager/heatmap-summary` | 83 | 83 | 0 |

The test uses `BASE_URL`, `LOAD_REQUESTS`, `LOAD_CONCURRENCY`, `SMOKE_EMAIL`, and `SMOKE_PASSWORD` when targeting an existing environment. No production credential is embedded. Without external credentials, protected endpoints are explicitly reported as skipped.

This is an initial read-path concurrency check, not a production capacity or endurance certification. It does not model distributed instances, production network/TLS latency, large operational datasets, mixed writes/uploads, sustained hours-long traffic, failure injection, or autoscaling behavior.
