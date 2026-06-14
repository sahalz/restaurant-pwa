-- Seed Categories
INSERT INTO "categories" ("id", "name") VALUES
  ('a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'Pizzas'),
  ('b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 'Burgers'),
  ('c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f', 'Drinks'),
  ('d4e5f6a7-8b9c-0d1e-2f3a-4b5c6d7e8f9a', 'Desserts')
ON CONFLICT ("name") DO NOTHING;

-- Seed MenuItems
INSERT INTO "menu_items" ("id", "category_id", "name", "description", "price", "image_url", "availability") VALUES
  -- Pizzas
  ('e4c7d8a9-2bf3-47a2-9f3a-7f6d1c2a0b89', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'Margherita Pizza', 'Fresh mozzarella, basil, and organic tomato sauce.', 12.99, 'https://images.directdine.com/pizza.jpg', TRUE),
  ('e4c7d8a9-2bf3-47a2-9f3a-7f6d1c2a0b90', 'a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'Pepperoni Pizza', 'Classic pepperoni with mozzarella and spicy marinara sauce.', 14.99, 'https://images.directdine.com/pepperoni.jpg', TRUE),
  
  -- Burgers
  ('f5d8e9b0-3cg4-58b3-0g4b-8g7e2d3b1c90', 'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 'Veg Burger', 'Crispy patty, lettuce, tomato, and chef secret sauce.', 8.49, 'https://images.directdine.com/burger.jpg', TRUE),
  ('f5d8e9b0-3cg4-58b3-0g4b-8g7e2d3b1c91', 'b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 'Classic Cheese Burger', 'Juicy grilled beef patty, cheddar cheese, lettuce, and pickles.', 9.99, 'https://images.directdine.com/cheeseburger.jpg', TRUE),

  -- Drinks
  ('g6e9f0a1-4dh5-69c4-1h5c-9h8f3e4c2d01', 'c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f', 'Iced Americano', 'Double shot of espresso poured over ice and cold water.', 3.49, 'https://images.directdine.com/americano.jpg', TRUE),
  ('g6e9f0a1-4dh5-69c4-1h5c-9h8f3e4c2d02', 'c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f', 'Fresh Lemonade', 'Squeezed fresh lemons with sugar syrup and mint leaves.', 2.99, 'https://images.directdine.com/lemonade.jpg', TRUE),

  -- Desserts
  ('h7f0a1b2-5ei6-7ad5-2i6d-0i9g4f5d3e12', 'd4e5f6a7-8b9c-0d1e-2f3a-4b5c6d7e8f9a', 'Chocolate Lava Cake', 'Warm chocolate cake with a molten chocolate center, served with vanilla scoop.', 5.99, 'https://images.directdine.com/lavacake.jpg', TRUE),
  ('h7f0a1b2-5ei6-7ad5-2i6d-0i9g4f5d3e13', 'd4e5f6a7-8b9c-0d1e-2f3a-4b5c6d7e8f9a', 'New York Cheesecake', 'Rich and creamy classic NY style cheesecake with berry compote.', 6.49, 'https://images.directdine.com/cheesecake.jpg', TRUE)
ON CONFLICT ("id") DO NOTHING;
