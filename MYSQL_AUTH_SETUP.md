# ✅ MySQL Authentication Setup Complete

## What Was Changed

The application now uses **MySQL for authentication** instead of Supabase.

### Files Modified:

1. **server/controllers/authController.js** (NEW)
   - Login endpoint
   - Register endpoint  
   - Get current user endpoint

2. **server/routes/authRoutes.js** (UPDATED)
   - Added MySQL auth routes: `/api/auth/login`, `/api/auth/register`

3. **client/src/lib/auth.ts** (UPDATED)
   - Switched from Supabase to fetch API calls
   - All auth now goes to `http://localhost:5001/api/auth`

---

## Admin Credentials (MySQL)

```
📧 Email:    admin@kasirent.com
🔑 Password: #kasirent
👤 Role:     admin
```

The admin user **already exists** in your MySQL database!

---

## How to Test Login

### Step 1: Start the Servers

**Terminal 1 - Server:**
```bash
cd C:\Users\User\OneDrive\Desktop\kasi-rent\server
npm start
```

**Terminal 2 - Client:**
```bash
cd C:\Users\User\OneDrive\Desktop\kasi-rent\client
npm run dev
```

### Step 2: Login

1. Open browser: `http://localhost:5173/signin`
2. Enter credentials:
   - Email: `admin@kasirent.com`
   - Password: `#kasirent`
3. Click "Sign In"
4. ✅ Should work now!

---

## API Endpoints

### Authentication Endpoints:

```
POST   /api/auth/register   - Create new user
POST   /api/auth/login      - Login user
POST   /api/auth/logout     - Logout user
GET    /api/auth/me         - Get current user
```

### Example Login Request:

```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kasirent.com","password":"#kasirent"}'
```

### Example Response:

```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "_id": "admin-1234567890",
    "id": "admin-1234567890",
    "name": "KasiRent Admin",
    "email": "admin@kasirent.com",
    "role": "admin",
    "userType": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## How It Works

### Before (Supabase):
```
Client → Supabase Auth API → Supabase Database
```

### Now (MySQL):
```
Client → Express Server → MySQL Database
```

### Authentication Flow:

1. **User enters credentials** on login page
2. **Client sends POST** to `/api/auth/login`
3. **Server finds user** in MySQL database
4. **Server compares password** using bcrypt
5. **Server generates JWT token** (valid 7 days)
6. **Server returns user data + token**
7. **Client stores token** in localStorage
8. **Client includes token** in all API requests

---

## Token Storage

Tokens are stored in browser localStorage:

```javascript
// After successful login
localStorage.setItem('token', result.token);
localStorage.setItem('user', JSON.stringify(result.user));

// For authenticated requests
fetch('http://localhost:5001/api/something', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## Creating New Users

### Register as Tenant:
1. Go to: `http://localhost:5173/getstarted`
2. Fill in:
   - Name
   - Email
   - Phone
   - Role: **Tenant**
   - Password
3. Click "Get Started"

### Register as Landlord:
Same as above, but select Role: **Landlord**

---

## Troubleshooting

### "Invalid email or password"

**Cause:** User doesn't exist in MySQL or wrong password

**Fix:** For admin, the user already exists. Check:
```sql
SELECT id, email, name, role FROM users WHERE email = 'admin@kasirent.com';
```

### "Cannot connect to authentication service"

**Cause:** Server not running

**Fix:** Start server:
```bash
cd server
npm start
```
Should see: `Server running on port 5001`

### Login works but redirects to wrong page

**Cause:** Role in database doesn't match expected values

**Fix:** Check user role:
```sql
SELECT id, email, role FROM users WHERE email = 'your@email.com';
```

Roles should be: `admin`, `tenant`, or `landlord`

### Token expired

**Cause:** JWT token is older than 7 days

**Fix:** Login again. Token will be refreshed.

---

## Next Steps

1. ✅ **Test admin login** with admin@kasirent.com / #kasirent
2. ✅ **Access admin dashboard** at /admin
3. ✅ **Create test tenant** account
4. ✅ **Test verification workflow**

---

## Notes

- **OAuth disabled:** Google/GitHub/Facebook login removed (requires Supabase)
- **Password reset:** Still works via email (uses MySQL)
- **JWT tokens:** Valid for 7 days
- **Password hashing:** bcrypt with 10 rounds
- **Role-based access:** Enforced on both client and server

---

**Status:** ✅ MySQL Authentication Active  
**Admin User:** ✅ Ready to use  
**Date:** January 14, 2026
