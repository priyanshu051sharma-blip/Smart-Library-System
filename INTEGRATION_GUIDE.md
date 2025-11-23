# 📧 How to Enable Email Notifications - Step by Step Guide

## ⚠️ IMPORTANT: Manual Integration Required

Due to the large file size, I've prepared everything for you to manually integrate the email functions.

---

## 📋 Step 1: Add Email Functions to server.js

### Location:
Open `backend/server.js` and find **line 59** (after the `sendOTPEmail` function ends with `}`)

### What to Add:
Copy the **ENTIRE content** from the file:
**`backend/email_functions_to_add.js`**

### Paste it After Line 59:
```javascript
}  // <-- This is the end of sendOTPEmail function (line 59)

// ADD THE 3 EMAIL FUNCTIONS HERE (from email_functions_to_add.js)

// Function to compare book cover images (base64 encoded)  // <-- This should be around line 61
```

---

## 📋 Step 2: Integrate Email Calls into API Endpoints

### 2.1 For `/api/issue-book` Endpoint

**Find this code** (around line 1279-1287):
```javascript
              res.json({
                success: true,
                message: 'Book issued successfully',
                borrowing_id: this.lastID,
                book_title: book.title,
                issued_date: issuedDate.toISOString().split('T')[0],
                due_date: dueDate.toISOString().split('T')[0],
                cover_verification: coverVerification
              });
```

**Replace with**:
```javascript
              // Send email notification
              db.get('SELECT name, email FROM users WHERE id = ?', [user_id], async (userErr, user) => {
                if (!userErr && user && user.email) {
                  sendBookIssueEmail(user.email, user.name, book.title, book_barcode, issuedDate.toISOString(), dueDate.toISOString()).catch(e => console.error('Email failed:', e));
                }
              });

              res.json({
                success: true,
                message: 'Book issued successfully',
                borrowing_id: this.lastID,
                book_title: book.title,
                issued_date: issuedDate.toISOString().split('T')[0],
                due_date: dueDate.toISOString().split('T')[0],
                cover_verification: coverVerification
              });
```

---

### 2.2 For `/api/return-book-new` Endpoint

**Find this code** (around line 1384):
```javascript
              res.json({
                success: true,
                message: 'Book returned successfully',
                return_date: returnDate.split('T')[0],
                cover_verification: coverVerification
              });
```

**Replace with**:
```javascript
              // Send email notification
              db.get('SELECT u.name, u.email, b.title FROM users u, borrowed_books bb, books b WHERE bb.id = ? AND bb.user_id = u.id AND bb.book_id = b.id', [borrowing_id], async (userErr, data) => {
                if (!userErr && data && data.email) {
                  sendBookReturnEmail(data.email, data.name, data.title, book_barcode, returnDate).catch(e => console.error('Email failed:', e));
                }
              });

              res.json({
                success: true,
                message: 'Book returned successfully',
                return_date: returnDate.split('T')[0],
                cover_verification: coverVerification
              });
```

---

### 2.3 For `/api/reissue-book` Endpoint

**Find this code** (search for "Book reissued successfully"):
```javascript
          res.json({
            success: true,
            message: 'Book reissued successfully',
            new_due_date: newDueDate.toISOString().split('T')[0],
            cover_verification: coverVerification
          });
```

**Replace with**:
```javascript
          // Send email notification
          db.get('SELECT u.name, u.email, b.title FROM users u, borrowed_books bb, books b WHERE bb.id = ? AND bb.user_id = u.id AND bb.book_id = b.id', [borrowing_id], async (userErr, data) => {
            if (!userErr && data && data.email) {
              sendBookReissueEmail(data.email, data.name, data.title, book_barcode, new Date().toISOString(), newDueDate.toISOString()).catch(e => console.error('Email failed:', e));
            }
          });

          res.json({
            success: true,
            message: 'Book reissued successfully',
            new_due_date: newDueDate.toISOString().split('T')[0],
            cover_verification: coverVerification
          });
```

---

## 📋 Step 3: Restart the Server

After making all the changes:

1. **Stop the current server** (Ctrl+C in the terminal running `npm start`)
2. **Restart it**:
   ```bash
   cd backend
   npm start
   ```

---

## ✅ Testing

After restarting, when you:
- **Issue a book** → User receives an email
- **Return a book** → User receives an email  
- **Reissue a book** → User receives an email

Check the server console for:
```
📧 Issue email sent to: user@example.com
📧 Return email sent to: user@example.com
📧 Reissue email sent to: user@example.com
```

---

## 📁 Files Created for You:

1. **`email_functions_to_add.js`** - The 3 email functions (copy this into server.js)
2. **`EMAIL_NOTIFICATION_STATUS.md`** - Status documentation
3. **`INTEGRATION_GUIDE.md`** - This file

---

## 🆘 Need Help?

If you encounter any issues:
1. Make sure the `.env` file has correct email credentials
2. Check server console for error messages
3. Verify the email functions are added after line 59
4. Ensure all 3 API endpoints have the email calls added

---

## 🎉 Once Complete:

Your Smart Library System will automatically send beautiful, professional emails for all book transactions!
