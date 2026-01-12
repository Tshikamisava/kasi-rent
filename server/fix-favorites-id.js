import { sequelize } from './config/mysql.js';

async function fixFavoritesId() {
  try {
    console.log('Fixing favorites table ID column...');
    
    // Drop the table and recreate it with correct structure
    await sequelize.query('DROP TABLE IF EXISTS favorites');
    
    await sequelize.query(`
      CREATE TABLE favorites (
        id CHAR(36) PRIMARY KEY,
        user_id CHAR(36) NOT NULL,
        property_id CHAR(36) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_property (user_id, property_id),
        INDEX idx_user_id (user_id),
        INDEX idx_property_id (property_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    console.log('✅ Favorites table recreated with CHAR(36) ID');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixFavoritesId();
