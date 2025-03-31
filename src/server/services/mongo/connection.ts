import mongoose, { Connection } from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export interface IMongoConnection {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  getConnection(): Connection;
  resetConnection(): Promise<void>;
}

export class MongoConnection implements IMongoConnection {
  private static instance: MongoConnection;
  private connection: Connection | null = null;
  private connected: boolean = false;

  private constructor() {}

  public async resetConnection(): Promise<void> {
    if (this.connected) {
      try {
        await mongoose.disconnect();
      } catch (error) {
        // Ignore disconnect errors during reset
      }
    }
    this.connection = null;
    this.connected = false;
  }

  public static async getInstance(): Promise<MongoConnection> {
    if (!MongoConnection.instance) {
      MongoConnection.instance = new MongoConnection();
    }
    return MongoConnection.instance;
  }

  public async connect(): Promise<void> {
    if (this.connected) {
      return;
    }

    try {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dental-plans', {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4,
      });

      this.connection = mongoose.connection;
      this.connected = true;
    } catch (error) {
      await this.resetConnection();
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.connected) {
      return;
    }

    try {
      await mongoose.disconnect();
      await this.resetConnection();
    } catch (error) {
      await this.resetConnection();
      throw error;
    }
  }

  public isConnected(): boolean {
    // Check both our internal state and Mongoose's state
    return this.connected && mongoose.connection.readyState === 1;
  }

  public getConnection(): Connection {
    if (!this.isConnected()) {
      throw new Error('MongoDB connection is not established');
    }
    return this.connection;
  }

  public async resetConnection(): Promise<void> {
    if (this.connected) {
      await this.disconnect();
    }
    await this.connect();
  }
}

export default MongoConnection;
