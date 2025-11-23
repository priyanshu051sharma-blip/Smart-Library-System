require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('📧 Testing Email Configuration...\n');
console.log('EMAIL_USER:', process.env.EMAIL_USER || 'NOT SET');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '****' + process.env.EMAIL_PASS.slice(-4) : 'NOT SET');
console.log('');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Test email sending
async function testEmail() {
  try {
    console.log('Sending test email...');
    
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to yourself
      subject: '📚 Smart Library - Email Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1>📚 Smart Library System</h1>
            <p>Email Configuration Test</p>
          </div>
          <div style="padding: 30px; background: white; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
            <p>✅ <strong>Success!</strong></p>
            <p>Your email configuration is working correctly.</p>
            <p>Test sent at: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `
    });

    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    console.log('\n✅ Check your inbox:', process.env.EMAIL_USER);
    
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    console.error('\nPossible issues:');
    console.error('1. EMAIL_USER or EMAIL_PASS not set in .env file');
    console.error('2. Gmail App Password is incorrect');
    console.error('3. 2-Factor Authentication not enabled on Gmail');
    console.error('4. Less secure app access blocked');
    console.error('\nFull error:', error);
  }
}

testEmail();
