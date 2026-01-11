import { sequelize } from './config/mysql.js';

async function checkFavoritesTable() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    // Check if favorites table exists
    const [tables] = await sequelize.query(`
      SHOW TABLES LIKE 'favorites'
    `);

    if (tables.length === 0) {
      console.log('❌ Favorites table does not exist. Creating it now...');
      
      // Create the table
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS favorites (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          property_id INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY unique_user_property (user_id, property_id),
          INDEX idx_user_favorites (user_id),
          INDEX idx_property_favorites (property_id)
        )
      `);

      // Add foreign keys separately to avoid errors if they already exist
      try {
        await sequelize.query(`
          ALTER TABLE favorites 
          ADD CONSTRAINT fk_favorites_user 
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        `);
        console.log('✅ Added user foreign key');
      } catch (err) {
        if (err.message.includes('Duplicate')) {
          console.log('ℹ️  User foreign key already exists');
        }
      }

      try {
        await sequelize.query(`
          ALTER TABLE favorites 
          ADD CONSTRAINT fk_favorites_property 
          FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
        `);
        console.log('✅ Added property foreign key');
      } catch (err) {
        if (err.message.includes('Duplicate')) {
          console.log('ℹ️  Property foreign key already exists');
        }
      }

      console.log('✅ Favorites table created successfully!');
    } else {
      console.log('✅ Favorites table already exists');
      
      // Check table structure
      const [columns] = await sequelize.query(`
        DESCRIBE favorites
      `);
      console.log('Table structure:', columns);
    }

    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkFavoritesTable();
