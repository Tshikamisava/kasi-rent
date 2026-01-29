import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function checkColumns() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('Connected to database...');

    const [columns] = await connection.execute(`
      SHOW COLUMNS FROM users WHERE Field LIKE 'reset_password%'
    `);

    console.log('\nReset password columns in users table:');
    if (columns.length === 0) {
      console.log('❌ No reset password columns found!');
    } else {
      columns.forEach(col => {
        console.log(`✓ ${col.Field} (${col.Type})`);
      });
    }

    await connection.end();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

checkColumns().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
