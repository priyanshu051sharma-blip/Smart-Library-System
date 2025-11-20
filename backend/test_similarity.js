// Test similarity calculation with random descriptors
function calculateDescriptorSimilarity(descriptor1, descriptor2) {
  if (!Array.isArray(descriptor1) || !Array.isArray(descriptor2)) {
    return 0;
  }

  // Both must be 128D
  if (descriptor1.length !== 128 || descriptor2.length !== 128) {
    return 0;
  }

  let sumSquaredDifferences = 0;

  for (let i = 0; i < 128; i++) {
    const d1 = descriptor1[i] || 0;
    const d2 = descriptor2[i] || 0;
    const diff = d1 - d2;
    sumSquaredDifferences += diff * diff;
  }

  const euclideanDistance = Math.sqrt(sumSquaredDifferences);
  const MAX_DISTANCE = Math.sqrt(2);
  const similarity = Math.max(0, Math.min(1, 1 - (euclideanDistance / MAX_DISTANCE)));
  
  return similarity;
}

console.log('🧪 Testing descriptor similarity calculations:\n');

// Test 1: Identical descriptors
console.log('Test 1: Identical descriptors');
const d1 = new Array(128).fill(0.5);
const sim1 = calculateDescriptorSimilarity(d1, d1);
console.log(`  Similarity: ${(sim1 * 100).toFixed(2)}% (expected: 100%)\n`);

// Test 2: Completely opposite descriptors
console.log('Test 2: Completely opposite descriptors');
const d2a = new Array(128).fill(0);
const d2b = new Array(128).fill(1);
const sim2 = calculateDescriptorSimilarity(d2a, d2b);
console.log(`  Similarity: ${(sim2 * 100).toFixed(2)}% (expected: 0%)\n`);

// Test 3: Similar but different (like same person different angle)
console.log('Test 3: Similar descriptors (same person, different angle)');
const d3a = new Array(128).fill(0).map(() => Math.random());
const d3b = d3a.map(v => v + (Math.random() * 0.15 - 0.075)); // Add small noise
const sim3 = calculateDescriptorSimilarity(d3a, d3b);
console.log(`  Similarity: ${(sim3 * 100).toFixed(2)}% (expected: 80-95%)\n`);

// Test 4: Random descriptors (different people)
console.log('Test 4: Random descriptors (different people) - running 10 tests');
let totalSim = 0;
for (let i = 0; i < 10; i++) {
  const ra = new Array(128).fill(0).map(() => Math.random());
  const rb = new Array(128).fill(0).map(() => Math.random());
  const simR = calculateDescriptorSimilarity(ra, rb);
  totalSim += simR;
  console.log(`  Test ${i + 1}: ${(simR * 100).toFixed(2)}%`);
}
const avgSim = totalSim / 10;
console.log(`  Average: ${(avgSim * 100).toFixed(2)}% (expected: ~48-52%)\n`);

console.log(`Threshold used in system: 60%`);
console.log(`With random descriptors averaging ${(avgSim * 100).toFixed(1)}%, threshold of 60% SHOULD reject different faces\n`);

// Test 5: Check the problematic case - what if frontend sends an older 112D descriptor mixed with stored 128D?
console.log('Test 5: Mismatched sizes (this should be caught by backend)');
const d5a = new Array(112).fill(0).map(() => Math.random());
const d5b = new Array(128).fill(0).map(() => Math.random());
console.log(`  112D vs 128D: Backend should reject (different lengths)`);
