import { sequelize } from './config/mysql.js';

async function createTable() {
  try {
    console.log('Creating favorites table...');
    
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
        property_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_property (user_id, property_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
        INDEX idx_user_favorites (user_id),
        INDEX idx_property_favorites (property_id)
      )
    `);
    
    console.log('✅ Favorites table created successfully!');
    
    // Verify structure
    const [results] = await sequelize.query('DESCRIBE favorites');
    console.log('\nTable structure:');
    console.table(results);
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTable();
