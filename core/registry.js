// core/registry.js

const services = {};

/**
 * Добавляет или обновляет информацию о сервисе
 * @param {string} id - Имя сервиса
 * @param {object} info - Данные: API, статус и т.п.
 */
function updateRegistry(id, info) {
  services[id] = info;
}

/**
 * Возвращает текущий реестр сервисов
 * @returns {object}
 */
function getRegistry() {
  return services;
}

/**
 * Рассылает обновление всем (заглушка для будущей реализации)
 */
function broadcastUpdate() {
  console.log("[nodeBond] Обновление реестра:", Object.keys(services));
}

module.exports = {
  updateRegistry,
  getRegistry,
  broadcastUpdate,
};
