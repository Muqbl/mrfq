#!/usr/bin/env node
'use strict';

const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const totalRequests = Math.max(1, Math.min(10000, Number(process.env.LOAD_REQUESTS) || 500));
const concurrency = Math.max(1, Math.min(100, Number(process.env.LOAD_CONCURRENCY) || 10));
const externalBase = process.env.BASE_URL;
const port = Number(process.env.LOAD_PORT) || 3100;
const baseUrl = externalBase || `http://127.0.0.1:${port}`;
const username = process.env.SMOKE_EMAIL || 'admin';
const password = process.env.SMOKE_PASSWORD || (externalBase ? '' : 'LocalLoadTest123!');
const endpoints = [
  '/health',
  '/api/facilities',
  '/api/facilities/heatmap',
  '/api/reports/facility-manager/executive',
  '/api/reports/facility-manager/module-comparison',
  '/api/reports/facility-manager/heatmap-summary'
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
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mrfq-basic-load-'));
  child = spawn(process.execPath, ['server.js'], {
    cwd: root,
    env: {
      ...process.env,
      PORT: String(port),
      DB_PATH: path.join(tempDir, 'load.db'),
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
  if (!response.ok) throw new Error(`Load-test login failed with ${response.status}`);
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
  const authSkipped = !cookie && endpoints.length > 1;
  const durations = [];
  const statuses = new Map();
  const perEndpoint = new Map(activeEndpoints.map(endpoint => [endpoint, { passed: 0, failed: 0 }]));
  let nextIndex = 0;
  let passed = 0;
  let failed = 0;

  async function worker() {
    while (true) {
      const index = nextIndex;
      nextIndex += 1;
      if (index >= totalRequests) return;
      const endpoint = activeEndpoints[index % activeEndpoints.length];
      const started = process.hrtime.bigint();
      let status = 'ERR';
      try {
        const response = await fetch(baseUrl + endpoint, cookie ? { headers: { Cookie: cookie } } : {});
        await response.arrayBuffer();
        status = response.status;
        if (response.status >= 200 && response.status < 400) {
          passed += 1;
          perEndpoint.get(endpoint).passed += 1;
        } else {
          failed += 1;
          perEndpoint.get(endpoint).failed += 1;
        }
      } catch {
        failed += 1;
        perEndpoint.get(endpoint).failed += 1;
      }
      durations.push(Number(process.hrtime.bigint() - started) / 1e6);
      statuses.set(String(status), (statuses.get(String(status)) || 0) + 1);
    }
  }

  const startedAt = Date.now();
  await Promise.all(Array.from({ length: concurrency }, worker));
  const elapsedMs = Date.now() - startedAt;
  durations.sort((a, b) => a - b);
  const average = durations.reduce((sum, value) => sum + value, 0) / durations.length;
  const result = {
    baseUrl,
    totalRequests,
    concurrency,
    passed,
    failed,
    p50Ms: Number(percentile(durations, 0.50).toFixed(2)),
    p95Ms: Number(percentile(durations, 0.95).toFixed(2)),
    p99Ms: Number(percentile(durations, 0.99).toFixed(2)),
    averageMs: Number(average.toFixed(2)),
    maxMs: Number((durations.at(-1) || 0).toFixed(2)),
    elapsedMs,
    requestsPerSecond: Number((totalRequests / Math.max(0.001, elapsedMs / 1000)).toFixed(2)),
    statusDistribution: Object.fromEntries(statuses),
    endpointResults: Object.fromEntries(perEndpoint),
    protectedEndpointsSkipped: authSkipped
  };
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (authSkipped) process.stderr.write('Protected endpoints skipped: provide SMOKE_EMAIL and SMOKE_PASSWORD for an external BASE_URL.\n');
  if (failed) process.exitCode = 1;
}

main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => {
  if (child) child.kill();
  if (tempDir) fs.rmSync(tempDir, { recursive: true, force: true });
});
