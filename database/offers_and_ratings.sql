-- ============================================================
-- Offers & Item Ratings Migration
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Offers Table
-- offer_type: 'combo' | 'percentage' | 'flat'
-- is_active: whether offer is shown to customers
-- valid_until: date after which offer expires (null = no expiry)
-- valid_days: JSONB array of days e.g. ["saturday","sunday"] (null = all days)
-- discount_percent: for 'percentage' type
-- category_condition: category name/id filter for 'percentage' type
-- min_spend: for 'flat' type minimum cart total
-- flat_discount: for 'flat' type discount amount
-- combo_items: JSONB array of {menu_item_id, name, quantity} for 'combo' type
-- original_price: for combos — sum of individual items
-- offer_price: for combos — the bundled price
CREATE TABLE IF NOT EXISTS "offers" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) NOT NULL,
  "offer_type" VARCHAR(50) NOT NULL CHECK (offer_type IN ('combo','percentage','flat')),
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "valid_until" DATE,
  "valid_days" JSONB,
  "discount_percent" DECIMAL(5,2),
  "category_condition" VARCHAR(255),
  "category_id" UUID REFERENCES "categories"("id") ON DELETE SET NULL,
  "min_spend" DECIMAL(10,2),
  "flat_discount" DECIMAL(10,2),
  "combo_items" JSONB,
  "original_price" DECIMAL(10,2),
  "offer_price" DECIMAL(10,2),
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_offers_active ON "offers"("is_active");
CREATE INDEX IF NOT EXISTS idx_offers_type ON "offers"("offer_type");

-- 2. Item Ratings Table
-- One rating row per (user, order, menu_item) — prevents duplicate ratings
CREATE TABLE IF NOT EXISTS "item_ratings" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID REFERENCES "users"("id") ON DELETE CASCADE,
  "order_id" UUID REFERENCES "orders"("id") ON DELETE CASCADE,
  "menu_item_id" UUID REFERENCES "menu_items"("id") ON DELETE CASCADE,
  "rating" INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  "review" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("user_id", "order_id", "menu_item_id")
);

CREATE INDEX IF NOT EXISTS idx_item_ratings_menu_item ON "item_ratings"("menu_item_id");

-- 3. Alter Orders table to track applied offers
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "applied_offer_id" UUID REFERENCES "offers"("id") ON DELETE SET NULL;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "offer_discount" DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "offer_name" VARCHAR(255);
