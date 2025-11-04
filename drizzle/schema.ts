import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, date } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============ MENU MANAGEMENT ============
export const menuCategories = mysqlTable("menu_categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  displayOrder: int("display_order").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MenuCategory = typeof menuCategories.$inferSelect;
export type InsertMenuCategory = typeof menuCategories.$inferInsert;

export const menuItems = mysqlTable("menu_items", {
  id: int("id").autoincrement().primaryKey(),
  categoryId: int("category_id").notNull(),
  name: varchar("name", { length: 150 }).notNull(),
  description: text("description"),
  price: int("price").notNull(), // Store in cents to avoid decimal issues
  cost: int("cost"), // Cost to prepare the item
  imageUrl: text("image_url"),
  isAvailable: boolean("is_available").default(true),
  preparationTime: int("preparation_time"), // in minutes
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = typeof menuItems.$inferInsert;

export const menuItemVariants = mysqlTable("menu_item_variants", {
  id: int("id").autoincrement().primaryKey(),
  menuItemId: int("menu_item_id").notNull(),
  name: varchar("name", { length: 100 }).notNull(), // e.g., "Size", "Temperature"
  options: text("options").notNull(), // JSON array of options
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MenuItemVariant = typeof menuItemVariants.$inferSelect;
export type InsertMenuItemVariant = typeof menuItemVariants.$inferInsert;

// ============ INVENTORY/STOCK MANAGEMENT ============
export const ingredients = mysqlTable("ingredients", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  unit: varchar("unit", { length: 50 }).notNull(), // e.g., "kg", "liter", "piece"
  currentStock: int("current_stock").default(0), // Store in smallest unit
  minimumStock: int("minimum_stock").default(0),
  reorderLevel: int("reorder_level").default(0),
  unitCost: int("unit_cost"), // Cost per unit in cents
  supplierId: int("supplier_id"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Ingredient = typeof ingredients.$inferSelect;
export type InsertIngredient = typeof ingredients.$inferInsert;

export const suppliers = mysqlTable("suppliers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  contactPerson: varchar("contact_person", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 100 }),
  address: text("address"),
  paymentTerms: varchar("payment_terms", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = typeof suppliers.$inferInsert;

export const purchaseOrders = mysqlTable("purchase_orders", {
  id: int("id").autoincrement().primaryKey(),
  supplierId: int("supplier_id").notNull(),
  orderDate: timestamp("order_date").defaultNow(),
  expectedDeliveryDate: date("expected_delivery_date"),
  actualDeliveryDate: date("actual_delivery_date"),
  status: mysqlEnum("status", ["pending", "confirmed", "delivered", "cancelled"]).default("pending"),
  totalAmount: int("total_amount"), // in cents
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type InsertPurchaseOrder = typeof purchaseOrders.$inferInsert;

export const purchaseOrderItems = mysqlTable("purchase_order_items", {
  id: int("id").autoincrement().primaryKey(),
  purchaseOrderId: int("purchase_order_id").notNull(),
  ingredientId: int("ingredient_id").notNull(),
  quantity: int("quantity").notNull(),
  unitPrice: int("unit_price").notNull(), // in cents
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PurchaseOrderItem = typeof purchaseOrderItems.$inferSelect;
export type InsertPurchaseOrderItem = typeof purchaseOrderItems.$inferInsert;

export const stockMovements = mysqlTable("stock_movements", {
  id: int("id").autoincrement().primaryKey(),
  ingredientId: int("ingredient_id").notNull(),
  type: mysqlEnum("type", ["in", "out", "adjustment"]),
  quantity: int("quantity").notNull(),
  reference: varchar("reference", { length: 100 }), // e.g., "PO-123", "ORDER-456"
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StockMovement = typeof stockMovements.$inferSelect;
export type InsertStockMovement = typeof stockMovements.$inferInsert;

// ============ EMPLOYEE MANAGEMENT ============
export const employees = mysqlTable("employees", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  email: varchar("email", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  position: varchar("position", { length: 100 }).notNull(), // e.g., "Manager", "Chef", "Waiter"
  role: mysqlEnum("role", ["manager", "cashier", "chef", "waiter", "staff"]).default("staff"),
  hireDate: date("hire_date"),
  salary: int("salary"), // Monthly salary in cents
  status: mysqlEnum("status", ["active", "inactive", "on_leave"]).default("active"),
  address: text("address"),
  emergencyContact: varchar("emergency_contact", { length: 150 }),
  emergencyPhone: varchar("emergency_phone", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = typeof employees.$inferInsert;

export const shifts = mysqlTable("shifts", {
  id: int("id").autoincrement().primaryKey(),
  employeeId: int("employee_id").notNull(),
  shiftDate: date("shift_date").notNull(),
  startTime: varchar("start_time", { length: 5 }).notNull(), // HH:MM format
  endTime: varchar("end_time", { length: 5 }).notNull(),
  status: mysqlEnum("status", ["scheduled", "completed", "cancelled", "no_show"]).default("scheduled"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Shift = typeof shifts.$inferSelect;
export type InsertShift = typeof shifts.$inferInsert;

// ============ CUSTOMER MANAGEMENT ============
export const customers = mysqlTable("customers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  email: varchar("email", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  loyaltyPoints: int("loyalty_points").default(0),
  totalSpent: int("total_spent").default(0), // in cents
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

// ============ TABLE MANAGEMENT ============
export const tables = mysqlTable("tables", {
  id: int("id").autoincrement().primaryKey(),
  tableNumber: varchar("table_number", { length: 50 }).notNull(),
  capacity: int("capacity").notNull(),
  location: varchar("location", { length: 100 }), // e.g., "Indoor", "Patio"
  status: mysqlEnum("status", ["available", "occupied", "reserved", "maintenance"]).default("available"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Table = typeof tables.$inferSelect;
export type InsertTable = typeof tables.$inferInsert;

export const reservations = mysqlTable("reservations", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customer_id"),
  tableId: int("table_id"),
  reservationDate: date("reservation_date").notNull(),
  reservationTime: varchar("reservation_time", { length: 5 }).notNull(), // HH:MM format
  partySize: int("party_size").notNull(),
  status: mysqlEnum("status", ["confirmed", "checked_in", "completed", "cancelled", "no_show"]).default("confirmed"),
  specialRequests: text("special_requests"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Reservation = typeof reservations.$inferSelect;
export type InsertReservation = typeof reservations.$inferInsert;

// ============ POS & ORDERS ============
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customer_id"),
  tableId: int("table_id"),
  orderDate: timestamp("order_date").defaultNow(),
  orderType: mysqlEnum("order_type", ["dine_in", "takeout", "delivery"]).default("dine_in"),
  status: mysqlEnum("status", ["pending", "confirmed", "preparing", "ready", "served", "completed", "cancelled"]).default("pending"),
  subtotal: int("subtotal").default(0), // in cents
  discount: int("discount").default(0), // in cents
  tax: int("tax").default(0), // in cents
  total: int("total").default(0), // in cents
  paymentMethod: mysqlEnum("payment_method", ["cash", "card", "online", "other"]),
  paymentStatus: mysqlEnum("payment_status", ["pending", "paid", "refunded"]).default("pending"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

export const orderItems = mysqlTable("order_items", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("order_id").notNull(),
  menuItemId: int("menu_item_id").notNull(),
  quantity: int("quantity").notNull(),
  unitPrice: int("unit_price").notNull(), // in cents
  specialInstructions: text("special_instructions"),
  status: mysqlEnum("status", ["pending", "preparing", "ready", "served"]).default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("order_id").notNull(),
  amount: int("amount").notNull(), // in cents
  method: mysqlEnum("method", ["cash", "card", "online", "other"]),
  reference: varchar("reference", { length: 100 }), // Transaction ID
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

// ============ CASHIER MODULE ============
export const cashierSessions = mysqlTable("cashier_sessions", {
  id: int("id").autoincrement().primaryKey(),
  openedAt: timestamp("opened_at").defaultNow().notNull(),
  closedAt: timestamp("closed_at"),
  openingBalance: int("opening_balance").notNull(), // in cents
  closingBalance: int("closing_balance"), // in cents
  totalCash: int("total_cash"), // in cents
  totalCardPayments: int("total_card_payments"), // in cents
  discrepancy: int("discrepancy"), // in cents
  notes: text("notes"),
  status: mysqlEnum("status", ["open", "closed"]).default("open"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CashierSession = typeof cashierSessions.$inferSelect;
export type InsertCashierSession = typeof cashierSessions.$inferInsert;

export const cashierTransactions = mysqlTable("cashier_transactions", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("session_id").notNull(),
  type: mysqlEnum("type", ["payment", "adjustment", "expense", "deposit"]).notNull(),
  amount: int("amount").notNull(), // in cents
  description: text("description"),
  reference: varchar("reference", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CashierTransaction = typeof cashierTransactions.$inferSelect;
export type InsertCashierTransaction = typeof cashierTransactions.$inferInsert;

// ============ FINANCIAL MANAGEMENT ============
export const financialAccounts = mysqlTable("financial_accounts", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  type: mysqlEnum("type", ["revenue", "expense", "asset", "liability"]).notNull(),
  code: varchar("code", { length: 50 }).unique(),
  description: text("description"),
  balance: int("balance").default(0), // in cents
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FinancialAccount = typeof financialAccounts.$inferSelect;
export type InsertFinancialAccount = typeof financialAccounts.$inferInsert;

export const financialTransactions = mysqlTable("financial_transactions", {
  id: int("id").autoincrement().primaryKey(),
  accountId: int("account_id").notNull(),
  type: mysqlEnum("type", ["debit", "credit"]).notNull(),
  amount: int("amount").notNull(), // in cents
  description: text("description"),
  reference: varchar("reference", { length: 100 }),
  transactionDate: timestamp("transaction_date").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FinancialTransaction = typeof financialTransactions.$inferSelect;
export type InsertFinancialTransaction = typeof financialTransactions.$inferInsert;

export const expenses = mysqlTable("expenses", {
  id: int("id").autoincrement().primaryKey(),
  category: varchar("category", { length: 100 }).notNull(),
  amount: int("amount").notNull(), // in cents
  description: text("description"),
  vendor: varchar("vendor", { length: 100 }),
  receipt: text("receipt"), // URL to receipt image
  expenseDate: timestamp("expense_date").defaultNow().notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = typeof expenses.$inferInsert;

// ============ AUDIT LOG ============
export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  action: varchar("action", { length: 100 }).notNull(),
  module: varchar("module", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 100 }),
  entityId: int("entity_id"),
  oldValue: text("old_value"),
  newValue: text("new_value"),
  details: text("details"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

// ============ SETTINGS ============
export const settings = mysqlTable("settings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value"),
  type: mysqlEnum("type", ["string", "number", "boolean", "json"]).default("string"),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = typeof settings.$inferInsert;
