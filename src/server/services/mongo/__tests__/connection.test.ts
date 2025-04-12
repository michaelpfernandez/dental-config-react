import MongoConnection from '../connection';
import mongoose from 'mongoose';
import { vi, describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { setupMongoConnection, teardownMongoConnection, clearDatabase } from './test-setup';

describe('MongoConnection', () => {
  let connection: MongoConnection;

  beforeAll(async () => {
    await setupMongoConnection();
    connection = await MongoConnection.getInstance();
  });

  afterAll(async () => {
    await teardownMongoConnection();
    // Clear all mongoose models
    Object.keys(mongoose.models).forEach((modelName) => {
      mongoose.deleteModel(modelName);
    });
  });

  beforeEach(async () => {
    await clearDatabase();
    await connection.resetConnection();
    // Reset mongoose connection state
    mongoose.connections.forEach((conn) => {
      Object.keys(conn.collections).forEach((collection) => {
        delete conn.collections[collection];
      });
    });
  });

  afterEach(async () => {
    vi.restoreAllMocks(); // Clean up all spies and mocks
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  describe('getInstance', () => {
    it('should return the same instance', async () => {
      const instance1 = await MongoConnection.getInstance();
      const instance2 = await MongoConnection.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should maintain singleton instance', async () => {
      const instance = await MongoConnection.getInstance();
      expect(instance).toBeInstanceOf(MongoConnection);
      expect(instance.isConnected()).toBeDefined();
    });
  });

  describe('connect', () => {
    it('should connect to MongoDB', async () => {
      await connection.connect();
      expect(connection.isConnected()).toBe(true);
      expect(mongoose.connection.readyState).toBe(1); // Verify Mongoose state
    });

    it('should not connect if already connected', async () => {
      await connection.connect();
      const connectSpy = vi.spyOn(mongoose, 'connect');
      await connection.connect();
      expect(connectSpy).not.toHaveBeenCalled();
      expect(connection.isConnected()).toBe(true);
    });

    it('should throw error on connection failure', async () => {
      // Reset connection state before testing error
      await connection.resetConnection();

      // Mock mongoose.connect to throw an error
      const error = new Error('Failed to connect to MongoDB');
      vi.spyOn(mongoose, 'connect').mockRejectedValue(error);

      await expect(connection.connect()).rejects.toThrow('Failed to connect to MongoDB');
      expect(connection.isConnected()).toBe(false); // Verify connection state after failure
    });
  });

  describe('disconnect', () => {
    it('should disconnect from MongoDB', async () => {
      await connection.connect();
      await connection.disconnect();
      expect(connection.isConnected()).toBe(false);
    });

    it('should not disconnect if not connected', async () => {
      await connection.disconnect();
      expect(connection.isConnected()).toBe(false);
    });

    it('should throw error on disconnection failure', async () => {
      const error = new Error('Failed to disconnect');
      vi.spyOn(mongoose, 'disconnect').mockRejectedValueOnce(error);

      await expect(connection.disconnect()).rejects.toThrow('Failed to disconnect');
    });
  });

  describe('isConnected', () => {
    it('should return true when connected', async () => {
      await connection.connect();
      expect(connection.isConnected()).toBe(true);
    });

    it('should return false when not connected', async () => {
      await connection.disconnect();
      expect(connection.isConnected()).toBe(false);
    });
  });

  describe('getConnection', () => {
    it('should return the connection when connected', async () => {
      await connection.connect();
      const conn = connection.getConnection();
      expect(conn).toBeDefined();
    });

    it('should throw error when not connected', async () => {
      await connection.disconnect();
      await expect(() => connection.getConnection()).toThrow(
        'MongoDB connection is not established',
      );
    });
  });

  describe('resetConnection', () => {
    it('should reset the connection', async () => {
      await connection.connect();
      await connection.resetConnection();
      expect(connection.isConnected()).toBe(true);
    });
  });
});
