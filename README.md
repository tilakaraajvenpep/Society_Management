# SocietyPro - Modern Society Management System

SocietyPro is a robust, multi-tenant SaaS platform designed to streamline apartment and housing society management. It provides comprehensive tools for administrators to manage members, payments, and helpdesk tickets, while offering residents a clean portal to track their dues and interact with management.

## 🚀 Key Features

### 🏢 Multi-Tenant Architecture
- **Strict Data Isolation**: Each society (tenant) operates in a complete silo. User records, payments, and settings are scoped to the specific society.
*   **Dynamic Branding**: Login pages and portals automatically adapt to the society's branding and settings.
*   **Role-Based Access**: Specialized dashboards for Super Admins, Tenant Admins (Society Managers), and Residents (Members).

### 👥 Member Management
- **Automated Onboarding**: Simplified member registration with automatic user account creation.
- **Data Privacy**: Mobile numbers and emails are unique per tenant, allowing users to participate in multiple societies without conflicts.
- **Status Tracking**: Track member activity, flat numbers, and contact details.

### 💰 Maintenance & Finance
- **Automated Billing**: Flexible billing cycles (Monthly, Quarterly, Annual) with smart end-date calculation.
- **Payment Collection**: Record payments via Cash, UPI, Bank Transfer, or Cheque with receipt generation.
- **Resident Portal**: Residents can log in to view their current dues, download receipts, and track payment history.
- **Cash Management**: Treasurer tools for tracking cash on hand, bank deposits, and inter-admin transfers.
- **Expense Tracking**: Log society expenses, categorize them, and manage vendor payments.

### 🎫 Helpdesk & Communication
- **Ticket System**: Residents can raise issues with priority levels (Low to Urgent).
- **Interactive Chat**: Real-time communication between residents and management within tickets.
- **Resolution Tracking**: Status updates (Open, In Progress, Resolved) to ensure no issue is missed.

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, TypeScript, Lucide Icons, Vanilla CSS (Premium Dark/Light UI).
- **Backend**: Node.js, Express, TypeScript (Node16 ESM).
- **Database**: PostgreSQL with Prisma ORM.
- **Authentication**: JWT (JSON Web Tokens) with multi-tenant scoping.

## 📐 Architecture & Data Model

### Strict Isolation Logic
SocietyPro uses a **Shared Database, Shared Schema** multi-tenancy model. Every table contains a `tenantId` field, and all database queries are strictly scoped to this ID. Composite unique constraints (e.g., `@@unique([mobile, tenantId])`) ensure that data integrity is maintained within a society while allowing global flexibility.

### Core Schema Overview
- **Tenant**: Stores society configuration, billing amounts, and feature toggles.
- **User**: Authentication entity with role-based permissions (Super Admin, Tenant Admin, Member).
- **Member**: Business entity representing a resident, linked to a User for portal access.
- **Payment**: Records all financial transactions with unique, tenant-specific receipt numbers.
- **Ticket**: Centralizes helpdesk requests and discussion threads.
- **CashBalance**: Real-time tracking of physical cash held by administrators.

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database

### 1. Database Setup
```bash
cd backend
# Create a .env file with your DATABASE_URL and JWT_SECRET
npx prisma db push
npx prisma generate
```

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 📄 Implementation Details

- **Module System**: Backend uses `Node16` resolution for modern TypeScript compatibility.
- **UI/UX**: Custom design system using CSS variables for high-performance, themeable interfaces without the overhead of heavy frameworks.
- **Security**: Password hashing via Bcrypt and stateless JWT authentication.
- **Scalability**: Designed to handle hundreds of societies with thousands of residents each through optimized Prisma indexing.

---
© 2026 SocietyPro. All rights reserved.
