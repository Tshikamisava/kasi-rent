# KasiRent - Netlify Deployment Guide

## 🚀 Quick Deployment to Netlify

### Method 1: Drag and Drop (Recommended for first deployment)

1. **Build the project locally:**
   ```bash
   cd client
   npm install
   npm run build
   ```

2. **Drag and drop the `client/dist` folder to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Sign in to your account
   - Drag the `client/dist` folder to the deploy area
   - Your site will be deployed instantly!

### Method 2: Git Integration (Recommended for continuous deployment)

1. **Push your code to GitHub/GitLab/Bitbucket**

2. **Connect to Netlify:**
   - Go to [netlify.com](https://netlify.com) and sign in
   - Click "New site from Git"
   - Choose your repository
   - Configure build settings:
     - **Build command:** `npm run build`
     - **Publish directory:** `client/dist`
     - **Base directory:** `client`

3. **Set Environment Variables:**
   In Netlify Dashboard → Site Settings → Environment Variables, add:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
   ```

4. **Deploy:**
   - Click "Deploy site"
   - Netlify will automatically build and deploy your site

## 🔧 Environment Variables

You need to set these environment variables in Netlify:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | `https://your-project.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your Supabase publishable key | `eyJhbGciOiJIUzI1NiIs...` |

## 📝 Configuration Files

- `netlify.toml` - Netlify configuration with redirects for SPA routing
- `client/.env.example` - Template for environment variables

## 🔍 Troubleshooting

### Build Errors
If you encounter TypeScript errors during build:
```bash
npm run build  # This skips TypeScript checking for deployment
```

### 404 Errors on Refresh
The `netlify.toml` file includes redirects to handle client-side routing. Make sure this file is in the root directory.

### Authentication Issues
Make sure your Supabase environment variables are correctly set in Netlify's environment variables section.

## 🌟 Features

- ✅ User Registration & Authentication (Supabase)
- ✅ Role-based Dashboards (Tenant/Landlord/Agent)
- ✅ Responsive Design
- ✅ Protected Routes
- ✅ Toast Notifications
- ✅ Modern UI with Shadcn/UI

## 📱 Live Demo

After deployment, your live site will be available at:
`https://your-site-name.netlify.app`