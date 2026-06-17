# 👻 Ghost Catch Bot

[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/kest14/GhostCatchBot/pulls)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/kest14/GhostCatchBot/issues)
![License](https://img.shields.io/github/license/kyst14/GhostCatchBot)
![CI](https://github.com/kyst14/GhostCatchBot/actions/workflows/tests.yml/badge.svg)

A Telegram bot that helps you track, save, and view deleted and edited messages in
Telegram Business chats.

Built with **Node.js + TypeScript + Prisma + grammY + Express (Webhook)**.

Telegram does not natively allow recovering deleted or edited messages. **Ghost Catch
Bot** solves this by safely storing message history from Telegram Business chats before it
disappears.

## ⚠ WARNING ⚠

This project is currently under development and not production-ready. Expect possible
bugs, breaking changes, and missing features. Use it at your own risk. If you encounter
any issues, feel free to report them in the
[Issues section](https://github.com/kyst14/GhostCatchBot/issues) or contribute
improvements via a Pull Request.

---

## ✨ Features

- **🗑️ View Deleted Messages:** Never miss what was sent, even if the sender deletes it.
- **📝 Track Edits:** View edited messages side-by-side with their original content.
- **🔒 Protect Media:** Save ephemeral or protected media before it expires.
- **📊 Analytics:** View user and chat message statistics.
- **🔌 Seamless Integration:** Quick and easy connection to your Telegram Business
  account.

---

## 🚀 How it works

The bot connects to your Telegram Business account via Webhooks and listens for:

- Incoming messages
- Message edits
- Message deletions
- Protected/ephemeral media events

> ⚠️ **Note:** To ensure user privacy, all captured data is encrypted at rest and
> automatically wiped using strict expiration rules.

---

## 🔐 Privacy & Security

- All messages are encrypted before storage
- Data has automatic expiration rules
- No data is shared with third parties

---

## ⚙️ Tech Stack

- **Runtime:** Node.js / Bun
- **Language:** TypeScript
- **Bot Framework:** grammY (Telegram Bot API)
- **Database & ORM:** PostgreSQL + Prisma ORM
- **Server:** Express (for Webhook handling)
- **Utilities:** `node-cron` (cleanup jobs), `crypto-js` (encryption), `dotenv`

---

## 📦 Installation

1. Clone the repository

```bash
git clone https://github.com/kyst14/ghostcatchbot
cd ghostcatchbot
```

2. Install dependencies

```bash
npm install
```

or

```bash
bun install
```

3. Clone environment

```bash
cp .env.example .env
```

4. Running the bot

Development

```bash
npm run dev
```

or

```bash
bun dev
```

Production

```bash
npm run build
npm start
```

or

```bash
bun run build
bun start
```

---

## 🔌 Telegram Business Setup

1. Open Telegram settings
2. Go to Edit Profile → Chat automation
3. Add your bot

---

## 🧠 Commands

- /start — Start the bot
- /help — Show help message
- /connect — Help to connect bot
- /stats — Show message statistics
- /feedback — Send feedback to developer
- /about — Project information and links

## 👨‍💻 Developer

- GitHub: https://github.com/kyst14
- Telegram: https://t.me/Cat333t

## 📄 License

This project is licensed under [GNU GPLv3](LICENSE).
