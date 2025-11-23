const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'library.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('📸 ADD BOOK COVER IMAGE');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: node add_book_cover.js <barcode> <image_file_path>\n');
    console.log('Example:');
    console.log('  node add_book_cover.js "004.6 STA-D" "./book_cover.jpg"\n');
    db.close();
    process.exit(1);
  }

  const barcode = args[0];
  const imagePath = args[1];

  // Check if file exists
  if (!fs.existsSync(imagePath)) {
    console.error(`❌ Error: File not found: ${imagePath}\n`);
    db.close();
    process.exit(1);
  }

  // Read the image file
  fs.readFile(imagePath, (err, imageData) => {
    if (err) {
      console.error('❌ Error reading image file:', err.message);
      db.close();
      process.exit(1);
    }

    // Convert to base64
    const base64Image = 'data:image/jpeg;base64,' + imageData.toString('base64');

    console.log(`📋 Adding cover image:`);
    console.log(`   Barcode: ${barcode}`);
    console.log(`   Image file: ${imagePath}`);
    console.log(`   File size: ${imageData.length} bytes`);
    console.log(`   Base64 size: ${base64Image.length} bytes\n`);

    // Update the book with cover image
    db.run(
      `UPDATE books SET cover_image_base64 = ? WHERE barcode = ?`,
      [base64Image, barcode],
      function(err) {
        if (err) {
          console.error('❌ Error updating book with cover image:', err.message);
          db.close();
          process.exit(1);
        }

        if (this.changes === 0) {
          console.error(`❌ Error: No book found with barcode: ${barcode}\n`);
          db.close();
          process.exit(1);
        }

        console.log('✅ Cover image added successfully!\n');

        // Show the book details
        db.get(
          `SELECT id, title, author, barcode, cover_image_base64 FROM books WHERE barcode = ?`,
          [barcode],
          (err, row) => {
            if (row) {
              const hasImage = row.cover_image_base64 ? '✅ Yes' : '❌ No';
              console.log('📚 Book Details:');
              console.log(`   ID: ${row.id}`);
              console.log(`   Title: ${row.title}`);
              console.log(`   Author: ${row.author}`);
              console.log(`   Barcode: ${row.barcode}`);
              console.log(`   Cover Image: ${hasImage}`);
              console.log(`   Image Size: ${row.cover_image_base64 ? row.cover_image_base64.length : 0} characters\n`);
            }
            console.log('═══════════════════════════════════════════════════════════════\n');
            db.close();
          }
        );
      }
    );
  });
});
