# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.5.1] - 2026-06-21

### Changed (Frontend Only)

#### ChannelMessageBubble Redesign
- Removed sender avatar and username from channel messages
- Simplified message display with clean minimal style
- Time stamp displayed below each message
- Unified gray background for all channel messages

### Removed (Frontend Only)

- Removed sender avatar from channel messages
- Removed sender username from channel messages
- Removed VerifiedBadge from channel messages
- Removed unnecessary API calls for sender info
- Removed useAuthStore dependency from ChannelMessageBubble

---

## [1.5.0] - 2026-05-25

### New Features

#### File Upload in Channels

#### Enhanced ChannelMessageBubble
- Complete media rendering similar to private chats
- Image preview with click-to-expand
- Video player with play button overlay
- Audio player with playback controls
- File download button with progress indicator

### Bug Fixes

- Fixed missing file content display in channel messages
- Fixed media preview not showing in channels
- Fixed download functionality for channel files

### Changed

- Improved message bubble UI consistency across chats and channels
- Optimized file loading performance

---

## [1.4.0] - 2026-05-25

### 🚀 Features

#### Routing Improvements
- **Removed automatic redirect** from `/` to `/chat`
- **Unified routing:** Both users and channels now use the `/:username` pattern
- **Legacy link support:** Automatic redirect from `/chat/:username` and `/channel/:username` to `/:username`

#### Mention Links
- Automatic conversion of `@username` to clickable links in messages
- Support for mentions in both private chats and channels

#### Username Validation
- Simultaneous username checking in **users** and **channels** during registration
- Simultaneous checking when creating a new channel
- Case-insensitive username support

### 🐛 Bug Fixes

- Fixed incorrect header display when clicking on mentions
- Fixed messages not loading after clicking on mention links
- Fixed 401 error in user/channel type detection
- Fixed redirect issue after creating a new channel

### 🔧 Changed

- Changed default redirect after login from `/chat` to `/`
- Optimized `UsernameRouter` for simultaneous user and channel detection
- Improved mention styling with transition effects

### ⚠️ Breaking Changes

- Legacy routes `/chat/:username` and `/channel/:username` are deprecated
- Automatic redirect to new route `/:username`

---

## [1.3.1] - 2026-05-20

### Fixed - Bug Fixes

#### Frontend (v1.3.1)
- **Channel route changed from ID to username**
  - Route: `/channel/:channelId` → `/channel/:username`
- **Fixed user role detection in channels**
  - `isOwner`, `isAdmin` now work correctly
- **Disabled click on active chat item**
  - Clicking currently active chat does nothing
- **Fixed avatar display in chat list**
  - Avatar URLs now constructed correctly
- **Fixed message text direction**
  - Auto-detect RTL (Arabic) and LTR (English)
- **Removed unnecessary console logs**
- **Fixed TypeScript errors** (socket null, unreadCount)

#### Backend (v1.3.1)
- **Added `GET /api/channels/username/:username` endpoint**
  - Get channel by username with role fields
- **Fixed search results missing role fields**
  - Now returns `isMember`, `isAdmin`, `isOwner`

### Changed - Improvements

#### Frontend (v1.3.1)
- **Unified ChatHeader style with ChannelHeader**
  - Entire header clickable to open user info
- **Moved edit button next to close button** in ChannelInfoDialog

---

## [1.3.0] - 2026-05-12

### Added - Channel Editing Feature

#### Frontend (v1.3.0)
- Professional channel information editing (name, username, description)
- Avatar upload with drag & drop and file selection
- File type and size validation (images only, max 5MB)
- Avatar preview before upload
- Change and remove avatar functionality
- Fixed state mixing bug in ChannelInfoDialog
- Improved mobile user experience
- Real-time store synchronization after edits

#### Backend (v1.3.0)
- Professional avatar upload system with Multer
- `POST /api/channels/:channelId/avatar` - Upload new avatar
- `DELETE /api/channels/:channelId/avatar` - Delete avatar
- Automatic deletion of old avatar file from disk
- File type validation (JPEG, PNG, GIF, WebP)
- File size limit (max 5MB)
- Separated text update from avatar update in `updateChannel`

### Breaking Changes
- `PUT /api/channels/:channelId` no longer accepts `avatar` field
- Use `POST /api/channels/:channelId/avatar` for avatar upload instead

---

## v1.2.0 — Security Upgrade Release (2026-02-27)

### 🔐 Major Security Enhancements
- Added full device/session tracking stored directly inside each user object.
- Added login activity logs (device, country, IP hash, timestamp).
- Added session management with `isActive`, `createdAt`, `lastActiveAt`.
- Added automatic session creation on login.
- Added automatic session deactivation on logout.
- Added country detection using IP (with privacy-first hashing).
- Added device detection using User-Agent parsing.
- Removed separate `login_logs.json` and `sessions.json` files.
- Unified all security data inside `users.json`.

### 🧠 Backend Improvements
- Rebuilt `auth.service.js` to store loginLogs and sessions inside user.
- Updated JWT to include `sessionId` for future multi-device control.
- Improved logout logic to deactivate all sessions for the user.
- Cleaned up `db.service.js` and removed unused log/session functions.
- Improved IP hashing and country detection fallback behavior.

### 🎨 Frontend Enhancements
- Added Security & Login Activity section in Profile settings.
- Shows:
  - Country
  - Last login
  - Last active session
  - “View all” toggle for full history
  - Copy button for each log/session
- Added safe TypeScript types for:
  - `LoginLog`
  - `Session`
  - Updated `User` interface
- Improved UI with `break-all` to prevent overflow of long IP hashes.

### 🧹 Cleanup & Refactoring
- Removed unused API endpoints.
- Removed old session/log storage files.
- Improved TypeScript safety across the app.
- Updated Zustand store to match new auth flow.

---

## Notes
This update lays the foundation for future features:
- Terminate individual sessions
- Logout from all devices
- Security tab with advanced controls
- Email notifications for new logins

---

## [1.1.2] - 2026-02-26

### 🖼️ UI Update
- Added new favicon (`talkify-icon.svg`) to improve branding and visual identity.
- Updated `index.html` to reference the new icon.

### 📁 Updated Files
- `public/talkify-icon.svg`
- `index.html`

---

# v1.1.1 — Fix Chat Navigation

This patch release fixes an issue where navigating to a chat from the user search dialog would still redirect to the old `chatId`-based URL instead of the new `username`-based route.

## Frontend (v1.1.1)
- Corrected navigation logic in `NewChatDialog.tsx` to use `/chat/:username`.
- Added missing `useNavigate` hook.
- Ensured consistent behavior with the new readable chat URL system.

---

## [1.1.0] - 2026-02-26

### ✨ Frontend (v1.1.0)

#### 🚀 New Features
- **Human‑readable chat URLs** — replaced `/chat/:chatId` with `/chat/:username`
  - Previous: `/chat/713f26c4-5256-4e90-98ea-3ad829e3abb3`
  - New: `/chat/talkify`

#### 📁 Updated Files
- `src/App.tsx` — updated routing from `:chatId` to `:username`
- `src/pages/chat/ChatPage.tsx` — fully rewritten to support username-based routing
- `src/features/chat/components/ChatItem.tsx` — updated links to use username
- `src/services/chat.service.ts` — added two new service methods

#### ⚡ Performance Improvements
- **50% faster chat loading** — reduced API calls from 2 requests to 1
- Removed unnecessary `getUserByUsername` step
- Optimized chat creation workflow

---

### 🖥️ Backend (v1.1.0)

#### 🚀 New Features
- **New endpoint:** `POST /api/chats/find-or-create`
  - Supports both `username` and `userId` in the request body

#### 📁 Updated Files
- `src/controllers/chat.controller.js` — added `findOrCreateChat` method
- `src/routes/chat.routes.js` — added `/find-or-create` route
- `src/services/chat.service.js` — added `findOrCreateChat` service

#### ✨ Added Capabilities
- Lookup user by username
- Validate user existence
- Prevent self-chat creation
- Detect existing chat between two users
- Create a new chat if none exists

#### 🐛 Bug Fixes
- Fixed 404 error in `find-or-create` route
- Fixed routing order issues

---

### 📊 Summary

| Layer       | Files Changed | Key Changes                       |
|-------------|---------------|-----------------------------------|
| Frontend    | 4 files       | Username-based readable URLs      |
| Backend     | 3 files       | New `find-or-create` endpoint     |

**Total files changed: 7**

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
- **CORS issue**: Fixed preflight request problem for login endpoint that was blocking frontend requests
- **Environment configuration**: Added proper .env setup with JWT secret
- **Authentication**: Resolved JWT secret loading issue causing 500 errors during login
- **Message status**: Fixed message seen status not updating in real-time

### 🔧 Changed
- Updated CORS settings to allow frontend on port 5173 with proper credentials
- Improved error handling for missing environment variables
- Enhanced database queries for better performance
- Updated user status tracking for online/offline states

### 📦 Added
- Backend environment configuration guide (.env.example)
- Proper gitignore rules for both frontend and backend
- Input validation for login and registration forms
- Better error messages for API responses

### 🔐 Security
- Strengthened JWT token validation
- Added rate limiting for login attempts
- Improved password hashing configuration

---

## [1.0.0] - 2025-01-01
### 🎉 Initial Release — Talkify v1.0.0

The first stable release of **Talkify**, a modern messaging platform with real‑time chat, channels, reactions, admin tools, and a polished UI/UX.

---

### ✅ Added
- Real‑time private chat system with instant messaging
- Channel system with verification badges for official channels
- Admin panel with comprehensive management tools:
  - Channel management (create, edit, delete, verify)
  - Broadcast messaging to all users
  - History logs with search and filter
- Advanced message features:
  - Edit message within time limit
  - Delete message for everyone
  - Reactions with emoji picker
  - Message status tracking (sent, delivered, seen)
- File & media messaging:
  - Image preview with blur overlay for sensitive content
  - Video placeholder with download button
  - Tooltip showing file name and size
  - Support for multiple file types
- System chat for support communication between users and admins
- Global broadcast messaging to all non-admin users
- Clean, modular backend architecture with separation of concerns
- English‑translated UI for production use
- Secure access control for all chat operations
- User profiles with avatar, bio, and online status
- Real‑time typing indicators
- Search functionality for messages and users

---

### 🔄 Changed
- Improved error handling with centralized `formatError` utility
- Enhanced UI consistency using ShadCN components + Tailwind CSS
- Updated backend message model to support reactions and status tracking
- Refactored socket connection for better performance
- Optimized database queries for faster message loading
- Improved responsive design for mobile devices

---

### 🐞 Fixed
- Message status not updating to "seen" in some group chat scenarios
- Incorrect permission checks for system chat access
- Minor UI alignment issues in chat bubbles and admin panel
- Socket disconnection issues during network changes
- Avatar upload not working in certain browsers
- Duplicate messages appearing after reconnection

---

### 🔐 Security
- Users can only access chats they are participants in
- Users can only edit/delete their own messages
- Deleted messages are permanently removed from database
- System chat protected from unauthorized message sending
- JWT tokens with proper expiration and refresh mechanism
- Input sanitization for all user inputs
- Rate limiting on authentication endpoints
- Secure file upload validation

---

### 🎨 UI/UX
- Smooth animations for message sending and receiving
- Dark/Light mode support with system preference detection
- Mobile-responsive design with touch-friendly interactions
- Loading states and skeleton screens for better UX
- Toast notifications for important events
- Emoji picker with recent emojis support

---

### ⚡ Performance
- Lazy loading for chat history
- Optimized re-renders with React memo
- Image optimization and lazy loading
- Efficient state management with React Query
- WebSocket connection pooling

---

## 📌 Notes
This release marks the first production‑ready version of Talkify, designed as a flagship portfolio project demonstrating real‑world system architecture, UI/UX polish, and secure backend engineering. The application is fully functional and ready for deployment.

---

Created by Amirhossein Agrest