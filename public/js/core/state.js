(function (global) {
  'use strict';
  let snapshot = Object.freeze({});
  global.MRFQState = Object.freeze({
    get: () => snapshot,
    replace: value => (snapshot = Object.freeze({ ...(value || {}) }))
  });
})(window);

