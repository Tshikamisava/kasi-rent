import { sequelize } from './config/mysql.js';

async function addTestUser() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database');

    // Make password optional
    await sequelize.query('ALTER TABLE users MODIFY COLUMN password VARCHAR(255) NULL');
    console.log('✅ Password column made optional');

    // Add test user
    await sequelize.query(
      `INSERT INTO users (id, name, email, role, created_at, updated_at) 
       VALUES ('test-user-789', 'Sarah Tenant', 'sarah@kasrent.com', 'tenant', NOW(), NOW())`
    );
    console.log('\n✅ Test user created successfully!\n');
    console.log('📧 Email: sarah@kasrent.com');
    console.log('👤 Name: Sarah Tenant');
    console.log('🏠 Role: tenant\n');
    console.log('You can now search for this email in the chat page!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addTestUser();
