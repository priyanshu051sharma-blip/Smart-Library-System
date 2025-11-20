const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./library.db');

// Generate a realistic 128D descriptor for testing
function generateTestDescriptor() {
  const descriptor = new Array(128);
  for (let i = 0; i < 128; i++) {
    // Generate values between 0 and 1, with realistic distribution
    descriptor[i] = Math.random();
  }
  return descriptor;
}

console.log('🔧 Fixing facial descriptors in database...\n');

// Get user 46 (priyanshu@smartlibrary.local)
db.get('SELECT id, name, email FROM users WHERE id = 46', (err, user) => {
  if (err) {
    console.error('Error reading user:', err);
    db.close();
    return;
  }

  if (!user) {
    console.log('❌ User 46 not found. Creating it...');
    
    const name = 'Priyanshu Sharma';
    const email = 'priyanshu@smartlibrary.local';
    const descriptor = generateTestDescriptor();
    const facialData = JSON.stringify({
      descriptor: descriptor,
      timestamp: new Date().toISOString(),
      version: '1.0'
    });

    db.run(
      'INSERT INTO users (id, name, email, password_hash, facial_data) VALUES (?, ?, ?, ?, ?)',
      [46, name, email, '$2a$10$hashedpassword', facialData],
      function(err) {
        if (err) {
          console.error('Error inserting user:', err);
        } else {
          console.log('✅ User 46 created with 128D descriptor');
          console.log(`   Descriptor[0-5]: [${descriptor.slice(0, 5).map(v => v.toFixed(3)).join(', ')}...]`);
        }
        db.close();
      }
    );
  } else {
    console.log(`Found user: ${user.name} (${user.email})`);
    
    const descriptor = generateTestDescriptor();
    const facialData = JSON.stringify({
      descriptor: descriptor,
      timestamp: new Date().toISOString(),
      version: '1.0'
    });

    db.run(
      'UPDATE users SET facial_data = ? WHERE id = ?',
      [facialData, 46],
      function(err) {
        if (err) {
          console.error('Error updating user:', err);
        } else {
          console.log('✅ User 46 updated with proper 128D descriptor');
          console.log(`   Descriptor[0-5]: [${descriptor.slice(0, 5).map(v => v.toFixed(3)).join(', ')}...]`);
        }
        db.close();
      }
    );
  }
});
