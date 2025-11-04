# Restaurant ERP System

A comprehensive, production-ready Enterprise Resource Planning system for restaurant management built with modern web technologies.

## 🎯 Features

### Core Modules

| Module | Features |
|--------|----------|
| **Dashboard** | Real-time sales metrics, active orders, staff status, low stock alerts |
| **POS System** | Order creation, item management, payment processing, order tracking |
| **Cashier** | Cash register sessions, transaction logging, balance reconciliation |
| **Inventory** | Stock tracking, low stock alerts, supplier management, purchase orders |
| **Employees** | Staff management, shift scheduling, role assignment |
| **Financial** | Revenue tracking, expense management, financial reports, account management |
| **Audit Log** | Complete activity tracking, change history, system monitoring |
| **Settings** | System configuration, database setup, backup management |

## 🛠️ Technology Stack

### Frontend
- **React 19** - Modern UI framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - High-quality components
- **Vite** - Lightning-fast build tool

### Backend
- **Node.js** - JavaScript runtime
- **Express 4** - Web framework
- **tRPC 11** - Type-safe API
- **Drizzle ORM** - SQL database toolkit

### Database
- **PostgreSQL** - Robust relational database
- **Supabase** - Managed PostgreSQL hosting (recommended)

### Deployment
- **Vercel** - Frontend & serverless functions
- **Netlify** - Alternative deployment option

## 📋 Database Schema

24 tables covering all business operations:
- Menu management (categories, items, variants)
- Inventory (ingredients, suppliers, stock movements)
- Employee management (staff, shifts)
- Customer management
- Table & reservation management
- Orders & payments
- Cashier operations
- Financial tracking
- Audit logging
- System settings

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm (or npm/yarn)
- PostgreSQL database or Supabase account

### Development

```bash
# Install dependencies
pnpm install

# Configure database
cp ENV_SETUP.md .env.local
# Edit .env.local with your database credentials

# Run migrations
pnpm db:push

# Start development server
pnpm dev

# Open http://localhost:3000
```

### Production Build

```bash
# Build for production
pnpm build

# Preview production build
pnpm preview
```

## 📦 Deployment

### Quick Deploy to Vercel
```bash
# Push to GitHub first
git push origin main

# Then connect to Vercel dashboard
# Vercel will auto-deploy on push
```

### Quick Deploy to Netlify
```bash
# Push to GitHub first
git push origin main

# Then connect to Netlify dashboard
# Netlify will auto-deploy on push
```

**See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.**

## 🗄️ Database Setup

### Supabase (Recommended)
1. Create project at https://supabase.com
2. Get connection string from Project Settings → Database
3. Import `supabase-schema.sql` via SQL Editor
4. Set `DATABASE_URL` environment variable

### Local PostgreSQL
```bash
createdb restaurant_erp
psql restaurant_erp < supabase-schema.sql
```

**See [ENV_SETUP.md](./ENV_SETUP.md) for detailed configuration.**

## 📁 Project Structure

```
restaurant-erp/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── lib/           # Utilities and helpers
│   │   └── App.tsx        # Main app component
│   └── dist/              # Production build output
├── server/                # Node.js backend
│   ├── routers.ts         # tRPC API endpoints
│   ├── db.ts              # Database queries
│   └── _core/             # Core infrastructure
├── drizzle/               # Database schema & migrations
│   └── schema.ts          # Table definitions
├── supabase-schema.sql    # SQL schema for Supabase
├── vercel.json            # Vercel configuration
├── netlify.toml           # Netlify configuration
├── DEPLOYMENT_GUIDE.md    # Deployment instructions
└── ENV_SETUP.md           # Environment setup guide
```

## 🔐 Environment Variables

Required:
```
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-secret-key
VITE_APP_TITLE=Restaurant ERP
VITE_APP_LOGO=https://your-logo-url.png
NODE_ENV=production
```

See [ENV_SETUP.md](./ENV_SETUP.md) for complete list.

## 📊 API Documentation

The backend uses tRPC for type-safe API calls. All procedures are defined in `server/routers.ts`.

### Example Usage (Frontend)

```typescript
import { trpc } from "@/lib/trpc";

// Query data
const { data } = trpc.menu.categories.list.useQuery();

// Mutate data
const createCategory = trpc.menu.categories.create.useMutation();
await createCategory.mutateAsync({ name: "Desserts" });
```

## 🧪 Testing

```bash
# Run tests (if configured)
pnpm test

# Build and test production
pnpm build
pnpm preview
```

## 🔧 Development Commands

```bash
# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Database migrations
pnpm db:push
pnpm db:check

# Type checking
pnpm type-check

# Linting (if configured)
pnpm lint
```

## 📱 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🔒 Security

- Type-safe API with tRPC
- Prepared statements with Drizzle ORM
- HTTPS in production
- JWT authentication ready
- SQL injection prevention
- CORS configuration
- Environment variable protection

## 📈 Performance

- Optimized React components
- Code splitting by route
- Lazy loading of components
- Database indexes on key columns
- Connection pooling
- Caching strategies

## 🐛 Troubleshooting

### Database Connection Error
- Verify DATABASE_URL format
- Check database server is running
- For Supabase: Verify IP whitelist

### Build Errors
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build
```

### Migration Issues
```bash
pnpm db:push --force
```

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for more troubleshooting.

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Detailed deployment instructions
- [Environment Setup](./ENV_SETUP.md) - Configuration guide
- [Supabase Schema](./supabase-schema.sql) - Database schema

## 🤝 Contributing

This is a production system. For modifications:
1. Test thoroughly in development
2. Update database migrations if needed
3. Run full test suite
4. Document changes

## 📄 License

This project is provided as-is for restaurant management purposes.

## 📞 Support

For issues or questions:
1. Check [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
2. Review [ENV_SETUP.md](./ENV_SETUP.md)
3. Check application logs
4. Contact your development team

---

**Built with ❤️ for restaurant management**

Last Updated: 2024
