import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import dotenv from 'dotenv';
import MongoConnection from '../connection';

// Load test environment variables
dotenv.config({ path: '.env.test' });

class TestMongoServer {
  private static instance?: MongoMemoryServer;
  private static uri?: string;
  private static readonly TEST_PORT = 37017; // Use a non-standard port
  private static readonly DB_PATH = path.join(os.tmpdir(), 'dental-plan-mongo-test');

  static async getInstance(): Promise<MongoMemoryServer> {
    if (!TestMongoServer.instance) {
      TestMongoServer.instance = await MongoMemoryServer.create({
        instance: {
          port: TestMongoServer.TEST_PORT,
          dbPath: TestMongoServer.DB_PATH,
        },
        binary: {
          version: '6.0.12',
          arch: 'arm64',
          platform: 'darwin',
        },
      });
      TestMongoServer.uri = TestMongoServer.instance.getUri();
    }
    return TestMongoServer.instance;
  }

  static async stopInstance(): Promise<void> {
    if (TestMongoServer.instance) {
      try {
        await mongoose.disconnect();
        await TestMongoServer.instance.stop({ force: true });
      } finally {
        // Always clean up, even if stop fails
        if (fs.existsSync(TestMongoServer.DB_PATH)) {
          await fs.promises.rm(TestMongoServer.DB_PATH, { recursive: true, force: true });
        }
        TestMongoServer.instance = undefined;
        TestMongoServer.uri = undefined;
      }
    }
  }

  static getUri(): string {
    if (!TestMongoServer.uri) {
      throw new Error('MongoDB URI not initialized');
    }
    return TestMongoServer.uri;
  }
}

let connection: MongoConnection;

export const setupMongoConnection = async () => {
  try {
    // Get or create MongoDB memory server
    await TestMongoServer.getInstance();
    const mongoUri = TestMongoServer.getUri();

    // Set the MongoDB URI for tests
    process.env.MONGODB_URI = mongoUri;
    process.env.MONGODB_DB_NAME = 'dental-plans-test';

    // Get the singleton instance and connect
    connection = await MongoConnection.getInstance();
    await connection.connect();
  } catch (error) {
    await TestMongoServer.stopInstance();
    // Preserve the original error message
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to setup test MongoDB connection: ${message}`);
  }
};

export const teardownMongoConnection = async () => {
  try {
    if (connection) {
      await connection.disconnect();
    }
    await TestMongoServer.stopInstance();
  } catch (error) {
    // Error will be thrown and caught by test runner
    throw new Error('Failed to teardown test MongoDB connection');
  } finally {
    // Clean up environment variables
    delete process.env.MONGODB_URI;
    delete process.env.MONGODB_DB_NAME;
  }
};

export const clearDatabase = async () => {
  if (!mongoose.connection.db) {
    return; // No connection, nothing to clear
  }
  const collections = await mongoose.connection.db.collections();
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
};
