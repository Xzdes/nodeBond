// ipc/client.js
const net = require("net");
const path = require("path");
const { encodeMessage, decodeMessage } = require("./protocol");
const EventEmitter = require("events");

function getSocketPath(name) {
  return process.platform === "win32"
    ? `\\\\.\\pipe\\nodebond-${name}`
    : path.join("/tmp", `nodebond-${name}.sock`);
}

let _requestIdCounter = 0;

function connectToBridge(name, options = {}) {
  const socketPath = getSocketPath(name);
  const socket = net.createConnection(socketPath);
  const emitter = new EventEmitter();
  const inflightRequests = new Map();
  let buffer = Buffer.alloc(0);

  socket.on("connect", () => {
    if (options.token) {
      socket.write(encodeMessage({ type: "handshake", token: options.token }));
    }
    emitter.emit("connect");
  });

  socket.on("data", (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);
    while (true) {
      const result = decodeMessage(buffer);
      if (!result) break;
      buffer = result.rest;
      const msg = result.message;

      if (msg.__requestId !== undefined && inflightRequests.has(msg.__requestId)) {
        const pending = inflightRequests.get(msg.__requestId);
        clearTimeout(pending.timer);
        inflightRequests.delete(msg.__requestId);
        if (msg.error) pending.reject(new Error(msg.error));
        else pending.resolve(msg.result);
      } else {
        emitter.emit("data", msg);
      }
    }
  });

  socket.on("error", (err) => emitter.emit("error", err));
  socket.on("close", () => emitter.emit("close"));

  return {
    on: emitter.on.bind(emitter),
    send(data) {
      const payload = encodeMessage(data);
      socket.write(payload);
    },
    call(call, ...args) {
      const __requestId = _requestIdCounter++;
      const payload = {
        call,
        args,
        __expectResponse: true,
        __requestId,
      };
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          inflightRequests.delete(__requestId);
          reject(new Error("Timeout while waiting for response"));
        }, 5000);
        inflightRequests.set(__requestId, { resolve, reject, timer });
        socket.write(encodeMessage(payload));
      });
    },
    socket
  };
}

module.exports = {
  connectToBridge,
};
