const nodemailer = require('nodemailer');
require('dotenv').config();

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('📧 EMAIL CONFIGURATION DIAGNOSTIC');
console.log('═══════════════════════════════════════════════════════════════\n');

// Check environment variables
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

console.log('🔍 Configuration Check:');
console.log(`   EMAIL_USER: ${emailUser ? '✅ Set' : '❌ NOT SET'}`);
console.log(`   EMAIL_PASS: ${emailPass ? '✅ Set' : '❌ NOT SET'}\n`);

if (!emailUser || !emailPass) {
  console.log('❌ ERROR: Email credentials not configured!');
  console.log('\n📝 FIX STEPS:');
  console.log('1. Edit backend/.env file');
  console.log('2. Set EMAIL_USER=your-real-email@gmail.com');
  console.log('3. Set EMAIL_PASS=your-16-char-app-password');
  console.log('4. Save and restart the server\n');
  process.exit(1);
}

if (emailUser === 'your-gmail@gmail.com' || emailPass === 'xxxx xxxx xxxx xxxx') {
  console.log('❌ ERROR: Email credentials are still set to placeholder values!');
  console.log('\n📝 FIX STEPS:');
  console.log('1. Edit backend/.env file');
  console.log('2. Replace "your-gmail@gmail.com" with your actual Gmail address');
  console.log('3. Replace "xxxx xxxx xxxx xxxx" with your 16-character app password');
  console.log('4. Save the file');
  console.log('5. Restart the server\n');
  console.log('📌 How to get Gmail App Password:');
  console.log('   1. Go to myaccount.google.com');
  console.log('   2. Click Security (left sidebar)');
  console.log('   3. Find "App passwords" (bottom)');
  console.log('   4. Select "Mail" and "Windows Computer"');
  console.log('   5. Copy the 16-character password\n');
  process.exit(1);
}

// Test email connection
console.log('🔗 Testing Email Connection...\n');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailUser,
    pass: emailPass
  }
});

transporter.verify((error, success) => {
  console.log('═══════════════════════════════════════════════════════════════');
  if (error) {
    console.log('❌ EMAIL CONNECTION FAILED\n');
    console.log('Error:', error.message);
    console.log('\n🔧 TROUBLESHOOTING:');
    console.log('1. Check EMAIL_USER is correct Gmail address');
    console.log('2. Check EMAIL_PASS is 16-char app password (not Gmail password)');
    console.log('3. Enable 2-Factor Authentication on Gmail account');
    console.log('4. Generate new app password at myaccount.google.com/apppasswords');
    console.log('5. Make sure .env file is saved correctly\n');
  } else {
    console.log('✅ EMAIL CONNECTION SUCCESSFUL\n');
    console.log('Configuration:');
    console.log(`   Email: ${emailUser}`);
    console.log('   Service: Gmail SMTP');
    console.log('   Status: Ready to send emails\n');
    console.log('📧 Emails will be sent to:');
    console.log('   - User\'s registered email on book issue');
    console.log('   - User\'s registered email on book return');
    console.log('   - User\'s registered email on book reissue\n');
  }
  console.log('═══════════════════════════════════════════════════════════════\n');
});
