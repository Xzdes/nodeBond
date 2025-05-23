# ![nodeBond Логотип](logo.png)

# nodeBond

**nodeBond** — это локальная шина взаимодействия микросервисов на Node.js. Позволяет приложениям на одной машине связываться, вызывать методы, обмениваться переменными и работать через центральный узел — хаб.

---

## 🔧 Возможности

- 🔌 IPC через Unix/Windows сокеты  
- 📡 Вызов методов между сервисами  
- 📦 Глобальное key-value хранилище  
- 🔐 Поддержка авторизации через токен  
- 🛠 CLI для управления  
- 🧩 Без фреймворков и лишних зависимостей  

---

## 🚀 Установка

```bash
npm install nodebond
```

Или глобально:

```bash
npm install -g nodebond
```

---

## 🔐 Опционально: токен безопасности

```bash
export NODEBOND_TOKEN=secret123       # Linux/macOS  
$env:NODEBOND_TOKEN="secret123"       # Windows PowerShell  
```

---

## ⚡ Быстрый старт (3 терминала)

### 1️⃣ Запуск хаба

```bash
nodebond start-hub
```

### 2️⃣ Сервис (example/db-service)

```js
// db-service/index.js
const { register } = require("nodebond");

register({
  id: "db",
  exports: {
    ping: () => "pong",
    getClientById: (id) => ({ id, name: "Иван", bonus: 100 })
  },
  onReady() {
    console.log("[db] Готов");
  }
});
```

```bash
NODEBOND_TOKEN=secret123 node example/db-service/index.js
```

### 3️⃣ Вызов метода

```bash
nodebond call db.ping
```

---

## 🛠 Команды CLI

```bash
nodebond start-hub
nodebond call printer.print "Hello"
nodebond set printer.status ""ready""
nodebond get printer.status
nodebond watch printer.status
```

---

## 🧪 Тестирование

```bash
test-nodebond-full.bat
```

Запускает хаб, сервисы, делает вызовы и отслеживает переменные.

---

## 📦 Структура проекта

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

## 📎 Ссылки

- NPM: https://www.npmjs.com/package/nodebond  
- GitHub: https://github.com/Xzdes/nodeBond

---

## 🛡 Версия: 4.0.0