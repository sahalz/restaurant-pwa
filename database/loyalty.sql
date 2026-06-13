-- Loyalty Settings Table (for Managers to edit Rules)
CREATE TABLE IF NOT EXISTS "LoyaltySettings" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "points_per_rupee" DECIMAL(10,4) DEFAULT 0.1,
  "rupee_per_point" DECIMAL(10,4) DEFAULT 0.5,
  "min_points_to_redeem" INTEGER DEFAULT 50,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Loyalty Settings (Singleton Row)
INSERT INTO "LoyaltySettings" ("id", "points_per_rupee", "rupee_per_point", "min_points_to_redeem")
VALUES ('00000000-0000-0000-0000-000000000001', 0.1, 0.5, 50)
ON CONFLICT ("id") DO NOTHING;

-- Loyalty Table
CREATE TABLE IF NOT EXISTS "Loyalty" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID UNIQUE REFERENCES "Users"("id") ON DELETE CASCADE,
  "points" INTEGER DEFAULT 0,
  "total_points_earned" INTEGER DEFAULT 0,
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Loyalty Transactions Table
CREATE TABLE IF NOT EXISTS "LoyaltyTransactions" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID REFERENCES "Users"("id") ON DELETE CASCADE,
  "order_id" UUID REFERENCES "Orders"("id") ON DELETE SET NULL,
  "points_changed" INTEGER NOT NULL,
  "transaction_type" VARCHAR(50) NOT NULL, -- 'earn', 'redeem', 'cancelled_reversal'
  "description" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Alter Orders Table to support points tracking
ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "loyalty_discount" DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "points_redeemed" INTEGER DEFAULT 0;
ALTER TABLE "Orders" ADD COLUMN IF NOT EXISTS "points_earned" INTEGER DEFAULT 0;
