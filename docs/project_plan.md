# Restaurant PWA Project Plan

This document outlines the development schedule, phase objectives, and team resource allocation for building the Restaurant PWA.

---

## 1. Project Timeline

```mermaid
gantt
    title Restaurant PWA Roadmap
    dateFormat  YYYY-MM-DD
    section Week 1: Core Foundation
    Database & API Design      :active, w1a, 2026-06-03, 2d
    Frontend & Backend Setup   :w1b, after w1a, 1d
    Authentication             :w1c, after w1b, 2d
    Menu & Cart Management     :w1d, after w1c, 2d
    Order Management           :w1e, after w1d, 1d
    section Week 2: Advanced Features
    Payment & Delivery         :w2a, after w1e, 3d
    Customer Support & Admin   :w2b, after w2a, 3d
    PWA Features & Testing     :w2c, after w2b, 2d
    Deployment & Documentation :w2d, after w2c, 2d
```

---

## 2. Weekly Deliverables

### Week 1: Core Architecture & Crucial Workflows
Focuses on scaffolding the systems, setting up databases/servers, authentication, and core ordering flows.

- [x] **Database Design**
  - Schema creation, indexing, relationships, and migrations setup.
- [x] **API Design**
  - Definition of REST endpoints, schemas, payloads, and API contracts.
- [x] **Frontend Setup**
  - Framework initialization (Vite + React), styling system configuration, router, and basic layout structure.
- [x] **Backend Setup**
  - Server initialization, configuration, database connectivity, and base routing.
- [x] **Authentication**
  - User registration, login, hashing, JWT token-based session management, and role validation.
- [x] **Menu Management**
  - Fetching items by category, detailed item views, and stock availability updates.
- [x] **Cart Management**
  - State management for carts, adding/editing/removing items, and persistency checks.
- [x] **Order Management**
  - Checkout flows, order object construction, and order status tracking.

---

### Week 2: Integration, Support, and Launch
Focuses on payment processing, delivery integration, administrator dashboards, offline PWA features, and deployment.

- [x] **Payment Module**
  - Payment gateway integration, transaction records, and payment status hooks.
- [x] **Delivery Module**
  - Delivery dispatch, rider assignment, and real-time status tracking updates.
- [x] **Customer Support Module**
  - Complaint logging, support tickets creation, and response updates.
- [x] **Admin Dashboard**
  - Metrics, order management, menu editor, and complaints handling panel.
- [x] **PWA Features**
  - Service worker configuration, caching strategy (offline capability), manifest file, and install prompt.
- [x] **Testing**
  - Unit tests, integration tests, and end-to-end user path walkthroughs.
- [x] **Deployment**
  - Host setups (e.g. Vercel for frontend, Render/AWS for backend/database).
- [x] **Documentation**
  - API reference completion, system design graphs, and setup guide.

---

### Advanced Features (Completed Post-Launch)
Focuses on extending the user experience, maximizing customer retention, and facilitating customer relationship management.

- [x] **Loyalty Rewards Program**
  - Manager rules editor (setting earn/redeem conversion rates, minimum redeeming points threshold).
  - Customer profile widgets showing point balances and detailed transaction logs.
  - Automatic earning of points upon order delivery; deduction of points upon redemption at checkout.
- [x] **Promotions & Offers Module**
  - Support for percentage-based category discounts, flat checkout discounts with min-spend rules, and combo packages.
  - Interactive manager panel for creating, updating, toggling active states, and deleting offers.
  - Checkout calculator integration to auto-apply the best discount rate.
- [x] **Real-Time Notification System**
  - Supabase database triggers coupled with Node.js Express server to detect postgres insertions.
  - Persistent Server-Sent Events (SSE) server stream with query-token authentication.
  - PWA customer toast prompts, active admin alert popups, and unread notification bell badges.

---

## 3. Team Allocation & Responsibilities

| Role / Owner | Domain | Assigned Responsibilities |
| :--- | :--- | :--- |
| **Member 1** | Frontend + PWA | - React layout and component structure<br>- Frontend state management (Cart, Authentication)<br>- PWA integration (Service workers, offline caching)<br>- UI/UX styling |
| **Member 2** | Backend + Database | - Database design and query optimization<br>- Core API endpoints and routing<br>- Authentication and role-based security layers<br>- Admin dashboard metrics and data APIs |
| **Member 3** | Integration & Support | - Payment gateway integration<br>- Delivery tracking module and rider assignment APIs<br>- Customer support ticket workflows and complaint APIs |
