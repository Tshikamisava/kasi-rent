import { sequelize } from './config/mysql.js';

async function checkCollation() {
  try {
    console.log('Checking users table...');
    const [users] = await sequelize.query(`
      SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_SET_NAME, COLLATION_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'kasi_rent' 
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME = 'id'
    `);
    console.table(users);
    
    console.log('\nChecking properties table...');
    const [props] = await sequelize.query(`
      SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_SET_NAME, COLLATION_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'kasi_rent' 
      AND TABLE_NAME = 'properties'
      AND COLUMN_NAME = 'id'
    `);
    console.table(props);
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkCollation();
