# Restaurant PWA & Administration Portal

A Progressive Web Application (PWA) designed for restaurants. This project features a Node.js Express backend using Supabase (PostgreSQL) for state management, coupled with two separate modern frontend clients: a client-facing Customer PWA and a Restaurant Administration Portal.

---

## Project Structure

```
├── customer-app/ # Customer-facing Progressive Web Application (PWA) on Port 5173
├── admin-app/    # Restaurant Administration Dashboard Portal on Port 5174
├── backend/      # Backend Node.js/Express API Service on Port 5000
│   ├── public/   # Static files and interactive mock menu page
│   └── src/      # API Controllers, routes, and database configs
├── docs/         # Documentation and API specifications
└── database/     # PostgreSQL schema and database seed files
```

---

## Database Setup

The backend utilizes **Supabase** (PostgreSQL) to store application data.

1. **Schema Initialization:** Execute the SQL commands in [schema.sql](file:///d:/Projects/restaurant-pwa/database/schema.sql) and [update_schema.sql](file:///d:/Projects/restaurant-pwa/database/update_schema.sql) in your Supabase database.
2. **Seed Data:** Execute the queries in [seed.sql](file:///d:/Projects/restaurant-pwa/database/seed.sql) to pre-populate categories and initial menu items (Pizzas, Burgers, Drinks, Desserts).

---

## Getting Started

### Backend Setup
1. Navigate to the `backend` directory and install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Create a `.env` file in the `backend/` directory (see [backend/.env](file:///d:/Projects/restaurant-pwa/backend/.env)) with the following keys:
   ```env
   PORT=5000
   SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
   SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
   SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE"
   JWT_SECRET="YOUR_JWT_SECRET_FOR_SIGNING_TOKENS"
   ```
3. Run the backend server:
   - **Development Mode:** `npm run dev`
   - **Production Mode:** `npm start`

### Customer App Setup (`customer-app`)
The Customer App is a Progressive Web Application (PWA) tailored for placing orders, tracking deliveries, and managing support tickets. Runs on port `5173`.
1. Navigate to the directory and install dependencies:
   ```bash
   cd customer-app
   npm install
   ```
2. Run the application:
   - **Development Mode:** `npm run dev` (runs on [http://localhost:5173](http://localhost:5173))
   - **Production Build:** `npm run build`

### Admin App Setup (`admin-app`)
The Admin Portal is a dedicated dashboard for restaurant staff to manage active orders, update statuses, resolve complaints, and approve refunds. Runs on port `5174`.
1. Navigate to the directory and install dependencies:
   ```bash
   cd admin-app
   npm install
   ```
2. Run the application:
   - **Development Mode:** `npm run dev` (runs on [http://localhost:5174](http://localhost:5174))
   - **Production Build:** `npm run build`

---

## Access Control & Roles

The system uses role-based access validation on both frontend and backend to secure the restaurant management flows:

### Frontends
- **Customer App** allows login via temporary email OTP verification and does not contain any administration dashboard elements or buttons.
- **Admin App** is restricted to staff (roles `admin` or `manager`). Authenticated users without staff permissions are redirected back to the login screen. It features metric overviews, an order management grid, and a customer support ticketing portal.

### Backend Endpoints
All administration-facing endpoints are protected via an `authorizeStaff` middleware which verifies the authenticated user has a role of `admin` or `manager`. Non-staff users requesting these endpoints receive a `403 Forbidden` response.

| Category | Endpoint | Method | Role Required | Description |
| :--- | :--- | :---: | :---: | :--- |
| **System** | `/` | `GET` | *None* | API Welcome status |
| | `/api/health` | `GET` | *None* | Health check endpoint |
| **Authentication** | `/api/auth/register` | `POST` | *None* | User registration (Passwords restricted to staff) |
| | `/api/auth/login` | `POST` | *None* | User password login (Staff Only) |
| **Menu** | `/api/menu` | `GET` | *None* | Retrieve list of menu items |
| **Cart** | `/api/cart` | `GET` | Customer | Retrieve user's current shopping cart |
| | `/api/cart` | `POST` | Customer | Add/update item quantity in cart |
| | `/api/cart/:itemId` | `DELETE` | Customer | Remove item from cart |
| **Orders** | `/api/orders` | `POST` | Customer | Place a new order |
| | `/api/orders` | `GET` | Authenticated | Retrieve customer's history or all active orders (Staff) |
| | `/api/orders/:id` | `PATCH` | Staff (`admin`/`manager`) | Update order status workflow |
| **Support** | `/api/support` | `POST` | Customer | Create support ticket |
| | `/api/support` | `GET` | Authenticated | Retrieve customer's tickets or all tickets (Staff) |
| | `/api/support/:id` | `PATCH` | Staff (`admin`/`manager`) | Resolve support ticket status |
| **Complaints** | `/api/complaints` | `POST` | Customer | File an order complaint |
| | `/api/complaints` | `GET` | Authenticated | Retrieve customer's complaints or all complaints (Staff) |
| | `/api/complaints/:id` | `PATCH` | Staff (`admin`/`manager`) | Resolve complaint status |
| **Refunds** | `/api/refunds` | `POST` | Customer | Request a refund for an order |
| | `/api/refunds` | `GET` | Authenticated | Retrieve customer's requests or all requests (Staff) |
| | `/api/refunds/:id` | `PATCH` | Staff (`admin`/`manager`) | Approve or reject refund |
| **Payments** | `/api/payments/process` | `POST` | Customer | Process simulated payment |
