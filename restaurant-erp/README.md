# Restaurant ERP Back Office System

A comprehensive Enterprise Resource Planning (ERP) system for restaurant back office management built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

### 🔐 Authentication
- Secure login system with role-based access control
- Admin and Manager roles
- Session management with localStorage

### 📊 Dashboard
- Real-time business metrics and KPIs
- Revenue and order analytics
- Interactive charts and graphs
- Low stock alerts
- Recent orders overview

### 📦 Inventory Management
- Track ingredients and supplies
- Stock level monitoring with alerts
- Min/Max stock thresholds
- Supplier tracking
- Expiry date management
- Real-time inventory valuation

### 🛒 Order Management
- Order tracking and status updates
- Table management
- Order history
- Payment status tracking
- Real-time order filtering
- Customer information

### 📋 Menu Management
- Menu item CRUD operations
- Category organization
- Pricing and cost management
- Profit margin calculations
- Ingredient tracking
- Availability status
- Preparation time tracking

### 👥 Staff Management
- Employee records
- Role and position tracking
- Salary management
- Hire date tracking
- Status management (Active/Inactive/On-leave)
- Contact information

### 🚚 Supplier Management
- Vendor information
- Contact management
- Category classification
- Rating system
- Payment terms tracking
- Address management

### 📈 Reports & Analytics
- Revenue analytics by category
- Daily revenue trends
- Inventory value reports
- Profit margin analysis
- Order status breakdown
- Comprehensive business insights

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Date Handling**: date-fns
- **State Management**: React Context API
- **API**: Next.js API Routes

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Navigate to the project directory:
```bash
cd restaurant-erp
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Demo Credentials

### Admin Account
- **Email**: admin@restaurant.com
- **Password**: admin123

### Manager Account
- **Email**: manager@restaurant.com
- **Password**: manager123

## Project Structure

```
restaurant-erp/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── dashboard/    # Dashboard data
│   │   ├── inventory/    # Inventory CRUD
│   │   ├── menu/         # Menu CRUD
│   │   ├── orders/       # Order management
│   │   ├── staff/        # Staff CRUD
│   │   └── suppliers/    # Supplier CRUD
│   ├── dashboard/        # Dashboard pages
│   │   ├── inventory/
│   │   ├── menu/
│   │   ├── orders/
│   │   ├── reports/
│   │   ├── staff/
│   │   └── suppliers/
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Login page
├── components/
│   ├── DashboardLayout.tsx
│   ├── LoginForm.tsx
│   └── Sidebar.tsx
├── contexts/
│   └── AuthContext.tsx   # Authentication context
├── lib/
│   ├── db.ts            # In-memory database
│   └── types.ts         # TypeScript types
└── public/              # Static assets
```

## Features in Detail

### Dashboard
- Today's revenue and order count
- Active orders monitoring
- Low stock item alerts
- Weekly revenue and order charts
- Recent orders table

### Inventory
- Add, edit, delete inventory items
- Visual stock level indicators
- Low stock warnings
- Category-based organization
- Total inventory value calculation

### Orders
- Real-time order status updates
- Filter by status (pending, preparing, completed)
- Order details with items
- Payment tracking
- Customer information

### Menu
- Category-based menu organization
- Profit margin calculations
- Ingredient management
- Availability toggle
- Preparation time tracking

### Staff
- Complete employee records
- Salary tracking
- Status management
- Contact information
- Total payroll calculation

### Suppliers
- Vendor management
- Rating system
- Contact details
- Payment terms
- Category classification

### Reports
- Revenue by category (Pie chart)
- Daily revenue trends (Line chart)
- Top inventory by value (Bar chart)
- Profit margin analysis (Bar chart)
- Order status breakdown

## Data Persistence

Currently, the application uses an in-memory database for demonstration purposes. Data will reset when the server restarts. To implement persistent storage:

1. Replace the in-memory database in `lib/db.ts` with a real database (PostgreSQL, MongoDB, etc.)
2. Update API routes to use the database client
3. Add environment variables for database connection

## Future Enhancements

- [ ] Real database integration (PostgreSQL/MongoDB)
- [ ] Advanced reporting with date range filters
- [ ] Purchase order management
- [ ] Expense tracking
- [ ] Multi-location support
- [ ] Email notifications
- [ ] Export reports to PDF/Excel
- [ ] Mobile responsive improvements
- [ ] Real-time updates with WebSockets
- [ ] Advanced user permissions
- [ ] Audit logs
- [ ] Backup and restore functionality

## License

This project is created for demonstration purposes.

## Support

For issues or questions, please create an issue in the repository.
