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
  console.log('📚 ADD BOOK TO DATABASE');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Get command line arguments
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log('Usage: node add_book.js <book_title> <author> <isbn_barcode> [quantity]');
    console.log('\nExample:');
    console.log('  node add_book.js "The Great Gatsby" "F. Scott Fitzgerald" "ISBN978123456" 5\n');
    
    console.log('Book Fields:');
    console.log('  title: Book title (required)');
    console.log('  author: Author name (required)');
    console.log('  isbn: ISBN/Barcode (required)');
    console.log('  quantity: Number of copies (optional, default: 1)\n');
    
    db.close();
    process.exit(1);
  }

  const title = args[0];
  const author = args[1];
  const barcode = args[2];
  const quantity = args[3] ? parseInt(args[3]) : 1;

  console.log('📋 Book Details:');
  console.log(`   Title: ${title}`);
  console.log(`   Author: ${author}`);
  console.log(`   Barcode: ${barcode}`);
  console.log(`   Quantity: ${quantity}\n`);

  db.run(
    `INSERT INTO books (title, author, isbn, barcode, quantity, available, category)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [title, author, barcode, barcode, quantity, quantity, 'General'],
    function(err) {
      if (err) {
        console.error('❌ Error adding book:', err.message);
        if (err.message.includes('UNIQUE constraint failed')) {
          console.error('\n⚠️  Barcode already exists in database!');
        }
        db.close();
        process.exit(1);
      }

      console.log('✅ Book added successfully!');
      console.log(`   Book ID: ${this.lastID}\n`);
      
      db.all(`SELECT id, title, author, barcode, quantity, available FROM books ORDER BY id DESC LIMIT 1`, (err, rows) => {
        if (rows) {
          console.log('📊 Current Books in Database:');
          console.table(rows);
        }
        console.log('\n═══════════════════════════════════════════════════════════════\n');
        db.close();
      });
    }
  );
});
