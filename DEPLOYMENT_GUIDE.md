# Restaurant ERP System - Deployment Guide

## Overview

This is a complete Restaurant ERP system built with:
- **Frontend:** React 19 + TypeScript + Tailwind CSS
- **Backend:** Node.js + Express + tRPC
- **Database:** PostgreSQL (Supabase recommended)
- **UI Components:** shadcn/ui

## Features

- **Dashboard:** Real-time metrics and overview
- **POS System:** Order creation and management
- **Cashier:** Cash register and session management
- **Inventory:** Stock tracking and management
- **Employees:** Staff management and scheduling
- **Financial Management:** Revenue, expenses, and reporting
- **Audit Log:** System activity tracking
- **Settings:** System configuration and database setup

## Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm (or npm/yarn)
- PostgreSQL database or Supabase account

### Local Development

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment variables
cp ENV_SETUP.md .env.local
# Edit .env.local with your database credentials

# 3. Run database migrations
pnpm db:push

# 4. Start development server
pnpm dev

# App will be available at http://localhost:3000
```

## Database Setup

### Option 1: Supabase (Recommended for Production)

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create new project
   - Note your project URL and API key

2. **Get Connection String**
   - Go to Project Settings → Database
   - Copy the connection string
   - Format: `postgresql://postgres.xxxxx:password@db.supabase.co:5432/postgres`

3. **Import Schema**
   - Option A: Use Supabase SQL Editor
     - Copy contents of `supabase-schema.sql`
     - Paste into SQL Editor and execute
   - Option B: Use psql command
     ```bash
     psql "postgresql://user:password@db.supabase.co:5432/postgres" < supabase-schema.sql
     ```

4. **Set Environment Variable**
   ```
   DATABASE_URL=postgresql://postgres.xxxxx:password@db.supabase.co:5432/postgres?sslmode=require
   ```

### Option 2: Local PostgreSQL

```bash
# 1. Create database
createdb restaurant_erp

# 2. Import schema
psql restaurant_erp < supabase-schema.sql

# 3. Set environment variable
DATABASE_URL=postgresql://postgres:password@localhost:5432/restaurant_erp
```

## Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Select your GitHub repository
   - Click "Import"

3. **Configure Environment Variables**
   - In Vercel dashboard, go to Settings → Environment Variables
   - Add the following:
     ```
     DATABASE_URL=postgresql://...
     JWT_SECRET=your-secret-key
     VITE_APP_TITLE=Restaurant ERP
     VITE_APP_LOGO=https://your-logo-url.png
     NODE_ENV=production
     ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically

### Deploy to Netlify

1. **Push to GitHub** (same as above)

2. **Connect to Netlify**
   - Go to https://netlify.com
   - Click "New site from Git"
   - Select your GitHub repository
   - Click "Connect"

3. **Configure Build Settings**
   - Build command: `pnpm build`
   - Publish directory: `client/dist`
   - Click "Save"

4. **Add Environment Variables**
   - Go to Site settings → Build & deploy → Environment
   - Add environment variables:
     ```
     DATABASE_URL=postgresql://...
     JWT_SECRET=your-secret-key
     VITE_APP_TITLE=Restaurant ERP
     VITE_APP_LOGO=https://your-logo-url.png
     NODE_ENV=production
     ```

5. **Deploy**
   - Netlify will automatically deploy on push to main branch

## Build & Optimization

### Production Build

```bash
# Build frontend and backend
pnpm build

# Output:
# - client/dist/ - Frontend static files
# - server/ - Backend compiled files
```

### Environment Variables

Required for production:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT signing (use strong random string)
- `VITE_APP_TITLE` - Application title
- `VITE_APP_LOGO` - Logo image URL
- `NODE_ENV=production`

### Security Checklist

- [ ] Use strong `JWT_SECRET` (min 32 characters)
- [ ] Enable SSL for database connection (`?sslmode=require`)
- [ ] Set `NODE_ENV=production`
- [ ] Use HTTPS for all external URLs
- [ ] Enable CORS appropriately
- [ ] Regularly rotate secrets
- [ ] Monitor audit logs
- [ ] Backup database regularly

## Troubleshooting

### Build Errors

```bash
# Clear cache and rebuild
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build
```

### Database Connection Issues

1. Check DATABASE_URL format
2. Verify database server is running
3. For Supabase: Check IP whitelist in project settings
4. Test connection:
   ```bash
   psql "your-connection-string"
   ```

### Migration Errors

```bash
# Reset database (development only)
pnpm db:push --force

# Check migration status
pnpm db:check
```

## Performance Optimization

### Frontend
- Vite for fast builds
- React 19 with automatic optimization
- Tailwind CSS with tree-shaking
- Code splitting by route

### Backend
- tRPC for type-safe API
- Connection pooling with Drizzle ORM
- Database indexes on frequently queried columns
- Caching strategies

### Database
- Indexes on foreign keys and frequently filtered columns
- Connection pooling (Supabase handles this)
- Regular maintenance and vacuuming

## Monitoring

### Logs
- Check deployment logs in Vercel/Netlify dashboard
- Monitor server logs for errors
- Review audit logs in application

### Metrics
- Monitor database query performance
- Track API response times
- Watch for memory leaks

### Backups
- Enable automatic backups in Supabase
- Regular manual backups recommended
- Test restore procedures

## Support & Documentation

- **Supabase Docs:** https://supabase.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **Netlify Docs:** https://docs.netlify.com
- **React Docs:** https://react.dev
- **Drizzle ORM:** https://orm.drizzle.team

## License

This project is provided as-is for restaurant management.

## Contact

For issues or questions, refer to the documentation or contact your development team.
