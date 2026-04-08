# StoryHub 🚀

A full-stack blog platform built with Next.js, focused on real-time interactions, scalable notification systems, and production-level architecture.

## ✨ Features

### 📝 Content Creation & Management
- Robust post CRUD system designed for real-world use cases
- Rich text editor with clean slug-based post pages (Tiptap)
- Autosave functionality to prevent data loss during writing
- Soft delete implementation to preserve data integrity
- Logged-in user dashboard (All / Drafts / Published posts)

### 💬 Comments System
- Full CRUD for comments
- Recursive rendering of nested replies
- Highlight & scroll-to-comment functionality for better UX

### 🔐 Authentication & Security
- Secure authentication with proper authorization and ownership validation
- Signed URLs for secure media access (via Supabase)

### ❤️ Core Engagement
- Like system for posts
- Bookmark posts for later reading
- Dedicated bookmarks page

### 👥 Social Graph
- Follow / Unfollow system

### 🔍 Discovery
- Full-text search across users and posts

### 🔗 Connections
- Followers & following lists
- Suggested users
- Mutual connections system

### 🔔 Notifications System
- Real-time in-app notifications using Server-Sent Events (SSE)
- Digest email system to batch and deliver notifications efficiently

### 📊 Activity & Interactions
- Comprehensive activity feed covering:
  - User ↔ User interactions (follows)
  - Post interactions (likes, comments)
  - Comment interactions (replies, likes)
- Aggregated handling for high-frequency events (post likes & comment likes) to optimize feed clarity and performance

## 🛠️ Tech Stack

### Frontend
- Next.js (App Router)
- React

### UI & UX
- Shadcn UI (component library)
- Framer Motion (animations)
- React-Toastify (notifications/toasts)
- Tiptap (rich text editor)

### Backend
- Next.js API Routes
- Node.js

### Database
- MongoDB
- Mongoose (Schema design & relationships)

### Real-Time & Background Jobs
- Server-Sent Events (SSE) for real-time notifications
- BullMQ + Redis (queue system for background jobs & email processing)

### Storage & Media
- Supabase (Signed URLs for secure asset access)

### Email Infrastructure
- Nodemailer (email sending)
- Mailtrap (email testing in development)

### API Testing & Development Tools
- Postman (API testing)

### State & UX Enhancements
- Debounced autosave system for improved performance and UX
- Optimistic UI patterns 


## 🌐 Live Demo

https://your-app.vercel.app
  

## 📦 Installation

```bash
git clone https://github.com/Swarnabha07/StoryHub.git
cd storyhub
npm install
cp .env.example .env.local
npm run dev
