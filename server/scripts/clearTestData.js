import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const clearTestData = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'kasi_rent',
    port: process.env.DB_PORT || 3306,
  });

  try {
    console.log('Clearing test data...');
    
    // Delete test user
    await connection.query("DELETE FROM user_roles WHERE user_id IN (SELECT id FROM users WHERE email = 'testuser@example.com')");
    await connection.query("DELETE FROM users WHERE email = 'testuser@example.com'");
    
    console.log('✅ Test data cleared!');
    
    // Show current count
    const [userCount] = await connection.query('SELECT COUNT(*) as count FROM users');
    const [roleCount] = await connection.query('SELECT COUNT(*) as count FROM user_roles');
    
    console.log(`\nCurrent database state:`);
    console.log(`Users: ${userCount[0].count}`);
    console.log(`Roles: ${roleCount[0].count}`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
};

clearTestData();
