const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'library.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('📚 BOOKS IN DATABASE');
  console.log('═══════════════════════════════════════════════════════════════\n');

  db.all(`SELECT id, title, author, barcode, quantity, available FROM books ORDER BY id DESC`, (err, rows) => {
    if (err) {
      console.error('Error:', err);
      db.close();
      process.exit(1);
    }
    
    console.log(`Total Books: ${rows.length}\n`);
    
    if (rows.length > 0) {
      console.table(rows);
    } else {
      console.log('No books found in the database.');
    }
    
    console.log('\n═══════════════════════════════════════════════════════════════\n');
    db.close();
  });
});
