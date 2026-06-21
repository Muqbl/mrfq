'use strict';

const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * SameSite=Strict is the primary CSRF boundary. This second boundary rejects
 * cross-site browser requests and mismatched Origin hosts. Non-browser API
 * clients without Fetch Metadata/Origin remain supported.
 */
function isTrustedMutation(req) {
  if (!MUTATING.has(req.method)) return true;
  const fetchSite = String(req.headers['sec-fetch-site'] || '').toLowerCase();
  if (fetchSite === 'cross-site') return false;
  const origin = req.headers.origin;
  if (!origin) return true;
  try {
    const originHost = new URL(origin).host;
    return originHost === String(req.headers.host || '');
  } catch {
    return false;
  }
}

module.exports = { isTrustedMutation };

