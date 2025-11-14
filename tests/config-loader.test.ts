import { loadConfig, getConfig, isConfigLoaded, clearConfig } from '../src/components/config-loader';
import { resolve } from 'path';

/**
 * Test for Config Loader Component
 *
 * This test:
 * 1. Loads the main config.toml file
 * 2. Verifies that the common config (test_tmf_common_config.toml) is also loaded
 * 3. Validates that all fields are parsed correctly
 */

async function testConfigLoader() {
  console.log('\n========================================');
  console.log('Testing Config Loader Component');
  console.log('========================================\n');

  try {
    // Clear any existing config
    clearConfig();

    // Path to config file
    const configPath = resolve(import.meta.dir, '../config/config.toml');
    console.log(`Loading config from: ${configPath}\n`);

    // Test 1: Load configuration
    console.log('Test 1: Loading configuration...');
    await loadConfig(configPath);
    console.log('✓ Configuration loaded successfully\n');

    // Test 2: Check if config is loaded
    console.log('Test 2: Checking if config is loaded...');
    if (!isConfigLoaded()) {
      throw new Error('Configuration should be loaded but isConfigLoaded() returned false');
    }
    console.log('✓ isConfigLoaded() returned true\n');

    // Test 3: Get configuration
    console.log('Test 3: Getting configuration...');
    const config = getConfig();
    console.log('✓ getConfig() returned successfully\n');

    // Test 4: Validate main config fields
    console.log('Test 4: Validating main config fields...');

    // App config
    if (!config.App) throw new Error('App config not found');
    console.log(`  - App.AppName: ${config.App.AppName}`);
    console.log(`  - App.HttpHostListen: ${config.App.HttpHostListen}`);
    console.log(`  - App.HttpPortListen: ${config.App.HttpPortListen}`);
    console.log(`  - App.CommonConfig: ${config.App.CommonConfig}`);

    // Logger config
    if (!config.Logger) throw new Error('Logger config not found');
    console.log(`  - Logger.LogDir: ${config.Logger.LogDir}`);
    console.log(`  - Logger.LogFileName: ${config.Logger.LogFileName}`);
    console.log(`  - Logger.MaxSizeMB: ${config.Logger.MaxSizeMB}`);
    console.log(`  - Logger.ToConsole: ${config.Logger.ToConsole}`);

    // MongoDB config
    if (!config.mongodb) throw new Error('MongoDB config not found');
    console.log(`  - MongoDB.database: ${config.mongodb.database}`);
    console.log(`  - MongoDB.hosts: ${config.mongodb.hosts.join(', ')}`);
    console.log(`  - MongoDB.username: ${config.mongodb.username}`);
    console.log(`  - MongoDB.replicaSet: ${config.mongodb.replicaSet}`);

    // Kafka config
    if (!config.Kafka) throw new Error('Kafka config not found');
    console.log(`  - Kafka.EnableKafka: ${config.Kafka.EnableKafka}`);
    console.log(`  - Kafka.Brokers: ${config.Kafka.Brokers.join(', ')}`);
    console.log(`  - Kafka.EnableTLS: ${config.Kafka.EnableTLS}`);
    console.log(`  - Kafka.ConsumerGroup: ${config.Kafka.ConsumerGroup}`);

    console.log('✓ All main config fields validated\n');

    // Test 5: Validate common config fields (merged from test_tmf_common_config.toml)
    console.log('Test 5: Validating common config fields...');

    if (!config.ModuleTable) {
      throw new Error('ModuleTable not found (should be loaded from common config)');
    }
    console.log(`  - ModuleTable entries: ${Object.keys(config.ModuleTable).length}`);
    console.log(`  - Sample: TMF640_SERVICE_ACTIVATION_TABLE_SERVICE = ${config.ModuleTable.TMF640_SERVICE_ACTIVATION_TABLE_SERVICE}`);

    if (!config.RemapKafkaTopicName) {
      throw new Error('RemapKafkaTopicName not found (should be loaded from common config)');
    }
    console.log(`  - RemapKafkaTopicName entries: ${Object.keys(config.RemapKafkaTopicName).length}`);
    console.log(`  - Sample: TMF640_SERVICE_ACTIVATION_KAFKA_SERVICE_IN = ${config.RemapKafkaTopicName.TMF640_SERVICE_ACTIVATION_KAFKA_SERVICE_IN}`);

    if (!config.EventTopicMapping) {
      throw new Error('EventTopicMapping not found (should be loaded from common config)');
    }
    console.log(`  - EventTopicMapping entries: ${config.EventTopicMapping.length}`);
    console.log(`  - Sample event: ${config.EventTopicMapping[0]?.EventNames[0]} -> ${config.EventTopicMapping[0]?.TopicName}`);

    console.log('✓ All common config fields validated\n');

    // Test 6: Validate Prometheus config (from common config)
    if (config.Prometheus) {
      console.log('Test 6: Validating Prometheus config...');
      console.log(`  - Prometheus.EnablePrometheus: ${config.Prometheus.EnablePrometheus}`);
      console.log(`  - Prometheus.HttpPort: ${config.Prometheus.HttpPort}`);
      console.log('✓ Prometheus config validated\n');
    }

    // Test 7: Validate TargetSystemReference
    console.log('Test 7: Validating TargetSystemReference...');
    if (!config.TargetSystemReference || config.TargetSystemReference.length === 0) {
      throw new Error('TargetSystemReference not found or empty');
    }
    console.log(`  - TargetSystemReference entries: ${config.TargetSystemReference.length}`);
    const firstRef = config.TargetSystemReference[0];
    console.log(`  - First entry: ${firstRef.TargetSystem} / ${firstRef.ModuleName} / ${firstRef.Action}`);
    console.log(`  - Topics: ${firstRef.KafkaTopicRequest} -> ${firstRef.KafkaTopicResponse}`);
    console.log('✓ TargetSystemReference validated\n');

    console.log('========================================');
    console.log('All Config Loader Tests Passed! ✓');
    console.log('========================================\n');

    return true;
  } catch (error) {
    console.error('\n❌ Config Loader Test Failed:');
    console.error(error);
    return false;
  }
}

// Run the test if this file is executed directly
if (import.meta.main) {
  testConfigLoader()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Test execution error:', error);
      process.exit(1);
    });
}

export { testConfigLoader };
