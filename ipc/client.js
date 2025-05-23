// ipc/client.js

const net = require("net");
const path = require("path");
const { encodeMessage, decodeMessage } = require("./protocol");

function getSocketPath(name) {
  return process.platform === "win32"
    ? `\\\\.\\pipe\\nodebond-${name}`
    : path.join("/tmp", `nodebond-${name}.sock`);
}

function connectToBridge(name) {
  const socketPath = getSocketPath(name);
  const socket = net.createConnection(socketPath);

  const listeners = {
    data: [],
    error: [],
    close: [],
    connect: [],
  };

  function emit(event, payload) {
    if (listeners[event]) {
      listeners[event].forEach((handler) => handler(payload));
    }
  }

  let buffer = Buffer.alloc(0);

  socket.on("connect", () => emit("connect"));
  socket.on("error", (err) => emit("error", err));
  socket.on("close", () => emit("close"));

  socket.on("data", (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);
    while (true) {
      const result = decodeMessage(buffer);
      if (!result) break;
      buffer = result.rest;
      const message = result.message;
      emit("data", message);
    }
  });

  return {
    send(data) {
      return new Promise((resolve, reject) => {
        const payload = {
          ...data,
          __expectResponse: true
        };

        socket.write(encodeMessage(payload));

        const timer = setTimeout(() => {
          reject(new Error("Таймаут ожидания ответа"));
        }, 3000);

        this.once("data", (msg) => {
          clearTimeout(timer);
          resolve(msg);
        });
      });
    },

    on(event, handler) {
      if (listeners[event]) listeners[event].push(handler);
    },

    once(event, handler) {
      const wrapper = (...args) => {
        handler(...args);
        const index = listeners[event].indexOf(wrapper);
        if (index !== -1) listeners[event].splice(index, 1);
      };
      if (listeners[event]) listeners[event].push(wrapper);
    },

    close() {
      socket.end();
    },
  };
}

module.exports = {
  connectToBridge,
};
