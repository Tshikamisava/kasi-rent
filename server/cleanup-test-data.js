import Property from './models/Property.js';
import { sequelize } from './config/mysql.js';

async function cleanupTestData() {
  try {
    console.log('🧹 Cleaning up test data...\n');
    await sequelize.authenticate();
    console.log('✅ Database connected\n');

    // Delete all properties with test landlord IDs
    const testLandlordIds = ['test-landlord-123', 'test', 'temp-id'];
    
    const deletedCount = await Property.destroy({
      where: {
        landlord_id: testLandlordIds
      }
    });
    
    console.log(`✅ Deleted ${deletedCount} test properties\n`);
    
    // Show remaining properties
    const remainingProperties = await Property.findAll();
    console.log(`📊 Remaining properties: ${remainingProperties.length}\n`);
    
    if (remainingProperties.length > 0) {
      console.log('Real properties in database:');
      remainingProperties.forEach((prop, index) => {
        console.log(`\n${index + 1}. ${prop.title}`);
        console.log(`   Location: ${prop.location}`);
        console.log(`   Price: R${prop.price}`);
        console.log(`   Landlord ID: ${prop.landlord_id}`);
      });
    } else {
      console.log('No properties remaining in database.');
    }
    
    await sequelize.close();
    console.log('\n✅ Cleanup complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

cleanupTestData();
