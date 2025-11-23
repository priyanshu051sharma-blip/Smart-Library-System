const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'library.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }

  const idsToDelete = [6, 17, 2, 29];
  
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('🗑️  DELETING USERS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  idsToDelete.forEach((id) => {
    db.run(`DELETE FROM users WHERE id = ?`, [id], function(err) {
      if (err) {
        console.error(`❌ Error deleting user ID ${id}:`, err);
      } else {
        console.log(`✅ Deleted user ID ${id}`);
      }
    });
  });

  setTimeout(() => {
    db.all(`SELECT COUNT(*) as total FROM users`, (err, rows) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log(`\n📊 Remaining users: ${rows[0].total}`);
      }
      console.log('\n═══════════════════════════════════════════════════════════════\n');
      db.close();
    });
  }, 500);
});
