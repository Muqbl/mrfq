'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeCode } = require('../server/services/maps.service');

test('map code normalization accepts Arabic and Persian digits', () => {
  assert.equal(normalizeCode('MF-WS-٠١'), 'MF-WS-01');
  assert.equal(normalizeCode('mf-ws-۰۲'), 'MF-WS-02');
  assert.equal(normalizeCode(' 4f–cam–03 '), '4F-CAM-03');
});
