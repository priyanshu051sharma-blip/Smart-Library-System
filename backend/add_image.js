const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'library.db');

// Read the image file and convert to binary
const imagePath = path.join(__dirname, 'priyanshu_photo.jpg');

if (!fs.existsSync(imagePath)) {
  console.error('❌ Image file not found at:', imagePath);
  console.log('\n📝 Please save your image as: priyanshu_photo.jpg in the backend folder');
  process.exit(1);
}

const imageBuffer = fs.readFileSync(imagePath);
const imageBase64 = imageBuffer.toString('base64');

console.log('✅ Image loaded successfully');
console.log(`   File: ${imagePath}`);
console.log(`   Size: ${imageBuffer.length} bytes`);
console.log(`   Base64 length: ${imageBase64.length} characters\n`);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Database connection error:', err);
    process.exit(1);
  }
  console.log('✅ Connected to database\n');
  updateUserImage();
});

function updateUserImage() {
  // Update user ID 6 (Priyanshu) with the image
  db.run(
    `UPDATE users SET image = ? WHERE id = 6`,
    [imageBuffer],
    function(err) {
      if (err) {
        console.error('❌ Error updating database:', err);
        db.close();
        process.exit(1);
      }

      if (this.changes === 0) {
        console.error('❌ User ID 6 not found');
        db.close();
        process.exit(1);
      }

      console.log('✅ Image added successfully!\n');
      console.log('📊 Update Details:');
      console.log(`   User ID: 6`);
      console.log(`   User Name: Priyanshu`);
      console.log(`   Email: priyanshu051sharma@gmail.com`);
      console.log(`   Image Size: ${imageBuffer.length} bytes`);
      console.log(`   Image Format: JPEG (Binary LONGBLOB)\n`);

      // Verify the update
      db.get(
        `SELECT id, name, email, 
                CASE 
                  WHEN image IS NULL THEN 'No image'
                  ELSE 'Image exists (' || length(image) || ' bytes)'
                END as image_status
         FROM users WHERE id = 6`,
        (err, row) => {
          if (err) {
            console.error('Error:', err);
            return;
          }

          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('✅ VERIFICATION - User Image Status');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.table([row]);

          console.log('\n🎉 Image now stored in database!');
          console.log('\n📸 When Priyanshu logs in:');
          console.log('   1. Facial verification happens');
          console.log('   2. Backend retrieves user record');
          console.log('   3. Image converted to base64');
          console.log('   4. Sent to frontend in response');
          console.log('   5. Dashboard displays circular photo');
          console.log('   6. Shows name and email below photo\n');

          console.log('🔗 To view on dashboard:');
          console.log('   1. Go to http://localhost:8000');
          console.log('   2. Login with: priyanshu051sharma@gmail.com');
          console.log('   3. Enter password: (from registration)');
          console.log('   4. Capture your face for verification');
          console.log('   5. Dashboard shows your photo! ✨\n');

          db.close();
          process.exit(0);
        }
      );
    }
  );
}
