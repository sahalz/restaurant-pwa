-- Enable pgcrypto extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS "Users" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255) UNIQUE NOT NULL,
  "password" VARCHAR(255) NOT NULL,
  "phone" VARCHAR(20) NOT NULL,
  "role" VARCHAR(50) NOT NULL DEFAULT 'customer',
  "preferred_food" VARCHAR(100),
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON "Users"("email");

-- 2. Addresses Table
CREATE TABLE IF NOT EXISTS "Addresses" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID REFERENCES "Users"("id") ON DELETE CASCADE,
  "address" TEXT NOT NULL,
  "city" VARCHAR(100) NOT NULL,
  "state" VARCHAR(100) NOT NULL,
  "pincode" VARCHAR(20) NOT NULL,
  "landmark" TEXT
);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS "Categories" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(100) UNIQUE NOT NULL
);

-- 4. MenuItems Table
CREATE TABLE IF NOT EXISTS "MenuItems" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "category_id" UUID REFERENCES "Categories"("id") ON DELETE CASCADE,
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "price" DECIMAL(10,2) NOT NULL,
  "image_url" TEXT,
  "availability" BOOLEAN NOT NULL DEFAULT TRUE
);

-- 5. Cart Table
CREATE TABLE IF NOT EXISTS "Cart" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID UNIQUE REFERENCES "Users"("id") ON DELETE CASCADE
);

-- 6. CartItems Table
CREATE TABLE IF NOT EXISTS "CartItems" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "cart_id" UUID REFERENCES "Cart"("id") ON DELETE CASCADE,
  "menu_item_id" UUID REFERENCES "MenuItems"("id") ON DELETE CASCADE,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  UNIQUE("cart_id", "menu_item_id")
);

-- 7. Orders Table
CREATE TABLE IF NOT EXISTS "Orders" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID REFERENCES "Users"("id") ON DELETE CASCADE,
  "total_amount" DECIMAL(10,2) NOT NULL,
  "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
  "payment_status" VARCHAR(50) NOT NULL DEFAULT 'unpaid',
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. OrderItems Table
CREATE TABLE IF NOT EXISTS "OrderItems" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "order_id" UUID REFERENCES "Orders"("id") ON DELETE CASCADE,
  "menu_item_id" UUID REFERENCES "MenuItems"("id") ON DELETE CASCADE,
  "quantity" INTEGER NOT NULL,
  "price" DECIMAL(10,2) NOT NULL
);

-- 9. Payments Table
CREATE TABLE IF NOT EXISTS "Payments" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "order_id" UUID REFERENCES "Orders"("id") ON DELETE CASCADE,
  "payment_method" VARCHAR(50) NOT NULL,
  "transaction_id" VARCHAR(255) NOT NULL,
  "amount" DECIMAL(10,2) NOT NULL,
  "status" VARCHAR(50) NOT NULL
);

-- 10. DeliveryTracking Table
CREATE TABLE IF NOT EXISTS "DeliveryTracking" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "order_id" UUID REFERENCES "Orders"("id") ON DELETE CASCADE,
  "delivery_status" VARCHAR(50) NOT NULL DEFAULT 'assigned',
  "assigned_rider" UUID REFERENCES "Users"("id") ON DELETE SET NULL,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Complaints Table
CREATE TABLE IF NOT EXISTS "Complaints" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID REFERENCES "Users"("id") ON DELETE CASCADE,
  "order_id" UUID REFERENCES "Orders"("id") ON DELETE CASCADE,
  "issue_type" VARCHAR(100) NOT NULL,
  "description" TEXT NOT NULL,
  "status" VARCHAR(50) NOT NULL DEFAULT 'open'
);

-- 12. RefundRequests Table
CREATE TABLE IF NOT EXISTS "RefundRequests" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID REFERENCES "Users"("id") ON DELETE CASCADE,
  "order_id" UUID REFERENCES "Orders"("id") ON DELETE CASCADE,
  "amount" DECIMAL(10,2) NOT NULL,
  "reason" TEXT NOT NULL,
  "status" VARCHAR(50) NOT NULL DEFAULT 'pending'
);

-- 13. SupportTickets Table
CREATE TABLE IF NOT EXISTS "SupportTickets" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID REFERENCES "Users"("id") ON DELETE CASCADE,
  "subject" VARCHAR(255) NOT NULL,
  "description" TEXT NOT NULL,
  "status" VARCHAR(50) NOT NULL DEFAULT 'open',
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
