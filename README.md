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
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **State Management**: Zustand
- **Deployment**: Vercel

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

2. Install dependencies:
```bash
cd client
npm install
```

3. Set up environment variables:
Create a `.env` file in the client directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

4. Start the development server:
```bash
npm run dev
```

## Authentication System

The application uses Supabase for authentication with the following user types:
- **Tenants**: Users looking for properties to rent
- **Landlords**: Property owners managing their listings

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
├── vercel.json            # Vercel deployment configuration
└── README.md              # This file
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
