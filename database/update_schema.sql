-- Add preferred_food column to Users table
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "preferred_food" VARCHAR(100);

-- Add landmark column to Addresses table
ALTER TABLE "Addresses" ADD COLUMN IF NOT EXISTS "landmark" TEXT;
