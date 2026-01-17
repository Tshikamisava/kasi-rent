import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function checkAdmin() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('✅ Connected to database\n');

    const [users] = await connection.query(
      'SELECT id, email, name, role, created_at FROM users WHERE email = ?',
      ['admin@kasirent.com']
    );

    if (users.length > 0) {
      console.log('✅ Admin user EXISTS in database:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('ID:', users[0].id);
      console.log('Email:', users[0].email);
      console.log('Name:', users[0].name);
      console.log('Role:', users[0].role);
      console.log('Created:', users[0].created_at);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    } else {
      console.log('❌ Admin user NOT FOUND in database');
      console.log('Run: node create-admin.js\n');
    }

    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkAdmin();
