import { sequelize } from './config/mysql.js';

async function checkTable() {
  try {
    const [results] = await sequelize.query('DESCRIBE users');
    console.log('\nUsers table structure:');
    console.table(results);
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkTable();
