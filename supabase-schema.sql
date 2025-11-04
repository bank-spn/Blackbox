-- Restaurant ERP System - Supabase Schema
-- This SQL file contains all the tables needed for the Restaurant ERP system
-- Import this into your Supabase database

-- ============ USERS ============
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  openId VARCHAR(64) NOT NULL UNIQUE,
  name TEXT,
  email VARCHAR(320),
  loginMethod VARCHAR(64),
  role VARCHAR(10) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  lastSignedIn TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============ MENU MANAGEMENT ============
CREATE TABLE IF NOT EXISTS menu_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  displayOrder INT,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  categoryId INT NOT NULL REFERENCES menu_categories(id),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price INT NOT NULL,
  cost INT,
  imageUrl TEXT,
  isAvailable BOOLEAN DEFAULT true,
  preparationTime INT,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS menu_item_variants (
  id SERIAL PRIMARY KEY,
  itemId INT NOT NULL REFERENCES menu_items(id),
  name VARCHAR(100) NOT NULL,
  priceModifier INT,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============ INVENTORY ============
CREATE TABLE IF NOT EXISTS ingredients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  currentStock INT NOT NULL DEFAULT 0,
  minimumStock INT NOT NULL DEFAULT 10,
  reorderLevel INT,
  unitCost INT,
  supplier VARCHAR(100),
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS suppliers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  contactPerson VARCHAR(100),
  email VARCHAR(320),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS purchase_orders (
  id SERIAL PRIMARY KEY,
  supplierId INT NOT NULL REFERENCES suppliers(id),
  orderDate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expectedDeliveryDate TIMESTAMP,
  totalAmount INT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'delivered', 'cancelled')),
  notes TEXT,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS purchase_order_items (
  id SERIAL PRIMARY KEY,
  purchaseOrderId INT NOT NULL REFERENCES purchase_orders(id),
  ingredientId INT NOT NULL REFERENCES ingredients(id),
  quantity INT NOT NULL,
  unitPrice INT NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stock_movements (
  id SERIAL PRIMARY KEY,
  ingredientId INT NOT NULL REFERENCES ingredients(id),
  type VARCHAR(20) NOT NULL CHECK (type IN ('in', 'out', 'adjustment')),
  quantity INT NOT NULL,
  reference VARCHAR(100),
  notes TEXT,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============ EMPLOYEES ============
CREATE TABLE IF NOT EXISTS employees (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(320),
  phone VARCHAR(20),
  position VARCHAR(100),
  salary INT,
  hireDate TIMESTAMP,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
  address TEXT,
  emergencyContact VARCHAR(100),
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shifts (
  id SERIAL PRIMARY KEY,
  employeeId INT NOT NULL REFERENCES employees(id),
  shiftDate DATE NOT NULL,
  startTime TIME NOT NULL,
  endTime TIME NOT NULL,
  position VARCHAR(100),
  notes TEXT,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============ CUSTOMERS ============
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(320),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  loyaltyPoints INT DEFAULT 0,
  totalSpent INT DEFAULT 0,
  lastVisit TIMESTAMP,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============ TABLES & RESERVATIONS ============
CREATE TABLE IF NOT EXISTS tables (
  id SERIAL PRIMARY KEY,
  tableNumber INT NOT NULL UNIQUE,
  capacity INT NOT NULL,
  location VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'maintenance')),
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reservations (
  id SERIAL PRIMARY KEY,
  tableId INT NOT NULL REFERENCES tables(id),
  customerId INT REFERENCES customers(id),
  reservationDate DATE NOT NULL,
  reservationTime TIME NOT NULL,
  partySize INT NOT NULL,
  customerName VARCHAR(100),
  customerPhone VARCHAR(20),
  specialRequests TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============ ORDERS & POS ============
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  tableId INT REFERENCES tables(id),
  customerId INT REFERENCES customers(id),
  orderNumber VARCHAR(50) UNIQUE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'served', 'cancelled')),
  subtotal INT NOT NULL DEFAULT 0,
  tax INT NOT NULL DEFAULT 0,
  discount INT DEFAULT 0,
  total INT NOT NULL DEFAULT 0,
  paymentStatus VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (paymentStatus IN ('pending', 'paid', 'refunded')),
  notes TEXT,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  orderId INT NOT NULL REFERENCES orders(id),
  menuItemId INT NOT NULL REFERENCES menu_items(id),
  quantity INT NOT NULL,
  unitPrice INT NOT NULL,
  specialInstructions TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'served')),
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  orderId INT NOT NULL REFERENCES orders(id),
  amount INT NOT NULL,
  method VARCHAR(20) CHECK (method IN ('cash', 'card', 'online', 'other')),
  reference VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============ CASHIER MODULE ============
CREATE TABLE IF NOT EXISTS cashier_sessions (
  id SERIAL PRIMARY KEY,
  openedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  closedAt TIMESTAMP,
  openingBalance INT NOT NULL,
  closingBalance INT,
  totalCash INT,
  totalCardPayments INT,
  discrepancy INT,
  notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cashier_transactions (
  id SERIAL PRIMARY KEY,
  sessionId INT NOT NULL REFERENCES cashier_sessions(id),
  type VARCHAR(20) NOT NULL CHECK (type IN ('payment', 'adjustment', 'expense', 'deposit')),
  amount INT NOT NULL,
  description TEXT,
  reference VARCHAR(100),
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============ FINANCIAL MANAGEMENT ============
CREATE TABLE IF NOT EXISTS financial_accounts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('revenue', 'expense', 'asset', 'liability')),
  code VARCHAR(50) UNIQUE,
  description TEXT,
  balance INT DEFAULT 0,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS financial_transactions (
  id SERIAL PRIMARY KEY,
  accountId INT NOT NULL REFERENCES financial_accounts(id),
  type VARCHAR(20) NOT NULL CHECK (type IN ('debit', 'credit')),
  amount INT NOT NULL,
  description TEXT,
  reference VARCHAR(100),
  transactionDate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  category VARCHAR(100) NOT NULL,
  amount INT NOT NULL,
  description TEXT,
  vendor VARCHAR(100),
  receipt TEXT,
  expenseDate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============ AUDIT LOG ============
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  action VARCHAR(100) NOT NULL,
  module VARCHAR(100) NOT NULL,
  entityType VARCHAR(100),
  entityId INT,
  oldValue TEXT,
  newValue TEXT,
  details TEXT,
  ipAddress VARCHAR(45),
  userAgent TEXT,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============ SETTINGS ============
CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) NOT NULL UNIQUE,
  value TEXT,
  type VARCHAR(20) NOT NULL DEFAULT 'string' CHECK (type IN ('string', 'number', 'boolean', 'json')),
  description TEXT,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============ INDEXES ============
CREATE INDEX idx_menu_items_category ON menu_items(categoryId);
CREATE INDEX idx_ingredients_name ON ingredients(name);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_tables_status ON tables(status);
CREATE INDEX idx_reservations_date ON reservations(reservationDate);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(createdAt);
CREATE INDEX idx_order_items_order ON order_items(orderId);
CREATE INDEX idx_payments_order ON payments(orderId);
CREATE INDEX idx_cashier_sessions_status ON cashier_sessions(status);
CREATE INDEX idx_audit_logs_module ON audit_logs(module);
CREATE INDEX idx_audit_logs_created ON audit_logs(createdAt);

-- ============ SAMPLE DATA ============
-- Insert sample menu category
INSERT INTO menu_categories (name, description, displayOrder) 
VALUES ('Appetizers', 'Starters and appetizers', 1)
ON CONFLICT DO NOTHING;

-- Insert sample table
INSERT INTO tables (tableNumber, capacity, location, status)
VALUES (1, 4, 'Window', 'available')
ON CONFLICT DO NOTHING;

-- Insert sample setting
INSERT INTO settings (key, value, type, description)
VALUES ('restaurant_name', 'My Restaurant', 'string', 'Name of the restaurant')
ON CONFLICT DO NOTHING;
