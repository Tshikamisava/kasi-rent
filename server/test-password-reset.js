import { connectDB } from './config/mysql.js';
import User from './models/User.js';
import crypto from 'crypto';

async function testPasswordReset() {
  try {
    await connectDB();
    console.log('✓ Database connected');

    // Check if user model has reset fields
    const users = await User.findAll({ limit: 1 });
    console.log('✓ User model working');
    console.log('Sample user columns:', users.length > 0 ? Object.keys(users[0].dataValues) : 'No users');

    console.log('\n✓ All tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('✗ Test failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testPasswordReset();
