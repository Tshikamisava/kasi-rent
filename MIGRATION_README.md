# KasiRent - MySQL Migration Complete

## Overview
The KasiRent application has been successfully migrated from Supabase to a Node.js backend with MySQL database.

## Architecture

### Backend (Node.js + Express + MySQL)
- **Location**: `server/` directory
- **Database**: MySQL with connection pooling
- **Authentication**: JWT-based authentication
- **File Uploads**: Local file storage (uploads directory)
- **Port**: 5001 (configurable via `.env`)

### Frontend (React + TypeScript)
- **Location**: `client/` directory
- **API Communication**: REST API calls to Node.js backend
- **Authentication**: JWT tokens stored in localStorage

## Setup Instructions

### 1. MySQL Database Setup

Install MySQL and create a database:

```sql
CREATE DATABASE kasi_rent;
```

### 2. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Edit .env with your MySQL credentials:
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=kasi_rent
# JWT_SECRET=your_secure_secret_key

# Initialize database tables
npm run init-db

# Start the server
npm run dev
```

The server will run on `http://localhost:5001`

### 3. Frontend Setup

```bash
cd client

# Remove Supabase package (already done)
npm uninstall @supabase/supabase-js

# Install dependencies
npm install

# Configure API URL in .env
echo "VITE_API_URL=http://localhost:5001" > .env

# Start the frontend
npm run dev
```

The frontend will run on `http://localhost:5173`

## Database Schema

### Tables Created:
1. **users** - User accounts with email/password
2. **user_roles** - User role assignments (tenant, landlord, agent, admin)
3. **properties** - Property listings with images
4. **bookings** - Booking requests and confirmations
5. **favorites** - User favorite properties
6. **reviews** - Property reviews and ratings
7. **messages** - Chat messages between users

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Properties
- `GET /api/properties` - Get all properties
- `GET /api/properties/:id` - Get property by ID
- `POST /api/properties` - Create property (landlord only)
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

### Bookings
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking status

### Favorites
- `GET /api/favorites` - Get user favorites
- `POST /api/favorites` - Add favorite
- `DELETE /api/favorites/:id` - Remove favorite

### Reviews
- `GET /api/reviews/:propertyId` - Get property reviews
- `POST /api/reviews` - Create review

### Chat
- `GET /api/chats` - Get conversations
- `GET /api/messages/:conversationId` - Get messages
- `POST /api/messages` - Send message (via Socket.IO)

### Upload
- `POST /api/upload` - Upload file (images, audio)

## Changes Made

### Removed:
- `@supabase/supabase-js` package from package.json
- All Supabase imports from components and pages
- Supabase client configuration files can be kept for reference but are not used
- Supabase storage calls (replaced with API uploads)

### Updated:
- Authentication now uses JWT tokens via `/api/auth/login`
- All data fetching now uses REST API calls
- File uploads use `/api/upload` endpoint
- Sign out now clears localStorage instead of calling Supabase

### Frontend Files Modified:
- `src/components/FeaturedProperties.tsx`
- `src/pages/Properties.tsx`
- `src/pages/SignIn.tsx`
- `src/pages/TenantDashboard.tsx`
- `src/pages/LandlordDashboard.tsx`
- `src/pages/MapSearch.tsx`
- `src/pages/Chat.tsx`
- `src/components/PropertyDetailModal.tsx`

## Environment Variables

### Backend (.env)
```env
PORT=5001
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=kasi_rent
DB_PORT=3306

JWT_SECRET=your_very_secure_jwt_secret_key
JWT_EXPIRES_IN=7d

UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5001
```

## Testing

1. **Start MySQL**:
   ```bash
   # Windows (if installed as service)
   net start MySQL80
   
   # Or start MySQL via XAMPP/WAMP control panel
   ```

2. **Start Backend**:
   ```bash
   cd server
   npm run dev
   ```

3. **Start Frontend**:
   ```bash
   cd client
   npm run dev
   ```

4. **Test Flow**:
   - Register a new user at `/get-started`
   - Login at `/signin`
   - Create property (as landlord)
   - Browse properties as tenant
   - Test chat functionality

## Migration Benefits

1. **Full Control**: Complete control over database schema and queries
2. **Performance**: Direct MySQL queries without third-party overhead
3. **Cost**: No Supabase subscription fees
4. **Flexibility**: Easier to customize and extend
5. **Local Development**: Can develop entirely offline

## Troubleshooting

### Database Connection Issues:
- Verify MySQL is running
- Check credentials in `.env`
- Ensure database `kasi_rent` exists
- Run `npm run init-db` to create tables

### Authentication Issues:
- Clear browser localStorage
- Verify JWT_SECRET is set in backend `.env`
- Check that API_URL is correct in frontend `.env`

### Port Conflicts:
- Backend uses port 5001 (change in `.env` if needed)
- Frontend uses port 5173 (change in `vite.config.ts` if needed)

## Production Deployment

For production:
1. Use environment-specific `.env` files
2. Set `NODE_ENV=production`
3. Use a production-grade MySQL instance
4. Set strong `JWT_SECRET`
5. Configure CORS for your domain
6. Use HTTPS for all connections
7. Set up proper error logging
8. Configure file upload limits
9. Set up database backups

## Support

If you encounter any issues:
1. Check the console for error messages
2. Verify all environment variables are set
3. Ensure MySQL is running and accessible
4. Check that all dependencies are installed
5. Review the API endpoint paths match between frontend and backend
