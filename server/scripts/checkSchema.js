import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const checkSchema = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'kasi_rent',
    port: process.env.DB_PORT || 3306,
  });

  try {
    console.log('=== USERS TABLE ===');
    const [usersSchema] = await connection.query('DESCRIBE users');
    console.table(usersSchema);

    console.log('\n=== USER_ROLES TABLE ===');
    const [rolesSchema] = await connection.query('DESCRIBE user_roles');
    console.table(rolesSchema);

    console.log('\n=== SAMPLE DATA ===');
    const [users] = await connection.query('SELECT id, email, full_name, phone FROM users LIMIT 3');
    console.log('Users:', users);

    const [roles] = await connection.query('SELECT * FROM user_roles LIMIT 3');
    console.log('Roles:', roles);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
};

checkSchema();
