import dotenv from 'dotenv';
dotenv.config();
import { connectDB } from '../config/mysql.js';

(async () => {
  try {
    await connectDB();
    console.log('SEQ_OK');
    process.exit(0);
  } catch (err) {
    console.error('SEQ_FAIL:', err.message || err);
    process.exit(1);
  }
})();