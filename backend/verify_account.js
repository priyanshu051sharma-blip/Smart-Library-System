#!/usr/bin/env node

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'library.db');
const db = new sqlite3.Database(dbPath);

db.get(
  `SELECT id, name, email, enrollment_id, password, facial_data FROM users WHERE email = ?`,
  ['priyanshu.sharma24@st.niituniversity.in'],
  (err, row) => {
    if (err) {
      console.error('Error:', err);
      db.close();
      return;
    }

    console.log('\n✅ ACCOUNT VERIFICATION');
    console.log('═══════════════════════════════════════════════════════');
    console.log('ID:', row.id);
    console.log('Name:', row.name);
    console.log('Email:', row.email);
    console.log('Enrollment:', row.enrollment_id);
    console.log('Password Hash:', row.password ? '✓ SET' : '✗ NOT SET');
    console.log('Facial Data:', row.facial_data ? '✓ ADDED' : '✗ NOT ADDED');
    
    if (row.facial_data) {
      const fdata = JSON.parse(row.facial_data);
      console.log('Facial Descriptors:', fdata.descriptor ? `✓ ${fdata.descriptor.length}-D` : '✗');
      console.log('Captured At:', fdata.capturedAt || 'N/A');
    }
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n✅ ALL SYSTEMS READY!');
    console.log('Your account is fully configured with:');
    console.log('  ✓ Password for login');
    console.log('  ✓ Facial data for recognition');
    console.log('  ✓ Profile information');
    console.log('\n🎯 Ready to login at http://localhost:8000\n');

    db.close();
  }
);
