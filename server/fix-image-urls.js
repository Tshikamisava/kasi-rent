import { sequelize } from './config/mysql.js';
import dotenv from 'dotenv';

dotenv.config();

async function fixImageUrls() {
  try {
    console.log('\n=== FIXING IMAGE URLs (5000 → 5001) ===\n');

    // Update image_url column
    const [result1] = await sequelize.query(`
      UPDATE properties 
      SET image_url = REPLACE(image_url, 'localhost:5000', 'localhost:5001')
      WHERE image_url LIKE '%localhost:5000%'
    `);

    console.log(`✓ Updated ${result1.affectedRows} image_url fields`);

    // Update images JSON array
    const [result2] = await sequelize.query(`
      UPDATE properties 
      SET images = REPLACE(images, 'localhost:5000', 'localhost:5001')
      WHERE images LIKE '%localhost:5000%'
    `);

    console.log(`✓ Updated ${result2.affectedRows} images arrays`);

    // Show updated properties
    const [properties] = await sequelize.query(`
      SELECT id, title, image_url, images 
      FROM properties 
      ORDER BY created_at DESC
    `);

    console.log('\n=== UPDATED PROPERTIES ===\n');
    properties.forEach((prop, index) => {
      console.log(`${index + 1}. ${prop.title}`);
      console.log(`   Primary: ${prop.image_url || 'None'}`);
      if (prop.images) {
        const imageArray = typeof prop.images === 'string' ? JSON.parse(prop.images) : prop.images;
        console.log(`   Images: ${imageArray.length} images`);
        imageArray.forEach((img, i) => {
          console.log(`     ${i + 1}. ${img}`);
        });
      }
      console.log('');
    });

    await sequelize.close();
    console.log('✓ All image URLs fixed!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixImageUrls();
