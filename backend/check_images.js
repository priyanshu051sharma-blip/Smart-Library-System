const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'library.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
  console.log('✅ Connected to database\n');
  checkImages();
});

function checkImages() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('📸 USER IMAGES IN DATABASE');
  console.log('═══════════════════════════════════════════════════════════════\n');

  db.all(
    `SELECT id, name, email, 
            CASE 
              WHEN image IS NULL THEN 'No image'
              ELSE 'Image exists (' || length(image) || ' bytes)'
            END as image_status
     FROM users`,
    (err, rows) => {
      if (err) {
        console.error('Error:', err);
        return;
      }

      console.log('USER IMAGES STATUS:\n');
      console.table(rows);

      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📍 IMAGE STORAGE LOCATION');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      console.log('\n📁 Database Location:');
      console.log(`   File: ${dbPath}`);
      console.log(`   Size: ${require('fs').statSync(dbPath).size} bytes`);

      console.log('\n📊 Database Table Structure:');
      console.log(`   Table: users`);
      console.log(`   Column: image (LONGBLOB type)`);
      console.log(`   Stores: Binary image data or NULL`);

      console.log('\n🔄 How Images Work:');
      console.log(`   1. Images are stored as BINARY data in SQLite`);
      console.log(`   2. Frontend sends as base64 during registration`);
      console.log(`   3. Backend converts base64 → binary → stores in DB`);
      console.log(`   4. On login, backend reads binary → converts to base64`);
      console.log(`   5. Frontend displays base64 in <img> tag`);

      console.log('\n📦 Storage Details:');
      db.get(
        `SELECT COUNT(*) as total_users, 
                COUNT(image) as users_with_images,
                ROUND(AVG(length(image)), 2) as avg_image_size,
                MAX(length(image)) as max_image_size,
                MIN(length(image)) as min_image_size
         FROM users WHERE image IS NOT NULL`,
        (err, stats) => {
          if (err) {
            console.error('Error:', err);
            db.close();
            return;
          }

          console.log(`   Total Users: ${rows.length}`);
          console.log(`   Users with Images: ${stats.users_with_images || 0}`);
          if (stats.users_with_images > 0) {
            console.log(`   Average Image Size: ${stats.avg_image_size || 0} bytes`);
            console.log(`   Max Image Size: ${stats.max_image_size || 0} bytes`);
            console.log(`   Min Image Size: ${stats.min_image_size || 0} bytes`);
          }

          console.log('\n💾 Database Schema (users table):');
          console.log(`   ┌─────────────────────────┬──────────┬──────────────┐`);
          console.log(`   │ Column                  │ Type     │ Description  │`);
          console.log(`   ├─────────────────────────┼──────────┼──────────────┤`);
          console.log(`   │ id                      │ INTEGER  │ Primary Key  │`);
          console.log(`   │ enrollment_id           │ TEXT     │ Enrollment # │`);
          console.log(`   │ name                    │ TEXT     │ User name    │`);
          console.log(`   │ email                   │ TEXT     │ Email        │`);
          console.log(`   │ password                │ TEXT     │ Hashed pwd   │`);
          console.log(`   │ phone                   │ TEXT     │ Phone number │`);
          console.log(`   │ image                   │ LONGBLOB │ 📸 IMAGES    │`);
          console.log(`   │ facial_data             │ TEXT     │ Face 128D    │`);
          console.log(`   │ two_fa_enabled          │ BOOLEAN  │ 2FA setting  │`);
          console.log(`   │ created_at              │ DATETIME │ Created date │`);
          console.log(`   └─────────────────────────┴──────────┴──────────────┘`);

          console.log('\n📍 WHERE TO ADD IMAGES:');
          console.log(`   1. During Registration:`);
          console.log(`      - Capture photo during facial recognition`);
          console.log(`      - Convert to base64`);
          console.log(`      - Send to /api/register endpoint`);
          console.log(`      - Backend stores in users.image column`);
          console.log();
          console.log(`   2. During Upload:`);
          console.log(`      - Use /api/upload-image endpoint`);
          console.log(`      - Send multipart/form-data with image file`);
          console.log(`      - Backend processes and stores in DB`);
          console.log();
          console.log(`   3. From URL:`);
          console.log(`      - Frontend sends image URL as base64`);
          console.log(`      - Backend converts and stores`);

          console.log('\n🔗 API ENDPOINTS FOR IMAGES:');
          console.log(`   POST /api/register          - Stores image during signup`);
          console.log(`   GET  /api/verify-otp        - Returns image on login`);
          console.log(`   GET  /api/user/:user_id     - Fetch user with image`);
          console.log(`   POST /api/upload-image      - Upload image file`);

          console.log('\n✅ RETRIEVING IMAGES:');
          console.log(`   On Login: verify-otp endpoint returns`);
          console.log(`   {`);
          console.log(`     "success": true,`);
          console.log(`     "user": {`);
          console.log(`       "id": 6,`);
          console.log(`       "name": "Priyanshu",`);
          console.log(`       "email": "priyanshu051sharma@gmail.com",`);
          console.log(`       "image": "data:image/jpeg;base64,/9j/4AAQSkZJ..."  ← BASE64`);
          console.log(`     }`);
          console.log(`   }`);

          console.log('\n═══════════════════════════════════════════════════════════════\n');
          db.close();
          process.exit(0);
        }
      );
    }
  );
}
