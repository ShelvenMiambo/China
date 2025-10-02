# TODO: Make App Ready for Vercel Hosting

## 1. Implement Database Storage
- [x] Create DbStorage class in server/storage.ts using Drizzle ORM
- [x] Add database connection setup using @neondatabase/serverless
- [x] Replace MemStorage with DbStorage in routes.ts

## 2. Convert to Vercel Serverless Functions
- [x] Create api/ directory
- [x] Create api/products.ts (GET /api/products)
- [x] Create api/products/[id].ts (GET/PUT/DELETE/PATCH /api/products/:id)
- [x] Create api/cart.ts (POST /api/cart)
- [x] Create api/cart/[id].ts (PUT/DELETE /api/cart/:id)
- [x] Create api/cart/session/[sessionId].ts (GET/DELETE /api/cart/session/:sessionId)
- [x] Create api/orders.ts (GET/POST /api/orders)
- [ ] Create api/orders/[id]/status.ts (PATCH /api/orders/:id/status) - issue with directory creation
- [x] Create api/admin/login.ts (POST /api/admin/login)
- [x] Create api/reports/sales.ts (GET /api/reports/sales)
- [x] Create api/reports/categories.ts (GET /api/reports/categories)
- [x] Create api/reports/low-stock.ts (GET /api/reports/low-stock)
- [x] Create api/reports/export/sales.ts (GET /api/reports/export/sales)

## 3. Create Vercel Configuration
- [x] Add vercel.json with rewrites for frontend and API

## 4. Update Build Scripts
- [x] Modify package.json scripts for Vercel deployment

## 5. Environment Variables
- [ ] Set DATABASE_URL in Vercel environment variables

## 6. Testing and Deployment
- [x] Push code to GitHub repository https://github.com/ShelvenMiambo/China.git
- [ ] Connect Vercel to the GitHub repo and deploy
- [ ] Set up PostgreSQL database (e.g., Neon) and run migrations
- [ ] Test the deployed app
