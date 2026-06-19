'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateSpaceScore, levelFor } = require('../server/services/heatmap.service');

test('heatmap score uses volume, SLA, severity, recurrence and delay', () => {
  const result = calculateSpaceScore([
    { priority:'critical', sla_breached:1, completion_time_mins:600 },
    { priority:'high', sla_breached:1, completion_time_mins:420 },
    { priority:'medium', sla_breached:0, completion_time_mins:240 }
  ]);
  assert.ok(result.score >= 61);
  assert.ok(['hot','critical'].includes(result.level));
  assert.ok(result.reasons.includes('recurring_requests'));
  assert.ok(result.reasons.includes('sla_breaches'));
});

test('heatmap level thresholds are stable', () => {
  assert.equal(levelFor(30), 'normal');
  assert.equal(levelFor(31), 'watch');
  assert.equal(levelFor(61), 'hot');
  assert.equal(levelFor(81), 'critical');
});
