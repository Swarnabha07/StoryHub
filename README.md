# StoryHub 🚀

A full-stack blogging platform built with Next.js, featuring real-time interactions, creator analytics, scheduled publishing, scalable notification systems, and production-grade architecture.

## ✨ Features

### 📝 Content Creation & Management

- Robust post CRUD system designed for real-world use cases
- Rich text editor with clean slug-based post pages (Tiptap)
- Autosave functionality to prevent data loss during writing
- Soft delete implementation to preserve data integrity
- Logged-in user dashboard (All / Drafts / Published / Scheduled posts)

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

### 📚 Personal Library

- Dedicated library page for logged-in users
- Bookmarked stories collection
- Liked stories collection

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

### 📈 Stats & Analytics

- Dedicated analytics dashboard for content creators
- Stats cards providing quick insights into overall platform engagement
- Engagement chart for visualizing trends in views, likes, comments, and user activity
- Audience chart to help understand readership patterns over time
- Most Engaged Posts section highlighting top-performing content
- Per-post analytics page with detailed metrics and performance insights for individual posts

### ⏰ Scheduled Publishing

- Schedule posts to be automatically published at a future date and time
- Quick scheduling presets (e.g. 1 hour, 12 hours, 24 hours)
- Custom date & time scheduling support
- Reschedule or cancel scheduled posts at any time before publication
- Automated publishing powered by a secure background publishing endpoint
- Timezone-safe scheduling implementation to ensure consistent publishing behavior across environments

## 🛠️ Tech Stack

### Frontend

- Next.js (App Router)
- React

### UI & UX

- Shadcn UI (component library)
- Framer Motion (animations)
- React-Toastify (notifications/toasts)
- Tiptap (rich text editor)
- Recharts (analytics & data visualization)
- Lordicon (interactive animated icons)

### Backend

- Next.js API Routes
- Node.js

### Database

- MongoDB
- Mongoose (Schema design & relationships)

### Real-Time & Background Jobs

- Server-Sent Events (SSE) for real-time notifications
- BullMQ + Redis (queue system for background jobs & email processing)
- cron-job.org (scheduled post publishing automation)

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

https://storyhub-seven.vercel.app/

## 📦 Installation

```bash
git clone https://github.com/Swarnabha07/StoryHub.git
cd storyhub
npm install
cp .env.example .env.local
npm run dev
```
