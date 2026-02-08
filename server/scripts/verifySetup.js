import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

console.log('\n🔍 Verifying KasiRent Backend Setup...\n');

async function verifySetup() {
  let connection;
  let allPassed = true;

  try {
    // 1. Check environment variables
    console.log('1️⃣ Checking environment variables...');
    const requiredVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET'];
    const missingVars = requiredVars.filter(v => !process.env[v]);
    
    if (missingVars.length > 0) {
      console.log('   ❌ Missing environment variables:', missingVars.join(', '));
      console.log('   ℹ️  Copy .env.example to .env and configure it\n');
      allPassed = false;
    } else {
      console.log('   ✅ All required environment variables set\n');
    }

    // 2. Test database connection
    console.log('2️⃣ Testing database connection...');
    try {
      connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        port: process.env.DB_PORT || 3306,
      });
      console.log('   ✅ Connected to MySQL server\n');
    } catch (error) {
      console.log('   ❌ Cannot connect to MySQL:', error.message);
      console.log('   ℹ️  Make sure MySQL is running and credentials are correct\n');
      allPassed = false;
      return;
    }

    // 3. Check if database exists
    console.log('3️⃣ Checking if database exists...');
    const dbName = process.env.DB_NAME || 'kasi_rent';
    const [databases] = await connection.query('SHOW DATABASES LIKE ?', [dbName]);
    
    if (databases.length === 0) {
      console.log(`   ❌ Database '${dbName}' does not exist`);
      console.log('   ℹ️  Run: npm run init-db\n');
      allPassed = false;
    } else {
      console.log(`   ✅ Database '${dbName}' exists\n`);
      
      // Switch to database
      await connection.query(`USE ${dbName}`);
      
      // 4. Check if tables exist
      console.log('4️⃣ Checking database tables...');
      const requiredTables = ['users', 'user_roles', 'properties', 'bookings', 'favorites', 'reviews', 'messages'];
      const [tables] = await connection.query('SHOW TABLES');
      const existingTables = tables.map(t => Object.values(t)[0]);
      
      const missingTables = requiredTables.filter(t => !existingTables.includes(t));
      
      if (missingTables.length > 0) {
        console.log('   ❌ Missing tables:', missingTables.join(', '));
        console.log('   ℹ️  Run: npm run init-db\n');
        allPassed = false;
      } else {
        console.log('   ✅ All required tables exist');
        requiredTables.forEach(table => {
          console.log(`      ✓ ${table}`);
        });
        console.log('');
        
        // 5. Check table row counts
        console.log('5️⃣ Database statistics...');
        for (const table of requiredTables) {
          const [result] = await connection.query(`SELECT COUNT(*) as count FROM ${table}`);
          const count = result[0].count;
          console.log(`   📊 ${table}: ${count} rows`);
        }
        console.log('');
      }
    }

    // 6. Check JWT secret strength
    console.log('6️⃣ Checking JWT secret...');
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret || jwtSecret === 'your_jwt_secret_key_here') {
      console.log('   ⚠️  JWT_SECRET is not configured or using default value');
      console.log('   ℹ️  Set a strong random string for production\n');
    } else if (jwtSecret.length < 32) {
      console.log('   ⚠️  JWT_SECRET is too short (minimum 32 characters recommended)');
      console.log('   ℹ️  Use a longer secret for better security\n');
    } else {
      console.log('   ✅ JWT_SECRET is configured\n');
    }

    // 7. Check uploads directory
    console.log('7️⃣ Checking uploads directory...');
    try {
      const fs = await import('fs');
      const uploadsDir = join(__dirname, '../uploads');
      if (!fs.existsSync(uploadsDir)) {
        console.log('   ℹ️  Creating uploads directory...');
        fs.mkdirSync(uploadsDir, { recursive: true });
        console.log('   ✅ Uploads directory created\n');
      } else {
        console.log('   ✅ Uploads directory exists\n');
      }
    } catch (error) {
      console.log('   ⚠️  Could not verify uploads directory:', error.message);
      console.log('');
    }

  } catch (error) {
    console.error('   ❌ Verification error:', error.message);
    allPassed = false;
  } finally {
    if (connection) {
      await connection.end();
    }
  }

  // Final summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (allPassed) {
    console.log('✅ All checks passed! Your backend is ready to run.');
    console.log('');
    console.log('Next steps:');
    console.log('  npm run dev     - Start the development server');
    console.log('  npm start       - Start the production server');
    console.log('');
  } else {
    console.log('❌ Some checks failed. Please fix the issues above.');
    console.log('');
    console.log('Common fixes:');
    console.log('  1. Copy .env.example to .env and configure it');
    console.log('  2. Make sure MySQL is running');
    console.log('  3. Run: npm run init-db');
    console.log('');
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

verifySetup().catch(console.error);
