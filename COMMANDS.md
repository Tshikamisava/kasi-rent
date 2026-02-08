# 🚀 KasiRent - Command Reference

Quick reference for common commands after migration.

## 📋 Prerequisites

- ✅ MySQL 8.0+ installed and running
- ✅ Node.js 16+ installed
- ✅ Git (optional)

---

## 🗄️ MySQL Commands

### Start MySQL Service
```bash
# Windows
net start MySQL80

# Or use MySQL Workbench/XAMPP/WAMP control panel
```

### Create Database
```bash
mysql -u root -p
```
```sql
CREATE DATABASE kasi_rent;
SHOW DATABASES;
USE kasi_rent;
SHOW TABLES;
EXIT;
```

### Check Database
```bash
mysql -u root -p kasi_rent
```
```sql
SHOW TABLES;
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM properties;
EXIT;
```

### Reset Database (if needed)
```sql
DROP DATABASE kasi_rent;
CREATE DATABASE kasi_rent;
```

---

## 🔧 Backend Commands

### Initial Setup
```bash
cd server

# Install dependencies
npm install

# Create .env file
copy .env.example .env
# Then edit .env with your MySQL credentials

# Initialize database tables
npm run init-db

# Verify setup
npm run verify
```

### Running the Server
```bash
cd server

# Development mode (auto-restart on changes)
npm run dev

# Production mode
npm start
```

### Database Scripts
```bash
cd server

# Create all tables
npm run init-db

# Verify configuration
npm run verify

# Add test user (if script exists)
node add-test-user.js
```

### Useful Checks
```bash
cd server

# Check if server is running
curl http://localhost:5001/api/properties

# Test database connection
node -e "import('./config/database.js').then(() => console.log('OK'))"
```

---

## 💻 Frontend Commands

### Initial Setup
```bash
cd client

# Install dependencies
npm install

# Create .env file
echo VITE_API_URL=http://localhost:5001 > .env

# On Windows PowerShell:
"VITE_API_URL=http://localhost:5001" | Out-File -Encoding ASCII .env
```

### Running the Frontend
```bash
cd client

# Development mode
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### Running Tests
```bash
cd client

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

---

## 🔄 Both Backend & Frontend

### Quick Start (Two Terminals)

**Terminal 1 - Backend**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend**
```bash
cd client
npm run dev
```

### Production Build
```bash
# Build frontend
cd client
npm run build

# Build artifacts will be in client/dist/

# Start backend in production mode
cd server
npm start
```

---

## 🧪 Testing Endpoints

### Test Properties API
```bash
# Get all properties
curl http://localhost:5001/api/properties

# Get specific property
curl http://localhost:5001/api/properties/property_id_here
```

### Test Authentication
```bash
# Register new user
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## 🐛 Troubleshooting Commands

### Check if MySQL is Running
```bash
# Windows
tasklist | findstr mysql

# Check service
sc query MySQL80
```

### Check if Port is in Use
```bash
# Windows - Check port 5001
netstat -ano | findstr :5001

# Kill process on port (if needed)
# Get PID from netstat output
taskkill /PID <PID> /F
```

### Clear Node Modules and Reinstall
```bash
cd server
rm -rf node_modules package-lock.json
npm install

cd ../client
rm -rf node_modules package-lock.json
npm install
```

### Clear Frontend Cache
```bash
cd client

# Clear Vite cache
rm -rf node_modules/.vite

# Rebuild
npm run dev
```

### Check Logs
```bash
# Backend logs (if running in background)
cd server
tail -f server.log

# Frontend logs are in the terminal where npm run dev is running
```

---

## 📦 Dependency Management

### Update Dependencies
```bash
# Backend
cd server
npm update
npm outdated

# Frontend
cd client
npm update
npm outdated
```

### Install New Package
```bash
# Backend
cd server
npm install package-name

# Frontend
cd client
npm install package-name
```

---

## 🔐 Security Commands

### Generate JWT Secret
```bash
# Generate random secret (Node.js)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use online tool: https://randomkeygen.com/
```

### Hash Password (for testing)
```bash
cd server
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('mypassword', 10, (e,h) => console.log(h))"
```

---

## 📊 Database Maintenance

### Backup Database
```bash
# Export entire database
mysqldump -u root -p kasi_rent > backup_$(date +%Y%m%d).sql

# Export specific table
mysqldump -u root -p kasi_rent users > users_backup.sql
```

### Restore Database
```bash
mysql -u root -p kasi_rent < backup_20240207.sql
```

### Check Database Size
```sql
SELECT 
  table_name AS 'Table',
  round(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'kasi_rent'
ORDER BY (data_length + index_length) DESC;
```

---

## 🚀 Deployment Commands

### Build for Production
```bash
# Frontend
cd client
npm run build
# Output: client/dist/

# Backend (just ensure .env is configured)
cd server
# Make sure .env has production settings
```

### Environment Variables
```bash
# Backend .env (production)
NODE_ENV=production
PORT=5001
DB_HOST=your_production_host
DB_NAME=kasi_rent
JWT_SECRET=your_very_secure_secret

# Frontend .env (production)
VITE_API_URL=https://your-api-domain.com
```

---

## 📁 File Structure Commands

### View Project Structure
```bash
# Windows
tree /F /A > structure.txt

# Or use a tool like `tree` on Linux/Mac
tree -L 3
```

### Find Files
```bash
# Find all TypeScript files
find . -name "*.ts" -o -name "*.tsx"

# Find files containing "supabase"
grep -r "supabase" client/src --include="*.tsx" --include="*.ts"
```

---

## 🔍 Verification Commands

### Verify Backend Setup
```bash
cd server
npm run verify
```

### Check Database Tables
```bash
cd server
node -e "import('./config/database.js').then(async (m) => { const [rows] = await m.default.query('SHOW TABLES'); console.table(rows); process.exit(0); })"
```

### Test API Connection
```bash
# From anywhere
curl http://localhost:5001/api/properties

# Should return JSON (empty array or properties list)
```

---

## 📝 Development Workflow

### Typical Development Session
```bash
# 1. Start MySQL (if not running)
net start MySQL80

# 2. Open two terminals

# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend  
cd client
npm run dev

# 3. Open browser to http://localhost:5173

# 4. Make changes to code (auto-reload enabled)

# 5. When done:
# Ctrl+C in both terminals
```

### Adding a New Feature
```bash
# 1. Create new route in backend
cd server/routes
# Create new route file

# 2. Create new component in frontend
cd client/src/components
# Create new component

# 3. Test locally

# 4. Commit changes
git add .
git commit -m "Added new feature"
git push
```

---

## 📚 Documentation Files

All documentation is in the root directory:

```bash
# View documentation
cat QUICKSTART.md      # Quick setup guide
cat MIGRATION_README.md # Detailed migration guide
cat SUMMARY.md         # Migration summary
cat CHANGES.md         # Before/after comparison
cat VERIFICATION.md    # Setup checklist
cat COMMANDS.md        # This file
```

---

## 🆘 Getting Help

### Check Application Status
```bash
# Backend health
curl http://localhost:5001/api/properties

# Frontend (check console in browser)
# Open http://localhost:5173 and press F12
```

### Common Issues

**Cannot connect to MySQL**
```bash
net start MySQL80
mysql -u root -p
# Verify credentials in server/.env
```

**Port already in use**
```bash
# Find process using port 5001
netstat -ano | findstr :5001
# Kill process if needed
taskkill /PID <PID> /F
```

**Authentication fails**
```bash
# Clear browser storage
# In browser: F12 > Application > Local Storage > Clear All
# Try login again
```

**Module not found**
```bash
cd server && npm install
cd ../client && npm install
```

---

## ✅ Success Indicators

**Backend Running:**
```
✅ MySQL Database connected successfully
🚀 Server running on port 5001
```

**Frontend Running:**
```
VITE v5.x.x ready in xxx ms
➜ Local: http://localhost:5173/
```

**Ready to Use:**
- ✅ Can access http://localhost:5173
- ✅ Can register/login
- ✅ Can view properties
- ✅ Can create properties (landlord)

---

## 🎯 Quick Reference Card

```bash
# Setup (first time only)
cd server && npm install && npm run init-db
cd client && npm install

# Run daily
cd server && npm run dev    # Terminal 1
cd client && npm run dev    # Terminal 2

# Verify setup
cd server && npm run verify
```

---

**Your KasiRent application is ready! 🎉**

For detailed guides, see:
- [QUICKSTART.md](QUICKSTART.md) - Setup instructions
- [MIGRATION_README.md](MIGRATION_README.md) - Full documentation
