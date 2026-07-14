# PPD Store - Frontend Application

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000)
![React](https://img.shields.io/badge/React-19.2-20232A?style=flat&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-007ACC?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8.1-%23646CFF.svg?style=flat&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

> **The customer-facing storefront and administrative dashboard for the PPD Store e-commerce platform.**

## 📖 Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture & Design Patterns](#architecture--design-patterns)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [State Management Strategy](#state-management-strategy)
- [Deployment](#deployment)
- [License](#license)

---

## 🌟 Overview

The frontend architecture of PPD Store is engineered as a highly optimized, lightning-fast Single Page Application (SPA). Built upon the cutting-edge React 19 ecosystem and bundled via Vite, it guarantees millisecond response times and a seamless user experience. 

It uniquely serves dual purposes:
1. **The Storefront:** An immersive, high-conversion environment for B2B/B2C customers featuring real-time carts, instantaneous filtering, and fluid Razorpay checkouts.
2. **The Command Center:** A secure, role-protected administrative dashboard granting business owners absolute control over product lifecycles, user moderation, and inventory analytics.

---

## ✨ Key Features

### 🛒 Customer Experience
- **Dynamic Product Grids:** Instantaneous rendering of product catalogs using TanStack Query for background fetching and caching.
- **Persistent Cart System:** Client-side state managed by Zustand, surviving page refreshes and bridging the gap between sessions.
- **Frictionless Checkout:** Multi-step, state-driven checkout wizard securely integrated with Razorpay's modal UI.
- **Account Management:** Comprehensive user profiles detailing order history, saved addresses, and active wishlist items.

### 🛡️ Administrative Control
- **Inventory Management:** Full CRUD interfaces for products and categories with image upload previews.
- **Bulk Operations:** Dedicated UI for importing hundreds of SKUs via Excel/CSV.
- **Data Validation:** Bulletproof client-side forms utilizing React Hook Form paired with strict Zod schemas to guarantee data integrity before it reaches the API.

---

## 🏗 Architecture & Design Patterns

The source code adheres to a strict feature-based architecture to guarantee high cohesion and loose coupling.

```text
src/
├── assets/       # Static global assets (SVGs, logos)
├── components/   # Pure, presentational UI components (Buttons, Inputs, Cards)
│   ├── ui/       # Headless UI primitives 
│   └── shared/   # Components shared across multiple features
├── features/     # Domain-driven feature modules
│   ├── auth/     # Login, Registration, JWT handling
│   ├── products/ # Product listings, detail views
│   ├── cart/     # Cart slide-outs and logic
│   └── admin/    # Protected dashboard routes
├── hooks/        # Custom React hooks (e.g., useAuth, useDebounce)
├── lib/          # Utility functions (date formatting, class merging)
├── services/     # Axios API instances and interceptors
├── store/        # Zustand global state slices
├── types/        # Global TypeScript interfaces and Zod schemas
└── App.tsx       # Root router (React Router v7)
```

---

## 💻 Technology Stack

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Core UI** | React 19 | Component-based rendering engine |
| **Language** | TypeScript | Enterprise-grade static type safety |
| **Build Tooling** | Vite | Ultra-fast HMR and optimized production builds |
| **Styling** | Tailwind CSS v4 | Utility-first CSS framework for rapid UI design |
| **Routing** | React Router v7 | Declarative, nested client-side routing |
| **Local State** | Zustand | Unopinionated, lightweight global state |
| **Server State** | TanStack Query | Asynchronous data fetching, caching, and mutation |
| **Forms** | React Hook Form | Performant, un-controlled form state management |
| **Validation** | Zod | TypeScript-first schema validation |
| **UI Polish** | Sonner, Lucide | Toast notifications and SVG iconography |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Backend API running locally (or a deployed staging URL)

### 1. Installation
Clone the repository and install the dependencies:
```bash
cd frontend
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root of the `frontend` directory. Do not commit this file to version control.
```env
# The base URL of the NestJS Backend API
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

### 3. Development Server
Boot up the Vite development server with Hot Module Replacement (HMR):
```bash
npm run dev
```
The application will be accessible at `http://localhost:5173`.

---

## 📦 Deployment

To create an optimized, minified production build:
```bash
npm run build
```
Vite will compile the application into the `dist` directory. These static files can be deployed to any static hosting provider such as **Vercel**, **Netlify**, or an **Nginx** reverse proxy on a VPS.

---

## 📄 License

**MIT License**

Copyright (c) 2026 PPD Store

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
