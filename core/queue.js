// core/queue.js

const pendingCalls = {};

/**
 * Добавляет вызов в очередь
 * @param {string} service - имя сервиса
 * @param {object} callData - данные вызова: message, resolve, reject
 */
function enqueueCall(service, callData) {
  if (!pendingCalls[service]) {
    pendingCalls[service] = [];
  }
  pendingCalls[service].push(callData);
}

/**
 * Возвращает очередь по сервису
 * @param {string} service
 * @returns {Array}
 */
function getQueue(service) {
  return pendingCalls[service] || [];
}

/**
 * Выполняет все вызовы из очереди
 * @param {string} service
 * @param {Function} sender - функция client.send
 */
async function flushQueue(service, sender) {
  const queue = getQueue(service);
  for (const call of queue) {
    try {
      const result = await sender(call.message);
      if (call.resolve) call.resolve(result);
    } catch (err) {
      if (call.reject) call.reject(err);
    }
  }
  pendingCalls[service] = [];
}

module.exports = {
  enqueueCall,
  getQueue,
  flushQueue,
};
