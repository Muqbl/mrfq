# Phase 5 Endurance / Load Test

Date: 2026-06-21

- Command: `LOAD_REQUESTS=3000 LOAD_CONCURRENCY=20 LOAD_DURATION_SECONDS=300 npm run test:load:endurance`
- Environment: isolated local Node process with temporary SQLite/uploads and generated temporary admin credential
- Endpoints: eight mixed authenticated/public read endpoints including health, facilities, heatmap, reports, modules, and bootstrap
- Request limit: 3000
- Concurrency: 20
- Duration safety limit: 300 seconds
- Actual duration: 0.60 seconds
- Stop reason: request limit reached
- Passed: 3000
- Failed: 0
- Error rate: 0%
- Status distribution: HTTP 200 = 3000
- p50: 3.53 ms
- p95: 7.20 ms
- p99: 8.83 ms
- Average: 3.98 ms
- Minimum: 0.27 ms
- Maximum: 13.93 ms
- Slowest endpoint by average: `/api/bootstrap` at 4.16 ms
- Runner memory snapshot: RSS 178,503,680 bytes; heap used 25,962,152 bytes; external 4,138,157 bytes

Each endpoint received 375 requests and recorded zero failures. Protected endpoints were authenticated and none were skipped.

## Scope boundary

This is a broader request-volume/concurrency verification, not a sustained 300-second endurance certification: the request cap was reached in 0.60 seconds. It uses an empty/local temporary database and loopback networking. Production TLS/network latency, representative datasets, mixed writes/uploads, multi-instance behavior, sustained memory trends, failure injection, and a time-sustained run remain pending.
