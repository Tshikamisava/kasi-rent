import dotenv from 'dotenv';
import { sequelize } from '../config/mysql.js';

dotenv.config();

try {
  const [subscriptions] = await sequelize.query('SHOW COLUMNS FROM subscriptions');
  const [payments] = await sequelize.query('SHOW COLUMNS FROM payments');
  const [users] = await sequelize.query('SHOW COLUMNS FROM users');

  console.log('SUBSCRIPTIONS_COLUMNS');
  console.log(JSON.stringify(subscriptions, null, 2));
  console.log('PAYMENTS_COLUMNS');
  console.log(JSON.stringify(payments, null, 2));
  console.log('USERS_COLUMNS');
  console.log(JSON.stringify(users, null, 2));
} catch (error) {
  console.error('SCHEMA_CHECK_ERROR:', error?.message || error);
} finally {
  await sequelize.close();
}
