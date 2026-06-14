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
| `loyalty_discount`| DECIMAL(10,2)| Amount off from loyalty point redemptions |
| `points_redeemed`| INTEGER | Quantity of loyalty points redeemed for order |
| `points_earned` | INTEGER | Quantity of loyalty points earned from order |
| `applied_offer_id`| UUID | Foreign Key -> `offers(id)` (On Delete Set Null) |
| `offer_discount` | DECIMAL(10,2)| Amount off from applied promotional offer |
| `offer_name` | VARCHAR(255) | Cached name of the applied promotional offer |

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

---

## 2. Advanced Feature Tables

### LoyaltySettings
Configuration rules for the restaurant's loyalty rewards program (singleton table).

| Field | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `points_per_rupee` | DECIMAL(10,4)| Ratio of points earned per currency unit spent (Default: 0.1) |
| `rupee_per_point` | DECIMAL(10,4)| Monetary value of a single point during redemption (Default: 0.5) |
| `min_points_to_redeem`| INTEGER | Threshold required to begin points redemption (Default: 50) |
| `updated_at` | TIMESTAMP | Last update timestamp |

---

### Loyalty
Customer loyalty reward balances.

| Field | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `user_id` | UUID | Foreign Key -> `Users(id)` (Unique, On Delete Cascade) |
| `points` | INTEGER | Active redeemable points balance |
| `total_points_earned`| INTEGER | Lifetime accumulated points earned |
| `updated_at` | TIMESTAMP | Last balance change timestamp |

---

### LoyaltyTransactions
Historical ledger tracking earns, redeems, and reversals of loyalty points.

| Field | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `user_id` | UUID | Foreign Key -> `Users(id)` (On Delete Cascade) |
| `order_id` | UUID | Foreign Key -> `Orders(id)` (On Delete Set Null) |
| `points_changed` | INTEGER | Amount of points added (positive) or removed (negative) |
| `transaction_type` | VARCHAR(50) | Action descriptor (e.g. `earn`, `redeem`, `cancelled_reversal`) |
| `description` | TEXT | Detail/reason for balance adjustment |
| `created_at` | TIMESTAMP | Transaction timestamp |

---

### Offers
Promotional offers, flat checkout discounts, and percentage coupons.

| Field | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `name` | VARCHAR(255) | Name/Title of the offer |
| `offer_type` | VARCHAR(50) | Promo class: `combo` \| `percentage` \| `flat` |
| `is_active` | BOOLEAN | Switch to toggle availability (Default: true, Index) |
| `valid_until` | DATE | Expiry date of the offer (nullable) |
| `valid_days` | JSONB | Array of days valid (e.g. `["saturday", "sunday"]`) (nullable) |
| `discount_percent` | DECIMAL(5,2) | Percentage reduction for percentage promos |
| `category_condition` | VARCHAR(255) | Conditions text for applying percentage promos |
| `category_id` | UUID | Foreign Key -> `Categories(id)` (On Delete Set Null) |
| `min_spend` | DECIMAL(10,2)| Minimum order value to enable flat discount |
| `flat_discount` | DECIMAL(10,2)| Value deducted from cart for flat promos |
| `combo_items` | JSONB | List of items included in combo bundled deal |
| `original_price` | DECIMAL(10,2)| Aggregate menu item pricing sum |
| `offer_price` | DECIMAL(10,2)| Bundled promo menu pricing |
| `created_at` | TIMESTAMP | Offer creation timestamp |
| `updated_at` | TIMESTAMP | Offer configuration update timestamp |

---

### ItemRatings
Ratings and feedback submitted by users on individual menu items.

| Field | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `user_id` | UUID | Foreign Key -> `Users(id)` (On Delete Cascade) |
| `order_id` | UUID | Foreign Key -> `Orders(id)` (On Delete Cascade) |
| `menu_item_id` | UUID | Foreign Key -> `MenuItems(id)` (On Delete Cascade) |
| `rating` | INTEGER | Score from 1 to 5 |
| `review` | TEXT | Written feedback |
| `created_at` | TIMESTAMP | Submission timestamp |
| *Constraint* | Unique | Combined unique index on `(user_id, order_id, menu_item_id)` |

---

### Notifications
Logs for real-time notification alerts sent to customers and staff members.

| Field | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | UUID | Primary Key |
| `user_id` | UUID | Foreign Key -> `Users(id)` (On Delete Cascade) |
| `title` | VARCHAR(255) | Notification title |
| `message` | TEXT | Body content of notification |
| `type` | VARCHAR(50) | Source type (e.g. `order_status`, `loyalty`, `support`, `promo`) |
| `reference_id` | UUID | Optional ID linking to context (e.g. order_id, ticket_id) |
| `is_read` | BOOLEAN | Read flag (Default: false) |
| `created_at` | TIMESTAMP | Generation timestamp |

