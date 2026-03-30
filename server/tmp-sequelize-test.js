import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

dotenv.config({ path: './.env' });

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
    pool: { max: 5, min: 0 }
  }
);

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Sequelize CONNECT OK');
    await sequelize.close();
  } catch (err) {
    console.error('Sequelize CONNECT ERROR:', err.message || err);
    console.error(err);
    process.exit(1);
  }
})();
