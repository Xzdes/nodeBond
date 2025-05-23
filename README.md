<p align="center">
  <img src="logo.png" alt="nodeBond Logo" width="180"/>
</p>

# nodeBond

[![NPM Version](https://img.shields.io/npm/v/nodebond.svg?style=flat)](https://www.npmjs.com/package/nodebond)
[![GitHub Repo](https://img.shields.io/badge/GitHub-nodeBond-blue?logo=github)](https://github.com/Xzdes/nodeBond)

📖 Also available in [Русский язык](README.ru.md)

---

`nodeBond` is a lightweight inter-process communication (IPC) system designed for seamless local service orchestration in Node.js. It connects multiple independent services on a single machine with minimal setup, no external dependencies, and a robust messaging system.

## 🚀 Features

- Minimalistic IPC bridge using Unix domain sockets / named pipes
- Auto-registration of services
- Service discovery and remote calls
- CLI for diagnostics and interaction
- Platform support: Windows, Linux, macOS

## 📦 Installation

```bash
git clone https://github.com/Xzdes/nodeBond.git
cd nodeBond
npm install
npm link   # Register CLI globally
```


## 🧵 Starting the System

Start the hub first:

```bash
nodebond start-hub
```

Then in separate terminals:

```bash
node example/db-service/index.js
node example/printer-service/index.js
node example/cashbox-service/index.js
```

## 💡 How It Works

- Services register with the hub using `register()`
- Hub builds a registry and distributes it to all
- Services use `call()` to communicate

### Example: `cashbox-service`

```js
const { register, call } = require("nodebond");

register({
  id: "cashbox",
  exports: {
    ping: () => "pong"
  },
  onReady: async () => {
    await call("db.getClientById", 42);
  }
});
```

## 🔧 CLI Usage

```bash
nodebond call db.getClientById 42
nodebond get printer.status
nodebond set printer.status "ready"
```

## ❓ Troubleshooting

- Ensure `hub` is started
- On Windows: `Get-ChildItem \\.\pipe\ | findstr nodebond`
- On Linux/macOS: `ls /tmp/nodebond-*`

## 📄 License

MIT