# ![nodeBond Logo](logo.png)

# nodeBond

nodeBond is a local microservice communication bus for Node.js. It lets you register services (apps) on the same machine, send messages, call functions, share global state, and coordinate them via a central hub — with almost zero dependencies.

---

## 🔧 Features

- 🔌 IPC via Unix/Windows sockets  
- 📡 Call remote methods from other services  
- 📦 Global key-value store (get/set/watch)  
- 🔐 Token-based authentication (optional)  
- 🛠 CLI for direct interaction  
- 🧩 Fully modular and framework-free  

---

## 🚀 Installation

Install from npm:

```bash
npm install nodebond
```

Or globally:

```bash
npm install -g nodebond
```

---

## 🔐 Optional: secure your system with token

```bash
export NODEBOND_TOKEN=secret123       # Linux/macOS  
$env:NODEBOND_TOKEN="secret123"       # PowerShell  
```

---

## ⚡ Quick Start (3 terminals)

### 1️⃣ Start the hub

```bash
nodebond start-hub
```

### 2️⃣ Run a service (example/db-service)

```js
// db-service/index.js
const { register } = require("nodebond");

register({
  id: "db",
  exports: {
    ping: () => "pong",
    getClientById: (id) => ({ id, name: "Ivan", bonus: 100 })
  },
  onReady() {
    console.log("[db] Ready");
  }
});
```

```bash
NODEBOND_TOKEN=secret123 node example/db-service/index.js
```

### 3️⃣ Call it

```bash
nodebond call db.ping
```

---

## 🛠 CLI Usage

```bash
nodebond start-hub
nodebond call printer.print "Hello"
nodebond set printer.status ""ready""
nodebond get printer.status
nodebond watch printer.status
```

---

## 🧪 Test Automation

We provide a full test script:

```bash
test-nodebond-full.bat
```

It starts hub, services, performs calls, sets and watches variables.

---

## 📦 Project Structure

```
nodeBond/
├── core/
├── ipc/
├── runtime/
├── bin/
├── example/
├── plugins/
├── logo.png
├── README.md
```

---

## 📎 Links

- NPM: https://www.npmjs.com/package/nodebond  
- GitHub: https://github.com/Xzdes/nodeBond

---

## 🛡 Version: 4.0.0