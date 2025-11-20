import sqlite3
import base64
import sys
from pathlib import Path

# Your image file path (you need to provide this)
IMAGE_PATH = r"C:\Users\PRIYANSHU SHARMA\final library system\smart_library_system\backend\priyanshu.jpg"
DB_PATH = r"C:\Users\PRIYANSHU SHARMA\final library system\smart_library_system\backend\library.db"

print("📸 Adding profile image to Priyanshu user...\n")

# Check if image exists
if not Path(IMAGE_PATH).exists():
    print(f"⚠️  Image file not found: {IMAGE_PATH}")
    print("\n📝 Please provide your photo as 'priyanshu.jpg' in the backend folder")
    print("   Or update IMAGE_PATH in this script with correct path\n")
    
    # Create a simple test image for demonstration
    print("✅ Creating placeholder image for testing...\n")
    try:
        from PIL import Image, ImageDraw
        
        # Create a simple placeholder image
        img = Image.new('RGB', (300, 300), color='lightblue')
        draw = ImageDraw.Draw(img)
        draw.text((100, 140), "Priyanshu", fill='black')
        
        img.save(IMAGE_PATH)
        print(f"✅ Placeholder image created: {IMAGE_PATH}\n")
    except ImportError:
        print("⚠️  PIL not installed. Using minimal binary approach...\n")
        # Use a minimal JPEG header as fallback
        minimal_jpeg = bytes([
            0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
            0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xFF, 0xD9
        ])
        with open(IMAGE_PATH, 'wb') as f:
            f.write(minimal_jpeg)
        print(f"✅ Minimal test image created: {IMAGE_PATH}\n")

# Read the image file
try:
    with open(IMAGE_PATH, 'rb') as f:
        image_binary = f.read()
    print(f"✅ Image loaded successfully")
    print(f"   File: {IMAGE_PATH}")
    print(f"   Size: {len(image_binary)} bytes\n")
except Exception as e:
    print(f"❌ Error reading image: {e}")
    sys.exit(1)

# Connect to database
try:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    print(f"✅ Connected to database: {DB_PATH}\n")
except Exception as e:
    print(f"❌ Database connection error: {e}")
    sys.exit(1)

# Update user 6 (Priyanshu) with image
try:
    cursor.execute("UPDATE users SET image = ? WHERE id = 6", (image_binary,))
    conn.commit()
    
    if cursor.rowcount == 0:
        print("❌ User ID 6 not found")
        conn.close()
        sys.exit(1)
    
    print("✅ Image added to database successfully!\n")
    print("📊 Update Details:")
    print("   User ID: 6")
    print("   User Name: Priyanshu")
    print("   Email: priyanshu051sharma@gmail.com")
    print(f"   Image Size: {len(image_binary)} bytes")
    print("   Image Format: Binary LONGBLOB\n")
    
    # Verify the update
    cursor.execute(
        """SELECT id, name, email, 
           CASE WHEN image IS NULL THEN 'No image'
                ELSE 'Image exists (' || length(image) || ' bytes)'
           END as image_status
           FROM users WHERE id = 6"""
    )
    row = cursor.fetchone()
    
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("✅ VERIFICATION - User Image Status")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    if row:
        print(f"ID: {row[0]}")
        print(f"Name: {row[1]}")
        print(f"Email: {row[2]}")
        print(f"Status: {row[3]}")
    
    print("\n🎉 Image now stored in database!")
    print("\n📸 When Priyanshu logs in:")
    print("   1. Facial verification happens")
    print("   2. Backend retrieves user record")
    print("   3. Image converted to base64")
    print("   4. Sent to frontend in response")
    print("   5. Dashboard displays circular photo")
    print("   6. Shows name and email below photo\n")
    
    print("🔗 To view on dashboard:")
    print("   1. Go to http://localhost:8000")
    print("   2. Login with: priyanshu051sharma@gmail.com")
    print("   3. Capture your face for verification")
    print("   4. Dashboard shows your photo! ✨\n")
    
except Exception as e:
    print(f"❌ Error updating database: {e}")
    sys.exit(1)
finally:
    conn.close()
