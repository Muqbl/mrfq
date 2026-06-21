# Smoke Load Test

- Command: `npm run test:smoke`
- Date: 2026-06-19
- Base URL: isolated local server at `http://127.0.0.1:3099`
- Request pattern: 5 sequential requests per endpoint; no aggressive concurrency
- Authentication: temporary environment-provided admin credential generated for the isolated run; no credential stored in source

| Endpoint | Requests | Status | Average response | Result |
|---|---:|---:|---:|---|
| `/health` | 5 | 200 | 0.66 ms | Pass |
| `/api/facilities` | 5 | 200 | 0.62 ms | Pass |
| `/api/facilities/heatmap` | 5 | 200 | 0.55 ms | Pass |
| `/api/reports/facility-manager/executive` | 5 | 200 | 0.50 ms | Pass |
| `/api/reports/facility-manager/module-comparison` | 5 | 200 | 0.45 ms | Pass |
| `/api/reports/facility-manager/heatmap-summary` | 5 | 200 | 0.54 ms | Pass |

- Overall average response: 0.55 ms.
- Failures: 0.
- Notes: This detects immediate crashes/regressions only. It is not a capacity, endurance, distributed, or production-network load test.

For an existing environment, use `BASE_URL`, `SMOKE_EMAIL`, and `SMOKE_PASSWORD`. The script never embeds a production password.

