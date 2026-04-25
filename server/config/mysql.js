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
    // Enable Sequelize logging when SEQ_DEBUG=true
    logging: process.env.SEQ_DEBUG === 'true' ? (msg) => console.log('[sequelize]', msg) : false,
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
      // Enable Sequelize logging when SEQ_DEBUG=true
      logging: process.env.SEQ_DEBUG === 'true' ? (msg) => console.log('[sequelize]', msg) : false,
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
  // Diagnostic: print effective DB connection settings (avoid printing password)
  try {
    console.log('🔎 DB config (effective):', {
      useDatabaseUrl,
      DB_HOST: process.env.DB_HOST,
      DB_USER: process.env.DB_USER,
      DB_NAME: process.env.DB_NAME,
      DB_POOL_MAX: poolMax,
      DB_POOL_MIN: poolMin,
      DB_POOL_ACQUIRE: poolAcquire,
      DB_POOL_IDLE: poolIdle,
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: !!process.env.DATABASE_URL
    });
  } catch (diagErr) {
    console.error('Error printing DB diagnostic info:', diagErr && diagErr.message);
  }
  const retries = parseInt(process.env.DB_CONNECT_RETRIES, 10) || 5;
  const delayMs = parseInt(process.env.DB_CONNECT_RETRY_DELAY, 10) || 5000;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await sequelize.authenticate();
      console.log('✅ Database connected successfully');
      // Optionally sync model changes to DB.
      // Defaults:
      // - non-production: enabled
      // - production + DATABASE_URL (e.g. Render Postgres): enabled
      //   This prevents first-boot "relation does not exist" failures when
      //   schema has not been created yet.
      // Override with:
      // - SEQ_SYNC=true  -> force enable
      // - SEQ_SYNC=false -> force disable
      // WARNING: This uses ALTER to match models. Use with care.
      const seqSyncValue = process.env.SEQ_SYNC;
      const shouldSync = seqSyncValue === 'true' ||
        (typeof seqSyncValue === 'undefined' && (process.env.NODE_ENV !== 'production' || useDatabaseUrl));
      if (shouldSync) {
        let globalSyncSucceeded = false;
        try {
          console.log('🔁 Running sequelize.sync({ alter: true }) to ensure schema is up to date');
          await sequelize.sync({ alter: true });
          globalSyncSucceeded = true;
          console.log('✅ Database schema synced (alter applied)');
        } catch (syncErr) {
          console.error('❌ sequelize.sync failed:', syncErr.message);
        }

        try {
          const models = await import('../models/index.js');
          const criticalModels = [
            models.User,
            models.Property,
            models.Booking,
            models.Favorite,
            models.Subscription,
            models.Review,
          ].filter((model) => model && typeof model.sync === 'function');

          if (!globalSyncSucceeded) {
            console.log('🩹 Global sync was partial/failed, ensuring critical tables exist with per-model sync()');
          } else {
            console.log('🔎 Ensuring critical tables exist after global sync');
          }

          for (const model of criticalModels) {
            await model.sync();
            console.log(`✅ Ensured table exists for model: ${model.name}`);
          }
        } catch (modelSyncErr) {
          console.error('❌ Per-model sync fallback failed:', modelSyncErr.message);
        }
      } else {
        console.log('ℹ️ Schema sync skipped (set SEQ_SYNC=true to force, SEQ_SYNC=false to disable)');
      }
      console.log('✅ Database ready');
      return;
    } catch (error) {
      console.error(`❌ Database connection error (attempt ${attempt}/${retries}):`, error.message || error);
      if (process.env.SEQ_DEBUG === 'true') {
        console.error('Full error stack:', error.stack);
      }
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