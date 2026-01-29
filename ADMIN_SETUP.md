# Admin Account Setup & Access

This document explains how to create and use the admin account for KasiRent.

## Creating the Admin Account

### Step 1: Run the Admin Creation Script

Navigate to the server directory and run:

```bash
cd server
node create-admin.js
```

### Step 2: Admin Credentials

The script creates an admin account with these **specific credentials**:

```
📧 Email:    admin@kasirent.com
🔑 Password: #kasirent
👤 Role:     admin
```

**Important Notes:**
- The password `#kasirent` is hardcoded as requested
- If the admin already exists, the script will update the role and password
- The script will display the credentials after successful creation

## Admin Access & Permissions

### What Admins Can Access

1. **Admin Dashboard** (`/admin`)
   - View all tenant verification requests
   - Filter by status (Pending, Verified, Rejected)
   - Review verification details
   - Access all uploaded documents

2. **Tenant Verification System**
   - View all verification documents:
     - ID Documents (passport, driver's license, etc.)
     - Employment Letters
     - Bank Statements
     - Credit Reports
     - Reference Letters
   - Approve/reject verifications
   - Add admin notes (internal only)
   - Add rejection reasons (visible to tenant)

3. **Individual Field Verification**
   - Mark ID as verified
   - Mark employment as verified
   - Mark financial documents as verified
   - Mark references as verified

### How to Login as Admin

1. Navigate to the login page: `http://localhost:5173/signin`
2. Enter credentials:
   - Email: `admin@kasirent.com`
   - Password: `#kasirent`
3. Click "Sign In"
4. You will be redirected and see the "Admin" link in the navbar

### Accessing the Admin Dashboard

After logging in as admin:

1. Click the **Shield icon** (Admin) in the navigation bar
2. Or navigate directly to: `http://localhost:5173/admin`
3. You will see the Admin Dashboard with verification requests

## Verification Workflow

### Tenant Submits Verification

1. Tenant logs in and goes to `/verification`
2. Fills out 4-step form:
   - Personal Information (ID)
   - Employment Details
   - Financial Information
   - References
3. Uploads required documents
4. Submits verification request
5. Status shows as "Pending"

### Admin Reviews Verification

1. Admin logs in and goes to `/admin`
2. Sees verification in the "Pending" tab
3. Clicks on the verification to view details
4. Reviews all uploaded documents:
   - Click "View" link to open/download each document
5. Checks individual verification boxes for each category
6. Adds admin notes (internal, not visible to tenant)
7. Either:
   - **Approve:** All boxes must be checked
   - **Reject:** Must provide rejection reason

### Tenant Sees Result

1. Tenant returns to `/verification`
2. Status updated to either:
   - **Verified:** Green badge with checkmarks for verified categories
   - **Rejected:** Red badge with rejection reason and option to resubmit

## Security Features

### Document Security

- **Tenant Access:** Tenants can only see their own verification status
- **Tenant Limitation:** Document URLs are NOT returned to tenant API calls
- **Admin Access:** Only admins can view actual document files
- **Backend Protection:** `authorizeRole('admin')` middleware on all document routes

### Route Protection

- **Frontend:** `ProtectedRoute` component with `requiredRole="admin"`
- **Backend:** `authorizeRole('admin')` middleware on API routes
- **Access Control:** 
  - Tenants cannot access `/admin` (redirected to `/dashboard/tenant`)
  - Landlords cannot access `/admin` (redirected to `/dashboard/landlord`)
  - Non-authenticated users redirected to `/signin`

### Role-Based Access

```
Admin:      Access to everything
Landlord:   Access to landlord dashboard and property management
Tenant:     Access to tenant dashboard and verification submission
```

## Troubleshooting

### Can't Login as Admin

**Issue:** Login fails with admin@kasirent.com

**Solutions:**
1. Verify admin was created:
   ```bash
   cd server
   node create-admin.js
   ```
2. Check database:
   ```sql
   SELECT id, email, role FROM users WHERE email = 'admin@kasirent.com';
   ```
3. Ensure password is exactly: `#kasirent` (with # symbol)

### Can't Access Admin Dashboard

**Issue:** Redirected when accessing `/admin`

**Solutions:**
1. Verify you're logged in as admin (check navbar for Shield icon)
2. Check user role in console:
   ```javascript
   // In browser console
   localStorage.getItem('user')
   ```
3. Ensure `requiredRole="admin"` is set on the route in App.tsx

### Documents Not Loading

**Issue:** Document links don't work in admin dashboard

**Solutions:**
1. Check server is running on port 5001
2. Verify documents exist in `/uploads/verifications/`
3. Check file permissions on uploads folder
4. Verify API returns document URLs for admin (not for tenants)

### Admin Role Not Working

**Issue:** User has admin role but no access

**Solutions:**
1. Re-run admin creation script to update role:
   ```bash
   cd server
   node create-admin.js
   ```
2. Clear browser cache and localStorage
3. Login again with admin credentials

## Changing Admin Password

If you need to change the admin password from `#kasirent`:

### Option 1: Edit create-admin.js

1. Open `server/create-admin.js`
2. Change line:
   ```javascript
   const adminPassword = '#kasirent'; // Change this
   ```
3. Run the script again:
   ```bash
   node create-admin.js
   ```

### Option 2: Direct Database Update

```sql
-- Generate new password hash (use bcrypt with 10 rounds)
UPDATE users 
SET password = '$2b$10$YOUR_NEW_HASHED_PASSWORD'
WHERE email = 'admin@kasirent.com';
```

## API Endpoints for Admin

All admin endpoints require authentication and admin role:

```
GET    /api/verification/admin/pending      - List pending verifications
GET    /api/verification/admin/all          - List all verifications (with filter)
GET    /api/verification/admin/:id          - Get verification details with documents
PUT    /api/verification/admin/:id/review   - Approve/reject verification
```

Example API call:
```javascript
const response = await fetch('http://localhost:5001/api/verification/admin/pending', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## Database Schema

### Admin Role in Users Table

```sql
role ENUM('landlord', 'tenant', 'agent', 'admin') DEFAULT 'tenant'
```

### Tenant Verifications Table

Stores all verification data including:
- Personal information
- Employment details
- Financial information
- References
- Document file paths
- Verification status flags
- Admin review data

## Best Practices

1. **Change Default Password:** After first login, consider changing from `#kasirent`
2. **Regular Review:** Check pending verifications daily
3. **Document Review:** Always download and review documents before approving
4. **Admin Notes:** Use internal notes to document your review process
5. **Rejection Reasons:** Be clear and specific when rejecting verifications
6. **Security:** Never share admin credentials
7. **Backup:** Keep backups of verification documents

## Support

If you encounter issues not covered in this guide:

1. Check server logs: `npm start` output in server directory
2. Check browser console: F12 → Console tab
3. Verify database connection: Check `.env` file in server directory
4. Test API endpoints: Use Postman or similar tool

---

**Last Updated:** January 2025
**Version:** 1.0
