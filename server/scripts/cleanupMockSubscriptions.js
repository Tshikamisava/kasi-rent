#!/usr/bin/env node
import dotenv from 'dotenv';
import { Op } from 'sequelize';
import { connectDB, sequelize } from '../config/mysql.js';
import Subscription from '../models/Subscription.js';

dotenv.config();

const usage = `
Cleanup mock/stale pending subscriptions created when gateway wasn't configured.

Usage:
  node scripts/cleanupMockSubscriptions.js [--delete] [--hours=24] [--all-pending]

Examples:
  node scripts/cleanupMockSubscriptions.js
  node scripts/cleanupMockSubscriptions.js --hours=12
  node scripts/cleanupMockSubscriptions.js --delete --hours=24
  node scripts/cleanupMockSubscriptions.js --all-pending --delete
`;

const parseHours = () => {
  const arg = process.argv.find((a) => a.startsWith('--hours='));
  if (!arg) return 24;

  const parsed = Number(arg.split('=')[1]);
  if (!Number.isFinite(parsed) || parsed <= 0) return 24;
  return parsed;
};

const isDeleteMode = process.argv.includes('--delete');
const allPendingMode = process.argv.includes('--all-pending');
const hours = parseHours();

const main = async () => {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(usage);
    process.exit(0);
  }

  try {
    await connectDB();

    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);

    const whereClause = {
      status: 'pending',
      provider: 'paystack',
      provider_reference: {
        [Op.is]: null,
      },
    };

    if (!allPendingMode) {
      whereClause.created_at = {
        [Op.lt]: cutoff,
      };
    }

    const candidates = await Subscription.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      limit: 1000,
    });

    if (!candidates.length) {
      if (allPendingMode) {
        console.log('No pending mock subscriptions found (paystack + no provider reference).');
      } else {
        console.log(`No stale pending subscriptions found older than ${hours} hour(s).`);
      }
      process.exit(0);
    }

    if (allPendingMode) {
      console.log(`Found ${candidates.length} pending mock subscription(s) (all ages):\n`);
    } else {
      console.log(`Found ${candidates.length} stale pending subscription(s) older than ${hours} hour(s):\n`);
    }
    candidates.forEach((sub, i) => {
      console.log(`${i + 1}. id=${sub.id}`);
      console.log(`   user_id=${sub.user_id}`);
      console.log(`   plan=${sub.plan}`);
      console.log(`   amount=${sub.amount} ${sub.currency}`);
      console.log(`   created_at=${sub.created_at}`);
      console.log('');
    });

    if (!isDeleteMode) {
      console.log('Dry run only. No records deleted.');
      console.log('Re-run with --delete to remove these records.');
      process.exit(0);
    }

    const ids = candidates.map((s) => s.id);
    const deletedCount = await Subscription.destroy({ where: { id: ids } });

    console.log(`Deleted ${deletedCount} subscription(s).`);
    process.exit(0);
  } catch (error) {
    console.error('Cleanup failed:', error.message || error);
    process.exit(1);
  } finally {
    try {
      await sequelize.close();
    } catch (e) {
      // ignore close errors
    }
  }
};

main();
