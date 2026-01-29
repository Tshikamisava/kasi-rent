import { sequelize } from './config/mysql.js';

async function checkFavoritesTable() {
  try {
    const [results] = await sequelize.query("SHOW TABLES LIKE 'favorites'");
    if (results.length > 0) {
      console.log('✅ Favorites table exists');
      // Check structure
      const [columns] = await sequelize.query("DESCRIBE favorites");
      console.log('Table structure:');
      columns.forEach(col => {
        console.log(`  - ${col.Field}: ${col.Type}`);
      });
    } else {
      console.log('❌ Favorites table not found');
    }
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkFavoritesTable();
