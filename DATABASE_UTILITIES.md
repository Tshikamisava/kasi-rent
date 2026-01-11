# Database Utilities Guide

This document describes the utility scripts available in the server directory for database management, testing, and debugging.

## Quick Start

All scripts should be run from the `server` directory:

```bash
cd server
node <script-name>.js
```

Or use the provided wrapper scripts from the project root:

**Windows (PowerShell):**
```powershell
.\check-users-table.ps1
```

**Linux/Mac:**
```bash
./check-users-table.sh
```

## Prerequisites

1. Install dependencies:
```bash
cd server
npm install
```

2. Configure database connection:
   - Copy `.env.example` to `.env`
   - Update database credentials (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME)

3. Ensure MySQL server is running

## Database Verification Scripts

### check-users-table.js
**Purpose:** Display the structure of the users table

**Usage:**
```bash
node check-users-table.js
```

**Output:** Shows column names, types, keys, and constraints for the users table

**Common Errors:**
- `ECONNREFUSED`: MySQL server not running
- `Unknown database`: Database doesn't exist (run `CREATE DATABASE kasirent;`)
- `Table doesn't exist`: Run migrations to create the table

---

### check-properties.js
**Purpose:** List all properties in the database with details

**Usage:**
```bash
node check-properties.js
```

**Output:** 
- Total count of properties
- Details for each property (title, location, price, type, bedrooms, bathrooms, etc.)

---

### check-favorites-table.js
**Purpose:** Verify favorites table exists and show its structure

**Usage:**
```bash
node check-favorites-table.js
```

**Output:**
- Checks if favorites table exists
- Creates table if it doesn't exist
- Displays table structure

---

### check-favorites-structure.js
**Purpose:** Verify the structure of the favorites table

**Usage:**
```bash
node check-favorites-structure.js
```

---

### check-id-types.js
**Purpose:** Verify data types of ID columns across tables

**Usage:**
```bash
node check-id-types.js
```

---

### check-collation.js
**Purpose:** Check database collation settings

**Usage:**
```bash
node check-collation.js
```

---

### check-property-dates.js
**Purpose:** Verify date fields in the properties table

**Usage:**
```bash
node check-property-dates.js
```

## Migration Scripts

### run-migration.js
**Purpose:** Run database migrations

**Usage:**
```bash
node run-migration.js
```

---

### run-favorites-migration.js
**Purpose:** Run migrations specific to the favorites feature

**Usage:**
```bash
node run-favorites-migration.js
```

---

### run-profile-migration.js
**Purpose:** Run migrations for user profile updates

**Usage:**
```bash
node run-profile-migration.js
```

---

### run-video-migration.js
**Purpose:** Run migrations for video feature support

**Usage:**
```bash
node run-video-migration.js
```

---

### run-fix-favorites.js
**Purpose:** Fix issues with the favorites table

**Usage:**
```bash
node run-fix-favorites.js
```

## Table Creation Scripts

### create-favorites-table.js
**Purpose:** Manually create the favorites table

**Usage:**
```bash
node create-favorites-table.js
```

**Note:** This script will create the favorites table with proper foreign keys if it doesn't exist.

## Test Data Scripts

### add-test-user.js
**Purpose:** Add a test user to the database

**Usage:**
```bash
node add-test-user.js
```

---

### add-test-properties.js
**Purpose:** Add test properties to the database

**Usage:**
```bash
node add-test-properties.js
```

---

### cleanup-test-data.js
**Purpose:** Remove test data from the database

**Usage:**
```bash
node cleanup-test-data.js
```

**Warning:** This will delete test users and properties. Use with caution.

## Feature Scripts

### add-view-count.js
**Purpose:** Add or update view count column in properties table

**Usage:**
```bash
node add-view-count.js
```

## Testing Scripts

### test-property-fetch.js
**Purpose:** Test property fetching functionality

**Usage:**
```bash
node test-property-fetch.js
```

---

### test-validation.js
**Purpose:** Test data validation logic

**Usage:**
```bash
node test-validation.js
```

## Troubleshooting

### Cannot connect to database

**Error:** `ECONNREFUSED` or connection refused

**Solutions:**
1. Verify MySQL server is running:
   ```bash
   # Windows
   net start MySQL80
   
   # Linux/Mac
   sudo systemctl start mysql
   # or
   mysql.server start
   ```

2. Check `.env` configuration:
   - Verify `DB_HOST` is correct (usually `localhost`)
   - Verify `DB_USER` and `DB_PASSWORD` are correct
   - Ensure `DB_NAME` matches your database name

### Database doesn't exist

**Error:** `Unknown database 'kasirent'`

**Solution:**
```sql
CREATE DATABASE kasirent;
```

### Table doesn't exist

**Error:** `Table 'kasirent.users' doesn't exist`

**Solution:** Run the appropriate migration script:
```bash
node run-migration.js
```

### Access denied

**Error:** `Access denied for user`

**Solution:**
1. Verify database credentials in `.env`
2. Grant proper permissions to the MySQL user:
```sql
GRANT ALL PRIVILEGES ON kasirent.* TO 'your_user'@'localhost';
FLUSH PRIVILEGES;
```

## Best Practices

1. **Always backup your database** before running migration scripts
2. **Test scripts on a development database** first
3. **Review script code** before running, especially cleanup scripts
4. **Keep .env file secure** - never commit it to version control
5. **Run check scripts** after migrations to verify changes

## Adding New Utility Scripts

When creating new utility scripts, follow these conventions:

1. **Naming:**
   - `check-*.js` - Scripts that verify/display data
   - `add-*.js` - Scripts that add data
   - `run-*.js` - Scripts that execute migrations
   - `test-*.js` - Scripts that test functionality
   - `create-*.js` - Scripts that create tables/structures

2. **Structure:**
   ```javascript
   import { sequelize } from './config/mysql.js';
   
   async function yourFunction() {
     try {
       await sequelize.authenticate();
       // Your code here
       await sequelize.close();
       process.exit(0);
     } catch (error) {
       console.error('Error:', error.message);
       process.exit(1);
     }
   }
   
   yourFunction();
   ```

3. **Error handling:**
   - Always include try-catch blocks
   - Provide helpful error messages
   - Close database connections
   - Exit with appropriate codes (0 for success, 1 for failure)

## Contributing

If you create a new utility script:
1. Document it in this file
2. Follow the naming conventions
3. Include proper error handling
4. Test thoroughly before committing

---

For more information about the project structure and setup, see the main [README.md](../README.md).
