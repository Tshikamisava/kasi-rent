-- Drop existing foreign keys first
ALTER TABLE favorites DROP FOREIGN KEY favorites_ibfk_1;
ALTER TABLE favorites DROP FOREIGN KEY favorites_ibfk_2;

-- Drop indexes
DROP INDEX idx_user_favorites ON favorites;
DROP INDEX idx_property_favorites ON favorites;

-- Modify columns to VARCHAR(255)
ALTER TABLE favorites MODIFY COLUMN user_id VARCHAR(255) NOT NULL;
ALTER TABLE favorites MODIFY COLUMN property_id VARCHAR(255) NOT NULL;

-- Recreate foreign keys
ALTER TABLE favorites 
  ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  ADD FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE;

-- Recreate indexes
CREATE INDEX idx_user_favorites ON favorites(user_id);
CREATE INDEX idx_property_favorites ON favorites(property_id);
