// ipc/server.js

const net = require("net");
const path = require("path");
const fs = require("fs");
const { encodeMessage, decodeMessage } = require("./protocol");

/**
 * Получает путь к сокету по имени моста
 * @param {string} name
 * @returns {string}
 */
function getSocketPath(name) {
  if (process.platform === "win32") {
    return `\\\\.\\pipe\\nodebond-${name}`;
  } else {
    return path.join("/tmp", `nodebond-${name}.sock`);
  }
}

/**
 * Создаёт IPC-мост (локальный сокет-сервер)
 * @param {string} name - имя моста
 * @param {object} [options] - настройки
 * @returns {object} API управления мостом
 */
function createBridge(name, options = {}) {
  const socketPath = getSocketPath(name);
  const clients = new Set();
  const listeners = {
    data: [],
    error: [],
    connect: [],
    disconnect: [],
    client: [],
  };

  const server = net.createServer((socket) => {
    clients.add(socket);
    emit("connect", socket);
    emit("client", socket);

    let buffer = Buffer.alloc(0);

    socket.on("data", (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);

      while (true) {
        const result = decodeMessage(buffer);
        if (!result) break;

        buffer = result.rest;
        const message = result.message;

        // Важно: больше не отправляем автоматический ack
        emit("data", message, socket);
      }
    });

    socket.on("close", () => {
      clients.delete(socket);
      emit("disconnect", socket);
    });

    socket.on("error", (err) => {
      emit("error", err);
    });
  });

  tryListen(socketPath);

  function tryListen(path) {
    server.listen(path, () => {
      console.log(`[nodeBond] Мост '${name}' запущен на ${path}`);
      if (options.secure && process.platform !== "win32") {
        try {
          fs.chmodSync(path, 0o600);
        } catch (err) {
          console.warn("[nodeBond] Не удалось установить права на сокет:", err.message);
        }
      }
    });

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        try {
          fs.unlinkSync(path);
          server.listen(path);
        } catch (unlinkErr) {
          console.error("[nodeBond] Не удалось очистить старый сокет:", unlinkErr.message);
        }
      } else {
        console.error("[nodeBond] Ошибка IPC:", err.message);
      }
    });
  }

  function emit(event, ...args) {
    if (listeners[event]) {
      for (const fn of listeners[event]) {
        fn(...args);
      }
    }
  }

  return {
    /**
     * Подписка на событие: data, client, error, disconnect
     */
    on(event, handler) {
      if (listeners[event]) listeners[event].push(handler);
    },

    /**
     * Подписка один раз
     */
    once(event, handler) {
      const wrapper = (...args) => {
        handler(...args);
        const index = listeners[event].indexOf(wrapper);
        if (index !== -1) listeners[event].splice(index, 1);
      };
      if (listeners[event]) listeners[event].push(wrapper);
    },

    /**
     * Отправка сообщения всем подключенным
     */
    send(data) {
      const buffer = encodeMessage(data);
      for (const socket of clients) {
        if (socket.writable) {
          socket.write(buffer);
        }
      }
    },

    /**
     * Завершение моста
     */
    close() {
      for (const socket of clients) {
        socket.destroy();
      }
      server.close(() => {
        if (fs.existsSync(socketPath)) {
          try {
            fs.unlinkSync(socketPath);
          } catch (err) {
            console.error("[nodeBond] Не удалось удалить сокет:", err.message);
          }
        }
      });
    },
  };
}

module.exports = {
  createBridge,
};
