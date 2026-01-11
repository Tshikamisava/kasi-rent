import { sequelize } from './config/mysql.js';

async function checkTable() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connected to database successfully!\n');
    
    const [results] = await sequelize.query('DESCRIBE users');
    console.log('Users table structure:');
    console.table(results);
    
    await sequelize.close();
    console.log('\n✅ Database connection closed successfully');
    process.exit(0);
  } catch (error) {
    const errorMsg = error.message || error.parent?.message || '';
    const errorCode = error.code || error.parent?.code || error.original?.code || '';
    
    console.error('\n❌ Error:', errorMsg || errorCode || 'Unknown error');
    
    if (errorCode === 'ECONNREFUSED' || errorMsg.includes('ECONNREFUSED')) {
      console.error('\n⚠️  Cannot connect to MySQL database');
      console.error('\nPossible solutions:');
      console.error('1. Make sure MySQL server is running');
      console.error('2. Check your database host and port in .env file');
      console.error('3. Verify database credentials (DB_USER, DB_PASSWORD)');
    } else if (errorMsg.includes('Unknown database')) {
      console.error('\nPossible solutions:');
      console.error('1. Create the database: CREATE DATABASE kasirent;');
      console.error('2. Check DB_NAME in .env file');
    } else if (errorMsg.includes("Table") && errorMsg.includes("doesn't exist")) {
      console.error('\nThe users table does not exist.');
      console.error('Run migrations to create the table.');
    } else if (errorMsg.includes('Access denied') || errorCode === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\nPossible solutions:');
      console.error('1. Check your MySQL username and password in .env');
      console.error('2. Verify the user has access to the database');
    } else if (!process.env.DB_HOST || !process.env.DB_NAME) {
      console.error('\n⚠️  Missing environment variables!');
      console.error('Please create a .env file in the server directory with:');
      console.error('DB_HOST, DB_USER, DB_PASSWORD, DB_NAME');
      console.error('\nYou can copy .env.example to .env and update the values.');
    }
    
    process.exit(1);
  }
}

checkTable();
