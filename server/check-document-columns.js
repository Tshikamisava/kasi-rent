import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function checkDocumentColumns() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    const [columns] = await connection.execute(`
      SHOW COLUMNS FROM properties WHERE Field IN (
        'document_url',
        'document_filename',
        'document_type',
        'document_uploaded_at',
        'document_verified',
        'document_verified_by',
        'document_review_notes'
      )
    `);

    console.log(`Found ${columns.length} document-related columns in properties table.`);
    columns.forEach(col => console.log(`- ${col.Field} (${col.Type})`));

    await connection.end();
  } catch (error) {
    console.error('Error checking document columns:', error.message);
    process.exit(1);
  }
}

checkDocumentColumns();
