const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('library.db');

db.all('SELECT id, name, email, enrollment_id FROM users', [], (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('\n📚 All Users in Database:');
    console.log('═══════════════════════════════════════');
    rows.forEach(row => {
      console.log(`ID: ${row.id}`);
      console.log(`Name: ${row.name}`);
      console.log(`Email: ${row.email}`);
      console.log(`Enrollment: ${row.enrollment_id || 'N/A'}`);
      console.log('───────────────────────────────────────');
    });
  }
  db.close();
});
