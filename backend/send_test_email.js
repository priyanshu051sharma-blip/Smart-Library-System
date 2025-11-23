require('dotenv').config();
const nodemailer = require('nodemailer');

async function sendTestEmail() {
    console.log('📧 Configuring email transport...');

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'priyanshu051sharma@gmail.com',
        subject: '🚀 Smart Library - Test Email',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1>📚 Smart Library System</h1>
          <p>System Test Notification</p>
        </div>
        <div style="padding: 30px; background: white; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
          <p>Dear <strong>Priyanshu</strong>,</p>
          <p>This is a test email to verify that your Smart Library email notifications are working correctly.</p>
          <div style="background: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="color: #28a745; font-size: 18px; font-weight: bold;">✅ Email System Operational</p>
            <p style="color: #666;">Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
          </div>
          <p style="color: #666;">You will receive similar emails when you issue, return, or reissue books.</p>
        </div>
      </div>
    `
    };

    try {
        console.log('📤 Sending test email to priyanshu051sharma@gmail.com...');
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully!');
        console.log('Message ID:', info.messageId);
    } catch (error) {
        console.error('❌ Error sending email:', error);
    }
}

sendTestEmail();
