# Smart Parking Management System

## Project Overview
This project is a comprehensive **Smart Parking Management System** designed to streamline urban parking operations through a multi-role digital ecosystem. It simplifies the parking lifecycle—from vehicle registration and QR-based entry to automated billing and retrieval progress tracking.

### Users
- **User (Customer):** Parks and retrieves their own vehicles using QR codes.
- **Driver (Valet):** Handles the physical parking and retrieval tasks assigned by the system.
- **Manager:** Oversees specific site operations, assigns valets, and manages driver recruitment.
- **Super Admin:** The master controller of the system, managing all sites, approving new drivers, and monitoring global metrics.

### High-Level Architecture
- **Mobile App:** Built with **React Native (Expo)**, providing a unified interface for all user roles.
- **Backend:** Powered by **Supabase**, leveraging PostgreSQL for data persistence, Supabase Auth for identity management, and Row Level Security (RLS) for enterprise-grade data isolation.

---

## Features Implemented

### 🚗 User Dashboard
- **Vehicle Registration:** Add and manage a personal fleet of vehicles with auto-fill support.
- **QR-Based Parking:** Scan a location-specific QR code to initiate a parking session instantly.
- **Active Session Tracking:** View live parking tickets, including duration and real-time charging.
- **Vehicle Retrieval:** Request vehicle retrieval via the "One-Tap Retrieve" feature and track the driver's progress.

### 🧤 Driver Flow
- **Task Management:** Receive real-time assignments for parking or retrieving vehicles.
- **State Machine Integration:** Systematic flow from "Request Received" to "Parked/Retrieved" with visual progress indicators.
- **Performance Tracking:** View statistics on completed tasks within the driver console.

### 📈 Manager Dashboard
- **Operational Oversight:** Monitor active sessions, waitlists, and completed transactions for their site.
- **Driver Recruitment:** Submit new driver applications, including document uploads (license, photos), for system-wide approval.
- **Site Metrics:** High-level overview of total revenue and ticket volume.

### 🛡️ Super Admin Dashboard
- **Site Management:** Toggle between diverse parking sites (e.g., Mall, Airport, Plaza) to view site-specific data.
- **Driver Approvals:** Review, approve, or reject pending driver applications with a detailed profile viewer.
- **Global Metrics:** Real-time collection analytics (Daily vs. Total) and system-wide ticket history.

---

## Tech Stack
- **Frontend:** React Native, Expo, Lucide Icons, React Navigation.
- **Backend:** Supabase (PostgreSQL, Auth, RLS).
- **Styling:** Vanilla CSS (via StyleSheet) with a focus on premium, modern aesthetics and micro-animations.

---

## Setup Instructions

### 1. Supabase Project Creation
1. Core a new project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor**.

### 2. Running SQL Migrations
Run the scripts located in the `/migrations` folder in the following order to set up your schema and seed data:
1. `001_users_system.sql`
2. `002_vehicles.sql`
3. `003_transactions.sql`
4. `004_seed_test_users.sql` (Optional: Seeds test accounts)
5. `005_pending_drivers.sql`
6. `008_add_parking_sessions_columns.sql`
7. `...` (Apply all remaining numbered migrations)

### 3. Environment Variables Setup
⚠️ **Note:** The `.env` file contains sensitive API keys and is excluded from source control.

1. Navigate to the `/mobile` directory.
2. Create a file named `.env`.
3. Copy the structure from the **Environment Variables** section below.

---

## Environment Variables
Reviewers must create their own `.env` file in the `mobile/` directory with the following variables:

```env
EXPO_PUBLIC_SUPABASE_URL=your-project-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

---

## Demo

---

https://github.com/user-attachments/assets/c2330930-b9d4-4601-832c-f8a2b6a8709a



## APK
[smart-parking-app.apk](./release/smart-parking-app.apk).

---

## AI Usage Disclosure
This project utilized modern AI tools to accelerate development and ensure code quality. This includes assistance with schema design, bug diagnosis, and boilerplate generation. All architectural decisions and feature implementations were verified and refined by a human developer.

For a detailed history of AI assistance, please refer to [AI.md](./AI.md).
