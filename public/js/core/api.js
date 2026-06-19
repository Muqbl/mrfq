(function (global) {
  'use strict';
  async function request(path, options) {
    const opt = options || {};
    const cleanPath = String(path || '').replace(/^\/?api\/?/, '/');
    const response = await fetch('/api' + cleanPath, {
      ...opt,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-MRFQ-CSRF': 'same-origin',
        ...(opt.headers || {})
      }
    });
    const text = await response.text();
    let payload = {};
    try { payload = text ? JSON.parse(text) : {}; } catch {}
    if (!response.ok) throw new Error(payload.error || 'ERROR');
    return payload;
  }
  global.MRFQApi = Object.freeze({ request });
})(window);

