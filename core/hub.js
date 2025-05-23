// core/hub.js
const net = require("net");
const { encodeMessage, decodeMessage } = require("../ipc/protocol");
const registry = require("./registry");

const REQUIRED_TOKEN = process.env.NODEBOND_TOKEN || null;
const clients = new Map();

function sendRegistryToAll() {
  const data = {
    type: "registry",
    services: registry.getAll(),
  };
  for (const socket of clients.values()) {
    socket.write(encodeMessage(data));
  }
}

function handleRegister(msg, socket) {
  if (REQUIRED_TOKEN && msg.token !== REQUIRED_TOKEN) {
    console.log("[hub] ❌ Неверный токен авторизации от клиента");
    socket.destroy();
    return;
  }

  const { id, api } = msg;
  registry.register(id, api);
  clients.set(id, socket);
  console.log(`[hub] ✅ Зарегистрирован сервис: '${id}'`);
  sendRegistryToAll();
}

function startHub() {
  const server = net.createServer((socket) => {
    let buffer = Buffer.alloc(0);

    socket.on("data", (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      while (true) {
        const result = decodeMessage(buffer);
        if (!result) break;
        buffer = result.rest;
        const msg = result.message;

        if (msg.type === "register") {
          handleRegister(msg, socket);
        }
      }
    });

    socket.on("close", () => {
      for (const [id, sock] of clients.entries()) {
        if (sock === socket) {
          clients.delete(id);
          registry.unregister(id);
          console.log(`[hub] ⚠️ Сервис '${id}' отключён`);
          sendRegistryToAll();
          break;
        }
      }
    });

    socket.on("error", (err) => {
      console.error("[hub] Socket error:", err.message);
    });
  });

  const path = process.platform === "win32"
    ? `\\\\.\\pipe\\nodebond-hub`
    : require("path").join("/tmp", "nodebond-hub.sock");

  server.listen(path, () => {
    console.log("[nodeBond] Хаб запущен");
    console.log(`[nodeBond] Мост 'hub' запущен на ${path}`);
  });
}

module.exports = { startHub };
