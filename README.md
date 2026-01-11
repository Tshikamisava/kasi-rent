# KasiRent - Township Property Rental Platform

KasiRent is a modern web application designed to connect tenants and landlords in township areas, making property rental easier and more accessible.

## Features

- **User Authentication**: Secure registration and login for tenants and landlords
- **Role-Based Dashboards**: Separate interfaces for tenants and landlords
- **Property Listings**: Browse and manage property rentals
- **Responsive Design**: Works seamlessly on all devices
- **Modern UI**: Built with Shadcn/UI components for a beautiful user experience

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Cloudinary
- **Deployment**: Vercel (Frontend), Custom hosting (Backend)

## Live Application

🌐 **Production**: [KasiRent Live App](https://kasi-rent.vercel.app)

## Local Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Tshikamisava/kasi-rent.git
cd kasi-rent
```

2. Install server dependencies:
```bash
cd server
npm install
```

3. Set up server environment variables:
Create a `.env` file in the server directory (use `.env.example` as template):
```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=kasirent

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

4. Install client dependencies:
```bash
cd ../client
npm install
```

5. Start the development servers:
```bash
# In server directory
npm start

# In client directory (separate terminal)
npm run dev
```

## Authentication System

The application uses JWT-based authentication with the following user types:
- **Tenants**: Users looking for properties to rent
- **Landlords**: Property owners managing their listings

## Database Utilities

The project includes several utility scripts for database management and verification. 
For a complete guide, see [DATABASE_UTILITIES.md](./DATABASE_UTILITIES.md).

### Quick Start: Check Users Table Structure
To verify the users table structure in your MySQL database:

**Windows (PowerShell):**
```powershell
.\check-users-table.ps1
```

**Linux/Mac:**
```bash
./check-users-table.sh
```

**Or directly:**
```bash
cd server
node check-users-table.js
```

These scripts will display the current structure of the users table, helping you verify that migrations have been applied correctly.

## Deployment

The application is configured for automatic deployment to Vercel via GitHub integration.

### Manual Deployment
```bash
# Build the application
cd client
npm run build

# The built files will be in client/dist
```

## Project Structure

```
kasi-rent/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and configurations
│   │   └── assets/        # Images and static files
│   ├── public/            # Public static files
│   └── dist/              # Built application (after build)
├── server/                # Backend Express application
│   ├── config/           # Database and service configurations
│   ├── controllers/      # Request handlers
│   ├── models/          # Sequelize models
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   └── *.js             # Utility scripts for DB management
├── check-users-table.ps1 # PowerShell utility to check users table
├── check-users-table.sh  # Bash utility to check users table
├── vercel.json          # Vercel deployment configuration
└── README.md            # This file
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

---

Built with ❤️ for the township community
