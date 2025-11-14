import { loadConfig, getConfig } from '../src/components/config-loader';
import { initLogger } from '../src/components/logger';
import { connectMongoDB, getDB, disconnectMongoDB, mongoDBHealthCheck } from '../src/components/mongodb';
import { resolve } from 'path';

/**
 * Test for MongoDB Component
 *
 * This test:
 * 1. Loads configuration
 * 2. Connects to MongoDB
 * 3. Creates a test collection
 * 4. Writes a test record
 * 5. Queries and validates the record
 * 6. Cleans up test data
 */

async function testMongoDB() {
  console.log('\n========================================');
  console.log('Testing MongoDB Component');
  console.log('========================================\n');

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

    // Test 1: Connect to MongoDB
    console.log('Test 1: Connecting to MongoDB...');
    await connectMongoDB(config.mongodb);
    console.log('✓ Connected to MongoDB successfully\n');

    // Test 2: Health check
    console.log('Test 2: Running health check...');
    const isHealthy = await mongoDBHealthCheck();
    if (!isHealthy) {
      throw new Error('MongoDB health check failed');
    }
    console.log('✓ MongoDB health check passed\n');

    // Test 3: Get database instance
    console.log('Test 3: Getting database instance...');
    const db = getDB();
    console.log(`✓ Database instance obtained: ${db.databaseName}\n`);

    // Test 4: Create/access test collection
    console.log('Test 4: Accessing test collection...');
    const testCollection = db.collection('test');
    console.log('✓ Test collection accessed\n');

    // Test 5: Write test record
    console.log('Test 5: Writing test record...');
    const testDocument = {
      testId: 'test-' + Date.now(),
      timestamp: new Date(),
      message: 'This is a test document',
      data: {
        component: 'mongodb-test',
        version: '1.0.0',
        environment: 'development',
      },
      metadata: {
        createdBy: 'ConnectX Helper Test Suite',
        purpose: 'Component validation',
      },
    };

    const insertResult = await testCollection.insertOne(testDocument);
    if (!insertResult.acknowledged) {
      throw new Error('Insert operation was not acknowledged');
    }
    console.log(`✓ Test record inserted with ID: ${insertResult.insertedId}\n`);

    // Test 6: Query test record
    console.log('Test 6: Querying test record...');
    const foundDocument = await testCollection.findOne({ testId: testDocument.testId });

    if (!foundDocument) {
      throw new Error('Test document not found in database');
    }

    console.log('✓ Test record found');
    console.log(`  - Test ID: ${foundDocument.testId}`);
    console.log(`  - Message: ${foundDocument.message}`);
    console.log(`  - Timestamp: ${foundDocument.timestamp}`);
    console.log(`  - Component: ${foundDocument.data.component}\n`);

    // Test 7: Validate record fields
    console.log('Test 7: Validating record fields...');
    if (foundDocument.testId !== testDocument.testId) {
      throw new Error('testId mismatch');
    }
    if (foundDocument.message !== testDocument.message) {
      throw new Error('message mismatch');
    }
    if (foundDocument.data.component !== testDocument.data.component) {
      throw new Error('data.component mismatch');
    }
    console.log('✓ All fields validated successfully\n');

    // Test 8: Update test record
    console.log('Test 8: Updating test record...');
    const updateResult = await testCollection.updateOne(
      { testId: testDocument.testId },
      {
        $set: {
          message: 'Updated test message',
          updated: new Date(),
        },
      }
    );

    if (updateResult.matchedCount !== 1) {
      throw new Error('Update did not match any documents');
    }
    if (updateResult.modifiedCount !== 1) {
      throw new Error('Update did not modify any documents');
    }
    console.log('✓ Test record updated successfully\n');

    // Test 9: Query updated record
    console.log('Test 9: Verifying update...');
    const updatedDocument = await testCollection.findOne({ testId: testDocument.testId });
    if (!updatedDocument) {
      throw new Error('Updated document not found');
    }
    if (updatedDocument.message !== 'Updated test message') {
      throw new Error('Update verification failed: message was not updated');
    }
    console.log('✓ Update verified successfully\n');

    // Test 10: Count documents
    console.log('Test 10: Counting documents in test collection...');
    const count = await testCollection.countDocuments();
    console.log(`✓ Test collection contains ${count} document(s)\n`);

    // Test 11: Cleanup - Delete test record
    console.log('Test 11: Cleaning up test data...');
    const deleteResult = await testCollection.deleteOne({ testId: testDocument.testId });
    if (deleteResult.deletedCount !== 1) {
      throw new Error('Failed to delete test document');
    }
    console.log('✓ Test record deleted successfully\n');

    // Test 12: Verify deletion
    console.log('Test 12: Verifying deletion...');
    const deletedDocument = await testCollection.findOne({ testId: testDocument.testId });
    if (deletedDocument !== null) {
      throw new Error('Document should have been deleted but was still found');
    }
    console.log('✓ Deletion verified\n');

    // Test 13: Disconnect from MongoDB
    console.log('Test 13: Disconnecting from MongoDB...');
    await disconnectMongoDB();
    console.log('✓ Disconnected from MongoDB\n');

    console.log('========================================');
    console.log('All MongoDB Tests Passed! ✓');
    console.log('========================================\n');

    return true;
  } catch (error) {
    console.error('\n❌ MongoDB Test Failed:');
    console.error(error);

    // Try to disconnect even if test failed
    try {
      await disconnectMongoDB();
    } catch (disconnectError) {
      console.error('Error during cleanup:', disconnectError);
    }

    return false;
  }
}

// Run the test if this file is executed directly
if (import.meta.main) {
  testMongoDB()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Test execution error:', error);
      process.exit(1);
    });
}

export { testMongoDB };
