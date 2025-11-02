# Deployment Guide

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

Vercel is the easiest way to deploy Next.js applications.

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Deploy**
```bash
cd restaurant-erp
vercel
```

3. **Follow the prompts**
- Set up and deploy
- Link to existing project or create new
- Deploy to production

**Vercel Dashboard**: https://vercel.com/dashboard

### Option 2: Netlify

1. **Install Netlify CLI**
```bash
npm install -g netlify-cli
```

2. **Build the project**
```bash
npm run build
```

3. **Deploy**
```bash
netlify deploy --prod
```

### Option 3: Docker

1. **Create Dockerfile**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

2. **Build and run**
```bash
docker build -t restaurant-erp .
docker run -p 3000:3000 restaurant-erp
```

### Option 4: Traditional Server (VPS/Cloud)

1. **Prerequisites**
- Node.js 18+ installed
- PM2 for process management

2. **Setup**
```bash
# Clone/upload your project
cd restaurant-erp

# Install dependencies
npm ci --production

# Build
npm run build

# Install PM2
npm install -g pm2

# Start with PM2
pm2 start npm --name "restaurant-erp" -- start

# Save PM2 configuration
pm2 save
pm2 startup
```

3. **Nginx Configuration** (Optional)
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔧 Environment Variables

Create a `.env.local` file for environment-specific configuration:

```env
# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Database (when you add real database)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Authentication (when you add JWT)
JWT_SECRET=your-secret-key-here

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password
```

## 📋 Pre-Deployment Checklist

- [ ] Run `npm run build` successfully
- [ ] Test all features locally
- [ ] Update environment variables
- [ ] Configure database connection (if using real DB)
- [ ] Set up SSL certificate
- [ ] Configure domain name
- [ ] Test authentication flow
- [ ] Verify API endpoints
- [ ] Check responsive design
- [ ] Test on different browsers
- [ ] Set up monitoring/logging
- [ ] Configure backup strategy

## 🔒 Security Considerations

1. **Environment Variables**
   - Never commit `.env` files
   - Use secure secrets
   - Rotate keys regularly

2. **Database**
   - Use connection pooling
   - Enable SSL connections
   - Regular backups
   - Access control

3. **Authentication**
   - Implement JWT tokens
   - Add rate limiting
   - Enable HTTPS only
   - Session timeout

4. **API Security**
   - Add CORS configuration
   - Implement rate limiting
   - Validate all inputs
   - Sanitize data

## 📊 Monitoring

### Recommended Tools

1. **Vercel Analytics** (if using Vercel)
2. **Google Analytics**
3. **Sentry** for error tracking
4. **LogRocket** for session replay
5. **Uptime Robot** for uptime monitoring

### Setup Example (Sentry)

```bash
npm install @sentry/nextjs
```

```javascript
// sentry.client.config.js
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

## 🗄️ Database Migration

When moving from in-memory to real database:

1. **Choose Database**
   - PostgreSQL (recommended)
   - MongoDB
   - MySQL

2. **Install ORM**
```bash
npm install prisma @prisma/client
# or
npm install mongoose
```

3. **Update `lib/db.ts`**
   - Replace in-memory storage
   - Add database client
   - Implement connection pooling

4. **Run Migrations**
```bash
npx prisma migrate dev
```

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm test
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 📱 Performance Optimization

1. **Enable Caching**
```javascript
// next.config.ts
module.exports = {
  headers: async () => [
    {
      source: '/:all*(svg|jpg|png)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ],
};
```

2. **Image Optimization**
   - Use Next.js Image component
   - Compress images
   - Use WebP format

3. **Code Splitting**
   - Already handled by Next.js
   - Use dynamic imports for heavy components

## 🆘 Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 📞 Support

For deployment issues:
1. Check Next.js documentation
2. Review deployment platform docs
3. Check application logs
4. Verify environment variables

## 🎉 Post-Deployment

After successful deployment:
1. ✅ Test all features
2. ✅ Monitor error logs
3. ✅ Check performance metrics
4. ✅ Set up alerts
5. ✅ Document any issues
6. ✅ Share with team

---

**Happy Deploying! 🚀**
