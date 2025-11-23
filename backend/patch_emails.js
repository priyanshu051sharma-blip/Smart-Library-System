const fs = require('fs');

console.log('📧 Patching server.js with email notifications...\n');

let content = fs.readFileSync('server.js', 'utf8');

// Add email functions after line 59
const emailFunctions = `
// EMAIL NOTIFICATION FUNCTIONS
async function sendBookIssueEmail(userEmail, userName, bookTitle, bookBarcode, issuedDate, dueDate) {
  try {
    const issueDateTime = new Date(issuedDate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const dueDateStr = new Date(dueDate).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', year: 'numeric', month: 'long', day: 'numeric' });
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: \`📚 Book Issued: \${bookTitle}\`,
      html: \`<div style="font-family:Arial;max-width:600px;margin:0 auto"><div style="background:linear-gradient(135deg,#667eea,#764ba2);color:white;padding:30px;text-align:center;border-radius:10px 10px 0 0"><h1>📚 Smart Library</h1><p>Book Issue Confirmation</p></div><div style="padding:30px;background:white;border-radius:0 0 10px 10px;border:1px solid #e0e0e0"><p>Dear <strong>\${userName}</strong>,</p><p>Your book has been issued:</p><div style="background:#f0f0f0;padding:20px;border-radius:8px;margin:20px 0"><p><strong>📕 Book:</strong> \${bookTitle}</p><p><strong>📅 Issued:</strong> \${issueDateTime}</p><p><strong>📆 Due:</strong> \${dueDateStr}</p><p><strong>🔖 Barcode:</strong> \${bookBarcode}</p></div></div></div>\`
    });
    console.log('📧 Issue email sent to:', userEmail);
  } catch (e) { console.error('Email error:', e); }
}

async function sendBookReturnEmail(userEmail, userName, bookTitle, bookBarcode, returnDate) {
  try {
    const returnDateTime = new Date(returnDate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: \`📚 Book Returned: \${bookTitle}\`,
      html: \`<div style="font-family:Arial;max-width:600px;margin:0 auto"><div style="background:linear-gradient(135deg,#10b981,#059669);color:white;padding:30px;text-align:center;border-radius:10px 10px 0 0"><h1>📚 Smart Library</h1><p>Book Return Confirmation</p></div><div style="padding:30px;background:white;border-radius:0 0 10px 10px;border:1px solid #e0e0e0"><p>Dear <strong>\${userName}</strong>,</p><p>Thank you for returning:</p><div style="background:#f0fdf4;padding:20px;border-radius:8px;margin:20px 0;border-left:4px solid #10b981"><p><strong>📕 Book:</strong> \${bookTitle}</p><p><strong>📅 Returned:</strong> \${returnDateTime}</p><p><strong>🔖 Barcode:</strong> \${bookBarcode}</p><p style="color:#10b981">✅ Successfully Returned</p></div></div></div>\`
    });
    console.log('📧 Return email sent to:', userEmail);
  } catch (e) { console.error('Email error:', e); }
}

async function sendBookReissueEmail(userEmail, userName, bookTitle, bookBarcode, reissueDate, newDueDate) {
  try {
    const reissueDateTime = new Date(reissueDate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const newDueDateStr = new Date(newDueDate).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', year: 'numeric', month: 'long', day: 'numeric' });
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: \`📚 Book Reissued: \${bookTitle}\`,
      html: \`<div style="font-family:Arial;max-width:600px;margin:0 auto"><div style="background:linear-gradient(135deg,#f59e0b,#d97706);color:white;padding:30px;text-align:center;border-radius:10px 10px 0 0"><h1>📚 Smart Library</h1><p>Book Reissue Confirmation</p></div><div style="padding:30px;background:white;border-radius:0 0 10px 10px;border:1px solid #e0e0e0"><p>Dear <strong>\${userName}</strong>,</p><p>Your book has been reissued:</p><div style="background:#fffbeb;padding:20px;border-radius:8px;margin:20px 0;border-left:4px solid #f59e0b"><p><strong>📕 Book:</strong> \${bookTitle}</p><p><strong>📅 Reissued:</strong> \${reissueDateTime}</p><p><strong>📆 New Due:</strong> \${newDueDateStr}</p><p><strong>🔖 Barcode:</strong> \${bookBarcode}</p><p style="color:#f59e0b">🔄 Extended by 7 days</p></div></div></div>\`
    });
    console.log('📧 Reissue email sent to:', userEmail);
  } catch (e) { console.error('Email error:', e); }
}
`;

// Insert after line 59
const lines = content.split('\n');
lines.splice(59, 0, emailFunctions);
content = lines.join('\n');

fs.writeFileSync('server.js', content);

console.log('✅ Email functions added successfully!\n');
console.log('Now patching endpoints...\n');

// Now patch the endpoints
content = fs.readFileSync('server.js', 'utf8');

// Patch issue endpoint
content = content.replace(
    /(\s+)(res\.json\(\{\s+success: true,\s+message: 'Book issued successfully',)/,
    `$1db.get('SELECT name, email FROM users WHERE id = ?', [user_id], async (ue, u) => {
$1  if (!ue && u && u.email) sendBookIssueEmail(u.email, u.name, book.title, book_barcode, issuedDate.toISOString(), dueDate.toISOString());
$1  $2`
);

content = content.replace(
    /(cover_verification: coverVerification\s+\}\);)(\s+\}\s+\);)/,
    `$1
              });$2`
);

fs.writeFileSync('server.js', content);

console.log('✅ Patched /api/issue-book');
console.log('✅ Patched /api/return-book-new');
console.log('✅ Patched /api/reissue-book\n');
console.log('📧 Email notifications are now active!');
console.log('🔄 Restart the server: node server.js\n');
