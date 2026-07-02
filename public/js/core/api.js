(function (global) {
  'use strict';
  async function request(path, options) {
    const opt = options || {};
    const cleanPath = String(path || '').replace(/^\/?api\/?/, '/');
    const timeoutMs = Number.isFinite(opt.timeoutMs) ? opt.timeoutMs : 20000;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const { timeoutMs: _timeoutMs, signal: _signal, ...fetchOptions } = opt;
    try {
      const response = await fetch('/api' + cleanPath, {
        ...fetchOptions,
        signal: controller.signal,
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
    } catch (error) {
      if (error && error.name === 'AbortError') throw new Error('REQUEST_TIMEOUT');
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
  global.MRFQApi = Object.freeze({ request });
})(window);
