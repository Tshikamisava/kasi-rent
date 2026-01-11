# KasiRent AI Agent Instructions

This document provides essential context for AI agents working with the KasiRent codebase.

## Project Architecture

KasiRent is a full-stack property rental application with distinct client and server components:

### Client (`/client`)
- React + TypeScript + Vite application
- UI components using Shadcn/UI library in `/components/ui`
- Page components in `/pages` following a standard routing structure
- Custom hooks in `/hooks` for shared functionality
- State management via React hooks and context

### Server (`/server`)
- Express.js backend with MongoDB (Mongoose)
- RESTful API architecture with routes in `/routes`
- Controllers in `/controllers` handling business logic
- Models in `/models` defining data schemas
- Middleware in `/middleware` for auth and request processing
- Config in `/config` for database and cloud services

## Key Development Workflows

### Client Development
```bash
cd client
npm install
npm run dev  # Starts Vite dev server
```

### Server Development
```bash
cd server
npm install
npm start  # Runs Express server
```

## Data Models

### Property Schema
```javascript
{
  title: String,      // required
  description: String,
  price: Number,      // required
  location: String,   // required
  images: [String]    // Array of image URLs
}
```

## API Routes

- Properties: `/api/properties` - CRUD operations for property listings
- Users: `/api/users` - User authentication and management

## Project Conventions

1. Component Structure:
   - UI components use Shadcn/UI patterns (see `/components/ui`)
   - Page components handle routing and layout
   - Reusable logic extracted to custom hooks

2. File Naming:
   - React components: PascalCase (e.g., `Hero.tsx`, `FeaturedProperties.tsx`)
   - Utility files: camelCase (e.g., `utils.ts`)
   - Configuration files: kebab-case (e.g., `eslint.config.js`)

3. State Management:
   - Prefer hooks and context over external state libraries
   - See `useToast` and `useMobile` in `/hooks` for examples

## Integration Points

1. Client-Server Communication:
   - API calls from client to server
   - File uploads handled through Cloudinary (configured in `/server/config/cloudinary.js`)

2. External Services:
   - MongoDB for data persistence
   - Cloudinary for image storage
   - Authentication middleware for protected routes

## Common Patterns

1. Error Handling:
   - Server: Express error middleware
   - Client: Toast notifications using `useToast` hook

2. Component Composition:
   - Shadcn/UI components as building blocks
   - Custom components built on top of UI primitives

## Getting Started

1. Set up environment:
   - Create `.env` in server root
   - Configure MongoDB connection
   - Set up Cloudinary credentials

2. Install dependencies:
   ```bash
   # Client
   cd client && npm install
   
   # Server
   cd server && npm install
   ```

3. Start development servers:
   ```bash
   # Client (in client directory)
   npm run dev
   
   # Server (in server directory)
   npm start
   ```