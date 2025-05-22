// index.js

const { createBridge } = require('./bridge-server');
const { connectToBridge } = require('./bridge-client');
const os = require('os');
const path = require('path');
const crypto = require('crypto');

const DEBUG = process.env.NODEBOND_DEBUG === '1' || process.env.NODEBOND_DEBUG === 'true';

function log(...args) {
  if (DEBUG) {
    console.log('[nodeBond DEBUG]', ...args);
  }
}

function generateBridgeName(prefix = 'auto') {
  return `${prefix}-${os.hostname()}-${process.pid}-${Date.now()}`;
}

module.exports = {
  createBridge,
  connectToBridge,

  /**
   * dual(localName, remoteName)
   * Создаёт двустороннюю связь: сервер + клиент
   */
  dual(localName, remoteName) {
    const server = createBridge(localName);
    let client = null;
    const stats = {
      sent: 0,
      received: 0,
      startTime: Date.now(),
    };

    const listeners = {
      data: [],
      error: [],
      connect: [],
      disconnect: [],
    };

    const middlewares = [];

    function emit(event, payload) {
      if (listeners[event]) {
        listeners[event].forEach((handler) => handler(payload));
      }
    }

    function applyMiddlewares(msg, finalCallback) {
      let index = 0;

      function next(modified) {
        if (index >= middlewares.length) {
          return finalCallback(modified);
        }
        const mw = middlewares[index++];
        mw(modified, next);
      }

      next(msg);
    }

    server.on('data', (msg) => {
      stats.received++;
      log('Получено на сервере:', msg);
      applyMiddlewares(msg, (finalMsg) => emit('data', finalMsg));
    });

    server.on('connect', (sock) => emit('connect', { type: 'server', socket: sock }));
    server.on('disconnect', (sock) => emit('disconnect', { type: 'server', socket: sock }));

    function tryConnect(retry = true) {
      try {
        client = connectToBridge(remoteName);

        client.on('data', (msg) => {
          stats.received++;
          log('Получено от клиента:', msg);
          applyMiddlewares(msg, (finalMsg) => emit('data', finalMsg));
        });

        client.on('connect', () => emit('connect', { type: 'client' }));
        client.on('disconnect', () => {
          emit('disconnect', { type: 'client' });
          if (retry) setTimeout(() => tryConnect(true), 1000);
        });

        client.on('error', (err) => {
          emit('error', err);
          if (retry) setTimeout(() => tryConnect(true), 1000);
        });

        log('Клиент успешно подключён к', remoteName);
      } catch (err) {
        log('Ошибка подключения:', err.message);
        if (retry) setTimeout(() => tryConnect(true), 1000);
      }
    }

    tryConnect(true);

    return {
      on(event, handler) {
        if (listeners[event]) {
          listeners[event].push(handler);
        }
      },

      once(event, handler) {
        const wrapper = (payload) => {
          handler(payload);
          const index = listeners[event].indexOf(wrapper);
          if (index !== -1) listeners[event].splice(index, 1);
        };
        if (listeners[event]) {
          listeners[event].push(wrapper);
        }
      },

      send(data, options = {}) {
        stats.sent++;
        if (client) {
          log('Отправка сообщения:', data);
          return client.send(data, options);
        } else {
          log('Клиентское соединение не установлено');
        }
      },

      sendTo(target, data, options = {}) {
        if (typeof data === 'object' && !Buffer.isBuffer(data)) {
          data.__target = target;
        }
        return this.send(data, options);
      },

      close() {
        log('Закрытие сервера и клиента...');
        server.close();
        if (client) {
          client.close();
        }
      },

      use(fn) {
        if (typeof fn === 'function') {
          middlewares.push(fn);
        }
      },

      stats() {
        const uptime = Date.now() - stats.startTime;
        return {
          messagesSent: stats.sent,
          messagesReceived: stats.received,
          memoryUsageMB: (process.memoryUsage().rss / 1024 / 1024).toFixed(2),
          uptimeMs: uptime,
        };
      },
    };
  },

  /**
   * dual.auto() — автоматическая генерация имён мостов
   */
  auto() {
    const local = generateBridgeName('local');
    const remote = generateBridgeName('remote');
    return this.dual(local, remote);
  },
};
