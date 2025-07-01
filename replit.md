# QR Menü Pro - Digital Restaurant Menu System

## Overview

QR Menü Pro is a modern NFC/QR menu system designed for restaurants to provide digital menu experiences to customers. The application features a tiered subscription model with free and premium plans, offering restaurant owners comprehensive tools to manage their digital presence and customer interactions.

## System Architecture

The application follows a full-stack architecture with clear separation between client and server components:

### Frontend Architecture
- **Framework**: React 18 with Vite for build tooling
- **UI Components**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Language**: TypeScript for type safety

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Authentication**: Replit Auth (OpenID Connect)
- **Session Management**: Express sessions with PostgreSQL store

## Key Components

### Authentication System
The application uses Replit's OpenID Connect authentication system, providing secure user authentication without custom password management. Sessions are stored in PostgreSQL using connect-pg-simple.

### Database Schema
The database schema includes:
- **Users**: User profiles and authentication data
- **Restaurants**: Restaurant profiles with plan information
- **Categories**: Menu categorization system
- **Products**: Menu items with pricing and availability
- **Tables**: QR code generation for table-specific menus
- **Orders**: Customer order management
- **Order Items**: Individual order line items
- **Waiter Calls**: Service request system
- **Sessions**: Authentication session storage

### Subscription Management
Two-tier subscription model:
- **Free Plan**: Limited to 10 products, basic features
- **Elite Plan**: Unlimited products, advanced features, customization options

### QR Code System
Dynamic QR code generation for tables, allowing customers to access restaurant-specific menus with table identification for order tracking and service requests.

## Data Flow

1. **Authentication Flow**: Users authenticate via Replit Auth, sessions stored in PostgreSQL
2. **Restaurant Setup**: Authenticated users create restaurant profiles with plan selection
3. **Menu Management**: Restaurant owners manage categories and products within plan limits
4. **QR Generation**: Dynamic QR codes created for tables linking to public menu views
5. **Customer Experience**: QR scan leads to responsive menu with ordering capabilities
6. **Order Processing**: Orders and service requests processed through real-time updates

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL connectivity
- **drizzle-orm**: Type-safe ORM with PostgreSQL support
- **@tanstack/react-query**: Server state management
- **openid-client**: OpenID Connect authentication
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store

### UI Framework
- **@radix-ui/***: Comprehensive UI component primitives
- **class-variance-authority**: Utility for component variants
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Modern icon library

### Development Tools
- **vite**: Fast build tool and dev server
- **typescript**: Static type checking
- **drizzle-kit**: Database migrations and schema management

## Deployment Strategy

The application is configured for deployment on Replit with:
- **Development**: Vite dev server with HMR and error overlay
- **Production**: Static build served by Express with API routes
- **Database**: Neon serverless PostgreSQL with connection pooling
- **Environment**: Environment variables for database URL and session secrets

### Build Process
1. Frontend built with Vite to `dist/public`
2. Backend bundled with esbuild to `dist/index.js`
3. Single deployment artifact with static file serving

### Database Management
- Schema defined in TypeScript with Drizzle
- Migrations managed through `drizzle-kit push`
- Connection pooling for serverless environment compatibility

## Changelog
- July 01, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.