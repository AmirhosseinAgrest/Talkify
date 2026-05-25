# Changelog - Talkify Frontend
All notable changes to the frontend application will be documented in this file.

This project follows **Keep a Changelog** and adheres to **Semantic Versioning**.

---

## [1.5.0] - 2026-05-25

### 🚀 New Features

#### File Upload in Channels
- Complete file upload support in channels
- File selection with preview before sending
- Image preview

#### Enhanced ChannelMessageBubble
- Complete media rendering similar to private chats
- MediaViewer integration for full-screen media viewing

### 🐛 Bug Fixes

- Fixed missing file content display in channel messages
- Fixed media preview not showing in channels

---

## [1.4.0] - 2026-05-25

### Added
- `UsernameRouter` component for automatic user/channel detection
- `MentionText` component for converting `@username` to links
- Mention support in messages

### Changed
- Routing changed from `/chat` and `/channel` to `/:username`
- Redirect after login changed from `/chat` to `/`
- Optimized mention styling

### Fixed
- Fixed incorrect header after clicking mentions
- Fixed messages loading issue

---

## [1.3.1] - 2026-05-20

### Fixed - Bug Fixes

#### Channel Routing
- **Changed channel route from ID to username**
  - Route changed from `/channel/:channelId` to `/channel/:username`
  - Added `getChannelByUsername` API call
  - Fixed channel item click navigation

#### User Role Detection in Channels
- **Fixed isOwner and isAdmin detection**
  - Added missing role fields to channel data

#### Chat Improvements
- **Fixed click on active chat item**
  - Disabled clicking on currently active chat
  - Added visual feedback for active chat (opacity, different style)
- **Fixed avatar display in chat list**
  - Corrected avatar URL construction with API_URL
- **Fixed message text direction**
  - Auto-detect RTL (Arabic) and LTR (English) languages
  - Proper text alignment based on language

#### UI Improvements
- **Unified ChatHeader style with ChannelHeader**
  - Made entire header clickable to open user info
  - Moved edit button next to close button in ChannelInfoDialog
  - Removed unnecessary border line from dialog header

#### Code Quality
- **Removed unnecessary console logs**
  - Cleaned up socket-related console.log statements
- **Fixed TypeScript errors**
  - Fixed `socket` possibly null error
  - Added `unreadCount` to Channel type

---

## [1.3.0] - 2026-05-12

### Added - New Features

#### Channel Editing Feature
- **Professional channel information editing**
  - Ability to edit channel name, username, and description by channel owner
  - Edit button visible only to channel owner
  - Edit form with Cancel and Save functionality

#### Avatar Management
- **Professional avatar upload and management**
  - Avatar upload with drag & drop and file selection
  - File type and size validation (images only, max 5MB)
  - Avatar preview before upload
  - Ability to change and remove avatar
  - Upload using multipart/form-data

#### Technical Improvements
- **Fixed state inconsistency in Dialog**
  - Added `useEffect` to reset state when channel changes
  - Prevented data mixing between different channels
- **Improved mobile user experience**
  - Optimized display on small screens
  - Added `truncate` and `shrink-0` to prevent overflow
- **Real-time store synchronization**
  - Store updates after every edit
  - Instant display of changes in channel header

---

## v1.2.0 — Security UI & Auth Integration Update (2026-02-27)

### 🔐 New Security UI in Profile Settings
- Added **Security & Login Activity** section.
- Displays:
  - Country
  - Last login
  - Last active session
  - Full login history (with “View all” toggle)
  - Full session history (with “View all” toggle)
- Added copy button for each log/session card.
- Added `break-all` to prevent long IP hashes from overflowing UI.

### 🧠 Auth Store & API Improvements
- Updated `useAuthStore` to match new backend session architecture.
- Updated `api.ts`:
  - Removed forced redirect on 401.
  - Improved token handling.
  - Ensured compatibility with sessionId-based JWT.
- Updated `authService` to use new request types:
  - `LoginRequest`
  - `RegisterRequest`

### 🧩 TypeScript Enhancements
- Updated `User` interface to include:
  - `country`
  - `loginLogs`
  - `sessions`
- Added new interfaces:
  - `LoginLog`
  - `Session`
- Removed all TypeScript errors related to undefined fields.

### 🎨 UI/UX Improvements
- Improved ProfileTab layout.
- Added safe fallback values for missing data.
- Added loading states and better error messages.
- Improved avatar upload/delete flow.

### 🧹 Cleanup
- Removed unused components and old logic.
- Improved consistency of formatting and naming.
- Cleaned up form validation and default values.

---

## Notes
This frontend update is fully compatible with Backend v1.2.0 and unlocks future features like:
- Terminate session
- Logout from all devices
- Security tab with advanced controls

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
