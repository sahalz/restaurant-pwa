-- Add preferred_food column to Users table
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "preferred_food" VARCHAR(100);

-- Add landmark column to Addresses table
ALTER TABLE "Addresses" ADD COLUMN IF NOT EXISTS "landmark" TEXT;

-- Add restaurant_note and delivery_instructions to orders table
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "restaurant_note" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "delivery_instructions" JSONB;

-- Add is_featured column to menu_items table
ALTER TABLE "menu_items" ADD COLUMN IF NOT EXISTS "is_featured" BOOLEAN DEFAULT false;

-- Create or replace popular_menu_items view
CREATE OR REPLACE VIEW popular_menu_items AS
SELECT 
  mi.id, mi.name, mi.price, mi.image_url, mi.description, mi.category_id, mi.availability, mi.is_featured,
  c.name as category,
  SUM(oi.quantity)::int as total_ordered
FROM "menu_items" mi
JOIN "order_items" oi ON mi.id = oi.menu_item_id
JOIN "orders" o ON oi.order_id = o.id
LEFT JOIN "categories" c ON mi.category_id = c.id
WHERE o.status = 'delivered'
  AND o.created_at >= NOW() - INTERVAL '30 days'
GROUP BY mi.id, c.name
ORDER BY total_ordered DESC;
