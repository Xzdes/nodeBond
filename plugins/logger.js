// plugins/logger.js

/**
 * Плагин логгирования вызовов экспортированных функций
 * @param {object} options - настройки плагина
 * @param {string} [options.prefix] - префикс в логах
 * @returns {Function} плагин
 */
function loggerPlugin(options = {}) {
  const logPrefix = options.prefix || "[nodeBond:LOG]";

  return function attach(context) {
    const { id, exports } = context;

    for (const key of Object.keys(exports)) {
      const originalFn = exports[key];
      if (typeof originalFn === "function") {
        exports[key] = async (...args) => {
          console.log(logPrefix, id + "." + key, "args:", args);
          const result = await originalFn(...args);
          console.log(logPrefix, id + "." + key, "→", result);
          return result;
        };
      }
    }
  };
}

module.exports = {
  loggerPlugin,
};
