import { Kafka, Producer, Consumer, Admin, logLevel, IHeaders } from 'kafkajs';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { KafkaConfig } from './config-loader';
import { logger } from './logger';

/**
 * Message handler function type
 */
export type MessageHandler = (message: {
  topic: string;
  partition: number;
  value: any;
  key?: string;
  headers?: IHeaders;
  timestamp: string;
}) => void | Promise<void>;

/**
 * Kafka connection manager
 */
class KafkaManager {
  private kafka: Kafka | null = null;
  private producer: Producer | null = null;
  private consumer: Consumer | null = null;
  private admin: Admin | null = null;
  private config: KafkaConfig | null = null;
  private isConnected: boolean = false;
  private messageHandlers: Map<string, MessageHandler[]> = new Map();

  /**
   * Initialize Kafka connection
   */
  async init(config: KafkaConfig): Promise<void> {
    try {
      if (!config.EnableKafka) {
        logger.warn('Kafka is disabled in configuration');
        return;
      }

      this.config = config;

      // Build Kafka client configuration
      const kafkaConfig: any = {
        clientId: config.ConsumerGroup,
        brokers: config.Brokers,
        logLevel: logLevel.INFO,
      };

      // Add SSL/TLS configuration if enabled
      if (config.EnableTLS) {
        logger.info('Configuring Kafka with TLS/SSL');
        kafkaConfig.ssl = {
          rejectUnauthorized: false,
          ca: [readFileSync(resolve(config.CACert), 'utf-8')],
          cert: [readFileSync(resolve(config.ClientSignedCert), 'utf-8')],
          key: [readFileSync(resolve(config.ClientPrivateKey), 'utf-8')],
        };
      }

      // Add SASL configuration if enabled
      if (config.EnableSASL) {
        logger.info('Configuring Kafka with SASL authentication');
        kafkaConfig.sasl = {
          mechanism: 'scram-sha-256',
          username: config.SASLUser,
          password: config.SASLPassword,
        };
      }

      logger.info('Initializing Kafka connection...', {
        brokers: config.Brokers,
        consumerGroup: config.ConsumerGroup,
        enableTLS: config.EnableTLS,
        enableSASL: config.EnableSASL,
      });

      // Create Kafka client
      this.kafka = new Kafka(kafkaConfig);

      // Create admin client
      this.admin = this.kafka.admin();
      await this.admin.connect();

      // Create topics if auto-creation is enabled
      if (config.AutomaticallyCreateTopics && config.ListenTopicsList.length > 0) {
        await this.createTopics(config.ListenTopicsList, config.DefaultNumberOfPartitions);
      }

      // Create producer
      this.producer = this.kafka.producer();
      await this.producer.connect();

      // Create consumer with dynamic naming if enabled
      let consumerGroup = config.ConsumerGroup;
      if (config.EnableDynamicConsumerName) {
        const timestamp = Date.now();
        consumerGroup = `${config.ConsumerGroup}-${timestamp}`;
      }

      this.consumer = this.kafka.consumer({
        groupId: consumerGroup,
        sessionTimeout: 30000,
        heartbeatInterval: 3000,
      });
      await this.consumer.connect();

      // Subscribe to configured topics
      if (config.ListenTopicsList.length > 0) {
        await this.subscribeToTopics(config.ListenTopicsList);
      }

      this.isConnected = true;

      logger.info('Kafka connected successfully', {
        brokers: config.Brokers.length,
        consumerGroup,
      });
    } catch (error) {
      logger.error('Failed to initialize Kafka', error);
      throw new Error(`Kafka initialization failed: ${error}`);
    }
  }

  /**
   * Create topics
   */
  private async createTopics(topics: string[], numPartitions: number): Promise<void> {
    if (!this.admin) {
      throw new Error('Kafka admin not initialized');
    }

    try {
      logger.info('Creating Kafka topics...', { topics });

      const topicConfigs = topics.map((topic) => ({
        topic,
        numPartitions,
        replicationFactor: 1,
      }));

      await this.admin.createTopics({
        topics: topicConfigs,
        waitForLeaders: true,
      });

      logger.info('Topics created successfully');
    } catch (error: any) {
      // Ignore error if topics already exist
      if (error.type === 'TOPIC_ALREADY_EXISTS') {
        logger.info('Topics already exist, skipping creation');
      } else {
        logger.error('Failed to create topics', error);
        throw error;
      }
    }
  }

  /**
   * Subscribe to topics
   */
  private async subscribeToTopics(topics: string[]): Promise<void> {
    if (!this.consumer) {
      throw new Error('Kafka consumer not initialized');
    }

    try {
      logger.info('Subscribing to topics...', { topics });

      // Subscribe to each topic
      for (const topic of topics) {
        await this.consumer.subscribe({ topic, fromBeginning: false });
      }

      // Start consuming messages
      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            const handlers = this.messageHandlers.get(topic) || [];
            const messageData = {
              topic,
              partition,
              value: message.value ? JSON.parse(message.value.toString()) : null,
              key: message.key?.toString(),
              headers: message.headers,
              timestamp: message.timestamp,
            };

            // Call all handlers for this topic
            for (const handler of handlers) {
              await handler(messageData);
            }
          } catch (error) {
            logger.error(`Error processing message from topic ${topic}`, error);
          }
        },
      });

      logger.info('Subscribed to topics successfully');
    } catch (error) {
      logger.error('Failed to subscribe to topics', error);
      throw error;
    }
  }

  /**
   * Send message to a topic
   */
  async send(topic: string, message: any, key?: string): Promise<void> {
    if (!this.producer) {
      throw new Error('Kafka producer not initialized');
    }

    try {
      const messageValue = typeof message === 'string' ? message : JSON.stringify(message);

      await this.producer.send({
        topic,
        messages: [
          {
            key: key || null,
            value: messageValue,
          },
        ],
      });

      logger.debug(`Message sent to topic: ${topic}`, { key });
    } catch (error) {
      logger.error(`Failed to send message to topic ${topic}`, error);
      throw error;
    }
  }

  /**
   * Register a message handler for a topic
   */
  onMessage(topic: string, handler: MessageHandler): void {
    const handlers = this.messageHandlers.get(topic) || [];
    handlers.push(handler);
    this.messageHandlers.set(topic, handlers);
    logger.debug(`Message handler registered for topic: ${topic}`);
  }

  /**
   * Get producer instance
   */
  getProducer(): Producer {
    if (!this.producer) {
      throw new Error('Kafka producer not initialized');
    }
    return this.producer;
  }

  /**
   * Get consumer instance
   */
  getConsumer(): Consumer {
    if (!this.consumer) {
      throw new Error('Kafka consumer not initialized');
    }
    return this.consumer;
  }

  /**
   * Get admin instance
   */
  getAdmin(): Admin {
    if (!this.admin) {
      throw new Error('Kafka admin not initialized');
    }
    return this.admin;
  }

  /**
   * Check if connected
   */
  isReady(): boolean {
    return this.isConnected;
  }

  /**
   * Disconnect from Kafka
   */
  async disconnect(): Promise<void> {
    try {
      logger.info('Disconnecting from Kafka...');

      if (this.consumer) {
        await this.consumer.disconnect();
      }

      if (this.producer) {
        await this.producer.disconnect();
      }

      if (this.admin) {
        await this.admin.disconnect();
      }

      this.isConnected = false;
      this.kafka = null;
      this.producer = null;
      this.consumer = null;
      this.admin = null;

      logger.info('Kafka disconnected successfully');
    } catch (error) {
      logger.error('Error disconnecting from Kafka', error);
      throw error;
    }
  }
}

/**
 * Global Kafka manager instance
 */
const kafkaManager = new KafkaManager();

/**
 * Initialize Kafka
 */
export async function initKafka(config: KafkaConfig): Promise<void> {
  await kafkaManager.init(config);
}

/**
 * Send message to Kafka topic
 */
export async function sendMessage(topic: string, message: any, key?: string): Promise<void> {
  await kafkaManager.send(topic, message, key);
}

/**
 * Register message handler for a topic
 */
export function onMessage(topic: string, handler: MessageHandler): void {
  kafkaManager.onMessage(topic, handler);
}

/**
 * Get producer instance
 */
export function getProducer(): Producer {
  return kafkaManager.getProducer();
}

/**
 * Get consumer instance
 */
export function getConsumer(): Consumer {
  return kafkaManager.getConsumer();
}

/**
 * Get admin instance
 */
export function getAdmin(): Admin {
  return kafkaManager.getAdmin();
}

/**
 * Check if Kafka is ready
 */
export function isKafkaReady(): boolean {
  return kafkaManager.isReady();
}

/**
 * Disconnect from Kafka
 */
export async function disconnectKafka(): Promise<void> {
  await kafkaManager.disconnect();
}
