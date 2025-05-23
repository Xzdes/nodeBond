// runtime/call.js

const { connectToBridge } = require("../ipc/client");
const { getRegistry } = require("../core/registry");
const { enqueueCall, flushQueue } = require("../core/queue");

const clients = {}; // Кэш подключений к сервисам

/**
 * Вызывает функцию у другого сервиса
 * @param {string} path - В виде "service.method"
 * @param  {...any} args - Аргументы
 * @returns {Promise<any>}
 */
async function call(path, ...args) {
  const [service, method] = path.split(".");
  if (!service || !method) {
    throw new Error("[nodeBond] Неверный путь вызова: должен быть 'service.method'");
  }

  if (!clients[service]) {
    try {
      const client = connectToBridge(service);

      client.on("connect", () => {
        flushQueue(service, client.send.bind(client));
      });

      clients[service] = client;
    } catch (e) {
      // не удалось подключиться — вызов попадёт в очередь ниже
    }
  }

  const client = clients[service];

  if (!client) {
    return new Promise((resolve, reject) => {
      enqueueCall(service, {
        message: {
          call: method,
          args,
          __expectResponse: true,
        },
        resolve,
        reject,
      });
    });
  }

  try {
    const response = await client.send({
      call: method,
      args,
      __expectResponse: true,
    });

    return response?.result;
  } catch (e) {
    return new Promise((resolve, reject) => {
      enqueueCall(service, {
        message: {
          call: method,
          args,
          __expectResponse: true,
        },
        resolve,
        reject,
      });
    });
  }
}

module.exports = {
  call,
};
