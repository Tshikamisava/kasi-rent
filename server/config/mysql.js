import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL Connected successfully');
    // Optionally sync model changes to DB when SEQ_SYNC=true is set in env.
    // WARNING: This will ALTER your tables to match the models. Use only for local/dev environments.
    if (process.env.SEQ_SYNC === 'true') {
      try {
        console.log('🔁 SEQ_SYNC=true: running sequelize.sync({ alter: true }) to update schema');
        await sequelize.sync({ alter: true });
        console.log('✅ Database schema synced (alter applied)');
      } catch (syncErr) {
        console.error('❌ sequelize.sync failed:', syncErr.message);
      }
    }
    console.log('✅ Database ready');
  } catch (error) {
    console.error('❌ MySQL Connection Error:', error.message);
  }
};

export { sequelize, connectDB };