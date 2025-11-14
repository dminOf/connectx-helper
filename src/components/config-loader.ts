import * as TOML from '@iarna/toml';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';

/**
 * Configuration interfaces matching the TOML structure
 */

export interface AppConfig {
  HttpHostListen: string;
  HttpPortListen: number;
  LogDirectory: string;
  LogFilePrefix: string;
  ExtraKafkaBackgroundListerTopics: string[];
  Constraints: string[];
  CommonConfig: string;
  AppName: string;
  Instance: string;
  TransactionsDurationTime: number;
}

export interface LoggerConfig {
  LogDir: string;
  LogFileName: string;
  MaxSizeMB: number;
  MaxBackups: number;
  MaxAgeDays: number;
  Compress: boolean;
  ToConsole: boolean;
  MaskingRegexPatterns: string[];
}

export interface PrometheusConfig {
  EnablePrometheus: boolean;
  HttpPort: number;
}

export interface MongoDBConfig {
  hosts: string[];
  database: string;
  username: string;
  password: string;
  replicaSet: string;
}

export interface KafkaConfig {
  EnableKafka: boolean;
  Brokers: string[];
  ListenTopicsList: string[];
  EnableTLS: boolean;
  EnableSASL: boolean;
  CACert: string;
  ClientSignedCert: string;
  ClientPrivateKey: string;
  SASLUser: string;
  SASLPassword: string;
  AutomaticallyCreateTopics: boolean;
  DefaultNumberOfPartitions: number;
  ConsumerGroup: string;
  EnableDynamicConsumerName: boolean;
}

export interface TargetSystemReference {
  TargetSystem: string;
  ModuleName: string;
  InterfaceType: string;
  KafkaTopicRequest: string;
  KafkaTopicResponse: string;
  HTTPURL: string;
  Action: string;
}

export interface ModuleTable {
  [key: string]: string;
}

export interface RemapKafkaTopicName {
  [key: string]: string;
}

export interface EventTopicMapping {
  EventNames: string[];
  TopicName: string;
  ModuleName: string;
  MongoTable: string;
}

export interface JaegerConfig {
  HttpHostListen: string;
  HttpPortListen: string;
}

export interface CommonConfig {
  ModuleTable?: ModuleTable;
  RemapKafkaTopicName?: RemapKafkaTopicName;
  EventTopicMapping?: EventTopicMapping[];
  Jaeger?: JaegerConfig;
  Prometheus?: PrometheusConfig;
  Logger?: LoggerConfig;
}

export interface Config {
  App: AppConfig;
  Logger: LoggerConfig;
  Prometheus: PrometheusConfig;
  mongodb: MongoDBConfig;
  Kafka: KafkaConfig;
  TargetSystemReference: TargetSystemReference[];
  // Common config fields merged in
  ModuleTable?: ModuleTable;
  RemapKafkaTopicName?: RemapKafkaTopicName;
  EventTopicMapping?: EventTopicMapping[];
  Jaeger?: JaegerConfig;
}

/**
 * Global configuration instance
 */
let globalConfig: Config | null = null;

/**
 * Load and parse TOML configuration file
 * @param configPath Path to the main config.toml file
 * @returns Parsed configuration object
 */
export async function loadConfig(configPath: string): Promise<Config> {
  try {
    // Read and parse main config file
    const configContent = readFileSync(configPath, 'utf-8');
    const config = TOML.parse(configContent) as any;

    // Check if there's a reference to a common config file
    if (config.App?.CommonConfig) {
      const commonConfigPath = resolve(dirname(configPath), config.App.CommonConfig);

      try {
        // Read and parse common config file
        const commonConfigContent = readFileSync(commonConfigPath, 'utf-8');
        const commonConfig = TOML.parse(commonConfigContent) as CommonConfig;

        // Merge common config into main config
        // Common config fields are added to the main config object
        if (commonConfig.ModuleTable) {
          config.ModuleTable = commonConfig.ModuleTable;
        }
        if (commonConfig.RemapKafkaTopicName) {
          config.RemapKafkaTopicName = commonConfig.RemapKafkaTopicName;
        }
        if (commonConfig.EventTopicMapping) {
          config.EventTopicMapping = commonConfig.EventTopicMapping;
        }
        if (commonConfig.Jaeger) {
          config.Jaeger = commonConfig.Jaeger;
        }
        // Merge logger and prometheus from common config if not in main config
        if (commonConfig.Logger && !config.Logger) {
          config.Logger = commonConfig.Logger;
        }
        if (commonConfig.Prometheus && !config.Prometheus) {
          config.Prometheus = commonConfig.Prometheus;
        }
      } catch (commonError) {
        console.warn(`Warning: Could not load common config from ${commonConfigPath}:`, commonError);
      }
    }

    // Store in global variable
    globalConfig = config as Config;

    console.log('Configuration loaded successfully');
    console.log(`- App: ${config.App.AppName}`);
    console.log(`- MongoDB: ${config.mongodb.database} @ ${config.mongodb.hosts.length} hosts`);
    console.log(`- Kafka: ${config.Kafka.Brokers.length} brokers`);
    console.log(`- Logger: ${config.Logger.LogFileName}`);

    return globalConfig;
  } catch (error) {
    console.error('Error loading configuration:', error);
    throw new Error(`Failed to load configuration from ${configPath}: ${error}`);
  }
}

/**
 * Get the loaded configuration
 * @returns The loaded configuration object
 * @throws Error if configuration hasn't been loaded yet
 */
export function getConfig(): Config {
  if (!globalConfig) {
    throw new Error('Configuration has not been loaded yet. Call loadConfig() first.');
  }
  return globalConfig;
}

/**
 * Check if configuration has been loaded
 * @returns true if configuration is loaded, false otherwise
 */
export function isConfigLoaded(): boolean {
  return globalConfig !== null;
}

/**
 * Clear the loaded configuration (useful for testing)
 */
export function clearConfig(): void {
  globalConfig = null;
}
