import { sequelize } from './config/mysql.js';

async function checkIdTypes() {
  try {
    console.log('Checking users table id column...');
    const [usersDesc] = await sequelize.query('DESCRIBE users');
    const userIdField = usersDesc.find(f => f.Field === 'id');
    console.log('users.id:', userIdField);
    
    console.log('\nChecking properties table id column...');
    const [propsDesc] = await sequelize.query('DESCRIBE properties');
    const propIdField = propsDesc.find(f => f.Field === 'id');
    console.log('properties.id:', propIdField);
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkIdTypes();
