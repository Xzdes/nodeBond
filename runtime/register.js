const { connectToBridge } = require("../ipc/client");
const { createBridge } = require("../ipc/server");

const internalState = {
  services: {},
  id: null,
  exports: {},
};

/**
 * Регистрирует сервис в системе nodeBond
 * @param {object} config
 */
async function register(config) {
  if (!config || !config.id) {
    throw new Error("[nodeBond] Не указан ID");
  }

  const id = config.id;
  const exports = config.exports || {};
  internalState.id = id;
  internalState.exports = exports;

  // Создаём локальный мост
  const server = createBridge(id);

  server.on("data", async (msg) => {
    if (msg.call && typeof exports[msg.call] === "function") {
      const result = await exports[msg.call](...(msg.args || []));
      server.send({ responseTo: msg.call, result });
    }
  });

  // Подключаемся к hub
  const hub = connectToBridge("hub");

  // После подключения отправляем сообщение регистрации
  hub.on("connect", () => {
    hub.send({
      type: "register",
      id,
      api: Object.keys(exports),
    });
  });

  // Ждём сообщение с реестром
  hub.on("data", (msg) => {
    if (msg && msg.type === "registry") {
      console.log(`[register.js:${id}] Получен реестр:`, msg.services);

      internalState.services = msg.services || {};

      if (typeof config.onReady === "function") {
        config.onReady({ hub });
      }
    }
  });
}

module.exports = {
  register,
};
