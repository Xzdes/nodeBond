# Contributing to nodeBond

🙏 Thank you for your interest in contributing to **nodeBond**!

This guide will help you understand how to get started, contribute code, report bugs, or suggest improvements.

---

## 📦 Getting Started

To set up the project locally:

```bash
git clone https://github.com/Xzdes/nodeBond.git
cd nodeBond
npm install
npm link
```

Then you can run the example services:

```bash
nodebond start-hub
node example/db-service/index.js
node example/printer-service/index.js
node example/cashbox-service/index.js
```

---

## 📁 Project Structure

See [`README.md`](README.md) for full project layout and architecture.

---

## 💻 Code Style

- Use **2 spaces** for indentation
- Prefer `camelCase` for variables and function names
- Use clear, descriptive names
- Comment your code when necessary
- Keep logic modular and maintainable

---

## ✅ Contributing Workflow

1. Fork this repository
2. Create a new branch:  
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Make your changes
4. Test your code locally
5. Commit with a clear message:  
   ```bash
   git commit -m "feat: short description of change"
   ```
6. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
7. Open a **Pull Request (PR)** with a brief description of what you’ve done

---

## 🐞 Bug Reports

Please include:

- A clear description of the issue
- Steps to reproduce
- Expected vs. actual behavior
- Your OS, Node.js version, and any logs

---

## 💡 Feature Suggestions

Open an issue and explain:

- What problem the feature solves
- How you would use it
- How it fits into the rest of nodeBond

---

## 🤝 Code of Conduct

We aim to be respectful, inclusive, and collaborative. Be kind and constructive in all interactions.

---

## 📬 Need Help?

Open an issue or reach out on GitHub:  
🔗 https://github.com/Xzdes/nodeBond/issues