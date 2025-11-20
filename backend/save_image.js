#!/usr/bin/env node

/**
 * QUICK GUIDE: Add your profile image to the database
 * 
 * Option 1: If you have an image file
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 1. Save your photo as 'priyanshu.jpg' or 'priyanshu.png' in the backend folder
 * 2. Run: node save_image.js
 * 3. The script will automatically detect and upload your image
 * 
 * Option 2: Drag & drop image here in VS Code
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Then run the script above
 * 
 * Option 3: Provide image path as argument
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * node save_image.js "path/to/your/image.jpg"
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = path.join(__dirname, 'library.db');
const backendDir = __dirname;

// Check for image files or use provided argument
let imagePath = process.argv[2];

if (!imagePath) {
  // Search for image files in backend directory
  const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
  const files = fs.readdirSync(backendDir);
  
  for (const ext of extensions) {
    const found = files.find(f => f.toLowerCase().endsWith(ext) && 
                                 f.toLowerCase().includes('priyanshu'));
    if (found) {
      imagePath = path.join(backendDir, found);
      break;
    }
  }
  
  // If no priyanshu-specific image, look for any image
  if (!imagePath) {
    for (const ext of extensions) {
      const found = files.find(f => f.toLowerCase().endsWith(ext));
      if (found) {
        imagePath = path.join(backendDir, found);
        break;
      }
    }
  }
}

if (!imagePath || !fs.existsSync(imagePath)) {
  console.log('\n📸 Add Profile Image to Database');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n❌ No image file found!\n');
  console.log('📝 To add your photo:\n');
  console.log('  1️⃣  Save your image in the backend folder:');
  console.log('     📁 backend/priyanshu.jpg  (or .png)\n');
  console.log('  2️⃣  Run this command:');
  console.log('     node save_image.js\n');
  console.log('  3️⃣  Or provide image path:');
  console.log('     node save_image.js "path/to/image.jpg"\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  process.exit(1);
}

console.log('\n📸 Adding Profile Image to Database');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Read image file
try {
  const imageBuffer = fs.readFileSync(imagePath);
  console.log('\n✅ Image loaded successfully');
  console.log(`   File: ${path.basename(imagePath)}`);
  console.log(`   Size: ${(imageBuffer.length / 1024).toFixed(2)} KB (${imageBuffer.length} bytes)`);
  
  // Connect to database
  const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('\n❌ Database connection error:', err.message);
      process.exit(1);
    }
    
    console.log('\n✅ Connected to database');
    
    // Update user 6 (Priyanshu) with image
    db.run(
      'UPDATE users SET image = ? WHERE id = 6',
      [imageBuffer],
      function(err) {
        if (err) {
          console.error('\n❌ Error updating database:', err.message);
          db.close();
          process.exit(1);
        }
        
        if (this.changes === 0) {
          console.log('\n❌ User ID 6 (Priyanshu) not found in database');
          db.close();
          process.exit(1);
        }
        
        console.log('\n✅ Image uploaded to database successfully!\n');
        
        // Verify the update
        db.get(
          `SELECT id, name, email, 
                  CASE WHEN image IS NULL THEN 'No image'
                       ELSE 'Image exists (' || length(image) || ' bytes)'
                  END as image_status
           FROM users WHERE id = 6`,
          (err, row) => {
            if (err) {
              console.error('❌ Verification error:', err.message);
              db.close();
              process.exit(1);
            }
            
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📊 User Profile Update Details');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            if (row) {
              console.log(`User ID:       ${row.id}`);
              console.log(`Name:          ${row.name}`);
              console.log(`Email:         ${row.email}`);
              console.log(`Image Status:  ${row.image_status}`);
            }
            
            console.log('\n🎉 Profile image successfully stored!\n');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📱 Next Steps: View Photo on Dashboard');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('\n1️⃣  Go to: http://localhost:8000');
            console.log('\n2️⃣  Click "Already have an account? Login"');
            console.log('\n3️⃣  Enter your credentials:');
            console.log('   Email: priyanshu051sharma@gmail.com');
            console.log('   Password: (your password)\n');
            console.log('4️⃣  Capture your face for verification\n');
            console.log('5️⃣  See your photo on the dashboard! ✨\n');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
            
            db.close();
          }
        );
      }
    );
  });
} catch (err) {
  console.error('\n❌ Error reading image file:', err.message);
  process.exit(1);
}
