'use strict';

const path = require('path');

module.exports = Object.freeze({
  port: Number.parseInt(process.env.PORT, 10) || 3000,
  https: process.env.HTTPS === 'true',
  sessionTimeoutMs: Number.parseInt(process.env.SESSION_TIMEOUT_MS, 10) || 7_200_000,
  dbPath: process.env.DB_PATH || path.resolve(__dirname, '../../data.db'),
  uploadsPath: process.env.UPLOADS_PATH || path.resolve(__dirname, '../../uploads')
});

