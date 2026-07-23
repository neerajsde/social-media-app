# 🌟 ReelTube Frontend

<div align="center">

  **A Premium Next-Generation ReelTube Platform**

  [![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Redux Toolkit](https://img.shields.io/badge/Redux-593D88?style=for-the-badge&logo=redux&logoColor=white)](https://redux-toolkit.js.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)

</div>

---

## 📖 Introduction

ReelTube is a modern, high-performance ReelTube and OTT platform tailored for seamless media sharing, real-time engagement, and short-form video content (Reels). This repository contains the Next.js frontend built with performance, premium UI/UX, and scalability in mind.

### 💡 Key Highlights
- **Premium Aesthetics**: Designed with a sleek dark mode, glassmorphism UI components, smooth micro-animations, and responsive layouts across all devices using Tailwind CSS and Radix/Shadcn UI.
- **Real-Time Interactivity**: Powered by Socket.io and RTK Query to provide instant messaging, real-time unread notification badges, and live engagement updates without full page reloads.
- **Robust State Management**: Uses Redux Toolkit and RTK Query for caching, predictive fetching, and maintaining global UI and authentication state efficiently.
- **Infinite Scrolling Feed**: Seamlessly loads posts and reels dynamically as the user scrolls, minimizing initial load times and maximizing user retention.
- **Secure & Integrated**: Fully integrated with the backend's robust Two-Factor Authentication (2FA), device session management, and JWT-based zero-trust security.

---

## 🛠 Tech Stack & Architecture

### Core Technologies
- **Framework**: [Next.js (App Router)](https://nextjs.org/) for Server-Side Rendering (SSR) and optimized client-side routing.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) combined with [Shadcn UI](https://ui.shadcn.com/) for a highly customizable and accessible design system.
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) & [RTK Query](https://redux-toolkit.js.org/rtk-query/overview) for declarative data fetching and cache management.
- **Real-Time Data**: [Socket.io-client](https://socket.io/) for websocket connections to power chat and notifications.
- **Forms & Validation**: Integrated robust form management strategies and UI feedback loops (e.g., Sonner for toast notifications).
- **Icons**: [Lucide React](https://lucide.dev/) for a consistent, lightweight iconography system.

### Project Structure
```bash
frontend/
├── app/          # Next.js 13+ App Router (Pages, Layouts, API routes)
├── components/   # Reusable UI components (Shared, UI library, Layout pieces)
├── lib/          # Redux Store, RTK Query APIs, Hooks, and Utility functions
├── public/       # Static assets like images and fonts
└── types/        # TypeScript interfaces and global type definitions
```

---

## 🚀 Key Features

### 🎬 Media & Feed
- **Dynamic Feeds**: "For You" and "Following" feeds with optimized infinite scrolling mechanisms.
- **Reels Player**: A dedicated TikTok/Shorts style vertical video scrolling interface.
- **Upload Studio**: Rich media uploader for posts, images, and videos with preview capabilities.

### 💬 Social & Real-Time
- **Live Chat**: Instant messaging interface with online presence tracking.
- **Interactive Notifications**: Real-time push alerts for likes, follows, comments, and messages.
- **Explore & Search**: Advanced discovery pages to find new creators and trending content.

### ⚙️ User Settings & Security
- **Profile Customization**: Edit bio, social links, avatars, and banner images.
- **Account Security**: Device management to revoke active sessions remotely.
- **2FA Management**: Seamlessly enable/disable Time-Based One-Time Passwords (TOTP) directly from the UI.

---

## 🚦 Getting Started

### Prerequisites
- **Node.js**: v18 or higher
- **npm** or **yarn** or **pnpm**

### Installation

1. **Clone & Install**
   ```bash
   git clone https://github.com/neerajsde/social-media-frontend.git
   cd social-media-frontend
   npm install
   ```

2. **Environment Configuration**
   Create a `.env.local` file in the root. Use the provided template below:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:7682/api/v1
   NEXT_PUBLIC_SOCKET_URL=http://localhost:7682
   ```

3. **Run the Application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm run build
   npm start
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 🛡 License
This project is licensed under the **ISC License**.

---
<div align="center">
  Developed with ❤️ by <a href="https://github.com/neerajsde">Neeraj Prajapati</a>
</div>
