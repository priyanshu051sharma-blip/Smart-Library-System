#!/usr/bin/env node

/**
 * Set password for Priyanshu Sharma's account
 */

const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'library.db');
const email = 'priyanshu.sharma24@st.niituniversity.in';
const password = 'priyanshu123'; // Default password - can be changed later

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Database error:', err);
    process.exit(1);
  }
});

// Hash the password
const hashedPassword = bcrypt.hashSync(password, 10);

// Update password
db.run(
  `UPDATE users SET password = ? WHERE email = ?`,
  [hashedPassword, email],
  function(err) {
    if (err) {
      console.error('❌ Error:', err);
      db.close();
      process.exit(1);
    }

    console.log('\n✅ PASSWORD SET SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('User: Priyanshu Sharma');
    console.log('Email: ' + email);
    console.log('Password: ' + password);
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n🎉 Your account is now ready!');
    console.log('\n📝 LOGIN INSTRUCTIONS:');
    console.log('1. Open http://localhost:8000');
    console.log('2. Enter Email: ' + email);
    console.log('3. Enter Password: ' + password);
    console.log('4. Click "Next: Facial Recognition"');
    console.log('5. Allow camera access');
    console.log('6. Start Camera → Capture Face → Complete Login');
    console.log('7. Access the Smart Library Dashboard!\n');

    db.close();
    process.exit(0);
  }
);
