import { sequelize } from './config/mysql.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkPropertyImages() {
  try {
    const [properties] = await sequelize.query(`
      SELECT id, title, image_url, images, landlord_id 
      FROM properties 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    console.log('\n=== RECENT PROPERTIES WITH IMAGES ===\n');
    
    if (properties.length === 0) {
      console.log('No properties found in database');
      return;
    }

    properties.forEach((prop, index) => {
      console.log(`${index + 1}. ${prop.title}`);
      console.log(`   ID: ${prop.id}`);
      console.log(`   Landlord: ${prop.landlord_id}`);
      console.log(`   Primary image_url: ${prop.image_url || 'NULL'}`);
      console.log(`   Images array: ${prop.images || 'NULL'}`);
      console.log(`   Images type: ${typeof prop.images}`);
      
      // Try to parse if it's a string
      if (prop.images && typeof prop.images === 'string') {
        try {
          const parsed = JSON.parse(prop.images);
          console.log(`   Parsed images (${parsed.length}):`, parsed);
        } catch (e) {
          console.log(`   Failed to parse images: ${e.message}`);
        }
      } else if (Array.isArray(prop.images)) {
        console.log(`   Images array (${prop.images.length}):`, prop.images);
      }
      console.log('');
    });

    await sequelize.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkPropertyImages();
