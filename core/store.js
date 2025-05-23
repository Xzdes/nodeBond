// core/store.js

const watchers = {};
const store = {};

/**
 * Устанавливает значение переменной и уведомляет подписчиков
 * @param {string} key
 * @param {any} value
 */
function set(key, value) {
  store[key] = value;

  if (watchers[key]) {
    for (const cb of watchers[key]) {
      cb(value);
    }
  }
}

/**
 * Получает значение переменной
 * @param {string} key
 * @returns {any}
 */
function get(key) {
  return store[key];
}

/**
 * Подписка на изменение переменной
 * @param {string} key
 * @param {Function} callback
 */
function watch(key, callback) {
  if (!watchers[key]) {
    watchers[key] = [];
  }
  watchers[key].push(callback);
}

module.exports = {
  set,
  get,
  watch,
};
