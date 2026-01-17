/**
 * Create Admin User in Supabase
 * 
 * This creates an admin user in Supabase Auth (which is what the login uses).
 * The MySQL script creates a user in the database, but login goes through Supabase.
 * 
 * IMPORTANT: You need to create the admin user in Supabase Dashboard manually:
 * 
 * 1. Go to: https://supabase.com/dashboard
 * 2. Select your project
 * 3. Go to Authentication > Users
 * 4. Click "Add user" > "Create new user"
 * 5. Enter:
 *    - Email: admin@kasirent.com
 *    - Password: #kasirent
 *    - Confirm Password: #kasirent
 * 6. Click "User Metadata" section
 * 7. Add metadata:
 *    {
 *      "name": "KasiRent Admin",
 *      "userType": "admin"
 *    }
 * 8. Click "Create user"
 * 
 * ALTERNATIVE - Use Supabase SQL Editor:
 * 
 * Go to SQL Editor in Supabase Dashboard and run:
 * 
 * -- First, find the admin user ID from auth.users (after creating via UI)
 * SELECT id, email FROM auth.users WHERE email = 'admin@kasirent.com';
 * 
 * -- Then update the user metadata to include admin role
 * UPDATE auth.users 
 * SET raw_user_meta_data = jsonb_set(
 *   raw_user_meta_data, 
 *   '{userType}', 
 *   '"admin"'
 * )
 * WHERE email = 'admin@kasirent.com';
 * 
 * OR - Use Supabase Management API (requires service role key):
 * This would require your Supabase service role key which is sensitive.
 * Best to create via the Supabase Dashboard UI.
 */

console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║         ADMIN USER MUST BE CREATED IN SUPABASE              ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

The KasiRent application uses Supabase for authentication.
The MySQL database is only for storing additional data.

TO CREATE ADMIN USER:

1. Go to Supabase Dashboard:
   https://supabase.com/dashboard
   
2. Select your "kasi-rent" project

3. Navigate to: Authentication > Users

4. Click "Add user" button > "Create new user"

5. Fill in the form:
   ┌─────────────────────────────────────┐
   │ Email:    admin@kasirent.com        │
   │ Password: #kasirent                 │
   │ Confirm:  #kasirent                 │
   └─────────────────────────────────────┘

6. Expand "User Metadata" section

7. Add this JSON:
   ┌─────────────────────────────────────┐
   │ {                                   │
   │   "name": "KasiRent Admin",         │
   │   "userType": "admin"               │
   │ }                                   │
   └─────────────────────────────────────┘

8. Click "Create user"

9. Done! You can now login with:
   📧 admin@kasirent.com
   🔑 #kasirent

═══════════════════════════════════════════════════════════════

IMPORTANT NOTES:

• The login page uses Supabase Auth, not MySQL
• MySQL only stores property/booking data
• User authentication is handled by Supabase
• The admin role is set in user_metadata.userType

═══════════════════════════════════════════════════════════════

After creating the admin in Supabase, you can also sync it to MySQL
by running: node sync-admin-to-mysql.js

`);
