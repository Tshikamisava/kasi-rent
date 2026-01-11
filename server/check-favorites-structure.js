import { sequelize } from './config/mysql.js';

async function checkStructure() {
  try {
    console.log('Checking favorites table structure...');
    
    const [results] = await sequelize.query(`
      DESCRIBE favorites
    `);
    
    console.log('\nFavorites table structure:');
    console.table(results);
    
    // Also check if there are any existing records
    const [records] = await sequelize.query(`
      SELECT * FROM favorites LIMIT 5
    `);
    
    console.log('\nExisting records (first 5):');
    console.table(records);
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkStructure();
