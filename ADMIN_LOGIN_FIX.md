# 🔐 Admin Login Issue - SOLUTION

## The Problem

When trying to login with `admin@kasirent.com` and `#kasirent`, you get "invalid credentials" error.

## Why This Happens

**KasiRent uses TWO separate systems:**

1. **Supabase** - For user authentication (login/register)
2. **MySQL** - For storing properties, bookings, etc.

The `create-admin.js` script created the admin user in **MySQL database** ✅  
But the login page uses **Supabase authentication** ❌

**You need to create the admin in Supabase, not just MySQL!**

---

## ✅ SOLUTION: Create Admin in Supabase

### Method 1: Supabase Dashboard (Easiest)

**Step 1:** Go to Supabase Dashboard
- URL: https://supabase.com/dashboard
- Login with your Supabase account

**Step 2:** Select Your Project
- Find and click on your "kasi-rent" project

**Step 3:** Navigate to Users
- Click "Authentication" in left sidebar
- Click "Users"

**Step 4:** Add New User
- Click the green "Add user" button at top right
- Select "Create new user" from dropdown

**Step 5:** Fill in User Details
```
Email:            admin@kasirent.com
Password:         #kasirent
Confirm Password: #kasirent

☐ Auto Confirm User: Check this box
```

**Step 6:** Add User Metadata
- Scroll down to "User Metadata" section
- Click to expand it
- Add this JSON:
```json
{
  "name": "KasiRent Admin",
  "userType": "admin"
}
```

**Step 7:** Create User
- Click the "Create user" button
- Wait for confirmation

**Step 8:** Test Login
- Go to: http://localhost:5173/signin
- Email: `admin@kasirent.com`
- Password: `#kasirent`
- Click "Sign In"
- ✅ Should work now!

---

### Method 2: Supabase SQL Editor

If you prefer using SQL:

**Step 1:** Go to SQL Editor
- In Supabase Dashboard
- Click "SQL Editor" in left sidebar

**Step 2:** Create User (if not exists)
```sql
-- Check if user exists
SELECT id, email, raw_user_meta_data 
FROM auth.users 
WHERE email = 'admin@kasirent.com';
```

**Step 3:** Update User Metadata
```sql
-- Add admin role to user metadata
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{userType}',
  '"admin"'
)
WHERE email = 'admin@kasirent.com';

-- Also set the name
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
  raw_user_meta_data,
  '{name}',
  '"KasiRent Admin"'
)
WHERE email = 'admin@kasirent.com';
```

**Step 4:** Verify
```sql
SELECT 
  id, 
  email, 
  raw_user_meta_data->>'name' as name,
  raw_user_meta_data->>'userType' as role
FROM auth.users 
WHERE email = 'admin@kasirent.com';
```

---

## Understanding the Two Systems

### Supabase (Authentication)
- Handles all login/register operations
- Stores user credentials (email/password)
- Provides JWT tokens for API access
- **This is what the SignIn page uses!**

**Location:** Supabase Cloud (https://supabase.com)

**Files that use it:**
- `client/src/lib/auth.ts` - Login function
- `client/src/pages/SignIn.tsx` - Login form
- `client/src/pages/GetStarted.tsx` - Register form

### MySQL (Data Storage)
- Stores properties, bookings, payments
- Stores verification documents
- Stores chat messages
- **NOT used for login authentication!**

**Location:** Local MySQL database

**Files that use it:**
- `server/models/*.js` - All Sequelize models
- `server/controllers/*.js` - All controllers

---

## What About the MySQL Admin?

The MySQL admin user created by `create-admin.js` is still useful!

**It's used for:**
- Admin API endpoints (viewing verifications)
- Backend role checking
- Database queries

**But for login:** You MUST have the user in Supabase too!

---

## Complete Setup Checklist

### ✅ Already Done:
- [x] MySQL admin user created
- [x] Admin routes protected with `requiredRole="admin"`
- [x] Admin dashboard shows verification documents
- [x] Password visibility toggles added

### 🔲 Need to Do:
- [ ] Create admin user in Supabase (Dashboard method above)
- [ ] Test login with admin@kasirent.com / #kasirent
- [ ] Verify admin can access /admin dashboard
- [ ] Test that admin can see all verification documents

---

## Troubleshooting

### Error: "Invalid login credentials"
**Cause:** User doesn't exist in Supabase  
**Fix:** Create user in Supabase Dashboard (see Method 1 above)

### Error: "User already registered"
**Cause:** User exists but wrong password  
**Fix:** Reset password in Supabase Dashboard:
1. Go to Authentication > Users
2. Find admin@kasirent.com
3. Click three dots (...) > "Send password reset"
4. OR manually set password in dashboard

### Can login but no admin access
**Cause:** User metadata doesn't have `userType: "admin"`  
**Fix:** Update user metadata in Supabase:
1. Go to Authentication > Users  
2. Click on admin@kasirent.com
3. Scroll to "User Metadata"
4. Add: `{ "userType": "admin" }`

### Admin link not showing in navbar
**Cause:** User metadata missing or wrong role  
**Fix:** Check browser console:
```javascript
// In browser console
const user = JSON.parse(localStorage.getItem('user') || '{}');
console.log('User type:', user.userType);
```
Should show: `User type: admin`

---

## Quick Reference

### Admin Credentials
```
📧 Email:    admin@kasirent.com
🔑 Password: #kasirent
👤 Role:     admin (in userType metadata)
```

### Where to Create
- ✅ **Supabase Dashboard** - For login to work
- ✅ **MySQL Database** - For backend API access

### How to Create
1. **Supabase:** Dashboard > Authentication > Users > Add user
2. **MySQL:** Run `node create-admin.js` (already done)

### How to Test
```bash
# Start servers
cd server && npm start
cd client && npm run dev

# Open browser
http://localhost:5173/signin

# Login with
admin@kasirent.com
#kasirent
```

---

## Next Steps

1. **Create admin in Supabase** (use Method 1 above - easiest)
2. **Test login** at http://localhost:5173/signin
3. **Access admin dashboard** at http://localhost:5173/admin
4. **Verify documents** are visible with "View" links

---

**Last Updated:** January 2026  
**Status:** Solution Provided - Action Required
