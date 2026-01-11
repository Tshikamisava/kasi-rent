import mysql from 'mysql2/promise';

async function testPropertyFetch() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Sc90/10/27/53',
      database: 'kasi_rent'
    });

    console.log('Fetching properties with all fields...\n');

    const [properties] = await connection.execute(
      'SELECT * FROM properties LIMIT 1'
    );

    if (properties.length > 0) {
      console.log('Sample property:');
      console.log(JSON.stringify(properties[0], null, 2));
      
      console.log('\nField names:');
      console.log(Object.keys(properties[0]));
      
      console.log('\nCreated at:', properties[0].created_at);
      console.log('Updated at:', properties[0].updated_at);
    } else {
      console.log('No properties found');
    }

    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testPropertyFetch();
