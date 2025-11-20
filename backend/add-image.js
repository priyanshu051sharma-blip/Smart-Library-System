const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Path to your image - update this path
const imagePath = process.argv[2] || './priyanshu.jpg';

if (!fs.existsSync(imagePath)) {
  console.error(`Image not found at: ${imagePath}`);
  process.exit(1);
}

const db = new sqlite3.Database('library.db', (err) => {
  if (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
});

const imageData = fs.readFileSync(imagePath);

db.run(
  `UPDATE users SET image = ? WHERE email = ?`,
  [imageData, 'priyanshu.sharma24@st.niituniversity.in'],
  (err) => {
    if (err) {
      console.error('Error updating image:', err);
    } else {
      console.log('Image updated successfully for Priyanshu Sharma');
    }
    db.close();
  }
);
