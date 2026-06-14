# Restaurant PWA & Administration Portal

A Progressive Web Application (PWA) designed for restaurants. This project features a Node.js Express backend using Supabase (PostgreSQL) for state management, coupled with two separate modern frontend clients: a client-facing Customer PWA and a Restaurant Administration Portal.

---

## Project Structure

```
├── frontend/
│   ├── customer-app/ # Customer-facing Progressive Web Application (PWA) on Port 5173
│   └── admin-app/    # Restaurant Administration Dashboard Portal on Port 5174
├── backend/      # Backend Node.js/Express API Service on Port 5000
│   ├── public/   # Static files and interactive mock menu page
│   └── src/      # API Controllers, routes, and database configs
├── docs/         # Documentation and API specifications
└── database/    ## Database Setup

The backend utilizes **Supabase** (PostgreSQL) to store application data.

1. **Schema Initialization:** Execute the SQL commands in [schema.sql](file:///d:/Projects/restaurant-pwa/database/schema.sql) and [update_schema.sql](file:///d:/Projects/restaurant-pwa/database/update_schema.sql) in your Supabase database. The `update_schema.sql` script sets up customer profiles, custom delivery columns, the `is_featured` column flag, the rolling 30-day `popular_menu_items` view, and the real-time `notifications` table.
2. **Loyalty Program Migration:** Execute the SQL commands in [loyalty.sql](file:///d:/Projects/restaurant-pwa/database/loyalty.sql) to set up loyalty program tables (`Loyalty`, `LoyaltySettings`, `LoyaltyTransactions`) and configure points tracking fields.
3. **Offers & Ratings Migration:** Execute the SQL commands in [offers_and_ratings.sql](file:///d:/Projects/restaurant-pwa/database/offers_and_ratings.sql) to configure the `offers` table, item feedback (`item_ratings` table), and modify the `orders` table to track applied offers.
4. **Seed Data:** Execute the queries in [seed.sql](file:///d:/Projects/restaurant-pwa/database/seed.sql) to pre-populate categories and initial menu items (Pizzas, Burgers, Drinks, Desserts).

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

### Customer App Setup (`frontend/customer-app`)
The Customer App is a Progressive Web Application (PWA) tailored for placing orders, tracking deliveries, managing support tickets, tracking loyalty rewards, and receiving real-time status alerts. Runs on port `5173`.
1. Navigate to the directory and install dependencies:
   ```bash
   cd frontend/customer-app
   npm install
   ```
2. Run the application:
   - **Development Mode:** `npm run dev` (runs on [http://localhost:5173](http://localhost:5173))
   - **Production Build:** `npm run build`

### Admin App Setup (`frontend/admin-app`)
The Admin Portal is a dedicated dashboard for restaurant staff to manage active orders, update menu items, review sales reports, manage active promotional offers, and handle customer support ticket escalations. Runs on port `5174`.
1. Navigate to the directory and install dependencies:
   ```bash
   cd frontend/admin-app
   npm install
   ```
2. Run the application:
   - **Development Mode:** `npm run dev` (runs on [http://localhost:5174](http://localhost:5174))
   - **Production Build:** `npm run build`

---

## Access Control & Roles

The system uses role-based access validation on both frontend and backend to secure the restaurant management flows:

### Frontends
- **Customer App** allows login via temporary email OTP verification, permitting customers to manage their profile, addresses, cart, orders, and ratings, while listening to live order status alerts via real-time notifications.
- **Admin App** is restricted to staff (roles `staff` or `manager`). Authenticated users without staff permissions are redirected back to the login screen.
  - **Staff Dashboard:** Access to active orders, menu management, open support tickets, and categories. Staff can update order stages, resolve basic support issues, and view real-time alert notifications.
  - **Manager Dashboard:** Access to daily sales report analytics (today's revenue, averages, order counts), daily order history, escalated support tickets, active promotional offers, and loyalty settings. Managers can approve refunds, provide compensation coupons, manage offers, and configure loyalty rates.

### Backend Endpoints

- All administration-facing endpoints are protected via an `authorizeStaff` middleware which verifies the authenticated user has a role of `staff` or `manager` (or legacy `admin`). Non-staff users requesting these endpoints receive a `403 Forbidden` response.
- Manager-only endpoints (refund approvals, loyalty setting changes, and offers CRUD) are protected via an `authorizeManager` middleware which strictly verifies the user is a `manager` (or legacy `admin`).

| Category | Endpoint | Method | Role Required | Description |
| :--- | :--- | :---: | :---: | :--- |
| **System** | `/` | `GET` | *None* | API Welcome status |
| | `/api/health` | `GET` | *None* | Health check endpoint |
| **Authentication** | `/api/auth/register` | `POST` | *None* | User registration (Passwords restricted to Staff / Managers) |
| | `/api/auth/login` | `POST` | *None* | User password login (Staff / Managers Only) |
| **Menu** | `/api/menu` | `GET` | *None* | Retrieve list of menu items |
| | `/api/menu/popular` | `GET` | *None* | Retrieve list of popular menu items based on 30-day order volume |
| | `/api/menu` | `POST` | Staff / Manager | Create a new menu item |
| | `/api/menu/:id` | `PATCH` | Staff / Manager | Update menu item details or availability |
| **Categories** | `/api/categories` | `GET` | *None* | Retrieve list of categories |
| | `/api/categories/:id` | `GET` | *None* | Retrieve category details by ID |
| | `/api/categories` | `POST` | Staff / Manager | Create a new category |
| | `/api/categories/:id` | `PUT` | Admin | Update category details (Admin only) |
| | `/api/categories/:id` | `DELETE` | Admin | Delete a category (Admin only) |
| **Cart** | `/api/cart` | `GET` | Customer | Retrieve user's current shopping cart |
| | `/api/cart` | `POST` | Customer | Add/update item quantity in cart |
| | `/api/cart/:itemId` | `DELETE` | Customer | Remove item from cart |
| **Orders** | `/api/orders` | `POST` | Customer | Place a new order |
| | `/api/orders` | `GET` | Authenticated | Retrieve customer's history or all active orders (Staff / Manager) |
| | `/api/orders/:id` | `PATCH` | Staff / Manager | Update order status workflow |
| | `/api/orders/:orderId/rate` | `POST` | Customer | Submit ratings and reviews for items in a delivered order |
| | `/api/orders/:orderId/rate` | `GET` | Customer | Retrieve submitted ratings for an order |
| **Addresses** | `/api/addresses` | `GET` | Customer | Retrieve customer's saved addresses |
| | `/api/addresses` | `POST` | Customer | Add a new address to customer profile |
| | `/api/addresses/:id` | `DELETE` | Customer | Delete a saved address |
| **Delivery** | `/api/delivery/assign` | `POST` | Staff / Manager | Assign a delivery rider to an order |
| | `/api/delivery/:id/status` | `PATCH` | Staff / Manager / Rider | Update delivery status tracking stage |
| | `/api/delivery/order/:orderId` | `GET` | Authenticated | Retrieve delivery tracking details by order ID |
| | `/api/delivery/rider/:riderId` | `GET` | Authenticated | Retrieve active deliveries assigned to a rider |
| **Support** | `/api/support` | `POST` | Customer | Create support ticket |
| | `/api/support` | `GET` | Authenticated | Retrieve customer's tickets or all tickets (Staff / Manager) |
| | `/api/support/:id` | `PATCH` | Staff / Manager | Update support ticket status |
| | `/api/support/:id/escalate` | `PATCH` | Staff / Manager | Escalate support ticket to manager |
| | `/api/support/:id/resolve` | `PATCH` | Staff / Manager | Resolve basic support ticket |
| | `/api/support/:id/close` | `PATCH` | Staff / Manager | Close support ticket |
| | `/api/support/:id/refund` | `PATCH` | Manager | Approve refund on support ticket |
| | `/api/support/:id/compensate` | `PATCH` | Manager | Provide compensation on support ticket |
| **Complaints** | `/api/complaints` | `POST` | Customer | File an order complaint |
| | `/api/complaints` | `GET` | Authenticated | Retrieve customer's complaints or all complaints (Staff / Manager) |
| | `/api/complaints/:id` | `PATCH` | Staff / Manager | Resolve complaint status |
| **Refunds** | `/api/refunds` | `POST` | Customer | Request a refund for an order |
| | `/api/refunds` | `GET` | Authenticated | Retrieve customer's requests or all requests (Staff / Manager) |
| | `/api/refunds/:id` | `PATCH` | Manager | Approve or reject refund request |
| **Loyalty** | `/api/loyalty/profile` | `GET` | Customer | Retrieve customer loyalty balance and transaction log history |
| | `/api/loyalty/settings` | `GET` | Authenticated | Retrieve active loyalty program points conversion configuration |
| | `/api/loyalty/settings` | `PUT` | Manager | Update loyalty program conversion and redemption rules |
| **Offers** | `/api/offers` | `GET` | *None* | Retrieve active promotional offers valid today |
| | `/api/offers/calculate` | `POST` | Customer | Calculate best applicable discount for cart total and items |
| | `/api/offers` | `POST` | Manager | Create a new promotional offer (combo, percentage, or flat discount) |
| | `/api/offers/:id` | `PUT` | Manager | Update an existing offer details |
| | `/api/offers/:id/status` | `PATCH` | Manager | Toggle offer active/inactive status |
| | `/api/offers/:id` | `DELETE` | Manager | Delete a promotional offer |
| **Notifications**| `/api/notifications` | `GET` | Authenticated | Retrieve user's last 50 notifications |
| | `/api/notifications/:id/read` | `PATCH` | Authenticated | Mark a specific notification as read |
| | `/api/notifications/read-all` | `POST` | Authenticated | Mark all user notifications as read |
| | `/api/notifications/stream` | `GET` | Authenticated | Connect to real-time Server-Sent Events (SSE) notification stream |
| **Payments** | `/api/payments/process` | `POST` | Customer | Process simulated payment |

---

## Testing & Verification

### Real-Time Notification Verification
The backend includes test scripts to verify the Postgres-to-SSE real-time notification broadcast loop:

- **Database-to-SSE verification:** Simulates a user connection to the Server-Sent Events stream, updates the Supabase database directly, and verifies the SSE stream captures and outputs the correct payload:
  ```bash
  cd backend
  node verify_notifications.js
  ```
- **API-to-SSE end-to-end flow:** Verifies that actions triggered via API requests (such as creating a support ticket) correctly trigger real-time SSE alerts broadcasted to the target staff/managers:
  ```bash
  cd backend
  node verify_api_notifications.js
  ```
