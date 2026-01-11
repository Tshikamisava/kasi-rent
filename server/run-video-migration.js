import mysql from 'mysql2/promise';
import fs from 'fs';

async function runMigration() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Sc90/10/27/53',
      database: 'kasi_rent'
    });

    console.log('Connected to database...');

    const sql = fs.readFileSync('./migrations/add-video-url.sql', 'utf8');
    console.log('Executing migration:', sql);

    await connection.execute(sql);
    console.log('✅ Migration completed: video_url column added to properties table');

    await connection.end();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Migration error:', error.message);
    process.exit(1);
  }
}

runMigration();
