const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'library.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }

  db.get(`SELECT id, enrollment_id, name, email, password FROM users WHERE email = 'priyanshu051sharma@gmail.com'`, (err, row) => {
    if (err) {
      console.error('Error:', err);
      db.close();
      process.exit(1);
    }
    
    if (row) {
      console.log('\n═══════════════════════════════════════════════════════════════');
      console.log('👤 USER PASSWORD INFORMATION');
      console.log('═══════════════════════════════════════════════════════════════\n');
      console.log(`ID: ${row.id}`);
      console.log(`Enrollment ID: ${row.enrollment_id}`);
      console.log(`Name: ${row.name}`);
      console.log(`Email: ${row.email}`);
      console.log(`Password: ${row.password}`);
      console.log('\n═══════════════════════════════════════════════════════════════\n');
    } else {
      console.log('\nNo user found with that email address.');
    }
    
    db.close();
  });
});
