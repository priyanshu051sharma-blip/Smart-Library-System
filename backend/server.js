require('dotenv').config();
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const multer = require('multer');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const app = express();
const PORT = 5000;

// Email Configuration (using Gmail - enable 2-factor auth and generate app password)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// Function to send OTP via email
async function sendOTPEmail(email, otp, userName) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: email,
      subject: '📚 Smart Library - Your OTP for Login',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1>📚 Smart Library System</h1>
            <p>Two-Factor Authentication</p>
          </div>
          <div style="padding: 30px; background: white; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
            <p>Dear <strong>${userName}</strong>,</p>
            <p>Your One-Time Password (OTP) for Smart Library login is:</p>
            <div style="background: #f0f0f0; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
              <h2 style="color: #667eea; letter-spacing: 5px; margin: 0;">${otp}</h2>
              <p style="color: #666; margin: 10px 0 0 0;">Valid for 5 minutes</p>
            </div>
            <p style="color: #666;">This OTP is for your security. Do not share it with anyone.</p>
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
            <p style="color: #999; font-size: 12px; text-align: center;">If you didn't request this OTP, please ignore this email.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('OTP email sent to:', email);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// Function to compare book cover images (base64 encoded)
function compareBookCovers(capturedImage, databaseImage) {
  try {
    if (!capturedImage || !databaseImage) {
      return { match: false, similarity: 0, reason: 'Missing image data' };
    }

    // Remove base64 prefix if present
    const capturedClean = capturedImage.replace(/^data:image\/[a-z]+;base64,/, '');
    const databaseClean = databaseImage.replace(/^data:image\/[a-z]+;base64,/, '');

    // Basic comparison: if images are identical, return 100% match
    if (capturedClean === databaseClean) {
      return { match: true, similarity: 100, reason: 'Exact match' };
    }

    // For partial match, compare image data hashes
    const crypto = require('crypto');
    const capturedHash = crypto.createHash('md5').update(capturedClean).digest('hex');
    const databaseHash = crypto.createHash('md5').update(databaseClean).digest('hex');

    // Calculate similarity based on hash similarity and image data length ratio
    const lengthRatio = Math.min(capturedClean.length, databaseClean.length) / 
                        Math.max(capturedClean.length, databaseClean.length);
    
    // If hashes match, 100% similarity
    if (capturedHash === databaseHash) {
      return { match: true, similarity: 100, reason: 'Hash match' };
    }

    // If lengths are similar (within 20%), consider it a partial match (60-80%)
    const similarity = Math.round(lengthRatio * 100 * 0.8); // Adjust similarity calculation

    return {
      match: similarity >= 70,
      similarity: similarity,
      reason: similarity >= 70 ? 'Similar cover detected' : 'Cover mismatch'
    };
  } catch (err) {
    console.error('Error comparing covers:', err);
    return { match: false, similarity: 0, reason: 'Comparison error' };
  }
}

// Middleware
app.use(cors({
  origin: ['http://localhost:8000', 'http://localhost:3000', 'http://127.0.0.1:8000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Initialize SQLite Database
const dbPath = path.join(__dirname, 'library.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database schema and sample data
function initializeDatabase() {
  // Create users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      enrollment_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      phone TEXT,
      image LONGBLOB,
      facial_data TEXT,
      two_fa_enabled BOOLEAN DEFAULT 1,
      otp_code TEXT,
      otp_expiry INTEGER,
      barcode_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating table:', err);
    } else {
      console.log('Users table created/verified');
      createBooksTable();
    }
  });
}

// Create books table for library inventory
function createBooksTable() {
  db.run(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      isbn TEXT UNIQUE,
      barcode TEXT UNIQUE NOT NULL,
      quantity INTEGER DEFAULT 0,
      available INTEGER DEFAULT 0,
      category TEXT,
      cover_image LONGBLOB,
      cover_image_base64 TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating books table:', err);
    } else {
      console.log('Books table created/verified');
      createBorrowedBooksTable();
    }
  });
}

// Create borrowed books tracking table
function createBorrowedBooksTable() {
  db.run(`
    CREATE TABLE IF NOT EXISTS borrowed_books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      book_id INTEGER NOT NULL,
      book_barcode TEXT NOT NULL,
      cover_image_base64 TEXT,
      issued_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      due_date DATETIME NOT NULL,
      return_date DATETIME,
      return_cover_image_base64 TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (book_id) REFERENCES books(id)
    )
  `, (err) => {
    if (err) {
      console.error('Error creating borrowed_books table:', err);
    } else {
      console.log('Borrowed books table created/verified');
      createBorrowingTable();
    }
  });
}

// Create borrowing history table
function createBorrowingTable() {
  db.run(`
    CREATE TABLE IF NOT EXISTS borrowing (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      book_id INTEGER NOT NULL,
      book_barcode TEXT,
      cover_image LONGBLOB,
      borrow_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      due_date DATETIME,
      return_date DATETIME,
      return_cover_image LONGBLOB,
      status TEXT DEFAULT 'active',
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (book_id) REFERENCES books(id)
    )
  `, (err) => {
    if (err) {
      console.error('Error creating borrowing table:', err);
    } else {
      console.log('Borrowing table created/verified');
      insertSampleData();
    }
  });
}

// Insert sample data
function insertSampleData() {
  const sampleUsers = [
    {
      enrollment_id: 'ENR001',
      name: 'Priyanshu Sharma',
      email: 'priyanshu.sharma24@st.niituniversity.in',
      phone: '9876543210',
      password: 'Password@123'
    },
    {
      enrollment_id: 'ENR002',
      name: 'Rajesh Kumar',
      email: 'rajesh.kumar@st.niituniversity.in',
      phone: '9876543211',
      password: 'Password@123'
    },
    {
      enrollment_id: 'ENR003',
      name: 'Sneha Patel',
      email: 'sneha.patel@st.niituniversity.in',
      phone: '9876543212',
      password: 'Password@123'
    },
    {
      enrollment_id: 'ENR004',
      name: 'Aditya Singh',
      email: 'aditya.singh@st.niituniversity.in',
      phone: '9876543213',
      password: 'Password@123'
    },
    {
      enrollment_id: 'ENR005',
      name: 'Priya Verma',
      email: 'priya.verma@st.niituniversity.in',
      phone: '9876543214',
      password: 'Password@123'
    }
  ];

  // Insert users one by one
  sampleUsers.forEach((user, index) => {
    // Hash password
    const hashedPassword = bcrypt.hashSync(user.password, 10);
    
    db.run(
      `INSERT OR IGNORE INTO users (enrollment_id, name, email, phone, password, barcode_id) VALUES (?, ?, ?, ?, ?, ?)`,
      [user.enrollment_id, user.name, user.email, user.phone, hashedPassword, 'BOOK' + user.enrollment_id],
      function(err) {
        if (err && err.code !== 'SQLITE_CONSTRAINT') {
          console.error('Error inserting user:', err);
        }
      }
    );
  });

  // Insert sample books with random cover images
  const sampleBooks = [
    { 
      title: 'The Great Gatsby', 
      author: 'F. Scott Fitzgerald', 
      isbn: 'ISBN001', 
      barcode: 'BAR001001', 
      quantity: 5, 
      available: 5, 
      category: 'Fiction',
      color: '#FFB6C1'
    },
    { 
      title: 'To Kill a Mockingbird', 
      author: 'Harper Lee', 
      isbn: 'ISBN002', 
      barcode: 'BAR001002', 
      quantity: 3, 
      available: 2, 
      category: 'Fiction',
      color: '#87CEEB'
    },
    { 
      title: 'Introduction to Algorithms', 
      author: 'Cormen & Leiserson', 
      isbn: 'ISBN003', 
      barcode: 'BAR001003', 
      quantity: 4, 
      available: 3, 
      category: 'Technical',
      color: '#90EE90'
    },
    { 
      title: 'Clean Code', 
      author: 'Robert C. Martin', 
      isbn: 'ISBN004', 
      barcode: 'BAR001004', 
      quantity: 2, 
      available: 1, 
      category: 'Technical',
      color: '#FFD700'
    },
    { 
      title: '1984', 
      author: 'George Orwell', 
      isbn: 'ISBN005', 
      barcode: 'BAR001005', 
      quantity: 4, 
      available: 4, 
      category: 'Fiction',
      color: '#D3D3D3'
    },
    { 
      title: 'Atomic Habits', 
      author: 'James Clear', 
      isbn: 'ISBN006', 
      barcode: 'BAR001006', 
      quantity: 3, 
      available: 3, 
      category: 'Self-Help',
      color: '#FFA500'
    },
    { 
      title: 'The Catcher in the Rye', 
      author: 'J.D. Salinger', 
      isbn: 'ISBN007', 
      barcode: 'BAR001007', 
      quantity: 2, 
      available: 2, 
      category: 'Fiction',
      color: '#DDA0DD'
    },
    { 
      title: 'Design Patterns', 
      author: 'Gang of Four', 
      isbn: 'ISBN008', 
      barcode: 'BAR001008', 
      quantity: 3, 
      available: 2, 
      category: 'Technical',
      color: '#00CED1'
    },
    { 
      title: 'The Hobbit', 
      author: 'J.R.R. Tolkien', 
      isbn: 'ISBN009', 
      barcode: 'BAR001009', 
      quantity: 4, 
      available: 4, 
      category: 'Fantasy',
      color: '#F08080'
    },
    { 
      title: 'Python Crash Course', 
      author: 'Eric Matthes', 
      isbn: 'ISBN010', 
      barcode: 'BAR001010', 
      quantity: 2, 
      available: 2, 
      category: 'Technical',
      color: '#20B2AA'
    }
  ];

  // Function to create a simple placeholder cover image as SVG base64
  function generateCoverImage(title, author, color) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
          <stop offset="100%" style="stop-color:#333;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="200" height="300" fill="url(#grad)"/>
      <rect x="10" y="10" width="180" height="280" fill="none" stroke="white" stroke-width="2"/>
      <text x="100" y="80" font-family="Arial" font-size="18" font-weight="bold" fill="white" text-anchor="middle" word-spacing="999">
        <tspan x="100" dy="0">${title.substring(0, 20)}</tspan>
        <tspan x="100" dy="30">${title.substring(20, 40)}</tspan>
      </text>
      <line x1="20" y1="120" x2="180" y2="120" stroke="white" stroke-width="1"/>
      <text x="100" y="200" font-family="Arial" font-size="14" fill="white" text-anchor="middle">
        ${author.substring(0, 20)}
      </text>
      <circle cx="100" cy="250" r="15" fill="white" opacity="0.3"/>
    </svg>`;
    return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
  }

  sampleBooks.forEach((book) => {
    const coverImage = generateCoverImage(book.title, book.author, book.color);
    db.run(
      `INSERT OR IGNORE INTO books (title, author, isbn, barcode, quantity, available, category, cover_image_base64) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [book.title, book.author, book.isbn, book.barcode, book.quantity, book.available, book.category, coverImage]
    );
  });
}

// Routes

// Helper function to generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Login endpoint - Email + Password verification (Step 1 of 2FA)
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.get(
    `SELECT * FROM users WHERE email = ?`,
    [email],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (row) {
        // Verify password
        const passwordMatch = bcrypt.compareSync(password, row.password);
        if (!passwordMatch) {
          return res.status(401).json({
            success: false,
            message: 'Invalid password'
          });
        }

        // Password verified - now user needs facial recognition
        return res.status(200).json({
          success: true,
          message: 'Password verified. Proceed to facial recognition.',
          user_id: row.id,
          enrollment_id: row.enrollment_id,
          name: row.name,
          email: row.email
        });
      } else {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }
    }
  );
});

// User Registration endpoint
app.post('/api/register', (req, res) => {
  const { email, password, name, enrollment_id, facial_descriptor, facial_data, image } = req.body;

  if (!email || !password || !name || !facial_descriptor) {
    return res.status(400).json({ error: 'Email, password, name, and facial descriptor are required' });
  }

  // Check if user already exists
  db.get(
    `SELECT id FROM users WHERE email = ?`,
    [email],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (row) {
        return res.status(409).json({ success: false, message: 'Email already registered' });
      }

      // Hash password
      const hashedPassword = bcrypt.hashSync(password, 10);

      // Store facial descriptor directly (array of 128 values from Face-API)
      const facialDataJSON = {
        descriptor: facial_descriptor,  // Store the real descriptor from Face-API
        timestamp: Date.now(),
        version: '1.0'  // For future updates
      };

      // Insert new user
      db.run(
        `INSERT INTO users (name, email, password, enrollment_id, facial_data, image) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [name, email, hashedPassword, enrollment_id || null, JSON.stringify(facialDataJSON), image ? Buffer.from(image, 'base64') : null],
        function(insertErr) {
          if (insertErr) {
            return res.status(500).json({ error: 'Registration failed', details: insertErr.message });
          }

          console.log(`✓ New user registered: ${name} (${email})`);

          return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user_id: this.lastID,
            email: email,
            name: name
          });
        }
      );
    }
  );
});

// Verify facial recognition for login - Step 2: Facial verification
app.post('/api/verify-otp', (req, res) => {
  const { user_id, facial_descriptor, facial_data } = req.body;

  console.log(`\n🔐 ======== FACIAL VERIFICATION REQUEST ========`);
  console.log(`   User ID: ${user_id}`);
  console.log(`   Facial Descriptor: ${facial_descriptor ? (Array.isArray(facial_descriptor) ? facial_descriptor.length + 'D array' : typeof facial_descriptor) : 'null'}`);

  if (!user_id) {
    console.error('❌ Missing user_id');
    return res.status(400).json({ error: 'User ID is required' });
  }

  if (!facial_descriptor) {
    console.error('❌ Missing facial_descriptor');
    return res.status(400).json({ error: 'Facial descriptor is required' });
  }

  if (!Array.isArray(facial_descriptor)) {
    console.error(`❌ Facial descriptor is not an array, got: ${typeof facial_descriptor}`);
    return res.status(400).json({ error: 'Facial descriptor must be an array' });
  }

  if (facial_descriptor.length !== 128) {
    console.error(`❌ Facial descriptor wrong size: ${facial_descriptor.length}D instead of 128D`);
    return res.status(400).json({ error: `Invalid facial descriptor size: ${facial_descriptor.length}D (expected 128D)` });
  }

  db.get(
    `SELECT * FROM users WHERE id = ?`,
    [user_id],
    (err, row) => {
      if (err) {
        console.error('DB Error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      if (!row) {
        console.error(`❌ User not found: ${user_id}`);
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      // Check if facial data is registered
      if (!row.facial_data) {
        console.log('❌ No facial data for user:', user_id);
        return res.status(400).json({ success: false, message: 'Facial data not registered. Please register first.' });
      }

      try {
        // Parse stored facial data
        const storedData = JSON.parse(row.facial_data);
        const storedDescriptor = storedData.descriptor;

        console.log(`📊 Descriptor validation:`);
        console.log(`   Stored: ${Array.isArray(storedDescriptor) ? storedDescriptor.length + 'D' : 'invalid'}`);
        console.log(`   Captured: ${Array.isArray(facial_descriptor) ? facial_descriptor.length + 'D' : 'invalid'}`);

        if (!Array.isArray(storedDescriptor) || storedDescriptor.length !== 128) {
          console.error(`❌ Stored descriptor invalid. Expected 128D, got ${Array.isArray(storedDescriptor) ? storedDescriptor.length + 'D' : 'not array'}`);
          return res.status(400).json({ success: false, message: 'Invalid stored facial data. User must re-register with correct facial capture.' });
        }

        if (!Array.isArray(facial_descriptor) || facial_descriptor.length !== 128) {
          console.error(`❌ Incoming descriptor invalid. Expected 128D, got ${Array.isArray(facial_descriptor) ? facial_descriptor.length + 'D' : 'not array'}`);
          return res.status(400).json({ success: false, message: 'Invalid facial descriptor from capture. Please capture your face again.' });
        }

        // Calculate Euclidean distance between descriptors
        const similarity = calculateDescriptorSimilarity(storedDescriptor, facial_descriptor);
        
        console.log(`🔍 Facial verification - User: ${row.name}`);
        console.log(`   Similarity: ${(similarity * 100).toFixed(2)}% (Threshold: 70%)`);
        console.log(`   Stored: [${Array.from(storedDescriptor).slice(0, 3).map(v => v.toFixed(3)).join(', ')}...]`);
        console.log(`   Captured: [${Array.from(facial_descriptor).slice(0, 3).map(v => v.toFixed(3)).join(', ')}...]`);
        
        // STRICT: Only accept if similarity > 70% (higher threshold due to proper normalization)
        const THRESHOLD = 0.7;
        const matched = similarity > THRESHOLD;

        if (!matched) {
          console.log(`❌ REJECTED - Similarity ${(similarity * 100).toFixed(2)}% < 70% threshold`);
          console.log(`🔐 ======== END FACIAL VERIFICATION (FAILED) ========\n`);
          return res.status(401).json({ 
            success: false, 
            message: `Facial recognition failed. Similarity: ${(similarity * 100).toFixed(1)}% (requires 70%+). This is a different face.`,
            similarity: similarity
          });
        }

        console.log(`✅ ACCEPTED - Similarity ${(similarity * 100).toFixed(2)}% >= 70% threshold`);

        // Facial recognition successful - return user data
        const userData = {
          id: row.id,
          enrollment_id: row.enrollment_id,
          name: row.name,
          email: row.email,
          image: row.image ? row.image.toString('base64') : null
        };

        console.log(`🔐 ======== END FACIAL VERIFICATION (SUCCESSFUL) ========\n`);
        return res.status(200).json({
          success: true,
          message: 'Login successful',
          user: userData,
          similarity: similarity
        });
      } catch (parseErr) {
        console.error('Facial verification error:', parseErr.message);
        console.log(`🔐 ======== END FACIAL VERIFICATION (ERROR) ========\n`);
        return res.status(400).json({ 
          success: false, 
          message: 'Facial data verification error: ' + parseErr.message 
        });
      }
    }
  );
});

// Get all users
app.get('/api/users', (req, res) => {
  db.all(`SELECT id, enrollment_id, name, email, created_at FROM users`, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Get user by enrollment ID
app.get('/api/users/:enrollment_id', (req, res) => {
  const { enrollment_id } = req.params;

  db.get(
    `SELECT * FROM users WHERE enrollment_id = ?`,
    [enrollment_id],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (row) {
        const userData = {
          id: row.id,
          enrollment_id: row.enrollment_id,
          name: row.name,
          email: row.email,
          image: row.image ? row.image.toString('base64') : null
        };
        res.json(userData);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    }
  );
});

// Upload image endpoint
app.post('/api/upload-image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({ 
    success: true, 
    filename: req.file.filename,
    path: `/uploads/${req.file.filename}`
  });
});

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Get all books
app.get('/api/books', (req, res) => {
  db.all(`SELECT * FROM books`, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Get book by ID
app.get('/api/books/:id', (req, res) => {
  const { id } = req.params;

  db.get(`SELECT * FROM books WHERE id = ?`, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (row) {
      res.json(row);
    } else {
      res.status(404).json({ error: 'Book not found' });
    }
  });
});

// Get user's borrowed books
app.get('/api/borrowing/:user_id', (req, res) => {
  const { user_id } = req.params;

  db.all(
    `SELECT b.id, b.title, b.author, b.isbn, bor.borrow_date, bor.due_date, bor.return_date, bor.status
     FROM borrowing bor
     JOIN books b ON bor.book_id = b.id
     WHERE bor.user_id = ?
     ORDER BY bor.borrow_date DESC`,
    [user_id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(rows);
    }
  );
});

// Store facial recognition data
app.post('/api/facial-recognition', (req, res) => {
  const { user_id, facial_data } = req.body;

  if (!user_id || !facial_data) {
    return res.status(400).json({ error: 'User ID and facial data are required' });
  }

  db.run(
    `UPDATE users SET facial_data = ? WHERE id = ?`,
    [facial_data, user_id],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to store facial data' });
      }
      res.json({ success: true, message: 'Facial recognition data stored' });
    }
  );
});

// Verify facial recognition
app.post('/api/verify-facial', (req, res) => {
  const { user_id, facial_data } = req.body;

  if (!user_id || !facial_data) {
    return res.status(400).json({ error: 'User ID and facial data are required' });
  }

  db.get(
    `SELECT facial_data FROM users WHERE id = ?`,
    [user_id],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!row || !row.facial_data) {
        return res.status(400).json({ success: false, message: 'Facial data not registered' });
      }

      // Simple similarity check (in production, use proper ML model)
      const storedData = JSON.parse(row.facial_data);
      const newData = JSON.parse(facial_data);
      
      const similarity = calculateSimilarity(storedData, newData);
      const matched = similarity > 0.7; // 70% threshold

      res.json({
        success: matched,
        message: matched ? 'Facial recognition successful' : 'Facial recognition failed',
        similarity: similarity
      });
    }
  );
});

// Helper function to calculate Euclidean distance between facial descriptors
function calculateDescriptorSimilarity(descriptor1, descriptor2) {
  if (!Array.isArray(descriptor1) || !Array.isArray(descriptor2)) {
    console.error('Invalid descriptor format');
    return 0;
  }

  // Both must be 128D
  if (descriptor1.length !== 128 || descriptor2.length !== 128) {
    console.error(`Descriptor size mismatch: ${descriptor1.length}D vs ${descriptor2.length}D`);
    return 0;
  }

  let sumSquaredDifferences = 0;

  for (let i = 0; i < 128; i++) {
    const d1 = descriptor1[i] || 0;
    const d2 = descriptor2[i] || 0;
    const diff = d1 - d2;
    sumSquaredDifferences += diff * diff;
  }

  // Euclidean distance for 128D vectors
  const euclideanDistance = Math.sqrt(sumSquaredDifferences);
  
  // PROPER FORMULA for Face-API descriptors:
  // Face-API outputs 128D unit-normalized vectors (L2 norm = 1)
  // For unit vectors, max distance is sqrt(2) ≈ 1.414
  // Similarity = 1 - (distance / max_distance)
  // This ensures:
  // - Identical vectors: distance = 0, similarity = 100%
  // - Opposite vectors: distance = sqrt(2), similarity = 0%
  // - Same person: distance ≈ 0.3-0.5, similarity ≈ 70-80%
  // - Different person: distance ≈ 1.0+, similarity < 30%
  const MAX_DISTANCE = Math.sqrt(2); // Maximum distance for unit vectors
  const similarity = Math.max(0, Math.min(1, 1 - (euclideanDistance / MAX_DISTANCE)));
  
  return similarity;
}

// Helper function to calculate facial data similarity (deprecated - kept for reference)
function calculateSimilarity(data1, data2) {
  if (!data1 || !data2) return 0;
  
  // Extract descriptors if available
  const desc1 = data1.descriptor || data1;
  const desc2 = data2.descriptor || data2;
  
  if (!Array.isArray(desc1) || !Array.isArray(desc2)) {
    return 0;
  }
  
  return calculateDescriptorSimilarity(desc1, desc2);
}

// Borrow a book with barcode and cover page scanning
app.post('/api/borrow-with-scan', (req, res) => {
  const { user_id, book_id, barcode, cover_image } = req.body;

  if (!user_id || !book_id || !barcode) {
    return res.status(400).json({ error: 'User ID, Book ID, and barcode are required' });
  }

  // Check if book is available
  db.get(`SELECT available FROM books WHERE id = ?`, [book_id], (err, book) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!book || book.available <= 0) {
      return res.status(400).json({ error: 'Book not available' });
    }

    // Calculate due date (14 days from now)
    const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    // Create borrowing record with barcode and cover image
    db.run(
      `INSERT INTO borrowing (user_id, book_id, book_barcode, cover_image, due_date, status) VALUES (?, ?, ?, ?, ?, 'active')`,
      [user_id, book_id, barcode, cover_image, dueDate.toISOString()],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to borrow book' });
        }

        // Decrease available count
        db.run(
          `UPDATE books SET available = available - 1 WHERE id = ?`,
          [book_id],
          (updateErr) => {
            if (updateErr) {
              return res.status(500).json({ error: 'Failed to update inventory' });
            }

            res.json({
              success: true,
              message: 'Book borrowed successfully with barcode scan',
              due_date: dueDate.toISOString()
            });
          }
        );
      }
    );
  });
});

// Return a book with cover page scanning
app.post('/api/return-book-with-scan', (req, res) => {
  const { borrowing_id, return_cover_image } = req.body;

  if (!borrowing_id) {
    return res.status(400).json({ error: 'Borrowing ID is required' });
  }

  // Get borrowing record to find book_id
  db.get(
    `SELECT book_id FROM borrowing WHERE id = ?`,
    [borrowing_id],
    (err, record) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!record) {
        return res.status(404).json({ error: 'Borrowing record not found' });
      }

      // Update borrowing record with return cover image
      db.run(
        `UPDATE borrowing SET return_date = CURRENT_TIMESTAMP, return_cover_image = ?, status = 'returned' WHERE id = ?`,
        [return_cover_image, borrowing_id],
        (updateErr) => {
          if (updateErr) {
            return res.status(500).json({ error: 'Failed to return book' });
          }

          // Increase available count
          db.run(
            `UPDATE books SET available = available + 1 WHERE id = ?`,
            [record.book_id],
            (inventoryErr) => {
              if (inventoryErr) {
                return res.status(500).json({ error: 'Failed to update inventory' });
              }

              res.json({
                success: true,
                message: 'Book returned successfully with cover scan'
              });
            }
          );
        }
      );
    }
  );
});

// Borrow a book
app.post('/api/borrow', (req, res) => {
  const { user_id, book_id } = req.body;

  if (!user_id || !book_id) {
    return res.status(400).json({ error: 'User ID and Book ID are required' });
  }

  // Check if book is available
  db.get(`SELECT available FROM books WHERE id = ?`, [book_id], (err, book) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!book || book.available <= 0) {
      return res.status(400).json({ error: 'Book not available' });
    }

    // Calculate due date (14 days from now)
    const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    // Create borrowing record
    db.run(
      `INSERT INTO borrowing (user_id, book_id, due_date, status) VALUES (?, ?, ?, 'active')`,
      [user_id, book_id, dueDate.toISOString()],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to borrow book' });
        }

        // Decrease available count
        db.run(
          `UPDATE books SET available = available - 1 WHERE id = ?`,
          [book_id],
          (updateErr) => {
            if (updateErr) {
              return res.status(500).json({ error: 'Failed to update inventory' });
            }

            res.json({
              success: true,
              message: 'Book borrowed successfully',
              due_date: dueDate.toISOString()
            });
          }
        );
      }
    );
  });
});

// Return a book
app.post('/api/return-book', (req, res) => {
  const { borrowing_id } = req.body;

  if (!borrowing_id) {
    return res.status(400).json({ error: 'Borrowing ID is required' });
  }

  // Get borrowing record to find book_id
  db.get(
    `SELECT book_id FROM borrowing WHERE id = ?`,
    [borrowing_id],
    (err, record) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!record) {
        return res.status(404).json({ error: 'Borrowing record not found' });
      }

      // Update borrowing record
      db.run(
        `UPDATE borrowing SET return_date = CURRENT_TIMESTAMP, status = 'returned' WHERE id = ?`,
        [borrowing_id],
        (updateErr) => {
          if (updateErr) {
            return res.status(500).json({ error: 'Failed to return book' });
          }

          // Increase available count
          db.run(
            `UPDATE books SET available = available + 1 WHERE id = ?`,
            [record.book_id],
            (inventoryErr) => {
              if (inventoryErr) {
                return res.status(500).json({ error: 'Failed to update inventory' });
              }

              res.json({
                success: true,
                message: 'Book returned successfully'
              });
            }
          );
        }
      );
    }
  );
});

// Admin endpoint to add Priyanshu's account (temporary setup endpoint)
app.post('/api/admin/add-priyanshu', (req, res) => {
  const name = 'Priyanshu Sharma';
  const email = 'priyanshu.sharma24@st.niituniversity.in';
  const password = bcrypt.hashSync('priyanshu123', 10);
  const enrollment_id = null;
  
  // Check if user already exists
  db.get(`SELECT id FROM users WHERE email = ?`, [email], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (row) {
      return res.status(409).json({ success: false, message: 'User already exists' });
    }

    // Create facial data from default image (you can update with real photo later)
    const defaultFacialData = JSON.stringify({
      descriptor: Array(128).fill(0.5),
      age: 20,
      gender: 'male',
      expressions: { neutral: 0.9 }
    });

    // Insert new user
    db.run(
      `INSERT INTO users (name, email, password, enrollment_id, facial_data) 
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, password, enrollment_id, defaultFacialData],
      function(insertErr) {
        if (insertErr) {
          return res.status(500).json({ error: 'Failed to create user' });
        }

        res.status(201).json({
          success: true,
          message: 'Priyanshu Sharma account created successfully',
          user_id: this.lastID,
          name: name,
          email: email,
          note: 'Default facial data assigned. Update with real photo when available.'
        });
      }
    );
  });
});

// Update user facial descriptor by email
app.post('/api/update-user-facial', (req, res) => {
  const { email, facial_descriptor } = req.body;

  if (!email || !facial_descriptor) {
    return res.status(400).json({ success: false, message: 'Email and facial descriptor are required' });
  }

  if (!Array.isArray(facial_descriptor) || facial_descriptor.length !== 128) {
    return res.status(400).json({ success: false, message: 'Invalid facial descriptor. Must be 128D array' });
  }

  try {
    const facialData = JSON.stringify({
      descriptor: facial_descriptor,
      timestamp: new Date().toISOString(),
      version: '1.0'
    });

    db.run(
      `UPDATE users SET facial_data = ? WHERE email = ?`,
      [facialData, email],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (this.changes === 0) {
          return res.status(404).json({ success: false, message: 'User not found' });
        }

        console.log(`✅ Facial descriptor updated for ${email}`);
        res.json({ 
          success: true, 
          message: `Facial descriptor updated successfully for ${email}`,
          descriptor_length: facial_descriptor.length,
          descriptor_sample: facial_descriptor.slice(0, 5)
        });
      }
    );
  } catch (error) {
    console.error('Error updating facial descriptor:', error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

// ============= BOOK MANAGEMENT ENDPOINTS =============

// Get all available books
app.get('/api/books-available', (req, res) => {
  db.all(
    `SELECT id, title, author, isbn, barcode, category, available, cover_image_base64 
     FROM books WHERE available > 0 ORDER BY title ASC`,
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error', details: err.message });
      }
      res.json({ success: true, books: rows || [] });
    }
  );
});

// Get book by barcode (for verification during issue/return)
app.get('/api/book-by-barcode/:barcode', (req, res) => {
  const { barcode } = req.params;
  
  db.get(
    `SELECT id, title, author, isbn, barcode, category, available, cover_image_base64 FROM books WHERE barcode = ?`,
    [barcode],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!row) {
        return res.status(404).json({ success: false, message: 'Book not found' });
      }
      res.json({ success: true, book: row });
    }
  );
});

// Issue a book to user (with barcode and cover page verification)
app.post('/api/issue-book', (req, res) => {
  const { user_id, book_id, book_barcode, cover_image_base64 } = req.body;
  
  if (!user_id || !book_id || !book_barcode) {
    return res.status(400).json({ success: false, message: 'User ID, Book ID, and barcode required' });
  }

  // Verify book exists and has the matching barcode
  db.get(
    `SELECT id, title, barcode, available, cover_image_base64 FROM books WHERE id = ? AND barcode = ?`,
    [book_id, book_barcode],
    (err, book) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      
      if (!book) {
        return res.status(400).json({ success: false, message: 'Book barcode verification failed' });
      }

      if (book.available <= 0) {
        return res.status(400).json({ success: false, message: 'Book is not available' });
      }

      // Verify cover image matches database
      let coverVerification = { match: true, similarity: 100, reason: 'No database cover to verify' };
      if (cover_image_base64 && book.cover_image_base64) {
        coverVerification = compareBookCovers(cover_image_base64, book.cover_image_base64);
      }

      // If cover match is critical, you can enforce it:
      // if (!coverVerification.match) {
      //   return res.status(400).json({ success: false, message: `Cover verification failed (${coverVerification.similarity}% match)`, verification: coverVerification });
      // }

      // Calculate issue date and due date (14 days)
      const issuedDate = new Date();
      const dueDate = new Date(issuedDate.getTime() + 14 * 24 * 60 * 60 * 1000);

      // Get user details for email
      db.get(`SELECT name, email FROM users WHERE id = ?`, [user_id], (err, user) => {
        if (err || !user) {
          return res.status(500).json({ success: false, message: 'Failed to retrieve user details' });
        }

        // Insert into borrowed_books table
        db.run(
          `INSERT INTO borrowed_books (user_id, book_id, book_barcode, cover_image_base64, issued_date, due_date, status)
           VALUES (?, ?, ?, ?, ?, ?, 'active')`,
          [user_id, book_id, book_barcode, cover_image_base64, issuedDate.toISOString(), dueDate.toISOString()],
          function(insertErr) {
            if (insertErr) {
              return res.status(500).json({ success: false, message: 'Failed to issue book' });
            }

            // Update book availability
            db.run(
              `UPDATE books SET available = available - 1 WHERE id = ?`,
              [book_id],
              (updateErr) => {
                if (updateErr) {
                  return res.status(500).json({ success: false, message: 'Failed to update inventory' });
                }

                // Send email notification
                const issueDateTime = issuedDate.toLocaleString('en-IN', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit',
                  second: '2-digit'
                });
                const dueDateStr = dueDate.toLocaleString('en-IN', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric'
                });

                const emailContent = `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                      <h1>📚 Smart Library System</h1>
                      <p>Book Issue Confirmation</p>
                    </div>
                    <div style="padding: 30px; background: white; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
                      <p>Dear <strong>${user.name}</strong>,</p>
                      <p>Your book has been successfully issued. Here are the details:</p>
                      <div style="background: #f0f0f0; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea;">
                        <p><strong>📕 Book Title:</strong> ${book.title}</p>
                        <p><strong>📅 Issue Date & Time:</strong> ${issueDateTime}</p>
                        <p><strong>📆 Due Date:</strong> ${dueDateStr}</p>
                        <p><strong>🔖 Barcode:</strong> ${book.barcode}</p>
                      </div>
                      <p style="color: #666;">Please return the book by the due date to avoid any penalties.</p>
                      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                      <p style="color: #999; font-size: 12px; text-align: center;">Smart Library System © 2025</p>
                    </div>
                  </div>
                `;

                const mailOptions = {
                  from: process.env.EMAIL_USER || 'your-email@gmail.com',
                  to: user.email,
                  subject: `📚 Book Issued: ${book.title}`,
                  html: emailContent
                };

                transporter.sendMail(mailOptions, (emailErr) => {
                  if (emailErr) {
                    console.error('Error sending issue email:', emailErr);
                  } else {
                    console.log('Issue notification email sent to:', user.email);
                  }
                });

                res.json({
                  success: true,
                  message: 'Book issued successfully',
                  borrowing_id: this.lastID,
                  book_title: book.title,
                  issued_date: issuedDate.toISOString().split('T')[0],
                  due_date: dueDate.toISOString().split('T')[0],
                  cover_verification: coverVerification
                });
              }
            );
          }
        );
      });
    }
  );
});

// Get user's borrowed books
app.get('/api/borrowed-books/:user_id', (req, res) => {
  const { user_id } = req.params;
  
  db.all(
    `SELECT bb.id, bb.book_id, bb.book_barcode, bb.issued_date, bb.due_date, bb.return_date, bb.status,
            b.title, b.author, b.category, b.cover_image_base64
     FROM borrowed_books bb
     JOIN books b ON bb.book_id = b.id
     WHERE bb.user_id = ? AND bb.status IN ('active', 'reissued')
     ORDER BY bb.issued_date DESC`,
    [user_id],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ success: true, borrowed_books: rows || [] });
    }
  );
});

// Return a borrowed book (with barcode and cover verification)
app.post('/api/return-book-new', (req, res) => {
  const { borrowing_id, book_barcode, return_cover_image_base64 } = req.body;
  
  if (!borrowing_id || !book_barcode) {
    return res.status(400).json({ success: false, message: 'Borrowing ID and barcode required' });
  }

  db.get(
    `SELECT bb.id, bb.book_id, bb.user_id, bb.book_barcode, bb.cover_image_base64, b.cover_image_base64 as db_cover, b.title
     FROM borrowed_books bb
     JOIN books b ON bb.book_id = b.id
     WHERE bb.id = ? AND bb.status IN ('active', 'reissued')`,
    [borrowing_id],
    (err, record) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      
      if (!record) {
        return res.status(400).json({ success: false, message: 'Borrowing record not found' });
      }

      if (record.book_barcode !== book_barcode) {
        return res.status(400).json({ success: false, message: 'Book barcode verification failed' });
      }

      // Verify return cover image matches original issue cover image
      let coverVerification = { match: true, similarity: 100, reason: 'No database cover to verify' };
      if (return_cover_image_base64 && record.cover_image_base64) {
        coverVerification = compareBookCovers(return_cover_image_base64, record.cover_image_base64);
      }

      // If cover match is critical, you can enforce it:
      // if (!coverVerification.match) {
      //   return res.status(400).json({ success: false, message: `Return cover verification failed (${coverVerification.similarity}% match)`, verification: coverVerification });
      // }

      const returnDate = new Date().toISOString();

      // Get user details for email
      db.get(`SELECT name, email FROM users WHERE id = ?`, [record.user_id], (err, user) => {
        if (err || !user) {
          return res.status(500).json({ success: false, message: 'Failed to retrieve user details' });
        }

        // Update borrowed_books record
        db.run(
          `UPDATE borrowed_books SET return_date = ?, return_cover_image_base64 = ?, status = 'returned' 
           WHERE id = ?`,
          [returnDate, return_cover_image_base64, borrowing_id],
          (updateErr) => {
            if (updateErr) {
              return res.status(500).json({ success: false, message: 'Failed to process return' });
            }

            // Increase book availability
            db.run(
              `UPDATE books SET available = available + 1 WHERE id = ?`,
              [record.book_id],
              (availErr) => {
                if (availErr) {
                  return res.status(500).json({ success: false, message: 'Failed to update inventory' });
                }

                // Send email notification
                const returnDateTime = new Date(returnDate).toLocaleString('en-IN', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit',
                  second: '2-digit'
                });

                const emailContent = `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                      <h1>📚 Smart Library System</h1>
                      <p>Book Return Confirmation</p>
                    </div>
                    <div style="padding: 30px; background: white; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
                      <p>Dear <strong>${user.name}</strong>,</p>
                      <p>Your book has been successfully returned. Here are the details:</p>
                      <div style="background: #f0f0f0; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea;">
                        <p><strong>📕 Book Title:</strong> ${record.title}</p>
                        <p><strong>📅 Return Date & Time:</strong> ${returnDateTime}</p>
                        <p><strong>🔖 Barcode:</strong> ${record.book_barcode}</p>
                      </div>
                      <p style="color: #666;">Thank you for returning the book on time. Happy reading!</p>
                      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                      <p style="color: #999; font-size: 12px; text-align: center;">Smart Library System © 2025</p>
                    </div>
                  </div>
                `;

                const mailOptions = {
                  from: process.env.EMAIL_USER || 'your-email@gmail.com',
                  to: user.email,
                  subject: `📚 Book Returned: ${record.title}`,
                  html: emailContent
                };

                transporter.sendMail(mailOptions, (emailErr) => {
                  if (emailErr) {
                    console.error('Error sending return email:', emailErr);
                  } else {
                    console.log('Return notification email sent to:', user.email);
                  }
                });

                res.json({
                  success: true,
                  message: 'Book returned successfully',
                  return_date: returnDate.split('T')[0],
                  cover_verification: coverVerification
                });
              }
            );
          }
        );
      });
    }
  );
});

// Reissue a book (extend due date by 7 more days)
app.post('/api/reissue-book', (req, res) => {
  const { borrowing_id, book_barcode, reissue_cover_image_base64 } = req.body;
  
  if (!borrowing_id || !book_barcode) {
    return res.status(400).json({ success: false, message: 'Borrowing ID and barcode required' });
  }

  db.get(
    `SELECT bb.id, bb.due_date, bb.book_barcode, bb.cover_image_base64, bb.user_id, b.cover_image_base64 as db_cover, b.title
     FROM borrowed_books bb
     JOIN books b ON bb.book_id = b.id
     WHERE bb.id = ? AND bb.status = 'active'`,
    [borrowing_id],
    (err, record) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      
      if (!record) {
        return res.status(400).json({ success: false, message: 'Active borrowing not found' });
      }

      if (record.book_barcode !== book_barcode) {
        return res.status(400).json({ success: false, message: 'Book barcode verification failed' });
      }

      // Verify reissue cover image matches original issue cover image
      let coverVerification = { match: true, similarity: 100, reason: 'No database cover to verify' };
      if (reissue_cover_image_base64 && record.cover_image_base64) {
        coverVerification = compareBookCovers(reissue_cover_image_base64, record.cover_image_base64);
      }

      // If cover match is critical, you can enforce it:
      // if (!coverVerification.match) {
      //   return res.status(400).json({ success: false, message: `Reissue cover verification failed (${coverVerification.similarity}% match)`, verification: coverVerification });
      // }

      // Extend due date by 7 days
      const currentDue = new Date(record.due_date);
      const newDueDate = new Date(currentDue.getTime() + 7 * 24 * 60 * 60 * 1000);

      // Get user details for email
      db.get(`SELECT name, email FROM users WHERE id = ?`, [record.user_id], (err, user) => {
        if (err || !user) {
          return res.status(500).json({ success: false, message: 'Failed to retrieve user details' });
        }

        db.run(
          `UPDATE borrowed_books SET due_date = ?, status = 'reissued' WHERE id = ?`,
          [newDueDate.toISOString(), borrowing_id],
          (updateErr) => {
            if (updateErr) {
              return res.status(500).json({ success: false, message: 'Failed to reissue book' });
            }

            // Send email notification
            const reissueDateTime = new Date().toLocaleString('en-IN', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit',
              second: '2-digit'
            });
            const newDueDateStr = newDueDate.toLocaleString('en-IN', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric'
            });

            const emailContent = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                  <h1>📚 Smart Library System</h1>
                  <p>Book Reissue Confirmation</p>
                </div>
                <div style="padding: 30px; background: white; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0;">
                  <p>Dear <strong>${user.name}</strong>,</p>
                  <p>Your book has been successfully reissued. Here are the updated details:</p>
                  <div style="background: #f0f0f0; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea;">
                    <p><strong>📕 Book Title:</strong> ${record.title}</p>
                    <p><strong>📅 Reissue Date & Time:</strong> ${reissueDateTime}</p>
                    <p><strong>📆 New Due Date:</strong> ${newDueDateStr}</p>
                    <p><strong>🔖 Barcode:</strong> ${record.book_barcode}</p>
                  </div>
                  <p style="color: #666;">Your due date has been extended by 7 days. Please return the book by the new due date.</p>
                  <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                  <p style="color: #999; font-size: 12px; text-align: center;">Smart Library System © 2025</p>
                </div>
              </div>
            `;

            const mailOptions = {
              from: process.env.EMAIL_USER || 'your-email@gmail.com',
              to: user.email,
              subject: `📚 Book Reissued: ${record.title}`,
              html: emailContent
            };

            transporter.sendMail(mailOptions, (emailErr) => {
              if (emailErr) {
                console.error('Error sending reissue email:', emailErr);
              } else {
                console.log('Reissue notification email sent to:', user.email);
              }
            });

            res.json({
              success: true,
              message: 'Book reissued successfully',
              new_due_date: newDueDate.toISOString().split('T')[0],
              cover_verification: coverVerification
            });
          }
        );
      });
    }
  );
});

// Get user by ID (includes photo)
app.get('/api/user/:user_id', (req, res) => {
  const { user_id } = req.params;
  
  if (!user_id) {
    return res.status(400).json({ success: false, message: 'User ID required' });
  }

  db.get(
    `SELECT id, name, email, enrollment_id, image FROM users WHERE id = ?`,
    [user_id],
    (err, row) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      if (!row) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      res.json({
        success: true,
        user: {
          id: row.id,
          name: row.name,
          email: row.email,
          enrollment_id: row.enrollment_id,
          image: row.image ? row.image.toString('base64') : null
        }
      });
    }
  );
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});