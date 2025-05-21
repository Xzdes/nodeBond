// index.js

const { createBridge } = require('./bridge-server');
const { connectToBridge } = require('./bridge-client');

const DEBUG = process.env.NODEBOND_DEBUG === '1' || process.env.NODEBOND_DEBUG === 'true';

function log(...args) {
  if (DEBUG) {
    console.log('[nodeBond DEBUG]', ...args);
  }
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

    const listeners = {
      data: [],
      error: [],
      connect: [],
      disconnect: [],
    };

    function emit(event, payload) {
      if (listeners[event]) {
        listeners[event].forEach((handler) => handler(payload));
      }
    }

    // Обработка входящих сообщений с сервера
    server.on('data', (msg) => {
      log('Получено на сервере:', msg);
      emit('data', msg);
    });

    server.on('connect', (sock) => emit('connect', { type: 'server', socket: sock }));
    server.on('disconnect', (sock) => emit('disconnect', { type: 'server', socket: sock }));

    // Подключение к удалённому мосту
    function tryConnect(retry = true) {
      try {
        client = connectToBridge(remoteName);

        client.on('data', (msg) => {
          log('Получено от клиента:', msg);
          emit('data', msg);
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
      /**
       * Подписка на событие.
       */
      on(event, handler) {
        if (listeners[event]) {
          listeners[event].push(handler);
        }
      },

      /**
       * Одноразовая подписка на событие.
       */
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

      /**
       * Отправка сообщения через клиентскую часть.
       */
      send(data, options = {}) {
        if (client) {
          log('Отправка сообщения:', data);
          return client.send(data, options);
        } else {
          log('Клиентское соединение не установлено');
        }
      },

      /**
       * Отправка с указанием цели (в сообщение добавляется __target).
       */
      sendTo(target, data, options = {}) {
        if (typeof data === 'object') {
          data.__target = target;
        }
        return this.send(data, options);
      },

      /**
       * Завершение соединений.
       */
      close() {
        log('Закрытие сервера и клиента...');
        server.close();
        if (client) {
          client.close();
        }
      },
    };
  },
};
