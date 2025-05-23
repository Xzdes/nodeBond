#!/usr/bin/env node

const { call, get, set, watch, startHub } = require("../index");

const args = process.argv.slice(2);
const command = args[0];

function printHelp() {
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

if (!command || command === "--help" || command === "-h") {
  printHelp();
  process.exit(0);
}

(async () => {
  try {
    if (command === "start-hub") {
      startHub();
    }

    else if (command === "call") {
      const path = args[1];
      const callArgs = args.slice(2).map((v) => {
        try {
          return JSON.parse(v);
        } catch {
          return v;
        }
      });

      const result = await call(path, ...callArgs);
      console.log("[RESULT]", result);
    }

    else if (command === "get") {
      const key = args[1];
      console.log("[VALUE]", get(key));
    }

    else if (command === "set") {
      const key = args[1];
      const value = args[2];
      set(key, JSON.parse(value));
      console.log("[SET]", key, "=", value);
    }

    else if (command === "watch") {
      const key = args[1];
      console.log(`[WATCHING] ${key}`);
      watch(key, (val) => {
        console.log(`[CHANGED] ${key} =`, val);
      });
    }

    else {
      console.log("[ERROR] Неизвестная команда:", command);
      printHelp();
    }
  } catch (e) {
    console.error("[ERROR]", e.message);
  }
})();
