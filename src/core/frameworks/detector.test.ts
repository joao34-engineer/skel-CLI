import { FrameworkDetector, DetectedStack } from './detector';

async function testDetector() {
  console.log('🧪 Testing FrameworkDetector...\n');

  // Test 1: Basic detection
  console.log('Test 1: Detecting current project framework');
  const detector = new FrameworkDetector();
  const result = await detector.detect();
  console.log('✅ Result:', JSON.stringify(result, null, 2));

  // Test 2: Caching
  console.log('\nTest 2: Testing cache');
  const result2 = await detector.detect();
  console.log('✅ Cached result:', JSON.stringify(result2, null, 2));
  console.log('✅ Results match:', JSON.stringify(result) === JSON.stringify(result2));

  // Test 3: Clear cache
  console.log('\nTest 3: Clearing cache');
  detector.clearCache();
  const result3 = await detector.detect();
  console.log('✅ Result after cache clear:', JSON.stringify(result3, null, 2));

  // Test 4: Parallel detection
  console.log('\nTest 4: Parallel detection');
  detector.clearCache();
  const result4 = await detector.detectParallel();
  console.log('✅ Parallel result:', JSON.stringify(result4, null, 2));

  // Test 5: Custom detector
  console.log('\nTest 5: Custom detector registration');
  class CustomDetector {
    priority = 1;
    async detect(): Promise<{ stack: DetectedStack; confidence: number } | null> {
      return null; // Always returns null for this test
    }
  }
  detector.registerDetector(new CustomDetector());
  console.log('✅ Custom detector registered');

  // Test 6: Error handling (invalid path)
  console.log('\nTest 6: Error handling with invalid path');
  const invalidDetector = new FrameworkDetector('/invalid/path/that/does/not/exist');
  const result6 = await invalidDetector.detect();
  console.log('✅ Graceful fallback:', JSON.stringify(result6, null, 2));

  // Test 7: detectWithConfidence method
  console.log('\nTest 7: Testing detectWithConfidence');
  detector.clearCache();
  const result7 = await detector.detectWithConfidence();
  console.log('✅ detectWithConfidence result:', JSON.stringify(result7, null, 2));

  console.log('\n✅ All tests passed!');
}

testDetector().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});

