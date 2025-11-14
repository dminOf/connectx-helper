import { testConfigLoader } from './config-loader.test';
import { testMongoDB } from './mongodb.test';
import { testKafka } from './kafka.test';

/**
 * Master Test Runner
 *
 * Runs all component tests in sequence:
 * 1. Config Loader Test
 * 2. MongoDB Test
 * 3. Kafka Test
 */

async function runAllTests() {
  console.log('\n');
  console.log('╔════════════════════════════════════════╗');
  console.log('║   ConnectX Helper - Test Suite        ║');
  console.log('║   Running All Component Tests          ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('\n');

  const results: { name: string; passed: boolean; error?: any }[] = [];

  // Test 1: Config Loader
  try {
    console.log('═'.repeat(50));
    console.log('TEST 1 OF 3: Config Loader');
    console.log('═'.repeat(50));
    const passed = await testConfigLoader();
    results.push({ name: 'Config Loader', passed });
  } catch (error) {
    console.error('Config Loader test threw an exception:', error);
    results.push({ name: 'Config Loader', passed: false, error });
  }

  // Test 2: MongoDB
  try {
    console.log('\n');
    console.log('═'.repeat(50));
    console.log('TEST 2 OF 3: MongoDB Connection');
    console.log('═'.repeat(50));
    const passed = await testMongoDB();
    results.push({ name: 'MongoDB Connection', passed });
  } catch (error) {
    console.error('MongoDB test threw an exception:', error);
    results.push({ name: 'MongoDB Connection', passed: false, error });
  }

  // Test 3: Kafka
  try {
    console.log('\n');
    console.log('═'.repeat(50));
    console.log('TEST 3 OF 3: Kafka Connection');
    console.log('═'.repeat(50));
    const passed = await testKafka();
    results.push({ name: 'Kafka Connection', passed });
  } catch (error) {
    console.error('Kafka test threw an exception:', error);
    results.push({ name: 'Kafka Connection', passed: false, error });
  }

  // Print summary
  console.log('\n\n');
  console.log('╔════════════════════════════════════════╗');
  console.log('║        TEST SUMMARY                    ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('\n');

  let allPassed = true;

  for (const result of results) {
    const status = result.passed ? '✓ PASSED' : '✗ FAILED';
    const icon = result.passed ? '✓' : '✗';
    console.log(`${icon} ${result.name.padEnd(30)} ${status}`);

    if (!result.passed) {
      allPassed = false;
      if (result.error) {
        console.log(`  Error: ${result.error.message || result.error}`);
      }
    }
  }

  console.log('\n');

  if (allPassed) {
    console.log('╔════════════════════════════════════════╗');
    console.log('║   🎉 ALL TESTS PASSED! 🎉            ║');
    console.log('╚════════════════════════════════════════╝');
    console.log('\n');
  } else {
    console.log('╔════════════════════════════════════════╗');
    console.log('║   ⚠️  SOME TESTS FAILED ⚠️           ║');
    console.log('╚════════════════════════════════════════╝');
    console.log('\n');
    console.log('Please check the logs above for details.\n');
  }

  return allPassed;
}

// Run all tests if this file is executed directly
if (import.meta.main) {
  runAllTests()
    .then((allPassed) => {
      // Give some time for cleanup before exiting
      setTimeout(() => {
        process.exit(allPassed ? 0 : 1);
      }, 3000);
    })
    .catch((error) => {
      console.error('Fatal error running tests:', error);
      setTimeout(() => {
        process.exit(1);
      }, 3000);
    });
}

export { runAllTests };
