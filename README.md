# **Talkify — Modern Messaging Platform**
A modern, full‑featured messaging system with real‑time chat, channels, reactions, admin tools, and a polished UI/UX — engineered with clean architecture and production‑ready standards.

> A flagship portfolio project by **Amirhossein Agrest**, showcasing system design, security‑first backend logic, and premium frontend engineering.

---

## ✨ Features

- Real‑time private chat  
- Channel system with verification badges  
- Admin panel for managing users, channels, and broadcasts  
- Message editing, deleting, reactions, and status tracking  
- File & media messaging (images, videos, documents)  
- System chat for support communication  
- Global broadcast messaging  
- Clean, modular backend with strict access control  
- Fully translated, production‑ready English UI  

---

## 🧠 Overview

Talkify is built as a modern messaging ecosystem inspired by platforms like Telegram and Discord.  
It includes:

- A secure backend with strict permission rules  
- A polished, responsive frontend  
- A complete admin dashboard  
- A scalable architecture suitable for real production environments  

This project demonstrates real engineering ability — not just UI work.

---

## 🧩 Tech Stack

### **Frontend**
- React + TypeScript  
- Tailwind CSS  
- ShadCN UI  
- Zustand  
- Vite  

### **Backend**
- Node.js  
- Custom DB service layer  
- Clean modular architecture  
- UUID-based resource IDs  

---

## 🔐 Security & Access Control
- Users can only access chats they participate in

- Users can only edit/delete their own messages

- Deleted messages cannot be edited

- System chat is protected from unauthorized messages

- Clean error handling with formatError

### Example:

```bash
if (!chat.participantIds.includes(userId)) {
  throw formatError('You do not have access to this chat', 403);
}
```

---

## 📦 Installation
```bash
git clone https://github.com/AmirhosseinAgrest/Talkify.git
cd talkify
cd talkify-frontend
npm install
cd talkify-backend
npm install
```

---

## 🛠 Development
### Frontend:

```bash
cd talkify-frontend
npm run dev
```

### Backend:

```bash
cd talkify-backend
npm run dev
```

---

## 📜 API Examples
```bash
export const deleteMessageById = async (messageId, userId) => {
  const message = await db.getMessageById(messageId);
  if (!message) throw formatError('Message not found', 404);
  if (message.senderId !== userId) throw formatError('You cannot delete this message', 403);

  return await db.updateMessage(messageId, {
    isDeleted: true,
    content: 'This message has been deleted',
  });
};
```
---
## 🧭 Roadmap
- ✅ Real‑time messaging

- ✅ Channels

- ✅ Admin panel

- ✅ Broadcast system

- ⏳ Voice messages

- ⏳ Group chats

- ⏳ Push notifications
---
## 👤 Author
 **Amirhossein Agrest** Creator & Lead Developer Open‑source advocate and system architect
