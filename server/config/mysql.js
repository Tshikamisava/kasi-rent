import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const poolMax = parseInt(process.env.DB_POOL_MAX, 10) || 5;
const poolMin = parseInt(process.env.DB_POOL_MIN, 10) || 0;
const poolAcquire = parseInt(process.env.DB_POOL_ACQUIRE, 10) || 30000;
const poolIdle = parseInt(process.env.DB_POOL_IDLE, 10) || 10000;

let sequelize;
const useDatabaseUrl = !!process.env.DATABASE_URL;

if (useDatabaseUrl) {
  // Use a single DATABASE_URL (e.g., Render Postgres) when provided
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false,
    pool: {
      max: poolMax,
      min: poolMin,
      acquire: poolAcquire,
      idle: poolIdle
    },
    // For managed Postgres (Render) require SSL. When connecting to a remote
    // DATABASE_URL we enable TLS even in non-production so clients running
    // locally against Render can connect without "SSL/TLS required" errors.
    dialectOptions: { ssl: { require: true, rejectUnauthorized: false } }
  });
} else {
  // Fallback to explicit MySQL env vars
  sequelize = new Sequelize(
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
}

const connectDB = async () => {
  const retries = parseInt(process.env.DB_CONNECT_RETRIES, 10) || 5;
  const delayMs = parseInt(process.env.DB_CONNECT_RETRY_DELAY, 10) || 5000;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await sequelize.authenticate();
      console.log('✅ Database connected successfully');
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
      return;
    } catch (error) {
      console.error(`❌ Database connection error (attempt ${attempt}/${retries}):`, error.message || error);
      if (attempt < retries) {
        console.log(`Waiting ${delayMs}ms before retrying...`);
        await new Promise((res) => setTimeout(res, delayMs));
        continue;
      }
      // After final attempt, throw the error
      throw error;
    }
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