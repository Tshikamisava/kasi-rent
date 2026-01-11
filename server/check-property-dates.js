import mysql from 'mysql2/promise';

async function checkPropertyDates() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Sc90/10/27/53',
      database: 'kasi_rent'
    });

    console.log('Checking property dates...\n');

    const [properties] = await connection.execute(
      'SELECT id, title, created_at, updated_at FROM properties ORDER BY created_at DESC'
    );

    console.log('Properties in database:');
    properties.forEach(p => {
      console.log(`\n📍 ${p.title}`);
      console.log(`   ID: ${p.id}`);
      console.log(`   Created: ${p.created_at}`);
      console.log(`   Updated: ${p.updated_at}`);
      console.log(`   Created (formatted): ${new Date(p.created_at).toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' })}`);
    });

    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkPropertyDates();
