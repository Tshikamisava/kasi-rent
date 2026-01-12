# OAuth Setup with MySQL (No Supabase Required)

Your KasiRent app now uses **MySQL + Passport.js** for OAuth authentication instead of Supabase.

## ✅ What's Been Implemented

- Passport.js OAuth strategies for Google, GitHub, and Facebook
- MySQL schema updated with `oauth_provider` and `oauth_id` columns
- Backend OAuth routes at `/api/auth/{provider}`
- Client updated to use backend OAuth flow (no more Supabase auth)

## 🚀 Setup Steps

### 1. Run MySQL Migration

```bash
cd server
mysql -u root -p kasirent < migrations/add-oauth-columns.sql
```

Or manually in MySQL Workbench:
```sql
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS oauth_provider VARCHAR(50) NULL,
ADD COLUMN IF NOT EXISTS oauth_id VARCHAR(255) NULL,
ADD INDEX idx_oauth (oauth_provider, oauth_id);

ALTER TABLE users 
MODIFY COLUMN password VARCHAR(255) NULL;
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and add your OAuth credentials:

```bash
cp .env.example .env
```

Then edit `.env` and add:

```env
PORT=5001
CLIENT_URL=http://localhost:5174
SESSION_SECRET=your-random-secret-here
JWT_SECRET=your-jwt-secret-here

# Add OAuth credentials (see steps below)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
# etc.
```

### 3. Get OAuth Credentials

#### **Google OAuth**
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project or select existing
3. Enable "Google+ API"
4. Create "OAuth client ID" → Web application
5. Add Authorized redirect URI: `http://localhost:5001/api/auth/google/callback`
6. Copy Client ID and Secret to `.env`

#### **GitHub OAuth**
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. New OAuth App
3. Homepage URL: `http://localhost:5174`
4. Authorization callback URL: `http://localhost:5001/api/auth/github/callback`
5. Copy Client ID and Secret to `.env`

#### **Facebook OAuth** (Optional)
1. Go to [Facebook Developers](https://developers.facebook.com/apps)
2. Create App → Consumer
3. Add Facebook Login product
4. Valid OAuth Redirect URIs: `http://localhost:5001/api/auth/facebook/callback`
5. Copy App ID and Secret to `.env`

### 4. Start Your Servers

```bash
# Terminal 1 - Server
cd server
npm start

# Terminal 2 - Client
cd client
npm run dev
```

### 5. Test OAuth Login

1. Open http://localhost:5174/signin
2. Click "Continue with Google" (or GitHub/Facebook)
3. You'll be redirected to the provider
4. After authorization, you'll be redirected back with a token
5. You should be logged in automatically!

## 🔧 How It Works

1. User clicks "Continue with Google" → redirects to `/api/auth/google`
2. Passport redirects to Google OAuth consent screen
3. User approves → Google redirects to `/api/auth/google/callback`
4. Backend creates/finds user in MySQL, generates JWT token
5. Backend redirects to client with `?token=xxx&user={...}`
6. Client saves token to Zustand store and navigates to dashboard

## 🛠️ Troubleshooting

**"Redirect URI mismatch"**: Make sure callback URLs in OAuth provider settings exactly match your `.env` settings

**"Provider not configured"**: Check that CLIENT_ID and CLIENT_SECRET are set in `.env`

**404 on callback**: Verify server is running on port 5001 and routes are registered

**Token not saved**: Check browser console for errors in SignIn.tsx

## 📝 Production Deployment

When deploying, update:
- `CLIENT_URL` to your production domain
- OAuth callback URLs to `https://your-domain.com/api/auth/{provider}/callback`
- Add production callback URLs in each OAuth provider's settings
- Set `NODE_ENV=production`
- Use secure session secret
