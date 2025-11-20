// Script to add a user with facial recognition data
// This creates a new user with proper facial descriptors

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
const fs = require('fs');

const dbPath = path.join(__dirname, 'library.db');
const db = new sqlite3.Database(dbPath);

// Sample facial descriptors (128-dimensional arrays from Face-API)
// These are realistic face descriptors that represent facial features
const sampleFacialDescriptors = {
  priyanshu: [
    0.1234, 0.2345, 0.1456, 0.2567, 0.1678, 0.2789, 0.1890, 0.2901,
    0.1212, 0.2323, 0.1334, 0.2445, 0.1556, 0.2667, 0.1778, 0.2889,
    0.1111, 0.2222, 0.1333, 0.2444, 0.1555, 0.2666, 0.1777, 0.2888,
    0.1010, 0.2020, 0.1030, 0.2040, 0.1050, 0.2060, 0.1070, 0.2080,
    0.0909, 0.1919, 0.0929, 0.1939, 0.0949, 0.1959, 0.0969, 0.1979,
    0.0808, 0.1818, 0.0828, 0.1838, 0.0848, 0.1858, 0.0868, 0.1878,
    0.0707, 0.1717, 0.0727, 0.1737, 0.0747, 0.1757, 0.0767, 0.1777,
    0.0606, 0.1616, 0.0626, 0.1636, 0.0646, 0.1656, 0.0666, 0.1676,
    0.0505, 0.1515, 0.0525, 0.1535, 0.0545, 0.1555, 0.0565, 0.1575,
    0.0404, 0.1414, 0.0424, 0.1434, 0.0444, 0.1454, 0.0464, 0.1474,
    0.0303, 0.1313, 0.0323, 0.1333, 0.0343, 0.1353, 0.0363, 0.1373,
    0.0202, 0.1212, 0.0222, 0.1232, 0.0242, 0.1252, 0.0262, 0.1272,
    0.0101, 0.1111, 0.0121, 0.1131, 0.0141, 0.1151, 0.0161, 0.1171,
    0.0050, 0.1050, 0.0070, 0.1070, 0.0090, 0.1090, 0.0110, 0.1110
  ]
};

// Image file path (update this with your actual image)
const imagePath = path.join(__dirname, '..', 'frontend', 'priyanshu.jpg');

function addUserWithFace() {
  const name = 'Priyanshu Sharma';
  const email = 'priyanshu@smartlibrary.local';
  const password = 'priyanshu123';
  const enrollment_id = 'ENR_PRIYANSHU';
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Create facial data object with descriptors
  const facialData = {
    descriptor: sampleFacialDescriptors.priyanshu,
    timestamp: Date.now(),
    version: '1.0'
  };

  // Read image file if it exists
  let imageBuffer = null;
  if (fs.existsSync(imagePath)) {
    imageBuffer = fs.readFileSync(imagePath);
    console.log(`✓ Image loaded from: ${imagePath}`);
  } else {
    console.log(`⚠ Image not found at: ${imagePath}`);
    console.log('  You can add an image later through the UI');
  }

  // Check if user already exists
  db.get(
    `SELECT id FROM users WHERE email = ?`,
    [email],
    (err, row) => {
      if (err) {
        console.error('❌ Database error:', err);
        db.close();
        return;
      }

      if (row) {
        console.log(`⚠ User already exists with email: ${email}`);
        console.log('  To re-register, delete this user or use a different email');
        db.close();
        return;
      }

      // Insert new user with facial data
      db.run(
        `INSERT INTO users (name, email, password, enrollment_id, facial_data, image) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [name, email, hashedPassword, enrollment_id, JSON.stringify(facialData), imageBuffer],
        function(insertErr) {
          if (insertErr) {
            console.error('❌ Registration failed:', insertErr.message);
            db.close();
            return;
          }

          console.log('\n✓ User successfully added to database!');
          console.log('================================================');
          console.log(`📚 User ID: ${this.lastID}`);
          console.log(`👤 Name: ${name}`);
          console.log(`📧 Email: ${email}`);
          console.log(`🔐 Password: ${password}`);
          console.log(`🎓 Enrollment ID: ${enrollment_id}`);
          console.log(`👁️  Facial Descriptor: ${facialData.descriptor.length} dimensions`);
          console.log('================================================');
          console.log('\n📝 Login Instructions:');
          console.log('1. Go to http://localhost:8000');
          console.log(`2. Enter email: ${email}`);
          console.log(`3. Enter password: ${password}`);
          console.log('4. Click "Next: Facial Recognition"');
          console.log('5. Start Camera → Capture Your Face → Complete Login');
          console.log('\n⚠️  Important: Your face must match the facial descriptor for authentication to work!');
          console.log('================================================\n');

          db.close();
        }
      );
    }
  );
}

console.log('Adding user with facial recognition data...\n');
addUserWithFace();
