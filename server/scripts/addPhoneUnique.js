import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Script to add unique constraint to phone number field
const addPhoneConstraint = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'kasi_rent',
    port: process.env.DB_PORT || 3306,
  });

  try {
    console.log('🔧 Adding unique constraint to phone numbers...\n');
    
    // First, check if phone column allows null
    const [columns] = await connection.query(
      "SELECT COLUMN_NAME, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'phone'",
      [process.env.DB_NAME || 'kasi_rent']
    );
    
    if (columns.length > 0) {
      console.log('✅ Phone column exists');
      
      // Check for duplicate phone numbers first
      const [duplicates] = await connection.query(`
        SELECT phone, COUNT(*) as count 
        FROM users 
        WHERE phone IS NOT NULL AND phone != '' 
        GROUP BY phone 
        HAVING count > 1
      `);
      
      if (duplicates.length > 0) {
        console.log('⚠️  Found duplicate phone numbers:');
        duplicates.forEach((dup) => {
          console.log(`   - ${dup.phone} (${dup.count} times)`);
        });
        console.log('\n⚠️  Please resolve duplicates before adding unique constraint.');
        console.log('   You can keep the first account and update/remove phone from duplicates.\n');
        return;
      }
      
      // Check if unique constraint already exists
      const [indexes] = await connection.query(`
        SHOW INDEXES FROM users WHERE Column_name = 'phone'
      `);
      
      const hasUniqueIndex = indexes.some((idx) => idx.Non_unique === 0);
      
      if (hasUniqueIndex) {
        console.log('✅ Phone number already has unique constraint');
      } else {
        // Add unique constraint
        await connection.query(`
          ALTER TABLE users 
          ADD UNIQUE INDEX idx_phone_unique (phone)
        `);
        console.log('✅ Added unique constraint to phone numbers');
        console.log('   Now each phone number can only be used once\n');
      }
    } else {
      console.log('❌ Phone column not found in users table');
    }
    
    console.log('🎉 Migration completed successfully!\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('\n⚠️  Duplicate phone numbers detected. Please clean up first.');
    }
  } finally {
    await connection.end();
  }
};

addPhoneConstraint().catch(console.error);
