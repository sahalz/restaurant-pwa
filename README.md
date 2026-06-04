# Restaurant PWA

A Progressive Web Application (PWA) designed for restaurants. This project features a Node.js Express backend using Supabase (PostgreSQL) for state management and an upcoming modern frontend client.

---

## Project Structure

```
├── frontend/     # Frontend Web Application (PWA)
├── backend/      # Backend Node.js/Express API Service
│   ├── public/   # Static files and interactive mock menu page
│   └── src/      # API Controllers, routes, and database configs
├── docs/         # Documentation and API specifications
└── database/     # PostgreSQL schema and database seed files
```

---

## Database Setup

The backend utilizes **Supabase** (PostgreSQL) to store application data.

1. **Schema Initialization:** Execute the SQL commands in [schema.sql](file:///d:/Projects/restaurant-pwa/database/schema.sql) in your Supabase database.
2. **Seed Data:** Execute the queries in [seed.sql](file:///d:/Projects/restaurant-pwa/database/seed.sql) to pre-populate categories and initial menu items (Pizzas, Burgers, Drinks, Desserts).

---

## Backend Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)

### Installation
Navigate to the `backend` directory and install the required dependencies:
```bash
cd backend
npm install
```

### Environment Variables
Create a `.env` file in the `backend/` directory (see [backend/.env](file:///d:/Projects/restaurant-pwa/backend/.env)) with the following keys:
```env
PORT=5000
SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE"
JWT_SECRET="YOUR_JWT_SECRET_FOR_SIGNING_TOKENS"
```

### Running the API Server
- **Development Mode (with auto-reload):**
  ```bash
  npm run dev
  ```
- **Production Mode:**
  ```bash
  npm start
  ```

---

## API Endpoints

The backend exposes the following API routes under `http://localhost:5000`:

| Category | Endpoint | Method | Description |
| :--- | :--- | :---: | :--- |
| **System** | `/` | `GET` | API Welcome status |
| | `/api/health` | `GET` | Health check endpoint |
| **Authentication** | `/api/auth/register` | `POST` | User registration |
| | `/api/auth/login` | `POST` | User login (returns JWT token) |
| **Menu** | `/api/menu` | `GET` | Retrieve list of menu items (filters by `category_id` query param) |
| **Cart** | `/api/cart` | `GET` | Retrieve user's current shopping cart |
| | `/api/cart` | `POST` | Add/update item quantity in cart |
| | `/api/cart/:itemId` | `DELETE` | Remove item from cart |
| **Orders** | `/api/orders` | `POST` | Place a new order |
| | `/api/orders` | `GET` | Retrieve order history for the authenticated user |
| **Payments** | `/api/payments/process` | `POST` | Process simulated payment |

---

## Interactive Menu Display

We have created an interactive single-page menu display at [menu.html](file:///d:/Projects/restaurant-pwa/backend/public/menu.html). 

This file is a standalone client mockup that:
- Connects to `http://localhost:5000/api/menu` to dynamically fetch food options.
- Groups items and filters them by category.
- Provides a clean search bar to filter items in real-time.
- Features a premium modern dark theme with glassmorphic cards, transition animations, and canvas-based fallbacks for broken image URLs.
- Simulates a mobile-responsive PWA shopping cart drawer where users can add items and view the running total.

You can open [menu.html](file:///d:/Projects/restaurant-pwa/backend/public/menu.html) directly in your browser or run a simple local HTTP server (like VS Code's Live Server) to interact with it.
