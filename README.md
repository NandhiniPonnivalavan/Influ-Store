<div align="center">

# 🛍️ Influ-Store

### *Where Social Influence Meets Seamless Commerce*

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://supabase.com/)

<p align="center">
  A next-generation creator commerce platform combining rich social feeds, video reels, interactive product discovery, verified seller storefronts, and full checkout workflows in one ultra-sleek experience.
</p>

[Explore Features](#-key-features) •
[Architecture](#-tech-stack--architecture) •
[Getting Started](#-getting-started) •
[Database Schema](#-database--data-models) •
[API Overview](#-api-routes)

---

</div>

## ✨ Highlights & Vision

**Influ-Store** bridges the gap between creator lifestyle content and instant retail checkout. Creators can share high-resolution visual posts and short-form video reels, tag products directly from their own catalogs or partner brands, and monetize their audience through dedicated storefronts.

Shoppers browse a personalized feed, watch engaging reels, discover trending styles, manage their wishlist and shopping cart, and checkout seamlessly.

---

## 🚀 Key Features

### 📸 1. Social Feed & Media Hub
- **Dynamic Content Feed**: High-resolution image posts with multi-image support, captions, hashtags, and creator attribution.
- **Short-Form Reels**: Immersive, full-screen vertical video reels with playback controls and engagement metrics.
- **Social Graph & Engagement**: Like, comment (with threaded replies), and follow/unfollow creators with instant UI optimistic updates.
- **Custom Profile Avatars**: Local photo upload with instant preview and crop support directly from user devices.

### 🏪 2. Creator Storefronts & Seller Ecosystem
- **Multi-Step Seller Verification**: Dedicated application flow with draft persistence (`/seller/apply`), identity proof uploads, address verification, and automated approval workflows.
- **Personalized Storefronts**: Customizable seller storefronts (`/store/[slug]`) complete with custom hero banners, logo badges, verified checkmarks, and brand descriptions.
- **Comprehensive Product Catalog**: Single & variant product management with custom options (size, color), SKU tracking, stock management, and high-resolution media galleries.

### 🔒 3. Granular Privacy & Profile Controls
- **Private Profiles**: Toggle privacy in settings to restrict posts, reels, and stories exclusively to approved followers with a stylish locked placeholder for non-followers.
- **Notification Preferences**: Granular control over in-app interaction alerts and weekly email digest updates.
- **Account Types**: Seamless distinction between standard customer accounts and verified creator/seller profiles.

### 🔔 4. Real-Time Activity & Notifications
- **Event-Driven Alerts**: Automatic alerts generated when users receive likes, comments, new followers, or order status changes.
- **Global Navbar Counter**: Real-time polling badge on the navigation bar tracking unread alerts.
- **Interactive Notification Center**: Filter activity by *Likes*, *Comments*, *Follows*, and *Orders* with single-click "Mark All as Read" and dismissal.

### 💳 5. Shopping, Cart & Order Processing
- **Cart & Wishlist**: Persistent cart and wishlist synchronization supporting item quantities, variant configurations, and pricing totals.
- **Multi-Method Checkout**: Support for Card, UPI, and Cash on Delivery (COD) order placements.
- **Order Tracking**: Complete order history tracking with detailed line items and shipping statuses (`Processing`, `Shipped`, `Delivered`).

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 15 (App Router)** | Server Components, dynamic streaming, and client transitions |
| **UI & Styling** | **Tailwind CSS + Lucide Icons** | Modern dark-mode aesthetic with glassmorphism effects |
| **Language** | **TypeScript** | Strict end-to-end type safety across components and services |
| **Database & ORM** | **PostgreSQL (Supabase) + Prisma** | Relational data integrity, connection pooling, and migrations |
| **Authentication** | **JOSE (JWT) + Secure Cookies** | Lightweight, stateless, HTTP-only cookie session management |
| **Validation** | **Zod** | Schema-level runtime validation for forms and API requests |
| **Storage Engine** | **Local & Cloud Storage Providers** | Modular storage service for product media, verification files, and avatars |

---

## 📂 Project Structure

```bash
Influ-Store/
├── prisma/
│   └── schema.prisma              # Database schema definitions
├── public/                        # Static assets and icons
├── src/
│   ├── app/                       # Next.js App Router pages and APIs
│   │   ├── api/                   # REST API routes (auth, posts, seller, settings, etc.)
│   │   ├── create-post/           # Post creation interface
│   │   ├── create-reel/           # Video reel upload interface
│   │   ├── explore/               # Discovery and hashtag search
│   │   ├── home/                  # Social activity feed
│   │   ├── notifications/         # Notification center
│   │   ├── profile/[username]/    # Public and private creator profiles
│   │   ├── reels/                 # Vertical video feed
│   │   ├── seller/                # Seller portal (apply, products, store setup)
│   │   ├── settings/              # Account, notification, and privacy settings
│   │   └── store/[slug]/          # Public seller storefronts
│   ├── components/                # Modular reusable UI components
│   │   ├── layout/                # Navbar, Footer, Mobile Drawer, UserMenu
│   │   ├── posts/                 # Post card, comments, interaction bar
│   │   ├── products/              # Product grid, product cards, variant selectors
│   │   ├── profile/               # Profile header, tabs, avatar uploader
│   │   ├── reels/                 # Reel player and vertical scroller
│   │   ├── seller/                # Product forms, document uploader, application forms
│   │   └── ui/                    # Base design system (Button, Card, Input, Modal, Badge)
│   ├── features/                  # State contexts (Auth, Cart, Toast)
│   ├── lib/                       # Core backend utilities, services, and db clients
│   │   ├── auth/                  # Session verification and role gates
│   │   ├── db/                    # Prisma client singleton
│   │   ├── services/              # Business logic (products, orders, notifications, etc.)
│   │   └── validations/           # Zod schemas
│   └── types/                     # Application-wide TypeScript interfaces
└── package.json
