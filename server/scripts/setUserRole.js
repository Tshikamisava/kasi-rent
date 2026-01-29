#!/usr/bin/env node
import dotenv from 'dotenv';
import { connectDB } from '../config/mysql.js';
import User from '../models/User.js';

dotenv.config();

const usage = `Usage: node scripts/setUserRole.js <email|id> <role>
Examples:
  node scripts/setUserRole.js user@example.com landlord
  node scripts/setUserRole.js 1a2b3c4d-... admin
`;

const main = async () => {
  const [, , identifier, role] = process.argv;

  if (!identifier || !role) {
    console.error(usage);
    process.exit(1);
  }

  try {
    await connectDB();

    let user = null;
    if (identifier.includes('@')) {
      user = await User.findOne({ where: { email: identifier } });
    } else {
      user = await User.findByPk(identifier);
    }

    if (!user) {
      console.error('User not found');
      process.exit(2);
    }

    user.role = role;
    await user.save();

    console.log(`Updated user ${user.email} (${user.id}) role -> ${role}`);
    process.exit(0);
  } catch (err) {
    console.error('Error updating user role:', err.message || err);
    process.exit(3);
  }
};

main();
