# API Contract Documentation

This document defines the REST API endpoints, request payloads, and response structures for the DirectDine application.

## Base URL
`https://api.directdine.com/v1`

---

## 1. Authentication & Users

### Register User
* **Endpoint:** `POST /auth/register`
* **Description:** Register a new customer, rider, or administrator.
* **Request Body:**
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "SecurePassword123",
    "phone": "+1234567890",
    "role": "customer"
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "status": "success",
    "message": "User registered successfully",
    "data": {
      "user_id": "c2b3e8a7-3df8-43d9-9f7a-8f5d1e2a0b12",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "customer",
      "created_at": "2026-06-03T12:00:00Z"
    }
  }
  ```

### Login User
* **Endpoint:** `POST /auth/login`
* **Description:** Authenticate user and return a JWT access token.
* **Request Body:**
  ```json
  {
    "email": "jane@example.com",
    "password": "SecurePassword123"
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "status": "success",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600,
    "user": {
      "id": "c2b3e8a7-3df8-43d9-9f7a-8f5d1e2a0b12",
      "name": "Jane Doe",
      "role": "customer"
    }
  }
  ```

---

## 2. Menu Management

### List Menu Items
* **Endpoint:** `GET /menu`
* **Description:** Get all available dishes and categories (optional filtering by category).
* **Query Parameters:**
  * `category_id` (optional): Filter items by a specific category.
* **Success Response (200 OK):**
  ```json
  {
    "status": "success",
    "data": [
      {
        "id": "e4c7d8a9-2bf3-47a2-9f3a-7f6d1c2a0b89",
        "category_id": "a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
        "name": "Margherita Pizza",
        "description": "Fresh mozzarella, basil, and organic tomato sauce.",
        "price": 12.99,
        "image_url": "https://images.directdine.com/pizza.jpg",
        "availability": true
      }
    ]
  }
  ```

---

## 3. Cart Management

### Get Cart
* **Endpoint:** `GET /cart`
* **Headers:** `Authorization: Bearer <token>`
* **Success Response (200 OK):**
  ```json
  {
    "status": "success",
    "data": {
      "cart_id": "d1c2b3a4-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
      "items": [
        {
          "cart_item_id": "f1e2d3c4-5b6a-7f8e-9d0c-1b2a3f4e5d6c",
          "menu_item_id": "e4c7d8a9-2bf3-47a2-9f3a-7f6d1c2a0b89",
          "name": "Margherita Pizza",
          "price": 12.99,
          "quantity": 2
        }
      ]
    }
  }
  ```

### Add/Update Item in Cart
* **Endpoint:** `POST /cart/items`
* **Headers:** `Authorization: Bearer <token>`
* **Request Body:**
  ```json
  {
    "menu_item_id": "e4c7d8a9-2bf3-47a2-9f3a-7f6d1c2a0b89",
    "quantity": 2
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "status": "success",
    "message": "Cart updated successfully"
  }
  ```

---

## 4. Orders & Payments

### Create Order
* **Endpoint:** `POST /orders`
* **Headers:** `Authorization: Bearer <token>`
* **Request Body:**
  ```json
  {
    "address_id": "a9b8c7d6-e5f4-3d2c-1b0a-9f8e7d6c5b4a"
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "status": "success",
    "message": "Order created successfully",
    "data": {
      "order_id": "b1a2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      "total_amount": 25.98,
      "status": "pending",
      "payment_status": "unpaid",
      "created_at": "2026-06-03T12:05:00Z"
    }
  }
  ```

### Process Payment
* **Endpoint:** `POST /payments/process`
* **Headers:** `Authorization: Bearer <token>`
* **Request Body:**
  ```json
  {
    "order_id": "b1a2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "payment_method": "card",
    "transaction_id": "tx_9876543210"
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "status": "success",
    "message": "Payment processed successfully",
    "data": {
      "payment_id": "p1o2i3u4-y5t6-r7e8-w9q0-m1n2b3v4c5x6",
      "status": "success",
      "amount": 25.98
    }
  }
  ```

---

## 5. Delivery & Tracking

### Get Delivery Status
* **Endpoint:** `GET /delivery/:order_id`
* **Headers:** `Authorization: Bearer <token>`
* **Success Response (200 OK):**
  ```json
  {
    "status": "success",
    "data": {
      "order_id": "b1a2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      "delivery_status": "picked_up",
      "assigned_rider": "r9e8d7c6-b5a4-3f2e-1d0c-9b8a7f6e5d4c",
      "updated_at": "2026-06-03T12:20:00Z"
    }
  }
  ```

---

## 6. Complaints, Refunds & Support

### File a Complaint
* **Endpoint:** `POST /complaints`
* **Headers:** `Authorization: Bearer <token>`
* **Request Body:**
  ```json
  {
    "order_id": "b1a2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "issue_type": "missing_items",
    "description": "The order was missing the beverages I paid for."
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "status": "success",
    "message": "Complaint logged successfully",
    "ticket_id": "t1i2c3k4-e5t6-7y8u-9i0o-p1l2k3j4h5g6"
  }
  ```

### Request a Refund
* **Endpoint:** `POST /refunds`
* **Headers:** `Authorization: Bearer <token>`
* **Request Body:**
  ```json
  {
    "order_id": "b1a2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "amount": 5.99,
    "reason": "Missing items complaint reference: t1i2c3k4..."
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "status": "success",
    "message": "Refund request submitted",
    "refund_id": "rf_1234567890",
    "status": "pending"
  }
  ```

---

## 7. Categories Management

### List Categories
* **Endpoint:** `GET /categories`
* **Description:** Get all available food categories.
* **Success Response (200 OK):**
  ```json
  {
    "status": "success",
    "data": [
      {
        "id": "a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
        "name": "Pizzas"
      }
    ]
  }
  ```

### Create Category
* **Endpoint:** `POST /categories`
* **Headers:** `Authorization: Bearer <token>` (Staff/Manager/Admin)
* **Request Body:**
  ```json
  {
    "name": "Desserts"
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "status": "success",
    "message": "Category created successfully",
    "data": {
      "id": "c8a9b0c1-d2e3-4f5a-6b7c-8d9e0f1a2b3c",
      "name": "Desserts"
    }
  }
  ```

---

## 8. Saved Addresses

### List Saved Addresses
* **Endpoint:** `GET /addresses`
* **Headers:** `Authorization: Bearer <token>`
* **Success Response (200 OK):**
  ```json
  {
    "status": "success",
    "data": [
      {
        "id": "ad88c7d6-e5f4-3d2c-1b0a-9f8e7d6c5b4a",
        "address": "123 Main St, Apt 4B",
        "city": "Metropolis",
        "state": "NY",
        "pincode": "10001"
      }
    ]
  }
  ```

### Save Address
* **Endpoint:** `POST /addresses`
* **Headers:** `Authorization: Bearer <token>`
* **Request Body:**
  ```json
  {
    "address": "456 Oak Rd",
    "city": "Metropolis",
    "state": "NY",
    "pincode": "10002"
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "status": "success",
    "data": {
      "id": "ad99c7d6-e5f4-3d2c-1b0a-9f8e7d6c5b4b",
      "user_id": "c2b3e8a7-3df8-43d9-9f7a-8f5d1e2a0b12",
      "address": "456 Oak Rd",
      "city": "Metropolis",
      "state": "NY",
      "pincode": "10002"
    }
  }
  ```

---

## 9. Delivery Logistics

### Assign Delivery Rider
* **Endpoint:** `POST /delivery/assign`
* **Headers:** `Authorization: Bearer <token>` (Staff/Manager)
* **Request Body:**
  ```json
  {
    "order_id": "b1a2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "assigned_rider": "r9e8d7c6-b5a4-3f2e-1d0c-9b8a7f6e5d4c"
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "status": "success",
    "data": {
      "id": "del_1122334455",
      "order_id": "b1a2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      "assigned_rider": "r9e8d7c6-b5a4-3f2e-1d0c-9b8a7f6e5d4c",
      "delivery_status": "assigned",
      "updated_at": "2026-06-03T12:15:00Z"
    }
  }
  ```

### Update Delivery Status
* **Endpoint:** `PATCH /delivery/:id/status`
* **Headers:** `Authorization: Bearer <token>`
* **Request Body:**
  ```json
  {
    "delivery_status": "delivered"
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "status": "success",
    "data": {
      "id": "del_1122334455",
      "delivery_status": "delivered",
      "updated_at": "2026-06-03T12:30:00Z"
    }
  }
  ```

---

## 10. Loyalty Rewards Program

### Get Loyalty Profile
* **Endpoint:** `GET /loyalty/profile`
* **Headers:** `Authorization: Bearer <token>`
* **Success Response (200 OK):**
  ```json
  {
    "status": "success",
    "data": {
      "balance": {
        "points": 120,
        "total_points_earned": 350
      },
      "transactions": [
        {
          "id": "tx_abc123",
          "points_changed": 25,
          "transaction_type": "earn",
          "description": "Points earned for Order #b1a2c3d4",
          "created_at": "2026-06-03T12:05:00Z"
        }
      ]
    }
  }
  ```

### Get Loyalty Rules Configuration
* **Endpoint:** `GET /loyalty/settings`
* **Headers:** `Authorization: Bearer <token>`
* **Success Response (200 OK):**
  ```json
  {
    "status": "success",
    "data": {
      "points_per_rupee": 0.10,
      "rupee_per_point": 0.50,
      "min_points_to_redeem": 50
    }
  }
  ```

---

## 11. Promotions & Offers

### List Active Offers
* **Endpoint:** `GET /offers`
* **Description:** Retrieve a list of active promotional offers valid for today.
* **Success Response (200 OK):**
  ```json
  {
    "status": "success",
    "data": [
      {
        "id": "off_percentage_123",
        "name": "10% Off Pizzas",
        "offer_type": "percentage",
        "is_active": true,
        "discount_percent": 10.0,
        "category_id": "a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d"
      }
    ]
  }
  ```

### Calculate Offer Discount
* **Endpoint:** `POST /offers/calculate`
* **Headers:** `Authorization: Bearer <token>`
* **Request Body:**
  ```json
  {
    "cart_total": 45.98,
    "cart_items": [
      {
        "menu_item_id": "item_pizza_12",
        "category_id": "a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
        "price": 22.99,
        "quantity": 2
      }
    ]
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "status": "success",
    "data": {
      "discount": 4.60,
      "offer": {
        "id": "off_percentage_123",
        "name": "10% Off Pizzas",
        "offer_type": "percentage"
      }
    }
  }
  ```

### Create Offer
* **Endpoint:** `POST /offers`
* **Headers:** `Authorization: Bearer <token>` (Manager)
* **Request Body:**
  ```json
  {
    "name": "Midweek 50 Flat Discount",
    "offer_type": "flat",
    "min_spend": 300,
    "flat_discount": 50,
    "valid_days": ["wednesday", "thursday"]
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "status": "success",
    "message": "Offer created",
    "data": {
      "id": "off_flat_789",
      "name": "Midweek 50 Flat Discount",
      "offer_type": "flat",
      "min_spend": 300.0,
      "flat_discount": 50.0,
      "valid_days": ["wednesday", "thursday"],
      "is_active": true
    }
  }
  ```

---

## 12. Real-Time Notification Alerts

### SSE Real-Time Stream
* **Endpoint:** `GET /notifications/stream`
* **Query Parameters:**
  * `token`: The user's JWT access token for authentication.
* **Description:** Establishes a persistent Server-Sent Events (SSE) connection to broadcast live order updates, support actions, and loyalty notifications.
* **Success Response:** Text stream headers (`Content-Type: text/event-stream`).

### List Notifications
* **Endpoint:** `GET /notifications`
* **Headers:** `Authorization: Bearer <token>`
* **Description:** Retrieve the user's notification history (up to last 50 entries).
* **Success Response (200 OK):**
  ```json
  {
    "status": "success",
    "data": [
      {
        "id": "notif_uuid_999",
        "user_id": "c2b3e8a7-3df8-43d9-9f7a-8f5d1e2a0b12",
        "title": "Order Placed",
        "message": "Your order #b1a2c3d4 has been received and is pending approval.",
        "type": "order_status",
        "reference_id": "b1a2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
        "is_read": false,
        "created_at": "2026-06-03T12:05:05Z"
      }
    ]
  }
  ```

### Mark Notification as Read
* **Endpoint:** `PATCH /notifications/:id/read`
* **Headers:** `Authorization: Bearer <token>`
* **Success Response (200 OK):**
  ```json
  {
    "status": "success",
    "data": {
      "id": "notif_uuid_999",
      "is_read": true
    }
  }
  ```
