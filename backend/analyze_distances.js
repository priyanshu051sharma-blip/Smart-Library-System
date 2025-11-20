// Analyze descriptor distances

function calculateDistance(descriptor1, descriptor2) {
  let sumSquaredDifferences = 0;
  for (let i = 0; i < 128; i++) {
    const d1 = descriptor1[i] || 0;
    const d2 = descriptor2[i] || 0;
    const diff = d1 - d2;
    sumSquaredDifferences += diff * diff;
  }
  return Math.sqrt(sumSquaredDifferences);
}

console.log('📊 Analyzing descriptor distances:\n');

// Same person scenarios
console.log('SAME PERSON SCENARIOS:');
const person1_v1 = new Array(128).fill(0).map(() => Math.random());
const person1_v2 = person1_v1.map(v => v + (Math.random() * 0.1 - 0.05)); // Add 5% noise

const dist_same = calculateDistance(person1_v1, person1_v2);
console.log(`  Different photos, same person:`);
console.log(`    Distance: ${dist_same.toFixed(3)}`);
console.log(`    Similarity (dist/2): ${(Math.max(0, 1 - dist_same / 2) * 100).toFixed(1)}%`);

// Different person scenarios
console.log('\nDIFFERENT PERSON SCENARIOS:');
for (let i = 0; i < 3; i++) {
  const person_a = new Array(128).fill(0).map(() => Math.random());
  const person_b = new Array(128).fill(0).map(() => Math.random());
  const dist = calculateDistance(person_a, person_b);
  const sim = Math.max(0, 1 - dist / 2);
  console.log(`  Random vs Random ${i + 1}: distance=${dist.toFixed(3)}, similarity=${(sim * 100).toFixed(1)}%`);
}

// What should the threshold be?
console.log('\n⚙️ THRESHOLD ANALYSIS:');
console.log('For Face-API descriptors (0-1 range):');
console.log('  - Identical: distance ≈ 0');
console.log('  - Same person (different angle): distance ≈ 0.5-0.8');
console.log('  - Different person: distance ≈ 1.0-1.5');
console.log('  - Completely unrelated: distance ≈ 1.5-2.0');
console.log('\nRecommended similarity formula: similarity = max(0, 1 - distance)');
console.log('Recommended threshold: 0.5 (50% match for same person)');
console.log('\nBUT WAIT - Face-API descriptors are normalized vectors!');
console.log('Max distance between two random 128D unit vectors: sqrt(128) ≈ 11.3');
console.log('For proper ML distance metric (cosine similarity): use 1 - (distance / 2sqrt(128))');

// Better formula for unit vectors
console.log('\n✅ CORRECT FORMULA for Face-API (unit vectors):');
const testVectors = [];
for (let i = 0; i < 5; i++) {
  testVectors.push(new Array(128).fill(0).map(() => Math.random()));
}

console.log('\nUsing formula: similarity = max(0, 1 - (distance / sqrt(2 * 128)))');
const maxDistance = Math.sqrt(2 * 128);
for (let i = 0; i < testVectors.length - 1; i++) {
  const d = calculateDistance(testVectors[i], testVectors[i + 1]);
  const sim = Math.max(0, 1 - (d / maxDistance));
  console.log(`  Vector ${i + 1} vs ${i + 2}: distance=${d.toFixed(3)}, similarity=${(sim * 100).toFixed(1)}%`);
}
