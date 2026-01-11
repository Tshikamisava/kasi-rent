import mysql from 'mysql2/promise';

async function addViewCountColumn() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Sc90/10/27/53',
      database: 'kasi_rent'
    });

    console.log('Adding view_count column to properties table...');

    // Check if column exists first
    const [existingColumns] = await connection.execute(`
      SHOW COLUMNS FROM properties WHERE Field = 'view_count'
    `);

    if (existingColumns.length > 0) {
      console.log('view_count column already exists');
    } else {
      // Add view_count column
      await connection.execute(`
        ALTER TABLE properties 
        ADD COLUMN view_count INT DEFAULT 0 AFTER is_verified
      `);
      console.log('✅ view_count column added successfully');
    }

    // Verify the column exists
    const [columns] = await connection.execute(`
      SHOW COLUMNS FROM properties WHERE Field = 'view_count'
    `);

    console.log('Column details:', columns);

    await connection.end();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

addViewCountColumn();
