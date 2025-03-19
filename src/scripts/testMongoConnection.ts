import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectToMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'your_default_mongodb_uri');
    // console.log('Successfully connected to MongoDB');
  } catch (error) {
    // console.error('Failed to connect to MongoDB:', error);
  } finally {
    mongoose.connection.close();
  }
};

connectToMongoDB();
