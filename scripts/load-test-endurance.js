#!/usr/bin/env node
'use strict';

const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const requestLimit = Math.max(1, Math.min(100000, Number(process.env.LOAD_REQUESTS) || 3000));
const concurrency = Math.max(1, Math.min(200, Number(process.env.LOAD_CONCURRENCY) || 20));
const durationLimitSeconds = Math.max(1, Math.min(3600, Number(process.env.LOAD_DURATION_SECONDS) || 300));
const externalBase = process.env.BASE_URL;
const port = Number(process.env.LOAD_PORT) || 3101;
const baseUrl = externalBase || `http://127.0.0.1:${port}`;
const username = process.env.SMOKE_EMAIL || 'admin';
const password = process.env.SMOKE_PASSWORD || (externalBase ? '' : 'LocalEnduranceTest123!');
const endpoints = [
  '/health',
  '/api/facilities',
  '/api/facilities/heatmap',
  '/api/reports/facility-manager/executive',
  '/api/reports/facility-manager/module-comparison',
  '/api/reports/facility-manager/heatmap-summary',
  '/api/modules',
  '/api/bootstrap'
];

let child = null;
let tempDir = null;

async function waitForServer() {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try { if ((await fetch(baseUrl + '/health')).ok) return; } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error(`Server did not become ready at ${baseUrl}`);
}

async function startServer() {
  if (externalBase) return;
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mrfq-endurance-'));
  child = spawn(process.execPath, ['server.js'], {
    cwd: root,
    env: {
      ...process.env,
      PORT: String(port),
      DB_PATH: path.join(tempDir, 'endurance.db'),
      UPLOADS_PATH: path.join(tempDir, 'uploads'),
      ADMIN_PASSWORD: password,
      DEMO_ADMIN_PASSWORD: password
    },
    stdio: ['ignore', 'ignore', 'pipe']
  });
  await waitForServer();
}

async function login() {
  if (!password) return '';
  const response = await fetch(baseUrl + '/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!response.ok) throw new Error(`Endurance login failed with ${response.status}`);
  return (response.headers.get('set-cookie') || '').split(';')[0];
}

function percentile(sorted, fraction) {
  if (!sorted.length) return 0;
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * fraction) - 1)];
}

async function main() {
  await startServer();
  const cookie = await login();
  const activeEndpoints = cookie ? endpoints : ['/health'];
  const protectedEndpointsSkipped = !cookie;
  const startedAt = Date.now();
  const deadline = startedAt + durationLimitSeconds * 1000;
  const durations = [];
  const statuses = new Map();
  const endpointStats = new Map(activeEndpoints.map(endpoint => [endpoint, { durations: [], passed: 0, failed: 0, statuses: {} }]));
  let issued = 0;

  async function worker() {
    while (issued < requestLimit && Date.now() < deadline) {
      const index = issued++;
      const endpoint = activeEndpoints[index % activeEndpoints.length];
      const stat = endpointStats.get(endpoint);
      const started = process.hrtime.bigint();
      let status = 'ERR';
      try {
        const response = await fetch(baseUrl + endpoint, cookie ? { headers: { Cookie: cookie } } : {});
        await response.arrayBuffer();
        status = String(response.status);
        if (response.status >= 200 && response.status < 400) stat.passed += 1;
        else stat.failed += 1;
      } catch {
        stat.failed += 1;
      }
      const duration = Number(process.hrtime.bigint() - started) / 1e6;
      durations.push(duration);
      stat.durations.push(duration);
      stat.statuses[status] = (stat.statuses[status] || 0) + 1;
      statuses.set(status, (statuses.get(status) || 0) + 1);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));
  const elapsedMs = Date.now() - startedAt;
  durations.sort((a, b) => a - b);
  const endpointResults = {};
  for (const [endpoint, stat] of endpointStats) {
    const average = stat.durations.reduce((sum, value) => sum + value, 0) / Math.max(1, stat.durations.length);
    endpointResults[endpoint] = {
      requests: stat.durations.length,
      passed: stat.passed,
      failed: stat.failed,
      averageMs: Number(average.toFixed(2)),
      maxMs: Number((Math.max(0, ...stat.durations)).toFixed(2)),
      statuses: stat.statuses
    };
  }
  const completed = durations.length;
  const failed = Object.values(endpointResults).reduce((sum, stat) => sum + stat.failed, 0);
  const average = durations.reduce((sum, value) => sum + value, 0) / Math.max(1, completed);
  const slowestEndpoint = Object.entries(endpointResults).sort((a, b) => b[1].averageMs - a[1].averageMs)[0]?.[0] || null;
  const memory = process.memoryUsage();
  const result = {
    baseUrl,
    requestLimit,
    concurrency,
    durationLimitSeconds,
    actualDurationSeconds: Number((elapsedMs / 1000).toFixed(2)),
    stopReason: completed >= requestLimit ? 'request-limit' : 'duration-limit',
    totalRequests: completed,
    passed: completed - failed,
    failed,
    errorRatePercent: Number((failed / Math.max(1, completed) * 100).toFixed(3)),
    p50Ms: Number(percentile(durations, 0.50).toFixed(2)),
    p95Ms: Number(percentile(durations, 0.95).toFixed(2)),
    p99Ms: Number(percentile(durations, 0.99).toFixed(2)),
    averageMs: Number(average.toFixed(2)),
    minMs: Number((durations[0] || 0).toFixed(2)),
    maxMs: Number((durations.at(-1) || 0).toFixed(2)),
    statusDistribution: Object.fromEntries(statuses),
    slowestEndpoint,
    failuresByEndpoint: Object.fromEntries(Object.entries(endpointResults).map(([endpoint, stat]) => [endpoint, stat.failed])),
    runnerMemoryBytes: { rss: memory.rss, heapUsed: memory.heapUsed, external: memory.external },
    endpointResults,
    protectedEndpointsSkipped
  };
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (protectedEndpointsSkipped) process.stderr.write('Protected endpoints skipped: provide SMOKE_EMAIL and SMOKE_PASSWORD for an external BASE_URL.\n');
  if (failed) process.exitCode = 1;
}

main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => {
  if (child) child.kill();
  if (tempDir) fs.rmSync(tempDir, { recursive: true, force: true });
});
