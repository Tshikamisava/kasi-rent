import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const verifyData = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'kasi_rent',
    port: process.env.DB_PORT || 3306,
  });

  try {
    console.log('=== DATABASE VERIFICATION ===\n');

    const [userCount] = await connection.query('SELECT COUNT(*) as count FROM users');
    console.log('Total Users:', userCount[0].count);

    const [roleCount] = await connection.query('SELECT COUNT(*) as count FROM user_roles');
    console.log('Total User Roles:', roleCount[0].count);

    console.log('\n=== USERS ===');
    const [users] = await connection.query('SELECT id, email, full_name, phone, created_at FROM users');
    console.table(users);

    console.log('\n=== USER ROLES ===');
    const [roles] = await connection.query('SELECT ur.id, ur.user_id, ur.role, u.email FROM user_roles ur LEFT JOIN users u ON ur.user_id = u.id');
    console.table(roles);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
};

verifyData();
