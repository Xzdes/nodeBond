// bridge-client.js

const net = require('net');
const path = require('path');
const { encodeMessage, decodeMessage } = require('./protocol');

/**
 * Получает путь к сокету для подключения.
 */
function getSocketPath(name) {
  if (process.platform === 'win32') {
    return `\\\\.\\pipe\\nodebond-${name}`;
  } else {
    return path.join('/tmp', `nodebond-${name}.sock`);
  }
}

/**
 * Подключается к мосту и управляет передачей данных.
 * @param {string} name - Имя моста
 * @returns {object} Управление клиентом (send, on, once, close)
 */
function connectToBridge(name) {
  const socketPath = getSocketPath(name);
  const socket = net.createConnection(socketPath);

  const listeners = {
    data: [],
    error: [],
    close: [],
  };

  function emit(event, payload) {
    if (listeners[event]) {
      listeners[event].forEach((handler) => handler(payload));
    }
  }

  socket.on('data', (chunk) => {
    let buffer = chunk;

    while (true) {
      const result = decodeMessage(buffer);
      if (!result) break;

      buffer = result.rest;
      const message = result.message;

      emit('data', message);
    }
  });

  socket.on('error', (err) => {
    emit('error', err);
  });

  socket.on('close', () => {
    emit('close');
  });

  return {
    /**
     * Отправка сообщения. Можно ожидать ответ как промис.
     * @param {object|Buffer} data
     * @param {object} options
     */
    send(data, options = {}) {
      const { expectResponse = false, timeout = 2000 } = options;

      if (!expectResponse) {
        socket.write(encodeMessage(data));
        return;
      }

      return new Promise((resolve, reject) => {
        const isBuffer = Buffer.isBuffer(data);
        const payload = isBuffer ? data : { ...data, __expectResponse: true };
        socket.write(encodeMessage(payload));

        const timer = setTimeout(() => {
          reject(new Error('[nodeBond] Ответ не получен: таймаут'));
        }, timeout);

        this.once('data', (msg) => {
          clearTimeout(timer);
          resolve(msg);
        });
      });
    },

    /**
     * Подписка на событие (многоразовая).
     */
    on(event, handler) {
      if (listeners[event]) {
        listeners[event].push(handler);
      }
    },

    /**
     * Подписка на событие (одноразовая).
     */
    once(event, handler) {
      const wrapper = (payload) => {
        handler(payload);
        const index = listeners[event].indexOf(wrapper);
        if (index !== -1) {
          listeners[event].splice(index, 1);
        }
      };
      if (listeners[event]) {
        listeners[event].push(wrapper);
      }
    },

    /**
     * Закрытие соединения с мостом.
     */
    close() {
      socket.end();
    },
  };
}

module.exports = {
  connectToBridge,
};
