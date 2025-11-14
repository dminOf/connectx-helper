import { MongoClient, Db, MongoClientOptions } from 'mongodb';
import { MongoDBConfig } from './config-loader';
import { logger } from './logger';

/**
 * MongoDB connection manager
 */
class MongoDBManager {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private config: MongoDBConfig | null = null;
  private isConnected: boolean = false;

  /**
   * Connect to MongoDB
   */
  async connect(config: MongoDBConfig): Promise<void> {
    try {
      this.config = config;

      // Build connection string
      const hosts = config.hosts.join(',');
      const uri = `mongodb://${config.username}:${config.password}@${hosts}/${config.database}?replicaSet=${config.replicaSet}`;

      // Connection options
      const options: MongoClientOptions = {
        maxPoolSize: 10,
        minPoolSize: 2,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4, // Use IPv4
      };

      logger.info('Connecting to MongoDB...', {
        database: config.database,
        hosts: config.hosts,
        replicaSet: config.replicaSet,
      });

      // Create client and connect
      this.client = new MongoClient(uri, options);
      await this.client.connect();

      // Get database reference
      this.db = this.client.db(config.database);

      // Verify connection
      await this.db.admin().ping();

      this.isConnected = true;

      logger.info('MongoDB connected successfully', {
        database: config.database,
        replicaSet: config.replicaSet,
      });
    } catch (error) {
      logger.error('Failed to connect to MongoDB', error);
      throw new Error(`MongoDB connection failed: ${error}`);
    }
  }

  /**
   * Get database instance
   */
  getDB(): Db {
    if (!this.db || !this.isConnected) {
      throw new Error('MongoDB is not connected. Call connect() first.');
    }
    return this.db;
  }

  /**
   * Get client instance
   */
  getClient(): MongoClient {
    if (!this.client || !this.isConnected) {
      throw new Error('MongoDB is not connected. Call connect() first.');
    }
    return this.client;
  }

  /**
   * Check if connected
   */
  isReady(): boolean {
    return this.isConnected;
  }

  /**
   * Disconnect from MongoDB
   */
  async disconnect(): Promise<void> {
    try {
      if (this.client) {
        logger.info('Disconnecting from MongoDB...');
        await this.client.close();
        this.isConnected = false;
        this.db = null;
        this.client = null;
        logger.info('MongoDB disconnected successfully');
      }
    } catch (error) {
      logger.error('Error disconnecting from MongoDB', error);
      throw error;
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.db) return false;
      await this.db.admin().ping();
      return true;
    } catch (error) {
      logger.error('MongoDB health check failed', error);
      return false;
    }
  }
}

/**
 * Global MongoDB manager instance
 */
const mongoDBManager = new MongoDBManager();

/**
 * Connect to MongoDB
 */
export async function connectMongoDB(config: MongoDBConfig): Promise<void> {
  await mongoDBManager.connect(config);
}

/**
 * Get database instance
 */
export function getDB(): Db {
  return mongoDBManager.getDB();
}

/**
 * Get client instance
 */
export function getClient(): MongoClient {
  return mongoDBManager.getClient();
}

/**
 * Check if MongoDB is ready
 */
export function isMongoDBReady(): boolean {
  return mongoDBManager.isReady();
}

/**
 * Disconnect from MongoDB
 */
export async function disconnectMongoDB(): Promise<void> {
  await mongoDBManager.disconnect();
}

/**
 * MongoDB health check
 */
export async function mongoDBHealthCheck(): Promise<boolean> {
  return await mongoDBManager.healthCheck();
}
