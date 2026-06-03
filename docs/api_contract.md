# API Contract Documentation

This document defines the REST API endpoints, request payloads, and response structures for the Restaurant PWA.

## Base URL
`https://api.restaurantpwa.com/v1`

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
        "image_url": "https://images.restaurantpwa.com/pizza.jpg",
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
