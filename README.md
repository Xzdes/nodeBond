![nodeBond Logo](logo.png)

---

# 🔗 nodeBond

**nodeBond** is a simple, secure, and dependency-free IPC bridge between two Node.js applications running on the same machine.

> 📡 Think of it as a virtual wire between your `.js` or `.exe` apps — fast, safe, and easy.

---

## 🚀 Features

* ✅ Zero dependencies — pure Node.js
* ✅ Bi-directional messaging with `.dual()`
* ✅ Cross-platform: Windows, Linux, macOS
* ✅ Uses Named Pipes / Unix Domain Sockets
* ✅ CLI ready: `npx nodebond send appA '{"msg": "Hi"}'`
* ✅ Debug mode with `NODEBOND_DEBUG=1`
* ✅ Secure by default: no open ports, no network exposure

---

## 📆 Installation

```bash
npm install nodebond
```

---

## ⚡ Quick Start

### App A (`appA.js`)

```js
const bond = require('nodebond').dual('appA', 'appB');

bond.on('data', (msg) => {
  if (msg.__target === 'appA') {
    console.log('[AppA] received:', msg);
  }
});

bond.sendTo('appB', { from: 'appA', msg: 'Hello from A' });
```

### App B (`appB.js`)

```js
const bond = require('nodebond').dual('appB', 'appA');

bond.on('data', (msg) => {
  if (msg.__target === 'appB') {
    console.log('[AppB] received:', msg);
  }
});

bond.sendTo('appA', { from: 'appB', msg: 'Hello from B' });
```

---

## 🛠️ CLI Usage

```bash
npx nodebond send appA '{"text": "Ping from CLI"}'
```

---

## 🔐 Security

`nodeBond` is secure by default:

* ❌ No TCP, no HTTP
* ✅ Only uses local IPC (sockets or named pipes)
* ✅ Not accessible from outside the machine
* ✅ Protected by OS-level permissions

Optional enhancement:

```js
fs.chmodSync(socketPath, 0o600); // Limit access on Unix
```

---

## 🧠 API Overview

| Method                | Description                                |
| --------------------- | ------------------------------------------ |
| `dual(local, remote)` | Starts a server and connects to a peer     |
| `.on(event, fn)`      | Listen for events: `data`, `connect`, etc. |
| `.once(event, fn)`    | Listen only once                           |
| `.send(data)`         | Send message to remote peer                |
| `.sendTo(name, data)` | Send message with target filtering         |
| `.close()`            | Shut down both server and client           |

---

## 🔍 Debug Mode

```bash
NODEBOND_DEBUG=1 node appA.js
```

Output:

```
[nodeBond DEBUG] Sending: { ... }
[nodeBond DEBUG] Received on server: { ... }
```

---

## 📄 License

MIT © Guliaev

---

## 💡 Perfect For

* GUI <-> CLI communication
* Cross-process automation
* Desktop apps using IPC
* Testing tools
* Any two apps that need local communication

> Plug it in. Send a message. Done.
