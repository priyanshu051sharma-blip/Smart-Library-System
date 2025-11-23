require('dotenv').config();
const nodemailer = require('nodemailer');

// Test email sending with detailed logging
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Test 1: Verify connection
console.log('\n=== TEST 1: Verify SMTP Connection ===');
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP Connection Failed:', error);
  } else {
    console.log('✅ SMTP Connection Successful');
    console.log('   Email:', process.env.EMAIL_USER);
    console.log('   Service: Gmail SMTP');
  }

  // Test 2: Send actual test email
  console.log('\n=== TEST 2: Send Test Email ===');
  const testEmail = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: '📚 Test Email - Smart Library System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1>📚 Smart Library System</h1>
          <p>Test Email</p>
        </div>
        <div style="padding: 30px; background: white; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
          <p>This is a test email to verify your email configuration is working correctly.</p>
          <p style="color: #666;">Sent at: ${new Date().toLocaleString('en-IN')}</p>
        </div>
      </div>
    `
  };

  transporter.sendMail(testEmail, (err, info) => {
    if (err) {
      console.error('❌ Email Send Failed:', err.message);
      console.error('   Code:', err.code);
      console.error('   Response:', err.response);
    } else {
      console.log('✅ Email Sent Successfully!');
      console.log('   Message ID:', info.messageId);
      console.log('   Response:', info.response);
    }
    process.exit(0);
  });
});
