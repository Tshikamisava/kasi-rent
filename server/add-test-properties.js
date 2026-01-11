import mysql from 'mysql2/promise';

async function addTestProperties() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Sc90/10/27/53',
      database: 'kasi_rent'
    });

    console.log('Connected to database...');

    // Check existing properties
    const [existing] = await connection.execute('SELECT COUNT(*) as count FROM properties');
    console.log('Current properties in database:', existing[0].count);

    if (existing[0].count === 0) {
      console.log('No properties found. Adding test properties...');

      // Add 3 test properties
      const testProperties = [
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          title: 'Modern 2 Bedroom Apartment in Soweto',
          description: 'Beautiful modern apartment with stunning views. Features include spacious living areas, modern kitchen, and secure parking.',
          price: 4500,
          location: 'Soweto, Johannesburg',
          address: '123 Vilakazi Street, Orlando West, Soweto',
          latitude: -26.2389,
          longitude: 27.8985,
          bedrooms: 2,
          bathrooms: 1,
          property_type: 'apartment',
          image_url: '/riverside-apartment-1.jpg',
          images: JSON.stringify(['/riverside-apartment-1.jpg']),
          video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          landlord_id: 'test-landlord-1',
          is_verified: true,
          status: 'available'
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          title: 'Spacious Family House in Alexandra',
          description: 'Perfect family home with large backyard. Close to schools and shopping centers.',
          price: 6000,
          location: 'Alexandra, Johannesburg',
          address: '45 London Road, Alexandra',
          latitude: -26.1028,
          longitude: 28.0989,
          bedrooms: 3,
          bathrooms: 2,
          property_type: 'house',
          image_url: '/riverside-house-1.jpg',
          images: JSON.stringify(['/riverside-house-1.jpg']),
          video_url: null,
          landlord_id: 'test-landlord-1',
          is_verified: true,
          status: 'available'
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440003',
          title: 'Cozy Bachelor Pad in Tembisa',
          description: 'Affordable bachelor unit perfect for young professionals. Close to public transport.',
          price: 2500,
          location: 'Tembisa, Johannesburg',
          address: '78 Andrew Mapheto Drive, Tembisa',
          latitude: -25.9988,
          longitude: 28.2273,
          bedrooms: 1,
          bathrooms: 1,
          property_type: 'bachelor',
          image_url: '/riverside-studio-1.jpg',
          images: JSON.stringify(['/riverside-studio-1.jpg']),
          video_url: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
          landlord_id: 'test-landlord-2',
          is_verified: false,
          status: 'available'
        }
      ];

      for (const prop of testProperties) {
        await connection.execute(
          `INSERT INTO properties (id, title, description, price, location, address, latitude, longitude, 
           bedrooms, bathrooms, property_type, image_url, images, video_url, landlord_id, is_verified, status, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            prop.id, prop.title, prop.description, prop.price, prop.location, prop.address,
            prop.latitude, prop.longitude, prop.bedrooms, prop.bathrooms, prop.property_type,
            prop.image_url, prop.images, prop.video_url, prop.landlord_id, prop.is_verified, prop.status
          ]
        );
        console.log('✅ Added:', prop.title);
      }

      console.log('\n✅ Successfully added 3 test properties!');
    } else {
      console.log('Properties already exist. Skipping...');
      
      // Show existing properties
      const [props] = await connection.execute('SELECT id, title, is_verified FROM properties LIMIT 5');
      console.log('\nExisting properties:');
      props.forEach(p => console.log(`  - ${p.title} (verified: ${p.is_verified})`));
    }

    await connection.end();
    console.log('\nDatabase connection closed.');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

addTestProperties();
