import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

export const setupTestDB = async () => {
  if (!mongoServer) {
    mongoServer = await MongoMemoryServer.create();
  }

  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri, {
    dbName: 'dental-plans-test',
  });
};

export const cleanupTestDB = async () => {
  if (mongoServer) {
    await mongoose.connection.close();
    await mongoServer.stop();
  }
};

// Export the shared instance for tests that need to use it directly
export { mongoServer };
