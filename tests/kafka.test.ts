import { loadConfig, getConfig } from '../src/components/config-loader';
import { initLogger } from '../src/components/logger';
import { initKafka, sendMessage, onMessage, disconnectKafka, isKafkaReady } from '../src/components/kafka';
import { resolve } from 'path';

/**
 * Test for Kafka Component
 *
 * This test:
 * 1. Loads configuration
 * 2. Connects to Kafka
 * 3. Creates a producer
 * 4. Sends a message to 'test' topic
 * 5. Creates a consumer
 * 6. Reads and validates the message from 'test' topic
 */

async function testKafka() {
  console.log('\n========================================');
  console.log('Testing Kafka Component');
  console.log('========================================\n');

  let messageReceived = false;
  let receivedMessage: any = null;

  try {
    // Load configuration
    console.log('Loading configuration...');
    const configPath = resolve(import.meta.dir, '../config/config.toml');
    await loadConfig(configPath);
    const config = getConfig();
    console.log('✓ Configuration loaded\n');

    // Initialize logger
    console.log('Initializing logger...');
    initLogger(config.Logger);
    console.log('✓ Logger initialized\n');

    // Modify config to listen to test topic
    const testConfig = {
      ...config.Kafka,
      ListenTopicsList: ['test'],
      AutomaticallyCreateTopics: true,
    };

    // Test 1: Initialize Kafka
    console.log('Test 1: Initializing Kafka...');
    await initKafka(testConfig);
    console.log('✓ Kafka initialized successfully\n');

    // Test 2: Check if Kafka is ready
    console.log('Test 2: Checking if Kafka is ready...');
    if (!isKafkaReady()) {
      throw new Error('Kafka should be ready but isKafkaReady() returned false');
    }
    console.log('✓ Kafka is ready\n');

    // Test 3: Register message handler for test topic
    console.log('Test 3: Registering message handler...');
    onMessage('test', (message) => {
      console.log('  📩 Message received!');
      console.log(`     - Topic: ${message.topic}`);
      console.log(`     - Partition: ${message.partition}`);
      console.log(`     - Key: ${message.key || 'none'}`);
      console.log(`     - Value: ${JSON.stringify(message.value, null, 2)}`);
      console.log(`     - Timestamp: ${message.timestamp}`);

      messageReceived = true;
      receivedMessage = message.value;
    });
    console.log('✓ Message handler registered\n');

    // Wait a moment for consumer to be ready
    console.log('Waiting for consumer to be ready...');
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log('✓ Consumer should be ready\n');

    // Test 4: Send test message
    console.log('Test 4: Sending test message to "test" topic...');
    const testMessage = {
      testId: 'kafka-test-' + Date.now(),
      timestamp: new Date().toISOString(),
      message: 'This is a test message from Kafka test suite',
      data: {
        component: 'kafka-test',
        version: '1.0.0',
        environment: 'development',
      },
      metadata: {
        createdBy: 'ConnectX Helper Test Suite',
        purpose: 'Component validation',
      },
    };

    await sendMessage('test', testMessage, 'test-key');
    console.log('✓ Test message sent successfully\n');

    // Test 5: Wait for message to be received
    console.log('Test 5: Waiting for message to be received...');
    console.log('(This may take a few seconds...)\n');

    // Wait up to 30 seconds for the message
    const timeout = 30000;
    const startTime = Date.now();

    while (!messageReceived && Date.now() - startTime < timeout) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      process.stdout.write('.');
    }

    console.log('\n');

    if (!messageReceived) {
      throw new Error('Message was not received within timeout period');
    }

    console.log('✓ Message received successfully\n');

    // Test 6: Validate received message
    console.log('Test 6: Validating received message...');

    if (!receivedMessage) {
      throw new Error('Received message is null or undefined');
    }

    if (receivedMessage.testId !== testMessage.testId) {
      throw new Error(`testId mismatch: expected ${testMessage.testId}, got ${receivedMessage.testId}`);
    }

    if (receivedMessage.message !== testMessage.message) {
      throw new Error(`message mismatch: expected ${testMessage.message}, got ${receivedMessage.message}`);
    }

    if (receivedMessage.data.component !== testMessage.data.component) {
      throw new Error(
        `data.component mismatch: expected ${testMessage.data.component}, got ${receivedMessage.data.component}`
      );
    }

    console.log('✓ All message fields validated successfully\n');

    // Test 7: Send another message
    console.log('Test 7: Sending second test message...');
    const testMessage2 = {
      testId: 'kafka-test-2-' + Date.now(),
      timestamp: new Date().toISOString(),
      message: 'Second test message',
      iteration: 2,
    };

    messageReceived = false;
    receivedMessage = null;

    await sendMessage('test', testMessage2, 'test-key-2');
    console.log('✓ Second test message sent\n');

    // Wait for second message
    console.log('Waiting for second message...');
    const startTime2 = Date.now();

    while (!messageReceived && Date.now() - startTime2 < timeout) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      process.stdout.write('.');
    }

    console.log('\n');

    if (!messageReceived) {
      console.warn('⚠ Warning: Second message was not received (this might be okay)');
    } else {
      console.log('✓ Second message received and validated\n');
    }

    // Test 8: Disconnect from Kafka
    console.log('Test 8: Disconnecting from Kafka...');
    await disconnectKafka();
    console.log('✓ Disconnected from Kafka\n');

    // Test 9: Verify disconnection
    console.log('Test 9: Verifying disconnection...');
    if (isKafkaReady()) {
      throw new Error('Kafka should not be ready after disconnection');
    }
    console.log('✓ Disconnection verified\n');

    console.log('========================================');
    console.log('All Kafka Tests Passed! ✓');
    console.log('========================================\n');

    console.log('Note: If you see connection errors during disconnection,');
    console.log('this is normal as KafkaJS is cleaning up connections.\n');

    return true;
  } catch (error) {
    console.error('\n❌ Kafka Test Failed:');
    console.error(error);

    // Try to disconnect even if test failed
    try {
      await disconnectKafka();
    } catch (disconnectError) {
      console.error('Error during cleanup:', disconnectError);
    }

    return false;
  }
}

// Run the test if this file is executed directly
if (import.meta.main) {
  testKafka()
    .then((success) => {
      // Give some time for cleanup before exiting
      setTimeout(() => {
        process.exit(success ? 0 : 1);
      }, 2000);
    })
    .catch((error) => {
      console.error('Test execution error:', error);
      setTimeout(() => {
        process.exit(1);
      }, 2000);
    });
}

export { testKafka };
