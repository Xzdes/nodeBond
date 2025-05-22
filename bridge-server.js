// bridge-server.js

const net = require('net');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { encodeMessage, decodeMessage } = require('./protocol');

/**
 * Генерирует путь до сокета, зависящий от операционной системы.
 * @param {string} name - Имя канала/моста
 * @returns {string} - Путь к Unix socket или Named Pipe
 */
function getSocketPath(name) {
  if (process.platform === 'win32') {
    return `\\\\.\\pipe\\nodebond-${name}`;
  } else {
    return path.join('/tmp', `nodebond-${name}.sock`);
  }
}

/**
 * Создаёт серверный IPC-мост, позволяющий принимать подключения и обмениваться сообщениями.
 * @param {string} name - Имя моста (уникальное на машине)
 * @param {object} [options] - Дополнительные параметры
 * @param {boolean} [options.secure] - Установить права 0o600 на Unix
 * @param {boolean} [options.temp] - Временный мост: удаляется при закрытии
 * @returns {object} API управления мостом: on, once, send, close
 */
function createBridge(name, options = {}) {
  const socketPath = getSocketPath(name);
  const clients = new Set();
  const listeners = {
    data: [],
    error: [],
    connect: [],
    disconnect: [],
  };

  const server = net.createServer((socket) => {
    clients.add(socket);
    emit('connect', socket);

    let buffer = Buffer.alloc(0);

    socket.on('data', (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);

      while (true) {
        const result = decodeMessage(buffer);
        if (!result) break;

        buffer = result.rest;
        const message = result.message;

        emit('data', message);

        if (socket.writable && message?.__expectResponse) {
          const reply = {
            ack: true,
            received: message,
          };
          socket.write(encodeMessage(reply));
        }
      }
    });

    socket.on('close', () => {
      clients.delete(socket);
      emit('disconnect', socket);
    });

    socket.on('error', (err) => {
      emit('error', err);
    });
  });

  tryListen(socketPath);

  /**
   * Пробует слушать сокет. Если сокет занят, пробует удалить и пересоздать.
   */
  function tryListen(path) {
    server.listen(path, () => {
      console.log(`[nodeBond] Мост '${name}' запущен на ${path}`);
      if (options.secure && process.platform !== 'win32') {
        try {
          fs.chmodSync(path, 0o600); // Только текущий пользователь
        } catch (err) {
          console.warn('[nodeBond] Не удалось установить безопасные права:', err.message);
        }
      }
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`[nodeBond] Сокет занят: ${path}`);
        try {
          fs.unlinkSync(path);
          console.log('[nodeBond] Старый сокет удалён. Повторный запуск...');
          server.listen(path);
        } catch (unlinkErr) {
          console.error('[nodeBond] Не удалось удалить занятый сокет:', unlinkErr.message);
        }
      } else {
        console.error('[nodeBond] Ошибка сервера:', err.message);
      }
    });
  }

  /**
   * Вызывает всех подписчиков события.
   */
  function emit(event, payload) {
    if (listeners[event]) {
      listeners[event].forEach((handler) => handler(payload));
    }
  }

  return {
    /**
     * Подписка на событие (многоразовая).
     * @param {string} event - Название события
     * @param {Function} handler - Обработчик
     */
    on(event, handler) {
      if (listeners[event]) {
        listeners[event].push(handler);
      }
    },

    /**
     * Подписка на событие (одноразовая).
     * @param {string} event - Название события
     * @param {Function} handler - Обработчик
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
     * Отправляет сообщение всем подключённым клиентам.
     * @param {object|Buffer} data - Данные для отправки
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
     * Завершает работу сервера и удаляет сокет.
     */
    close() {
      for (const socket of clients) {
        socket.destroy();
      }

      server.close(() => {
        if (fs.existsSync(socketPath)) {
          try {
            fs.unlinkSync(socketPath);
            console.log('[nodeBond] Сокет удалён при закрытии');
          } catch (err) {
            console.error('[nodeBond] Не удалось удалить сокет при закрытии:', err.message);
          }
        }
      });
    },
  };
}

module.exports = {
  createBridge,
};
