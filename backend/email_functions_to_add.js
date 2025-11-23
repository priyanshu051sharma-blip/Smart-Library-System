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
            subject: `📚 Book Issued: ${bookTitle}`,
            html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1>📚 Smart Library System</h1><p>Book Issue Confirmation</p>
        </div>
        <div style="padding: 30px; background: white; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
          <p>Dear <strong>${userName}</strong>,</p>
          <p>Your book has been successfully issued:</p>
          <div style="background: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>📕 Book:</strong> ${bookTitle}</p>
            <p><strong>📅 Issued:</strong> ${issueDateTime}</p>
            <p><strong>📆 Due Date:</strong> ${dueDateStr}</p>
            <p><strong>🔖 Barcode:</strong> ${bookBarcode}</p>
          </div>
          <p style="color: #666;">Please return by the due date to avoid late fees.</p>
        </div>
      </div>`
        });
        console.log('📧 Issue email sent to:', userEmail);
        return true;
    } catch (error) {
        console.error('❌ Email error:', error);
        return false;
    }
}

// Function to send book return notification email
async function sendBookReturnEmail(userEmail, userName, bookTitle, bookBarcode, returnDate) {
    try {
        const returnDateTime = new Date(returnDate).toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: `📚 Book Returned: ${bookTitle}`,
            html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1>📚 Smart Library System</h1><p>Book Return Confirmation</p>
        </div>
        <div style="padding: 30px; background: white; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
          <p>Dear <strong>${userName}</strong>,</p>
          <p>Thank you for returning your book:</p>
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <p><strong>📕 Book:</strong> ${bookTitle}</p>
            <p><strong>📅 Returned:</strong> ${returnDateTime}</p>
            <p><strong>🔖 Barcode:</strong> ${bookBarcode}</p>
            <p style="color: #10b981;">✅ <strong>Status:</strong> Successfully Returned</p>
          </div>
          <p style="color: #666;">Thank you for using Smart Library System!</p>
        </div>
      </div>`
        });
        console.log('📧 Return email sent to:', userEmail);
        return true;
    } catch (error) {
        console.error('❌ Email error:', error);
        return false;
    }
}

// Function to send book reissue notification email
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
            subject: `📚 Book Reissued: ${bookTitle}`,
            html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1>📚 Smart Library System</h1><p>Book Reissue Confirmation</p>
        </div>
        <div style="padding: 30px; background: white; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
          <p>Dear <strong>${userName}</strong>,</p>
          <p>Your book has been reissued with an extended due date:</p>
          <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p><strong>📕 Book:</strong> ${bookTitle}</p>
            <p><strong>📅 Reissued:</strong> ${reissueDateTime}</p>
            <p><strong>📆 New Due Date:</strong> ${newDueDateStr}</p>
            <p><strong>🔖 Barcode:</strong> ${bookBarcode}</p>
            <p style="color: #f59e0b;">🔄 <strong>Status:</strong> Extended by 7 days</p>
          </div>
          <p style="color: #666;">Please return by the new due date.</p>
        </div>
      </div>`
        });
        console.log('📧 Reissue email sent to:', userEmail);
        return true;
    } catch (error) {
        console.error('❌ Email error:', error);
        return false;
    }
}
