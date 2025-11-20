const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'library.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
  console.log('✅ Connected to database\n');
  viewDatabase();
});

function viewDatabase() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('📊 SMART LIBRARY DATABASE SCHEMA & DATA');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Users Table
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👤 USERS TABLE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  db.all(`SELECT id, enrollment_id, name, email, phone, created_at FROM users`, (err, rows) => {
    if (err) {
      console.error('Error:', err);
      return;
    }
    console.log(`Total Users: ${rows.length}\n`);
    if (rows.length > 0) {
      console.table(rows);
    }
    console.log();

    // Books Table
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📚 BOOKS TABLE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    db.all(`SELECT id, title, author, isbn, barcode, category, quantity, available FROM books ORDER BY id`, (err, rows) => {
      if (err) {
        console.error('Error:', err);
        return;
      }
      console.log(`Total Books: ${rows.length}\n`);
      if (rows.length > 0) {
        console.table(rows);
      }
      console.log();

      // Borrowed Books Table
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📖 BORROWED_BOOKS TABLE');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      db.all(
        `SELECT bb.id, bb.user_id, bb.book_id, bb.book_barcode, bb.issued_date, bb.due_date, bb.return_date, bb.status, b.title
         FROM borrowed_books bb
         LEFT JOIN books b ON bb.book_id = b.id
         ORDER BY bb.issued_date DESC`,
        (err, rows) => {
          if (err) {
            console.error('Error:', err);
            return;
          }
          console.log(`Total Borrowed Records: ${rows.length}\n`);
          if (rows.length > 0) {
            console.table(rows);
          }
          console.log();

          // Borrowing Table (legacy)
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('📋 BORROWING TABLE (Legacy)');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          db.all(
            `SELECT id, user_id, book_id, borrow_date, due_date, return_date, status FROM borrowing ORDER BY borrow_date DESC`,
            (err, rows) => {
              if (err) {
                console.error('Error:', err);
                return;
              }
              console.log(`Total Borrowing Records: ${rows.length}\n`);
              if (rows.length > 0) {
                console.table(rows);
              }
              console.log();

              // Summary Statistics
              console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
              console.log('📊 SUMMARY STATISTICS');
              console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

              db.get(`SELECT SUM(available) as available, SUM(quantity) as total FROM books`, (err, row) => {
                if (row) {
                  console.log(`📚 Books Available: ${row.available} / ${row.total}`);
                }

                db.get(`SELECT COUNT(*) as active FROM borrowed_books WHERE status = 'active'`, (err, row) => {
                  if (row) {
                    console.log(`📖 Currently Borrowed: ${row.active}`);
                  }

                  db.get(`SELECT COUNT(*) as returned FROM borrowed_books WHERE status = 'returned'`, (err, row) => {
                    if (row) {
                      console.log(`✅ Books Returned: ${row.returned}`);
                    }

                    db.get(`SELECT COUNT(*) as reissued FROM borrowed_books WHERE status = 'reissued'`, (err, row) => {
                      if (row) {
                        console.log(`🔄 Books Reissued: ${row.reissued}`);
                      }

                      console.log('\n═══════════════════════════════════════════════════════════════');
                      db.close();
                      process.exit(0);
                    });
                  });
                });
              });
            }
          );
        }
      );
    });
  });
}
