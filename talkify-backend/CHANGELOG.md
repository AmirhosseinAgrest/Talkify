# Changelog - Talkify Backend
All notable changes to the backend application will be documented in this file.

This project follows **Keep a Changelog** and adheres to **Semantic Versioning**.

---

## [1.5.0] - 2026-05-25

### 🚀 New Features

#### File Upload in Channels
- Added `sendChannelMessageWithFile` service function for handling file messages in channels
- Added `sendMessageWithFile` controller endpoint for file uploads
- Added `/messages/upload` route for channel file uploads
- Integrated with existing upload middleware for file validation

### 🔧 Technical Details

- **Storage**: Files stored in `/data/uploads/{type}s/` directory
- **Database**: Message records include `fileUrl`, `fileName`, `fileSize`, `type` fields

---

## [1.4.0] - 2026-05-25

### Added
- Simultaneous username checking in users and channels during registration
- Simultaneous checking when creating a new channel

### Changed
- Optimized case-insensitive search in `db.service.js`
- Improved error messages for duplicate usernames

### Fixed
- Fixed registration with username that exists in channels
- Fixed channel creation with username that exists in users

---

# Changelog - Talkify Backend

## [1.3.1] - 2026-05-20

### Added - New Endpoints

#### Get Channel by Username
- **`GET /api/channels/username/:username`** - Get channel by username
  - Returns channel with isMember, isAdmin, isOwner fields
  - Proper role detection for the requesting user

### Fixed - Bug Fixes

#### Search Channels Enhancement
- **Added user role fields to search results**
  - Now returns isMember, isAdmin, isOwner for each channel
  - Fixed role detection when accessing channels via search

---

## [1.3.0] - 2026-05-12

### Added - New Features

#### Channel Avatar Management with Multer
  - File upload with `multipart/form-data` 
  - Store files in `data/uploads/avatars/`
  - File type validation (JPEG, PNG, GIF, WebP only)
  - File size limit (max 5MB)
  - Auto-rename files with `userId` to prevent duplicates

#### Avatar Management Endpoints
- **`POST /api/channels/:channelId/avatar`** - Upload new avatar
  - Automatically delete previous avatar from disk
  - Only channel owner can upload
- **`DELETE /api/channels/:channelId/avatar`** - Delete avatar
  - Delete file from disk and database
  - Only channel owner can delete

#### Channel Update Improvement
- **Separated text update from avatar update**
  - `PUT /api/channels/:channelId` - edit only name, username, description
  - Avatar removed from this endpoint (use separate endpoint)

### Technical Improvements
- **Helper function `deleteAvatarFile`** for safe file deletion from disk
- **Correct file path handling** using `path.join` and `__dirname`
- **Auto file cleanup on error** (cleanup in catch block)

### Changed
- Changed `updateChannel` in controller - removed `avatar` from body
- Added `updateChannelAvatar` in service
- Fixed static file path for uploaded files

### Security
- Permission check before any avatar operation
- File type and size validation before storage

---

## v1.2.0 — Security & Session Architecture Upgrade (2026-02-27)

### 🔐 Security System Overhaul
- Added device-based session tracking stored directly inside each user object.
- Added login activity logs (device, country, IP hash, timestamp).
- Added automatic session creation on login.
- Added automatic session deactivation on logout.
- Added country detection using IP (with privacy-first hashing).
- Added device detection using User-Agent parsing.
- Added sessionId to JWT payload for future multi-device control.
- Removed `login_logs.json` and `sessions.json` in favor of unified user-based storage.

### 🧠 Authentication Improvements
- Rebuilt `auth.service.js` to:
  - Store loginLogs and sessions inside user.
  - Update country only on first valid login.
  - Hash IP addresses using SHA-256.
  - Track lastSeen and isOnline accurately.
- Improved error handling and fallback logic for GeoIP detection.
- Improved password hashing and validation flow.

### 🗂 Database Layer Changes
- Cleaned up `db.service.js`:
  - Removed all login log and session file operations.
  - Simplified user update logic.
  - Ensured backward compatibility for existing users.
- Unified all security-related data inside `users.json`.

### 🧹 Cleanup & Refactoring
- Removed unused code paths.
- Improved structure of authentication modules.
- Added safer defaults for missing IP or User-Agent.
- Improved consistency of timestamps across the system.

---

## Notes
This backend update prepares the system for:
- Terminating individual sessions
- Logging out from all devices
- Email notifications for new logins
- Admin security dashboards

---

## [1.1.0] - 2026-02-26

### 🚀 New Features
- **New endpoint:** `POST /api/chats/find-or-create`
  - Supports both `username` and `userId` in the request body

### 📁 Updated Files
- `src/controllers/chat.controller.js` — added `findOrCreateChat` method
- `src/routes/chat.routes.js` — added `/find-or-create` route
- `src/services/chat.service.js` — added `findOrCreateChat` service

### ✨ Added Capabilities
- Lookup user by username
- Validate user existence
- Prevent self-chat creation
- Detect existing chat between two users
- Create a new chat if none exists

### 🐛 Bug Fixes
- Fixed JSON parsing error in `users.json`
- Fixed 404 error in `find-or-create` route
- Fixed routing order issues

---

## [1.0.1] - 2026-02-25

### 🛠️ Fixed
- **CORS issue**: Fixed preflight request problem for login endpoint
- **Environment configuration**: Added proper .env setup with JWT secret
- **Authentication**: Resolved JWT secret loading issue causing 500 errors
- **Message status**: Fixed message seen status not updating in real-time

### 🔧 Changed
- Updated CORS settings to allow frontend on port 5173
- Improved error handling for missing environment variables
- Enhanced database queries for better performance
- Updated user status tracking for online/offline states

### 📦 Added
- Backend environment configuration guide (.env.example)
- Proper gitignore rules for backend
- Input validation for login and registration
- Better error messages for API responses

### 🔐 Security
- Strengthened JWT token validation
- Added rate limiting for login attempts
- Improved password hashing configuration

---

## [1.0.0] - 2025-01-01

### 🎉 Initial Release — Talkify Backend v1.0.0

The first stable release of Talkify backend server.

### ✅ Added
- **Authentication System**
  - JWT-based authentication
  - Register/Login with bcrypt password hashing
  - Token refresh mechanism

- **Chat System**
  - Private messaging between users
  - Message status tracking (sent, delivered, seen)
  - Message editing and deletion
  - Reactions support

- **Real-time Communication**
  - Socket.io integration for instant messaging
  - Typing indicators
  - Online/offline user status
  - Read receipts

- **File Handling**
  - File upload with multer
  - Image and video support
  - Avatar management

- **Database Layer**
  - JSON file-based storage
  - CRUD operations for all entities
  - Data persistence

- **Additional Features**
  - Block/unblock users
  - Suspension system
  - Report system
  - Admin panel API
  - System account support

### 🔧 Technical Stack
- Node.js + Express
- Socket.io for WebSocket
- JWT for authentication
- Multer for file upload
- UUID for IDs
- bcrypt for password hashing

### 🔐 Security Features
- Authentication middleware for protected routes
- Input sanitization
- Rate limiting on sensitive endpoints
- Secure file upload validation

---

## 📌 Notes
Backend server built with Express and Socket.io for real-time communication.
