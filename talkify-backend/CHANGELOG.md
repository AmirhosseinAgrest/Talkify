# Changelog - Talkify Backend
All notable changes to the backend application will be documented in this file.

This project follows **Keep a Changelog** and adheres to **Semantic Versioning**.

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
