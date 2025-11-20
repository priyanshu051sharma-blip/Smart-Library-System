// Test script for the Smart Library API
const http = require('http');

function testLogin() {
  const data = JSON.stringify({
    email: 'priyanshu.sharma24@st.niituniversity.in'
  });

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res) => {
    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    res.on('end', () => {
      console.log('Login Response:', JSON.parse(responseData));
    });
  });

  req.on('error', (error) => {
    console.error('Error:', error.message);
  });

  req.write(data);
  req.end();
}

function testGetUsers() {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/users',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    res.on('end', () => {
      console.log('All Users:', JSON.parse(responseData));
    });
  });

  req.on('error', (error) => {
    console.error('Error:', error.message);
  });

  req.end();
}

console.log('Testing Smart Library API...\n');
testLogin();
setTimeout(() => testGetUsers(), 1000);
