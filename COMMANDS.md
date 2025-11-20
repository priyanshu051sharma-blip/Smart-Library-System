# 🚀 COMMAND REFERENCE GUIDE

## Quick Commands to Run Everything

### Windows PowerShell

```powershell
# Terminal 1: Start Backend
cd "c:\Users\PRIYANSHU SHARMA\final library system\smart_library_system\backend"
node server.js

# Terminal 2: Start Frontend
cd "c:\Users\PRIYANSHU SHARMA\final library system\smart_library_system\frontend"
python -m http.server 8000

# Terminal 3: Open Browser
start http://localhost:8000
```

### Windows Command Prompt

```cmd
REM Terminal 1: Start Backend
cd c:\Users\PRIYANSHU SHARMA\final library system\smart_library_system\backend
node server.js

REM Terminal 2: Start Frontend
cd c:\Users\PRIYANSHU SHARMA\final library system\smart_library_system\frontend
python -m http.server 8000

REM Terminal 3: Open Browser
start http://localhost:8000
```

### One-Line Batch Script

```powershell
$backend = { cd "c:\Users\PRIYANSHU SHARMA\final library system\smart_library_system\backend"; node server.js }; $frontend = { cd "c:\Users\PRIYANSHU SHARMA\final library system\smart_library_system\frontend"; python -m http.server 8000 }; & $backend &
```

---

## First-Time Setup

```bash
# Install dependencies
cd backend
npm install

# That's it! Then just run the commands above.
```

---

## Stopping Services

```powershell
# Stop all Node processes
Get-Process node | Stop-Process -Force

# Stop all Python processes
Get-Process python | Stop-Process -Force

# Or: Ctrl+C in each terminal
```

---

## Reset Database

```powershell
# Delete database to start fresh
cd backend
Remove-Item library.db -Force

# Restart backend (it will recreate the database)
node server.js
```

---

## Access Points

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:8000 | Main app |
| Backend | http://localhost:5000 | API server |
| Database | backend/library.db | Data storage |

---

## Test Login

```
Email: priyanshu.sharma24@st.niituniversity.in
Password: Password@123
```

---

## Common Issues & Quick Fixes

```powershell
# Port already in use
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Module not found
npm install

# Database locked
Remove-Item backend/library.db -Force

# Can't find python
python --version  # If not found, install from python.org

# Backend connection error
# Make sure backend is running on 5000
# Check firewall settings
```

---

## Environment Setup (Optional - For Email)

```powershell
# Set Gmail credentials
[Environment]::SetEnvironmentVariable("EMAIL_USER", "your-email@gmail.com", "User")
[Environment]::SetEnvironmentVariable("EMAIL_PASS", "your-app-password", "User")

# Restart backend after setting
```

---

## Package Info

```bash
# Check Node version
node --version

# Check npm version
npm --version

# Check Python version
python --version

# List installed packages
npm list
```

---

## Development Commands

```bash
# Install specific package
npm install package-name

# Update all packages
npm update

# Check for vulnerabilities
npm audit

# Run backend with auto-reload (if nodemon installed)
npm install -g nodemon
nodemon server.js
```

---

## Database Commands

```bash
# Connect to database
sqlite3 backend/library.db

# Common SQLite commands
.tables                    # List tables
SELECT * FROM users;       # View users
SELECT * FROM books;       # View books
.exit                      # Exit
```

---

## Browser DevTools

```
Press: F12 or Right-click → Inspect

Tabs:
- Elements: View HTML structure
- Console: See JavaScript errors & logs
- Network: View API calls
- Application: Check localStorage
```

---

## If Something Goes Wrong

1. **Check Terminal Output**
   - Look for error messages
   - Copy error text
   - Search error online

2. **Restart Services**
   ```powershell
   # Stop all
   Get-Process node, python | Stop-Process -Force
   
   # Start again
   # (Follow startup commands above)
   ```

3. **Reset Everything**
   ```powershell
   # Delete database
   Remove-Item backend/library.db -Force
   
   # Reinstall packages
   cd backend
   npm install
   
   # Start fresh
   node server.js
   ```

4. **Check Logs**
   - Backend console output
   - Browser console (F12)
   - Network tab in DevTools

---

## Performance Monitoring

```javascript
// Run in browser console (F12)
// Time API request
console.time('login');
fetch('http://localhost:5000/api/login', {...});
console.timeEnd('login');
```

---

## Useful URLs

```
http://localhost:8000            # Main app
http://localhost:5000/api/books  # API test
```

---

## Batch Processing

### Windows Batch File (save as `start.bat`)

```batch
@echo off
title Smart Library System

echo Starting Backend...
start "Backend" cmd /k "cd backend && node server.js"

timeout /t 2

echo Starting Frontend...
start "Frontend" cmd /k "cd frontend && python -m http.server 8000"

timeout /t 2

echo Opening Browser...
start http://localhost:8000

echo.
echo All services started!
echo Frontend: http://localhost:8000
echo Backend: http://localhost:5000
echo.
pause
```

### PowerShell Script (save as `start.ps1`)

```powershell
$projectPath = "c:\Users\PRIYANSHU SHARMA\final library system\smart_library_system"

# Start Backend
Start-Process powershell -ArgumentList "-Command `"cd '$projectPath\backend'; node server.js`""

# Wait
Start-Sleep -Seconds 2

# Start Frontend
Start-Process powershell -ArgumentList "-Command `"cd '$projectPath\frontend'; python -m http.server 8000`""

# Wait and open browser
Start-Sleep -Seconds 2
Start-Process "http://localhost:8000"

Write-Host "Services started!"
Write-Host "Frontend: http://localhost:8000"
Write-Host "Backend: http://localhost:5000"
```

---

## Keyboard Shortcuts

```
F12                 # Open DevTools
Ctrl+Shift+Delete   # Clear cache
Ctrl+F5             # Hard refresh
Ctrl+Shift+C        # Inspect element
```

---

## Quick Stats

```
Backend Port:        5000
Frontend Port:       8000
Database:            SQLite3 (library.db)
API Endpoints:       15+
Sample Users:        5
Sample Books:        5
```

---

## Support Files

- README.md - Full documentation
- QUICK_START.md - Quick setup
- EMAIL_SETUP_GUIDE.md - Email config
- FILE_INDEX.md - File reference
- COMPLETION_SUMMARY.txt - Project summary

---

## Last But Not Least

```
Test Account:
Email: priyanshu.sharma24@st.niituniversity.in
Password: Password@123

OR try other test accounts (ENR002-ENR005) with same password
```

---

**Everything you need to run the Smart Library System! 🚀**
