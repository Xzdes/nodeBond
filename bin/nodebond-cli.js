#!/usr/bin/env node
const { connectToBridge } = require("../ipc/client");

const [,, cmd, ...args] = process.argv;
const token = process.env.NODEBOND_TOKEN || null;

function usage() {
  console.log(`
nodebond CLI

Usage:
  nodebond start-hub                    Запуск главного узла
  nodebond call <svc.method> [args..]   Вызов метода сервиса
  nodebond get <key>                    Получить переменную
  nodebond set <key> <value>            Установить переменную
  nodebond watch <key>                  Следить за изменением переменной

Examples:
  nodebond call printer.print "Hello"
  nodebond get printer.status
  nodebond set cashbox.open true
  nodebond watch printer.status
`);
}

if (!cmd || cmd === "--help") return usage();

if (cmd === "start-hub") {
  require("../core/hub").startHub();
  return;
}

if (cmd === "call") {
  const [callName, ...callArgs] = args;
  if (!callName) return usage();
  const hub = connectToBridge("hub", { token });
  hub.on("connect", async () => {
    try {
      const result = await hub.call(callName, ...callArgs.map(tryParse));
      console.log(result);
    } catch (err) {
      console.error("Ошибка:", err.message);
    }
  });
}

if (cmd === "get") {
  const [key] = args;
  if (!key) return usage();
  const hub = connectToBridge("hub", { token });
  hub.on("connect", async () => {
    try {
      const result = await hub.call("store.get", key);
      console.log(result);
    } catch (err) {
      console.error("Ошибка:", err.message);
    }
  });
}

if (cmd === "set") {
  const [key, value] = args;
  if (!key || value === undefined) return usage();
  const hub = connectToBridge("hub", { token });
  hub.on("connect", async () => {
    try {
      await hub.call("store.set", key, tryParse(value));
      console.log("OK");
    } catch (err) {
      console.error("Ошибка:", err.message);
    }
  });
}

if (cmd === "watch") {
  const [key] = args;
  if (!key) return usage();
  const hub = connectToBridge("hub", { token });
  hub.on("connect", () => {
    console.log(`[watch] Подписка на "${key}"...`);
    hub.send({ call: "store.watch", args: [key] });
  });
  hub.on("data", (msg) => {
    if (msg.type === "store.watch" && msg.key === key) {
      console.log(`[watch] ${msg.key} = ${JSON.stringify(msg.value)}`);
    }
  });
}

function tryParse(str) {
  try {
    return JSON.parse(str);
  } catch {
    return str;
  }
}
