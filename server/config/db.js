import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log('⚠️  Server will continue running but database operations will fail.');
    console.log('📝 To fix this:');
    console.log('   1. Go to MongoDB Atlas (https://cloud.mongodb.com)');
    console.log('   2. Navigate to Network Access');
    console.log('   3. Add your current IP address or use 0.0.0.0/0 for development');
    // Don't exit, let server continue for development
  }
};

export default connectDB;
