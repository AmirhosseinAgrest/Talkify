# Changelog - Talkify Frontend
All notable changes to the frontend application will be documented in this file.

This project follows **Keep a Changelog** and adheres to **Semantic Versioning**.

---

## [1.1.2] - 2026-02-26

### 🖼️ UI Update
- Added new favicon (`talkify-icon.svg`) to improve branding and visual identity.
- Updated `index.html` to reference the new icon.

### 📁 Updated Files
- `public/talkify-icon.svg`
- `index.html`

---

## [1.1.1] - 2026-02-26

### 🛠️ Fixes
- Fixed chat navigation to correctly use **username-based URLs** instead of falling back to `chatId`.
- Updated `NewChatDialog.tsx` to ensure `navigate(`/chat/${user.username}`)` is used after creating or finding a chat.
- Added missing `useNavigate` import and initialization to prevent fallback routing behavior.

### 📁 Updated Files
- `src/features/chat/components/NewChatDialog.tsx`

### 🔍 Summary
This update ensures that all chat navigation is fully aligned with the new readable URL system (`/chat/:username`) and prevents accidental routing to legacy `chatId` URLs.

---

## [1.1.0] - 2026-02-26

### 🚀 New Features
- **Human‑readable chat URLs** — replaced `/chat/:chatId` with `/chat/:username`
  - Previous: `/chat/713f26c4-5256-4e90-98ea-3ad829e3abb3`
  - New: `/chat/talkify`

### 📁 Updated Files
- `src/App.tsx` — updated routing from `:chatId` to `:username`
- `src/pages/chat/ChatPage.tsx` — fully rewritten to support username-based routing
- `src/features/chat/components/ChatItem.tsx` — updated links to use username
- `src/services/chat.service.ts` — added two new service methods

### 📦 New Service Methods
- `findOrCreateChat(username)` — 
- `findOrCreateChatWithUser(userId)` — 

### ⚡ Performance Improvements
- **50% faster chat loading** — reduced API calls from 2 requests to 1
- Removed unnecessary `getUserByUsername` step
- Optimized chat creation workflow

---

## [1.0.2] - 2026-02-25

### 🛠️ Fixed
- **API_URL undefined error**: Fixed missing environment variable in ChatItem component
- **Date type error**: Fixed formatTime function to accept string inputs
- **Type safety**: Improved type handling in utility functions

### 🔧 Changed
- Updated environment variable usage in frontend components
- Improved error handling in date formatting functions
- Enhanced type definitions for better TypeScript support

---

## [1.0.1] - 2026-02-25

### 🛠️ Fixed
- **CORS issue**: Fixed preflight request problem for login endpoint
- **API_URL error**: Fixed missing environment variable in ChatItem
- **Date type error**: Fixed formatTime function

---

## [1.0.0] - 2025-01-01

### 🎉 Initial Release — Talkify Frontend v1.0.0

The first stable release of Talkify frontend application.

### ✅ Added
- Real‑time private chat system with instant messaging
- Channel system with verification badges for official channels
- Admin panel with comprehensive management tools
- Advanced message features (edit, delete, reactions, status tracking)
- File & media messaging with previews
- System chat for support communication
- User profiles with avatar, bio, and online status
- Real‑time typing indicators
- Search functionality for messages and users
- Dark/Light mode support
- Mobile-responsive design

### 🔧 Technical Features
- React 18 with TypeScript
- Vite for build tooling
- Zustand for state management
- React Query for server state
- Socket.io-client for real-time communication
- Tailwind CSS + ShadCN for UI
- Axios for API calls

---

## 📌 Notes
Frontend application built with modern React practices and optimized for performance.
