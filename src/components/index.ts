/**
 * ConnectX Helper Components
 *
 * This file exports all reusable components for easy importing.
 * These components can be used in other projects as well.
 */

// Config Loader
export {
  loadConfig,
  getConfig,
  isConfigLoaded,
  clearConfig,
  type Config,
  type AppConfig,
  type LoggerConfig,
  type PrometheusConfig,
  type MongoDBConfig,
  type KafkaConfig,
  type TargetSystemReference,
  type ModuleTable,
  type RemapKafkaTopicName,
  type EventTopicMapping,
  type CommonConfig,
} from './config-loader';

// Logger
export { initLogger, logger, LogLevel } from './logger';

// MongoDB
export {
  connectMongoDB,
  getDB,
  getClient,
  isMongoDBReady,
  disconnectMongoDB,
  mongoDBHealthCheck,
} from './mongodb';

// Kafka
export {
  initKafka,
  sendMessage,
  onMessage,
  getProducer,
  getConsumer,
  getAdmin,
  isKafkaReady,
  disconnectKafka,
  type MessageHandler,
} from './kafka';
