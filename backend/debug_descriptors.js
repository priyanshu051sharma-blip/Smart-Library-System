const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./library.db');

console.log('🔍 Checking stored facial descriptors...\n');

db.all('SELECT id, name, email, facial_data FROM users', (err, rows) => {
  if (err) {
    console.error('Error:', err);
    db.close();
    return;
  }

  if (!rows || rows.length === 0) {
    console.log('❌ No users found in database');
    db.close();
    return;
  }

  rows.forEach((row, idx) => {
    console.log(`\nUser ${idx + 1}:`);
    console.log(`  ID: ${row.id}`);
    console.log(`  Name: ${row.name}`);
    console.log(`  Email: ${row.email}`);
    
    if (row.facial_data) {
      try {
        const data = JSON.parse(row.facial_data);
        if (data.descriptor && Array.isArray(data.descriptor)) {
          console.log(`  ✅ Descriptor: ${data.descriptor.length}D array`);
          console.log(`     Values: [${data.descriptor.slice(0, 5).map(v => v.toFixed(3)).join(', ')}...]`);
          console.log(`     Min: ${Math.min(...data.descriptor).toFixed(3)}, Max: ${Math.max(...data.descriptor).toFixed(3)}`);
        } else {
          console.log(`  ❌ Facial data format invalid:`, data);
        }
      } catch (e) {
        console.log(`  ❌ Error parsing facial data: ${e.message}`);
      }
    } else {
      console.log('  ❌ No facial data');
    }
  });

  db.close();
});
