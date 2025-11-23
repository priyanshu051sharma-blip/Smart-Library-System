const fs = require('fs');
const path = require('path');

console.log('📧 Adding Email Notifications to Smart Library System...\n');

const serverPath = path.join(__dirname, 'server.js');
let content = fs.readFileSync(serverPath, 'utf8');

// Email functions to add
const emailFunctions = `
// Function to send book issue notification email
async function sendBookIssueEmail(userEmail, userName, bookTitle, bookBarcode, issuedDate, dueDate) {
  try {
    const issueDateTime = new Date(issuedDate).toLocaleString('en-IN', { 
      timeZone: 'Asia/Kolkata', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    const dueDateStr = new Date(dueDate).toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata', year: 'numeric', month: 'long', day: 'numeric'
    });
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: \`📚 Book Issued: \${bookTitle}\`,
      html: \`<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1>📚 Smart Library System</h1><p>Book Issue Confirmation</p>
        </div>
        <div style="padding: 30px; background: white; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
          <p>Dear <strong>\${userName}</strong>,</p>
          <p>Your book has been successfully issued:</p>
          <div style="background: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>📕 Book:</strong> \${bookTitle}</p>
            <p><strong>📅 Issued:</strong> \${issueDateTime}</p>
            <p><strong>📆 Due Date:</strong> \${dueDateStr}</p>
            <p><strong>🔖 Barcode:</strong> \${bookBarcode}</p>
          </div>
          <p style="color: #666;">Please return by the due date.</p>
        </div>
      </div>\`
    });
    console.log('📧 Issue email sent to:', userEmail);
    return true;
  } catch (error) {
    console.error('❌ Email error:', error);
    return false;
  }
}

async function sendBookReturnEmail(userEmail, userName, bookTitle, bookBarcode, returnDate) {
  try {
    const returnDateTime = new Date(returnDate).toLocaleString('en-IN', { 
      timeZone: 'Asia/Kolkata', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: \`📚 Book Returned: \${bookTitle}\`,
      html: \`<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1>📚 Smart Library System</h1><p>Book Return Confirmation</p>
        </div>
        <div style="padding: 30px; background: white; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
          <p>Dear <strong>\${userName}</strong>,</p>
          <p>Thank you for returning your book:</p>
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <p><strong>📕 Book:</strong> \${bookTitle}</p>
            <p><strong>📅 Returned:</strong> \${returnDateTime}</p>
            <p><strong>🔖 Barcode:</strong> \${bookBarcode}</p>
            <p style="color: #10b981;">✅ <strong>Status:</strong> Successfully Returned</p>
          </div>
        </div>
      </div>\`
    });
    console.log('📧 Return email sent to:', userEmail);
    return true;
  } catch (error) {
    console.error('❌ Email error:', error);
    return false;
  }
}

async function sendBookReissueEmail(userEmail, userName, bookTitle, bookBarcode, reissueDate, newDueDate) {
  try {
    const reissueDateTime = new Date(reissueDate).toLocaleString('en-IN', { 
      timeZone: 'Asia/Kolkata', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    const newDueDateStr = new Date(newDueDate).toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata', year: 'numeric', month: 'long', day: 'numeric'
    });
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: \`📚 Book Reissued: \${bookTitle}\`,
      html: \`<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1>📚 Smart Library System</h1><p>Book Reissue Confirmation</p>
        </div>
        <div style="padding: 30px; background: white; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
          <p>Dear <strong>\${userName}</strong>,</p>
          <p>Your book has been reissued with extended due date:</p>
          <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p><strong>📕 Book:</strong> \${bookTitle}</p>
            <p><strong>📅 Reissued:</strong> \${reissueDateTime}</p>
            <p><strong>📆 New Due Date:</strong> \${newDueDateStr}</p>
            <p><strong>🔖 Barcode:</strong> \${bookBarcode}</p>
            <p style="color: #f59e0b;">🔄 <strong>Status:</strong> Extended by 7 days</p>
          </div>
        </div>
      </div>\`
    });
    console.log('📧 Reissue email sent to:', userEmail);
    return true;
  } catch (error) {
    console.error('❌ Email error:', error);
    return false;
  }
}
`;

// Step 1: Add email functions after sendOTPEmail
const sendOTPEnd = content.indexOf('}\n\n// Function to compare book cover images');
if (sendOTPEnd > 0) {
    content = content.slice(0, sendOTPEnd + 1) + emailFunctions + content.slice(sendOTPEnd + 1);
    console.log('✅ Added email notification functions');
} else {
    console.error('❌ Could not find insertion point for email functions');
    process.exit(1);
}

// Step 2: Modify /api/issue-book endpoint
const issueBookPattern = /res\.json\(\{\s+success: true,\s+message: 'Book issued successfully',\s+borrowing_id: this\.lastID,\s+book_title: book\.title,\s+issued_date: issuedDate\.toISOString\(\)\.split\('T'\)\[0\],\s+due_date: dueDate\.toISOString\(\)\.split\('T'\)\[0\],\s+cover_verification: coverVerification\s+\}\);/;

const issueBookReplacement = `// Get user for email
              db.get('SELECT name, email FROM users WHERE id = ?', [user_id], async (userErr, user) => {
                if (!userErr && user && user.email) {
                  sendBookIssueEmail(user.email, user.name, book.title, book_barcode, issuedDate.toISOString(), dueDate.toISOString()).catch(e => console.error('Email failed:', e));
                }
                res.json({
                  success: true,
                  message: 'Book issued successfully',
                  borrowing_id: this.lastID,
                  book_title: book.title,
                  issued_date: issuedDate.toISOString().split('T')[0],
                  due_date: dueDate.toISOString().split('T')[0],
                  cover_verification: coverVerification
                });
              });`;

if (content.match(issueBookPattern)) {
    content = content.replace(issueBookPattern, issueBookReplacement);
    console.log('✅ Modified /api/issue-book endpoint');
} else {
    console.log('⚠️  Could not modify /api/issue-book (pattern not found)');
}

// Step 3: Modify /api/return-book-new endpoint
const returnBookPattern = /res\.json\(\{\s+success: true,\s+message: 'Book returned successfully',\s+return_date: returnDate\.split\('T'\)\[0\],\s+cover_verification: coverVerification\s+\}\);/;

const returnBookReplacement = `// Get user and book for email
                db.get('SELECT u.name, u.email, b.title FROM users u, borrowed_books bb, books b WHERE bb.id = ? AND bb.user_id = u.id AND bb.book_id = b.id', [borrowing_id], async (userErr, data) => {
                  if (!userErr && data && data.email) {
                    sendBookReturnEmail(data.email, data.name, data.title, book_barcode, returnDate).catch(e => console.error('Email failed:', e));
                  }
                  res.json({
                    success: true,
                    message: 'Book returned successfully',
                    return_date: returnDate.split('T')[0],
                    cover_verification: coverVerification
                  });
                });`;

if (content.match(returnBookPattern)) {
    content = content.replace(returnBookPattern, returnBookReplacement);
    console.log('✅ Modified /api/return-book-new endpoint');
} else {
    console.log('⚠️  Could not modify /api/return-book-new (pattern not found)');
}

// Step 4: Modify /api/reissue-book endpoint
const reissueBookPattern = /res\.json\(\{\s+success: true,\s+message: 'Book reissued successfully',\s+new_due_date: newDueDate\.toISOString\(\)\.split\('T'\)\[0\],\s+cover_verification: coverVerification\s+\}\);/;

const reissueBookReplacement = `// Get user and book for email
          db.get('SELECT u.name, u.email, b.title FROM users u, borrowed_books bb, books b WHERE bb.id = ? AND bb.user_id = u.id AND bb.book_id = b.id', [borrowing_id], async (userErr, data) => {
            if (!userErr && data && data.email) {
              sendBookReissueEmail(data.email, data.name, data.title, book_barcode, new Date().toISOString(), newDueDate.toISOString()).catch(e => console.error('Email failed:', e));
            }
            res.json({
              success: true,
              message: 'Book reissued successfully',
              new_due_date: newDueDate.toISOString().split('T')[0],
              cover_verification: coverVerification
            });
          });`;

if (content.match(reissueBookPattern)) {
    content = content.replace(reissueBookPattern, reissueBookReplacement);
    console.log('✅ Modified /api/reissue-book endpoint');
} else {
    console.log('⚠️  Could not modify /api/reissue-book (pattern not found)');
}

// Write the modified content
fs.writeFileSync(serverPath, content, 'utf8');

console.log('\n✅ Email notifications have been added to server.js!');
console.log('\n📧 Features added:');
console.log('   - Book issue email notifications');
console.log('   - Book return email notifications');
console.log('   - Book reissue email notifications');
console.log('\n🔄 Please restart the server for changes to take effect.');
console.log('   Run: node server.js\n');
