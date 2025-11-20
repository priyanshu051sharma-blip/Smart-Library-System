#!/usr/bin/env node

/**
 * Direct Database Script - Add Priyanshu Sharma
 * This script directly inserts into the SQLite database
 */

const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'library.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Database connection error:', err);
    process.exit(1);
  }
  console.log('✓ Connected to database');
});

const name = 'Priyanshu Sharma';
const email = 'priyanshu.sharma24@st.niituniversity.in';
const password = bcrypt.hashSync('priyanshu123', 10);
const enrollment_id = null;

// Create default facial data
const defaultFacialData = JSON.stringify({
  descriptor: Array(128).fill(0.5),
  age: 20,
  gender: 'male',
  expressions: { neutral: 0.9 }
});

// Check if user already exists
db.get(`SELECT id FROM users WHERE email = ?`, [email], (err, row) => {
  if (err) {
    console.error('❌ Database error:', err);
    db.close();
    process.exit(1);
  }

  if (row) {
    console.log('⚠️  User already exists with ID:', row.id);
    console.log('Email:', email);
    db.close();
    process.exit(0);
  }

  // Insert new user
  db.run(
    `INSERT INTO users (name, email, password, enrollment_id, facial_data) 
     VALUES (?, ?, ?, ?, ?)`,
    [name, email, password, enrollment_id, defaultFacialData],
    function(err) {
      if (err) {
        console.error('❌ Failed to insert user:', err);
        db.close();
        process.exit(1);
      }

      console.log('\n✅ SUCCESS: Priyanshu Sharma account created!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('User ID:', this.lastID);
      console.log('Name:', name);
      console.log('Email:', email);
      console.log('Password: priyanshu123');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('\n📝 Login Instructions:');
      console.log('1. Go to http://localhost:8000');
      console.log('2. Enter email: ' + email);
      console.log('3. Enter password: priyanshu123');
      console.log('4. Capture your face for facial recognition');
      console.log('5. Access the dashboard!\n');

      db.close();
      process.exit(0);
    }
  );
});

// Handle close gracefully
db.on('close', () => {
  console.log('Database connection closed');
});
