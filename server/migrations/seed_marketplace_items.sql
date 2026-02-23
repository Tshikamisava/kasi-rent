-- MySQL seed script for marketplace_items table
-- Run this in your MySQL client or migration tool

INSERT INTO marketplace_items (title, description, price, seller_id, images, status, created_at, updated_at)
VALUES
  ('Modern Couch', 'A stylish and comfy 3-seater couch, perfect for any living room.', 3500, 1, '["https://via.placeholder.com/150"]', 'active', NOW(), NOW()),
  ('Dining Table Set', 'Solid wood table with 6 chairs. Great for family meals.', 4200, 2, '["https://via.placeholder.com/150"]', 'active', NOW(), NOW()),
  ('Fridge', 'Energy-efficient fridge, 2 years old, works perfectly.', 2500, 3, '["https://via.placeholder.com/150"]', 'active', NOW(), NOW()),
  ('Microwave Oven', 'Compact microwave, ideal for small kitchens.', 800, 4, '["https://via.placeholder.com/150"]', 'active', NOW(), NOW());
