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
    // Don't sync/alter schema to preserve manual FK changes
    // await sequelize.sync({ alter: true });
    console.log('✅ Database ready');
  } catch (error) {
    console.error('❌ MySQL Connection Error:', error.message);
  }
};

export { sequelize, connectDB };