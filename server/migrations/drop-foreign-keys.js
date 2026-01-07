import { sequelize } from '../config/mysql.js';

async function dropForeignKeys() {
  try {
    console.log('🔧 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    console.log('\n🔧 Dropping foreign key constraints...\n');
    
    // Drop foreign key from reviews table
    try {
      await sequelize.query('ALTER TABLE reviews DROP FOREIGN KEY reviews_ibfk_1');
      console.log('✅ Dropped reviews_ibfk_1 successfully');
    } catch (error) {
      if (error.message.includes("check that it exists") || error.message.includes("check that column/key exists")) {
        console.log('⚠️  reviews_ibfk_1 does not exist (already dropped)');
      } else {
        console.error('❌ Error dropping reviews_ibfk_1:', error.message);
      }
    }

    // Drop foreign key from bookings table
    try {
      await sequelize.query('ALTER TABLE bookings DROP FOREIGN KEY bookings_ibfk_1');
      console.log('✅ Dropped bookings_ibfk_1 successfully');
    } catch (error) {
      if (error.message.includes("check that it exists") || error.message.includes("check that column/key exists")) {
        console.log('⚠️  bookings_ibfk_1 does not exist (already dropped)');
      } else {
        console.error('❌ Error dropping bookings_ibfk_1:', error.message);
      }
    }

    console.log('\n✅ Migration completed successfully!');
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    await sequelize.close();
    process.exit(1);
  }
}

console.log('='.repeat(50));
console.log('Database Migration: Drop Foreign Keys');
console.log('='.repeat(50));

dropForeignKeys();
