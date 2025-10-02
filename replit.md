# Maputo Import Hub - E-commerce Platform

## Overview

Maputo Import Hub is a full-stack e-commerce platform for importing and selling Chinese products (construction materials, furniture, electronics) in Maputo, Mozambique. The platform serves both B2B (construction companies) and B2C (individual consumers) markets with dual currency support (MZN/USD) and WhatsApp Business integration for orders and quotations.

The application is built as a modern web platform optimized for mobile users (80% of traffic) with features for product browsing, shopping cart management, checkout, and comprehensive admin capabilities for inventory and order management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Tooling:**
- React 18+ with TypeScript for type safety
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management
- Zustand with persistence for client-side cart state management

**UI Framework:**
- Shadcn/ui component library (New York style) built on Radix UI primitives
- Tailwind CSS for styling with custom color scheme (blue primary, red accent, yellow CTA buttons)
- Custom CSS variables for theming support
- Responsive-first design approach

**State Management Strategy:**
- Server state: TanStack Query with query invalidation patterns
- Client state: Zustand store with localStorage persistence for shopping cart
- Form state: React Hook Form with Zod schema validation

**Key Frontend Features:**
- Product catalog with category filtering and search
- Shopping cart with quantity management
- Multi-step checkout process
- Admin dashboard with product and order management
- WhatsApp Business integration for direct customer communication

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript
- RESTful API design pattern
- Custom middleware for request logging and error handling

**API Structure:**
- `/api/products` - Product CRUD operations with filtering
- `/api/orders` - Order management
- `/api/cart` - Shopping cart operations
- `/api/admin` - Admin authentication and operations

**Storage Layer:**
- Designed for PostgreSQL via Drizzle ORM
- Currently using in-memory storage (MemStorage class) as fallback
- Database schema defined in `shared/schema.ts` for type sharing between client and server

**Data Models:**
- Products: Name, description, category, dual pricing (MZN/USD), stock, images, specifications
- Orders: Customer information, delivery details, order items, payment method, status tracking
- Cart Items: Session-based cart with product references
- Admin Users: Email-based authentication

### Data Storage Solutions

**Database Configuration:**
- Primary: PostgreSQL via Neon serverless driver
- ORM: Drizzle ORM with TypeScript schema definitions
- Migration strategy: Drizzle Kit for schema migrations
- Connection pooling through Neon serverless

**Schema Design:**
- Products table: Supports JSONB for images array and specifications object
- Orders table: JSONB for order items array, supports complete order history
- Cart items: Session-based with foreign key to products
- Generated UUIDs for primary keys using PostgreSQL's gen_random_uuid()

**Data Validation:**
- Zod schemas derived from Drizzle schema using drizzle-zod
- Client-side validation via React Hook Form
- Server-side validation on all API endpoints

### Authentication and Authorization

**Admin Authentication:**
- Email/password-based login system
- Session storage in localStorage (client-side)
- Protected admin routes with route guards
- No current JWT/token system (simplified for initial implementation)

**Session Management:**
- Anonymous cart sessions using generated session IDs
- Session persistence via localStorage
- Session-based cart items in database

### External Dependencies

**Third-Party Services:**
- Neon Database: Serverless PostgreSQL hosting
- WhatsApp Business API: Customer communication via wa.me links with pre-filled messages
- Vercel (deployment target): Optimized for hosting with automatic builds

**Payment Integration:**
- Current: Cash on delivery, bank transfer
- Planned: M-Pesa integration (noted as "coming soon" in UI)

**Image Handling:**
- Product images stored as URL arrays in JSONB
- External image hosting (placeholder URLs or future CDN integration)
- Fallback to placeholder images

**Development Tools:**
- Replit-specific plugins for development environment
- Vite plugins for error overlay and development features
- ESBuild for server-side bundling in production

**Localization:**
- Portuguese language UI (Mozambique market)
- Dual currency display: MZN (primary) and USD (secondary)
- Fixed exchange rate: 1 USD = 64 MZN

**Key Integration Points:**
- WhatsApp message generation with order details and customer information
- Currency conversion utilities for MZN/USD switching
- Form data to WhatsApp message transformation for B2B quotations