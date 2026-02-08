# Quick Start Guide

## Prerequisites
- MySQL installed and running
- Node.js 16+ installed

## Step 1: Setup MySQL Database

Open MySQL command line or workbench and run:

```sql
CREATE DATABASE kasi_rent;
```

## Step 2: Configure Backend

```bash
cd server

# Create .env file
copy .env.example .env

# Edit .env and set your MySQL password and JWT secret:
# - DB_PASSWORD=your_mysql_password
# - JWT_SECRET=your_random_secret_key
```

## Step 3: Initialize Database

```bash
# Install dependencies (if not already done)
npm install

# Create all database tables
npm run init-db
```

You should see:
```
✅ Users table created
✅ User roles table created
✅ Properties table created
✅ Bookings table created
✅ Favorites table created
✅ Reviews table created
✅ Messages table created
```

## Step 4: Start Backend Server

```bash
npm run dev
```

You should see:
```
✅ MySQL Database connected successfully
🚀 Server running on port 5001
```

## Step 5: Setup Frontend

Open a new terminal:

```bash
cd client

# Install dependencies
npm install

# Create .env file
echo VITE_API_URL=http://localhost:5001 > .env

# Start frontend
npm run dev
```

The app will open at `http://localhost:5173`

## Testing

1. Go to `http://localhost:5173/get-started`
2. Register a new account (choose landlord or tenant)
3. Login with your credentials
4. Create a property (if landlord) or browse properties (if tenant)

## Common Issues

### MySQL Connection Failed
- Verify MySQL is running: `net start MySQL80` (Windows)
- Check DB_PASSWORD in server/.env matches your MySQL password
- Ensure database 'kasi_rent' exists

### Port Already in Use
- Backend (5001): Change PORT in server/.env
- Frontend (5173): Change in vite.config.ts or use different port flag

### Authentication Failed
- Clear browser localStorage (F12 > Application > Local Storage > Clear)
- Verify JWT_SECRET is set in server/.env
- Check backend is running on port 5001
