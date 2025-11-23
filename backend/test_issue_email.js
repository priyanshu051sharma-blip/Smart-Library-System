require('dotenv').config();
const sqlite3 = require('sqlite3');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const db = new sqlite3.Database('./library.db');

// Test issuing a book to user ID 50 (Priyanshu)
const userId = 50;
const bookId = 1; // First book in database

console.log('=== TESTING BOOK ISSUE EMAIL ===\n');

db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
  if (err) {
    console.error('Error getting user:', err);
    process.exit(1);
  }
  if (!user) {
    console.error('User not found');
    process.exit(1);
  }

  console.log('User Found:', user.name, `<${user.email}>`);

  db.get('SELECT * FROM books WHERE id = ?', [bookId], (err, book) => {
    if (err) {
      console.error('Error getting book:', err);
      process.exit(1);
    }
    if (!book) {
      console.error('Book not found');
      process.exit(1);
    }

    console.log('Book Found:', book.title);
    console.log('\n=== SENDING EMAIL ===\n');

    const issueDate = new Date();
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + 7);

    const issueDateTime = issueDate.toLocaleString('en-IN', { 
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const dueDateStr = dueDate.toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1>📚 Smart Library System</h1>
          <p>Book Issue Confirmation</p>
        </div>
        <div style="padding: 30px; background: white; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
          <p>Dear <strong>${user.name}</strong>,</p>
          <p>Your book has been successfully issued. Here are the details:</p>
          <div style="background: #f0f0f0; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea;">
            <p><strong>📕 Book Title:</strong> ${book.title}</p>
            <p><strong>📅 Issue Date & Time:</strong> ${issueDateTime}</p>
            <p><strong>📆 Due Date:</strong> ${dueDateStr}</p>
            <p><strong>🔖 Barcode:</strong> ${book.barcode}</p>
          </div>
          <p style="color: #666;">Please return the book by the due date to avoid any penalties.</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">Smart Library System © 2025</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `📚 Book Issued: ${book.title}`,
      html: emailContent
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('❌ EMAIL SEND FAILED:', err.message);
        console.error('   Code:', err.code);
      } else {
        console.log('✅ EMAIL SENT SUCCESSFULLY!');
        console.log('   To:', user.email);
        console.log('   Subject:', mailOptions.subject);
        console.log('   Message ID:', info.messageId);
      }
      db.close();
      process.exit(0);
    });
  });
});
