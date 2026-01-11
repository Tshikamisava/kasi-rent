import Property from './models/Property.js';
import { sequelize } from './config/mysql.js';

async function checkProperties() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connected successfully!\n');

    console.log('Fetching all properties...');
    const properties = await Property.findAll();
    
    console.log(`\nTotal properties in database: ${properties.length}\n`);
    
    if (properties.length === 0) {
      console.log('❌ No properties found in the database!');
      console.log('\nPossible reasons:');
      console.log('1. No landlord has uploaded any properties yet');
      console.log('2. Properties table might be empty');
      console.log('3. Database connection might be pointing to wrong database\n');
    } else {
      console.log('✅ Properties found:\n');
      properties.forEach((property, index) => {
        console.log(`${index + 1}. ${property.title}`);
        console.log(`   Location: ${property.location}`);
        console.log(`   Price: R${property.price}`);
        console.log(`   Type: ${property.property_type}`);
        console.log(`   Bedrooms: ${property.bedrooms}`);
        console.log(`   Bathrooms: ${property.bathrooms}`);
        console.log(`   Verified: ${property.is_verified ? 'Yes' : 'No'}`);
        console.log(`   Landlord ID: ${property.landlord_id}`);
        console.log(`   Image URL: ${property.image_url || 'No image'}`);
        console.log(`   Images: ${property.images ? JSON.stringify(property.images) : 'None'}`);
        console.log(`   Created: ${property.created_at}`);
        console.log('');
      });
    }

    await sequelize.close();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error);
  }
}

checkProperties();
