import { connectDB } from './config/mysql.js';

(async () => {
  try {
    await connectDB();
    console.log('connectDB() completed');
  } catch (err) {
    console.error('connectDB() threw:', err && err.message);
    process.exit(1);
  }
})();
