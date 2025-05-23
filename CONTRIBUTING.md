# 🤝 Contributing to nodeBond

Thank you for considering contributing to **nodeBond** — a local microservice bridge for Node.js.

We welcome issues, pull requests, feedback, and ideas!

---

## 🧠 Before You Start

- Ensure you're using **Node.js >= 18**
- This project uses **no framework** – just vanilla JS
- Code should be **clear, full-length (no short var names)**, and readable

---

## 🚀 Getting Started

```bash
git clone https://github.com/Xzdes/nodeBond.git
cd nodeBond
npm install
```

To run the hub manually:

```bash
nodebond start-hub
```

To test a service:

```bash
NODEBOND_TOKEN=your-token node example/db-service/index.js
```

To test:

```bash
test-nodebond-full.bat
```

---

## 🧪 Testing Your Changes

Please test with:

- ✅ `test-nodebond-full.bat`
- ✅ manual usage of `call`, `set`, `watch`
- ✅ multiple services running at once

---

## ✍ Code Style

- Use full variable names (e.g. `requestId` not `rid`)
- Use `const`/`let`, avoid `var`
- Use async/await — no nested callbacks
- Handle errors (try/catch for async methods)
- Keep comments if logic is non-obvious

---

## 📥 Submitting Changes

1. Fork this repo
2. Create a new branch
3. Submit your PR against `main`
4. Use descriptive commit messages

---

## 💬 Need Help?

Open an issue or join our community on GitHub Discussions (soon!)

---

Thanks for helping grow **nodeBond** 🧩!