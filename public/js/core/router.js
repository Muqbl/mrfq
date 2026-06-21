(function (global) {
  'use strict';
  const listeners = new Set();
  const router = {
    current: 'dashboard',
    navigate(view) {
      router.current = String(view || 'dashboard');
      listeners.forEach(listener => listener(router.current));
    },
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); }
  };
  global.MRFQRouter = Object.freeze(router);
})(window);

