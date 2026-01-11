import mysql from 'mysql2/promise';

async function updatePropertyDates() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Sc90/10/27/53',
      database: 'kasi_rent'
    });

    console.log('Connected to database...');

    // Get all properties
    const [properties] = await connection.execute('SELECT id, title FROM properties');
    console.log(`Found ${properties.length} properties to update\n`);

    // Update each property with proper dates
    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
      
      // Create dates with some variation (properties listed over the past few months)
      const daysAgo = 30 + (i * 15); // Each property listed 15 days apart
      const createdDate = new Date();
      createdDate.setDate(createdDate.getDate() - daysAgo);
      
      const updatedDate = new Date();
      updatedDate.setDate(updatedDate.getDate() - (daysAgo - 5)); // Updated 5 days after creation

      const createdAt = createdDate.toISOString().slice(0, 19).replace('T', ' ');
      const updatedAt = updatedDate.toISOString().slice(0, 19).replace('T', ' ');

      await connection.execute(
        'UPDATE properties SET created_at = ?, updated_at = ? WHERE id = ?',
        [createdAt, updatedAt, property.id]
      );

      console.log(`✅ Updated "${property.title}"`);
      console.log(`   Created: ${createdDate.toLocaleDateString()}`);
      console.log(`   Updated: ${updatedDate.toLocaleDateString()}\n`);
    }

    console.log('✅ All properties updated successfully!');

    // Verify the updates
    const [updated] = await connection.execute(
      'SELECT title, created_at, updated_at FROM properties ORDER BY created_at DESC'
    );
    
    console.log('\nVerification - Properties with dates:');
    updated.forEach(p => {
      console.log(`  - ${p.title}`);
      console.log(`    Created: ${new Date(p.created_at).toLocaleDateString()}`);
      console.log(`    Updated: ${new Date(p.updated_at).toLocaleDateString()}`);
    });

    await connection.end();
    console.log('\nDatabase connection closed.');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

updatePropertyDates();
