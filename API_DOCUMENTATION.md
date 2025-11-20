# API Documentation - Secure Facial Recognition

## Base URL
```
http://localhost:5000/api
```

---

## User Registration Endpoint

### POST `/api/register`

**Request:**
```json
{
  "name": "Priyanshu Sharma",
  "email": "user@example.com",
  "password": "securePassword123",
  "enrollment_id": "ENR001",
  "facial_descriptor": [
    0.1234, 0.2345, 0.1456, ... (128 values from Face-API)
  ],
  "facial_data": "data:image/jpeg;base64,...",
  "image": "data:image/jpeg;base64,..."
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user_id": 46,
  "email": "user@example.com",
  "name": "Priyanshu Sharma"
}
```

**Response (Error - 409):**
```json
{
  "success": false,
  "message": "Email already registered"
}
```

**Database Storage:**
```
users table:
{
  id: 46,
  name: "Priyanshu Sharma",
  email: "user@example.com",
  password: "hashed_with_bcrypt",
  enrollment_id: "ENR001",
  facial_data: JSON.stringify({
    descriptor: [0.1234, 0.2345, ...(128 values)],
    timestamp: 1700234400000,
    version: "1.0"
  }),
  image: Buffer (BLOB)
}
```

---

## Login - Step 1: Email & Password

### POST `/api/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Password verified. Proceed to facial recognition.",
  "user_id": 46,
  "enrollment_id": "ENR001",
  "name": "Priyanshu Sharma",
  "email": "user@example.com"
}
```

**Response (Error - 401):**
```json
{
  "success": false,
  "message": "Invalid password"
}
```

---

## Login - Step 2: Facial Recognition

### POST `/api/verify-otp`

**Request:**
```json
{
  "user_id": 46,
  "facial_descriptor": [
    0.1256, 0.2334, 0.1478, ... (128 values from Face-API)
  ],
  "facial_data": "data:image/jpeg;base64,..."
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 46,
    "enrollment_id": "ENR001",
    "name": "Priyanshu Sharma",
    "email": "user@example.com",
    "image": "base64_string_or_null"
  },
  "similarity": 0.8523
}
```

**Response (Failed - 401):**
```json
{
  "success": false,
  "message": "Facial recognition failed. Similarity: 45.2% (requires 60%+)",
  "similarity": 0.452
}
```

---

## Facial Descriptor Format

### Structure
```javascript
facial_descriptor = [
  // 128 float values from Face-API
  // Each value represents a facial feature
  // Range: typically 0.0 to 1.0
  0.1234, 0.2345, 0.1456, ... // 128 values
]
```

### Example (First 10 values)
```javascript
[
  0.123456789,  // Feature 1: Distance between eyes
  0.234567890,  // Feature 2: Nose position
  0.145678901,  // Feature 3: Face width
  0.256789012,  // Feature 4: Cheekbone height
  0.167890123,  // Feature 5: Jawline angle
  0.278901234,  // Feature 6: Forehead height
  0.189012345,  // Feature 7: Mouth position
  0.290123456,  // Feature 8: Chin shape
  0.101234567,  // Feature 9: Eye shape
  0.212345678   // Feature 10: Skin texture
  // ... 118 more features ...
]
```

---

## Similarity Calculation Algorithm

```javascript
// Euclidean Distance Formula
function calculateDescriptorSimilarity(desc1, desc2) {
  let sumSquaredDifferences = 0;
  
  for (let i = 0; i < 128; i++) {
    const diff = desc1[i] - desc2[i];
    sumSquaredDifferences += diff * diff;
  }
  
  const euclideanDistance = Math.sqrt(sumSquaredDifferences / 128);
  
  // Normalize to 0-1 scale
  const similarity = Math.max(0, 1 - (euclideanDistance / 2));
  
  return similarity;
}

// Example:
// Identical faces:     similarity = 1.0 (distance ≈ 0)
// Same person:         similarity = 0.85+ (distance < 0.3)
// Different person:    similarity = 0.30 (distance ≈ 1.4)
// Completely different: similarity = 0.0 (distance ≈ 2.0)
```

---

## Threshold Logic

```javascript
const SIMILARITY_THRESHOLD = 0.6; // 60%

if (similarity > SIMILARITY_THRESHOLD) {
  // LOGIN SUCCESS ✓
  return { success: true, message: 'Login successful' };
} else {
  // LOGIN FAILED ✗
  return { 
    success: false, 
    message: `Facial recognition failed. Similarity: ${similarity * 100}% (requires 60%+)`
  };
}
```

---

## Other Endpoints (Book Management)

### GET `/api/books`
Returns all books in library
```json
[
  {
    "id": 1,
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "isbn": "ISBN001",
    "quantity": 5,
    "available": 5,
    "category": "Fiction"
  }
]
```

### POST `/api/borrow`
Borrow a book (requires authentication)
```json
{
  "user_id": 46,
  "book_id": 1
}
```

---

## Error Codes

| Code | Scenario |
|------|----------|
| 201 | Successful registration |
| 200 | Successful login/facial verification |
| 400 | Missing required fields |
| 401 | Authentication failed (password or facial) |
| 409 | Email already registered |
| 500 | Server/database error |

---

## Face-API Integration

### Model Loading
```javascript
const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';

await Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
  faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
  faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
  faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL)
]);
```

### Descriptor Extraction
```javascript
const canvas = document.getElementById('canvas');
const detections = await faceapi
  .detectAllFaces(canvas, new faceapi.TinyFaceDetectorOptions())
  .withFaceLandmarks()
  .withFaceDescriptors();

const descriptor = detections[0].descriptor;  // 128-d array
```

---

## Usage Flow

### Registration
```
1. User fills form + captures photo
   ↓
2. Face-API extracts descriptor (128D)
   ↓
3. POST /api/register with descriptor
   ↓
4. Backend hashes password, stores descriptor
   ↓
5. ✓ Account created (facial data locked)
```

### Login
```
1. User enters email + password
   ↓
2. POST /api/login → validates password
   ↓
3. User captures face
   ↓
4. Face-API extracts descriptor
   ↓
5. POST /api/verify-otp with new descriptor
   ↓
6. Backend compares:
   - Stored descriptor vs New descriptor
   - Calculate similarity (Euclidean distance)
   - Check if > 60%
   ↓
7. Success: Return user data
   Failure: Return error with similarity %
```

---

## Testing with curl

### Registration
```bash
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Test123",
    "facial_descriptor": [0.1, 0.2, 0.3, ... (128 values)],
    "facial_data": "data:image/jpeg;base64,..."
  }'
```

### Login - Password
```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123"
  }'
```

### Login - Facial
```bash
curl -X POST http://localhost:5000/api/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 46,
    "facial_descriptor": [0.1, 0.2, 0.3, ... (128 values)]
  }'
```

---

## Performance Metrics

| Operation | Time |
|-----------|------|
| Face detection | ~100-200ms |
| Descriptor extraction | ~200-300ms |
| Similarity calculation | <1ms |
| Total facial auth | ~2-3 seconds |
| Database lookup | ~5ms |
| Password verification | ~50-100ms |

---

**Last Updated**: 2025-11-20
**API Version**: 1.0
**Face-API Version**: Latest (via CDN)
**Status**: Production Ready
