const { createBridge } = require("../ipc/server");
const { updateRegistry, getRegistry, broadcastUpdate } = require("./registry");
const { encodeMessage, decodeMessage } = require("../ipc/protocol");

function startHub() {
  const bridge = createBridge("hub");
  console.log("[nodeBond] Хаб запущен");

  bridge.on("client", (socket) => {
    let buffer = Buffer.alloc(0);

    socket.on("data", (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);

      while (true) {
        const result = decodeMessage(buffer);
        if (!result) break;

        buffer = result.rest;
        const msg = result.message;

        if (msg.type === "register") {
          const id = msg.id;
          const api = msg.api;

          updateRegistry(id, { id, api });

          // 💡 Важно: именно это сообщение запускает onReady() на стороне клиента
          socket.write(encodeMessage({
            type: "registry",
            services: getRegistry()
          }));

          broadcastUpdate();
        }
      }
    });

    socket.on("error", (err) => {
      console.error("[hub] Ошибка сокета:", err.message);
    });
  });

  return bridge;
}

module.exports = {
  startHub,
};
