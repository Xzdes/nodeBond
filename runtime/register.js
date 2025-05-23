// runtime/register.js
const { connectToBridge } = require("../ipc/client");
const { createBridge } = require("../ipc/server");
const { encodeMessage } = require("../ipc/protocol");

const TOKEN = process.env.NODEBOND_TOKEN || null;

function register({ id, exports = {}, onReady }) {
  const server = createBridge(id);
  const hub = connectToBridge("hub");

  server.on("data", async (msg, clientSocket) => {
    if (msg.call && typeof exports[msg.call] === "function") {
      try {
        const result = await exports[msg.call](...(msg.args || []));
        if (clientSocket?.writable && msg.__expectResponse) {
          clientSocket.write(encodeMessage({
            responseTo: msg.call,
            result,
            __requestId: msg.__requestId,
          }));
        }
      } catch (err) {
        if (clientSocket?.writable) {
          clientSocket.write(encodeMessage({
            error: err.message,
            __requestId: msg.__requestId,
          }));
        }
      }
    }
  });

  hub.on("connect", () => {
    hub.send({ type: "register", id, api: Object.keys(exports), token: TOKEN });
  });

  hub.on("data", (msg) => {
    if (msg.type === "registry") {
      console.log(`[register.js:${id}] Получен реестр:`, msg.services);
      if (onReady) onReady({ hub });
    }
  });
}

module.exports = {
  register,
};
