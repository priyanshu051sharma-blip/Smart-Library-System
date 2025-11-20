#!/usr/bin/env node

/**
 * Add Priyanshu Sharma to the Smart Library System Database
 * This script creates the user account with default facial data
 * You can update the facial data with the actual photo later via the registration endpoint
 */

const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/admin/add-priyanshu',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': 0
  }
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    const response = JSON.parse(data);
    console.log('\n✓ Response received:');
    console.log(JSON.stringify(response, null, 2));
    
    if (response.success) {
      console.log('\n✅ SUCCESS: Priyanshu Sharma account created!');
      console.log('User ID:', response.user_id);
      console.log('Email:', response.email);
      console.log('\nYou can now login with:');
      console.log('Email: ' + response.email);
      console.log('Password: priyanshu123');
      console.log('(Then use facial recognition to complete login)');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error);
  console.error('\nMake sure the server is running on port 5000');
  process.exit(1);
});

console.log('Adding Priyanshu Sharma to the database...\n');
req.end();
