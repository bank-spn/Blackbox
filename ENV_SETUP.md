# Environment Configuration Guide

## Required Environment Variables

### Database Configuration
```
DATABASE_URL=postgresql://user:password@host:port/database
```

**For Supabase:**
```
DATABASE_URL=postgresql://postgres.xxxxx:password@db.supabase.co:5432/postgres
```

**For Local PostgreSQL:**
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/restaurant_erp
```

### Authentication
```
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### Application Settings
```
VITE_APP_TITLE=Restaurant ERP System
VITE_APP_LOGO=https://example.com/logo.png
NODE_ENV=production
```

## Setup Instructions

### 1. Local Development
```bash
# Copy environment template
cp ENV_SETUP.md .env.local

# Edit .env.local with your database credentials
nano .env.local

# Install dependencies
pnpm install

# Run migrations
pnpm db:push

# Start development server
pnpm dev
```

### 2. Supabase Setup
1. Create a new Supabase project at https://supabase.com
2. Go to Project Settings → Database
3. Copy the connection string
4. Add to your environment:
   ```
   DATABASE_URL=postgresql://postgres.xxxxx:password@db.supabase.co:5432/postgres
   ```
5. Enable SSL in production (add `?sslmode=require` to connection string)

### 3. Vercel Deployment
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard:
   - DATABASE_URL
   - JWT_SECRET
   - VITE_APP_TITLE
   - VITE_APP_LOGO
4. Deploy

### 4. Netlify Deployment
1. Push code to GitHub
2. Connect repository to Netlify
3. Set build command: `pnpm build`
4. Set publish directory: `client/dist`
5. Add environment variables in Netlify dashboard
6. Deploy

## Security Best Practices

1. **Never commit .env files** - Add to .gitignore
2. **Use strong JWT_SECRET** - Generate with: `openssl rand -base64 32`
3. **Enable SSL in production** - Always use `?sslmode=require` for database
4. **Rotate secrets regularly** - Change JWT_SECRET and database passwords
5. **Use environment-specific values** - Different secrets for dev/staging/production

## Troubleshooting

### Database Connection Error
- Check DATABASE_URL format
- Verify database server is running
- Ensure network access is allowed
- For Supabase: Check IP whitelist in project settings

### Migration Errors
```bash
# Reset database (development only)
pnpm db:push --force

# Check migration status
pnpm db:check
```

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build
```
