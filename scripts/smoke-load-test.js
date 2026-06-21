#!/usr/bin/env node
'use strict';

const { spawn } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const requestCount = Math.max(1, Math.min(10, Number(process.env.SMOKE_REQUESTS) || 5));
const externalBase = process.env.BASE_URL;
const port = Number(process.env.SMOKE_PORT) || 3099;
const baseUrl = externalBase || `http://127.0.0.1:${port}`;
const username = process.env.SMOKE_EMAIL || 'admin';
const password = process.env.SMOKE_PASSWORD || (externalBase ? '' : 'SmokeTest123!');
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

async function request(endpoint, options = {}) {
  const started = process.hrtime.bigint();
  const response = await fetch(baseUrl + endpoint, options);
  await response.arrayBuffer();
  const durationMs = Number(process.hrtime.bigint() - started) / 1e6;
  return { status: response.status, durationMs };
}

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try { if ((await fetch(baseUrl + '/health')).ok) return; } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error(`Server did not become ready at ${baseUrl}`);
}

async function startServer() {
  if (externalBase) return;
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mrfq-smoke-load-'));
  child = spawn(process.execPath, ['server.js'], {
    cwd: root,
    env: {
      ...process.env,
      PORT: String(port),
      DB_PATH: path.join(tempDir, 'smoke.db'),
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
  if (!response.ok) throw new Error(`Smoke login failed with ${response.status}`);
  return (response.headers.get('set-cookie') || '').split(';')[0];
}

async function main() {
  await startServer();
  const cookie = await login();
  let failures = 0;
  const summaries = [];
  for (const endpoint of endpoints) {
    const durations = [];
    let finalStatus = 0;
    let passed = true;
    for (let index = 0; index < requestCount; index += 1) {
      const result = await request(endpoint, cookie ? { headers: { Cookie: cookie } } : {});
      finalStatus = result.status;
      durations.push(result.durationMs);
      if (result.status < 200 || result.status >= 400) passed = false;
    }
    if (!passed) failures += 1;
    const averageMs = durations.reduce((sum, value) => sum + value, 0) / durations.length;
    const summary = { endpoint, status: finalStatus, requests: requestCount, averageMs: Number(averageMs.toFixed(2)), result: passed ? 'PASS' : 'FAIL' };
    summaries.push(summary);
    process.stdout.write(`${endpoint}\t${finalStatus}\t${summary.averageMs} ms avg\t${summary.result}\n`);
  }
  const overallAverage = summaries.reduce((sum, item) => sum + item.averageMs, 0) / summaries.length;
  process.stdout.write(`Overall average: ${overallAverage.toFixed(2)} ms; failures: ${failures}\n`);
  if (failures) process.exitCode = 1;
}

main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => {
  if (child) child.kill();
  if (tempDir) fs.rmSync(tempDir, { recursive: true, force: true });
});

