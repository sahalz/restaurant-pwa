# Database Schema

This document outlines the database schema and relationship models for the Restaurant PWA.

---

## Entity Relationship Details

### Users
Tracks customer, restaurant manager, administrator, and delivery rider profiles.

| Field | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key, Default: UUIDv4 |
| `name` | VARCHAR(255) | Full Name |
| `email` | VARCHAR(255) | Unique, Index |
| `password` | VARCHAR(255) | Hashed password |
| `phone` | VARCHAR(20) | Contact number |
| `role` | VARCHAR(50) | Role (e.g. `customer`, `rider`, `admin`) |
| `created_at` | TIMESTAMP | Default: CURRENT_TIMESTAMP |

---

### Addresses
Handles physical addresses for orders and deliveries.

| Field | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `user_id` | UUID | Foreign Key -> `Users(id)` (On Delete Cascade) |
| `address` | TEXT | Street address, building info |
| `city` | VARCHAR(100) | City name |
| `state` | VARCHAR(100) | State / Province |
| `pincode` | VARCHAR(20) | Postal code |

---

### Categories
Menu sections (e.g., Starters, Main Course, Drinks).

| Field | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `name` | VARCHAR(100) | Category name (Unique) |

---

### MenuItems
Individual dishes and drinks available on the menu.

| Field | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `category_id` | UUID | Foreign Key -> `Categories(id)` |
| `name` | VARCHAR(255) | Dish name |
| `description` | TEXT | Ingredients, portion sizing, etc. |
| `price` | DECIMAL(10,2) | Item unit price |
| `image_url` | TEXT | Link to hosted item image |
| `availability` | BOOLEAN | Instock status, Default: true |

---

### Cart
Transient storage linked to a user account.

| Field | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `user_id` | UUID | Foreign Key -> `Users(id)` (Unique) |

---

### CartItems
Items added to a specific cart.

| Field | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `cart_id` | UUID | Foreign Key -> `Cart(id)` (On Delete Cascade) |
| `menu_item_id` | UUID | Foreign Key -> `MenuItems(id)` |
| `quantity` | INTEGER | Quantity ordered, Default: 1 |

---

### Orders
Top-level details of purchased menu items.

| Field | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `user_id` | UUID | Foreign Key -> `Users(id)` |
| `total_amount` | DECIMAL(10,2) | Total cost including taxes/delivery |
| `status` | VARCHAR(50) | Order status (e.g. `pending`, `preparing`, `delivered`) |
| `payment_status`| VARCHAR(50) | Status (e.g. `unpaid`, `paid`, `refunded`) |
| `created_at` | TIMESTAMP | Order placement timestamp |

---

### OrderItems
Details of specific items within an order (captures historical price).

| Field | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `order_id` | UUID | Foreign Key -> `Orders(id)` (On Delete Cascade) |
| `menu_item_id` | UUID | Foreign Key -> `MenuItems(id)` |
| `quantity` | INTEGER | Quantity ordered |
| `price` | DECIMAL(10,2) | Captured historical unit price |

---

### Payments
Payment transactions and gateway responses.

| Field | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `order_id` | UUID | Foreign Key -> `Orders(id)` |
| `payment_method`| VARCHAR(50) | e.g. `card`, `upi`, `cash` |
| `transaction_id`| VARCHAR(255) | External transaction ID |
| `amount` | DECIMAL(10,2) | Amount processed |
| `status` | VARCHAR(50) | Status (e.g. `success`, `failed`, `pending`) |

---

### DeliveryTracking
Real-time status updates of riders and deliveries.

| Field | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `order_id` | UUID | Foreign Key -> `Orders(id)` |
| `delivery_status`| VARCHAR(50) | e.g., `assigned`, `picked_up`, `delivered` |
| `assigned_rider`| UUID | Foreign Key -> `Users(id)` |
| `updated_at` | TIMESTAMP | Last location/status update timestamp |

---

### Complaints
Customer issue reports for orders.

| Field | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `user_id` | UUID | Foreign Key -> `Users(id)` |
| `order_id` | UUID | Foreign Key -> `Orders(id)` |
| `issue_type` | VARCHAR(100) | Category (e.g., missing items, bad service) |
| `description` | TEXT | Detail description of the complaint |
| `status` | VARCHAR(50) | e.g., `open`, `under_investigation`, `resolved` |

---

### RefundRequests
Financial refunds associated with orders or complaints.

| Field | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `user_id` | UUID | Foreign Key -> `Users(id)` |
| `order_id` | UUID | Foreign Key -> `Orders(id)` |
| `amount` | DECIMAL(10,2) | Requested refund amount |
| `reason` | TEXT | Description/reasoning for the request |
| `status` | VARCHAR(50) | e.g., `pending`, `approved`, `rejected` |

---

### SupportTickets
General customer support tickets not strictly linked to a single order.

| Field | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `user_id` | UUID | Foreign Key -> `Users(id)` |
| `subject` | VARCHAR(255) | Short title/subject |
| `description` | TEXT | Detailed support ticket query |
| `status` | VARCHAR(50) | e.g., `open`, `closed` |
| `created_at` | TIMESTAMP | Ticket creation timestamp |
