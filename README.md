# Talkify — Modern Messaging Platform

Talkify is an open-source, production-oriented messaging platform built to demonstrate a real-world full-stack architecture. It provides real-time private chat, channels, an admin dashboard, and file messaging — implemented with a clean, modular architecture and a polished UI.

> A flagship portfolio project by **Amirhossein Agrest**, showcasing system design, backend access-control logic, and premium frontend engineering.

---

## ✨ Features

- Real-time private chat with typing indicators, reactions, and status (sending → sent → delivered → seen)
- Channel system with owner/admin/member roles and verification badges
- Message editing, deleting, replying, and status tracking
- File & media messaging (images, videos, audio, documents) — in chats and channels
- System / support chat and global broadcast messaging
- Blocking, reporting, and suspension flows
- Admin panel for users, channels, reports, suspensions, broadcasts, and manual messages
- Polished, responsive UI (English)

---

## 🧠 Overview

Talkify models a modern messenger inspired by Telegram and Discord:

- A Node.js + Express + Socket.IO backend with strict permission checks
- A React + TypeScript + Tailwind + shadcn/ui frontend
- An admin dashboard for moderation
- A layered backend architecture suitable for evolving toward production persistence

---

## 🧩 Technology Stack

### Frontend (`talkify-frontend`)

- **React 18** + **TypeScript 5** + **Vite 5** (`@vitejs/plugin-react-swc`)
- **Tailwind CSS 3** + **Autoprefixer** + `tailwindcss-animate`
- **shadcn/ui** on **Radix UI** primitives
- **Zustand** (client state) + **TanStack Query** (server state) + **React Router 6**
- **Socket.IO client 4** + **Axios** + **Zod** + **React Hook Form**
- Supporting libs: `emoji-picker-react`, `date-fns`, `lucide-react`

### Backend (`talkify-backend`)

- **Node.js** (ES modules, `type: module`) + **Express 4**
- **Socket.IO 4** (real-time handlers)
- **JWT (`jsonwebtoken`)** + **bcryptjs** (auth)
- **Multer** (file uploads) + **uuid** + **cors** + **dotenv**
- **Nodemon** (development)

---

## 🏗 Architecture & Project Structure

```text
Talkify/
├── talkify-backend/              # Express + Socket.IO API
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── socket/
│   │   ├── utils/
│   │   └── index.js
│   ├── data/
│   │   └── uploads/
│   ├── scripts/
│   ├── package.json
│   ├── .env.example
│   └── nodemon.json
├── talkify-frontend/            # React + Vite SPA
│   ├── src/
│   │   ├── components/
│   │   ├── features/
│   │   ├── pages/
│   │   ├── store/
│   │   ├── services/
│   │   ├── lib/
│   │   └── types/
│   ├── public/
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.*.json
│   └── package.json
├── LICENSE (MIT)
└── README.md
```

**Backend layering:**

```text
routes → controllers → services → db.service
```

---

## ✅ Prerequisites

- **Node.js 18+**
- **npm 9+**
- **Git**

---

## 📦 Installation

```bash
git clone https://github.com/AmirhosseinAgrest/Talkify.git
cd Talkify

# backend
cd talkify-backend
npm ci

# frontend
cd ../talkify-frontend
npm ci
```

---

## ⚙️ Environment Configuration

### Backend

```bash
cd talkify-backend
cp .env.example .env
```

Required variable:

| Variable | Required | Description |
|---|---|---|
| `JWT_SECRET` | Yes | HMAC key for signing/verifying JWTs |
| `CLIENT_URL` | In production | Allowed frontend origin(s) for CORS (REST + Socket.IO), comma-separated. Defaults to `http://localhost:5173` outside production; wildcard is rejected. |

Other variables (`PORT`, `NODE_ENV`, `JWT_EXPIRES_IN`) have defaults and are documented in `.env.example`.

### Frontend

No `.env` needed in development. Vite proxies `/api` and `/uploads` to `http://localhost:3001`.

---

## 🚀 Running Locally (Development)

You need **two terminals**.

**1. Backend**

```bash
cd talkify-backend
cp .env.example .env
npm run dev
```

Backend runs at `http://localhost:3001`.

**2. Frontend**

```bash
cd talkify-frontend
npm run dev
```

Frontend runs at `http://localhost:5173`.

---

## 🏗 Production Build

**Frontend only:**

```bash
cd talkify-frontend
npm run build
npm run preview
```

**Backend** has no build step — it runs as `node src/index.js`.

---

## 🤝 Contributing

Issues and pull requests are welcome.

- Open an issue describing the change
- Keep PRs focused on one concern
- Follow the existing `routes → controllers → services → db.service` layering

---

## 🔒 Security

If you discover a security issue, please open a private issue or contact the maintainer directly instead of filing a public issue with exploit details.

Backend authentication uses `JWT` + `bcryptjs` (12 rounds); `JWT_SECRET` must be set to a strong random value and never committed.

---

## 📄 License

MIT — see [`LICENSE`](./LICENSE).

---

## 👤 Author
**Amirhossein Agrest** — Creator & Lead Developer. Open-source advocate and system architect.