# USALLI Bank - AI Studio App

## Overview
USALLI Bank is a React-based banking application with a Node.js/Express backend. It provides features for client account management, money transfers, credit requests, and admin oversight with multi-language support (English, Spanish, French).

## Project Architecture

### Frontend (React + TypeScript + Vite)
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 5
- **Port**: 5000 (configured for Replit environment)
- **Key Features**:
  - User authentication (client/admin roles)
  - Account management and balance tracking
  - Money transfer functionality with multi-step verification
  - Credit request system
  - Chat interface
  - Multi-language support (i18n)

### Backend (Express.js)
- **Framework**: Express 4
- **Port**: 3001 (localhost only)
- **Database**: PostgreSQL (Supabase hosted)
  - Connection via environment variable `DATABASE_URL`
  - SSL enabled with certificate validation disabled
  - Automatic URL parsing for special characters in password
- **API Routes**:
  - `/api/login` - User authentication
  - `/api/users` - User management
  - `/api/transfers` - Transfer operations
  - `/api/credit-requests` - Credit request management
  - `/api/chats` - Chat sessions
  - `/api/settings` - Application settings

### Database Schema
The PostgreSQL database includes the following tables:
- **users**: User accounts with roles (client/admin), balances
- **transfers**: Money transfer records with status tracking
- **credit_requests**: Credit application records
- **unlock_codes**: Verification codes for multi-step transfers
- **chat_messages**: Chat history per user
- **settings**: Application configuration

## Project Structure
```
├── components/       # React UI components
│   ├── ui/          # Reusable UI elements
│   ├── AdminDashboard.tsx
│   ├── ClientDashboard.tsx
│   ├── ChatWindow.tsx
│   └── ...
├── hooks/           # Custom React hooks
├── i18n/            # Internationalization files
├── server/          # Backend Express server
│   ├── server.js    # Main server file
│   ├── api.js       # API routes
│   └── db.js        # In-memory database
├── services/        # Service layer
└── types.ts         # TypeScript type definitions
```

## Recent Changes (October 27, 2025)
- **Mixed Deployment Configuration (Latest)**:
  - ✅ Frontend configured for Hostinger shared hosting
  - ✅ Backend configured for Render.com free tier
  - ✅ CORS setup for cross-origin requests (Hostinger → Render)
  - ✅ API URL configuration with environment variables
  - ✅ Created deployment guides and automation scripts
  - ✅ Added health check endpoint for monitoring
  - ✅ Created .htaccess for React Router on Hostinger
  - ✅ Build script for production deployment

- **Supabase Database Connection Verified**:
  - ✅ Confirmed DATABASE_URL secret is properly configured
  - ✅ Database connection tested and working perfectly
  - ✅ All API endpoints returning data correctly from Supabase
  - ✅ Authentication system tested (login working)
  - ✅ Transfers and credit requests retrieving from database
  - Application fully operational with Supabase PostgreSQL backend

- **GitHub Import to Replit**:
  - Installed all npm dependencies successfully (189 packages)
  - Configured Vite with HMR for Replit environment (clientPort: 443)
  - Created .gitignore for Node.js project
  - Initialized PostgreSQL database with schema and default data using init-db.js
  - Set up workflow to run both frontend (port 5000) and backend (port 3001)
  - Verified application runs successfully with login page visible
  - Both frontend and backend confirmed working

- **Initial Setup**:
  - Configured Vite to run on 0.0.0.0:5000 for Replit proxy compatibility
  - Configured Express backend to bind to localhost:3001
  - Added proper .gitignore for Node.js project
  - Installed all npm dependencies
  - Fixed LSP warnings (removed unused imports)
  - Set up workflow to run both frontend and backend concurrently

- **PostgreSQL Integration**:
  - Migrated from in-memory storage to PostgreSQL (Supabase)
  - Created complete database schema with all required tables
  - Implemented database initialization script (`server/init-db.js`)
  - Updated all API routes to use async/await for database operations
  - Added proper error handling for all database operations
  - Configured secure SSL connection with custom URL parser
  - Successfully tested all API endpoints with real database

## Development
- **Start Command**: `npm run dev` (runs both frontend and backend)
- **Frontend URL**: Port 5000
- **Backend URL**: http://localhost:3001

## Test Credentials
- **Client**: client@usalli.com (no password required)
- **Admin**: admin@usalli.com / AdminPass123!

## Tech Stack
- React 19
- TypeScript 5
- Vite 5
- Express 4
- PostgreSQL (via Supabase)
- Node.js pg driver
- Tailwind CSS (via CDN)

## Database Initialization
To reset or initialize the database with default data:
```bash
node server/init-db.js
```

This will create all tables and insert default users, transfers, and settings.
