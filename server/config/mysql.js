import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const poolMax = parseInt(process.env.DB_POOL_MAX, 10) || 5;
const poolMin = parseInt(process.env.DB_POOL_MIN, 10) || 0;
const poolAcquire = parseInt(process.env.DB_POOL_ACQUIRE, 10) || 30000;
const poolIdle = parseInt(process.env.DB_POOL_IDLE, 10) || 10000;

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: poolMax,
      min: poolMin,
      acquire: poolAcquire,
      idle: poolIdle
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
    console.error('❌ MySQL Connection Error:', error);
    // Rethrow so callers can decide how to handle startup failures
    throw error;
  }
};

export { sequelize, connectDB };

// Graceful shutdown: close Sequelize connection on process exit
const shutdown = async () => {
  try {
    console.log('Shutting down DB connection...');
    await sequelize.close();
    console.log('✅ Sequelize connection closed');
  } catch (err) {
    console.error('Error closing Sequelize connection:', err);
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('beforeExit', shutdown);