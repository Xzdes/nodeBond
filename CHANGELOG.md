# 📦 CHANGELOG

## [4.0.0] – Stable core release

### 🚀 Major Features
- ✅ Full IPC bridge via sockets (Windows & Unix)
- ✅ Services can register with `id`, `exports`, `onReady`
- ✅ Central Hub handles registry and dispatch
- ✅ CLI: `call`, `get`, `set`, `watch`, `start-hub`
- ✅ Token-based authentication via `NODEBOND_TOKEN`
- ✅ Direct socket reply per-request using `__requestId`
- ✅ Global key-value store
- ✅ Registry updates to all connected services
- ✅ Watch API with real-time updates

### 🛠 CLI
- `nodebond call db.ping`
- `nodebond get printer.status`
- `nodebond watch printer.status`
- `nodebond set printer.status ""ready""`

### 📁 File Structure Updates
- `ipc/client.js` – request ID, token support
- `runtime/register.js` – direct reply to socket
- `core/hub.js` – deregistration & security
- `core/registry.js` – improved registry logic
- `bin/nodebond-cli.js` – robust CLI with token support

### 🧪 Testing
- Added `test-nodebond-full.bat` for system testing

---