# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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