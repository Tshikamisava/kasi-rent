import { sequelize } from './config/mysql.js';
import dotenv from 'dotenv';

dotenv.config();

async function cleanupTestData() {
  try {
    // First, show what we have
    const [properties] = await sequelize.query(`
      SELECT id, title, landlord_id, image_url, created_at 
      FROM properties 
      ORDER BY created_at DESC
    `);

    console.log('\n=== CURRENT PROPERTIES ===\n');
    properties.forEach((prop, index) => {
      console.log(`${index + 1}. ${prop.title}`);
      console.log(`   ID: ${prop.id}`);
      console.log(`   Created: ${prop.created_at}`);
      console.log(`   Image: ${prop.image_url ? prop.image_url.substring(0, 60) + '...' : 'None'}`);
      console.log('');
    });

    console.log(`\nTotal properties: ${properties.length}`);
    console.log('\nTo delete test properties, run this script with "--delete" flag');
    
    // If --delete flag is passed, delete test/placeholder properties
    if (process.argv.includes('--delete')) {
      const [result] = await sequelize.query(`
        DELETE FROM properties 
        WHERE image_url LIKE '%placeholder%' 
           OR image_url LIKE '%riverside%' 
           OR image_url LIKE '%property-placeholder%'
           OR title LIKE '%test%'
      `);
      
      console.log(`\n✓ Deleted ${result.affectedRows} test properties`);
      
      // Show remaining properties
      const [remaining] = await sequelize.query(`
        SELECT id, title FROM properties ORDER BY created_at DESC
      `);
      
      console.log(`\n${remaining.length} properties remaining:`);
      remaining.forEach((prop, index) => {
        console.log(`${index + 1}. ${prop.title}`);
      });
    }

    await sequelize.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

cleanupTestData();
