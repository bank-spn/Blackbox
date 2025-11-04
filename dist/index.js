// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/db.ts
import { eq, desc, and, gte, lte, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";

// drizzle/schema.ts
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, date } from "drizzle-orm/mysql-core";
var users = mysqlTable("users", {
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
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});
var menuCategories = mysqlTable("menu_categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  displayOrder: int("display_order").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var menuItems = mysqlTable("menu_items", {
  id: int("id").autoincrement().primaryKey(),
  categoryId: int("category_id").notNull(),
  name: varchar("name", { length: 150 }).notNull(),
  description: text("description"),
  price: int("price").notNull(),
  // Store in cents to avoid decimal issues
  cost: int("cost"),
  // Cost to prepare the item
  imageUrl: text("image_url"),
  isAvailable: boolean("is_available").default(true),
  preparationTime: int("preparation_time"),
  // in minutes
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var menuItemVariants = mysqlTable("menu_item_variants", {
  id: int("id").autoincrement().primaryKey(),
  menuItemId: int("menu_item_id").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  // e.g., "Size", "Temperature"
  options: text("options").notNull(),
  // JSON array of options
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var ingredients = mysqlTable("ingredients", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  unit: varchar("unit", { length: 50 }).notNull(),
  // e.g., "kg", "liter", "piece"
  currentStock: int("current_stock").default(0),
  // Store in smallest unit
  minimumStock: int("minimum_stock").default(0),
  reorderLevel: int("reorder_level").default(0),
  unitCost: int("unit_cost"),
  // Cost per unit in cents
  supplierId: int("supplier_id"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var suppliers = mysqlTable("suppliers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  contactPerson: varchar("contact_person", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 100 }),
  address: text("address"),
  paymentTerms: varchar("payment_terms", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var purchaseOrders = mysqlTable("purchase_orders", {
  id: int("id").autoincrement().primaryKey(),
  supplierId: int("supplier_id").notNull(),
  orderDate: timestamp("order_date").defaultNow(),
  expectedDeliveryDate: date("expected_delivery_date"),
  actualDeliveryDate: date("actual_delivery_date"),
  status: mysqlEnum("status", ["pending", "confirmed", "delivered", "cancelled"]).default("pending"),
  totalAmount: int("total_amount"),
  // in cents
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var purchaseOrderItems = mysqlTable("purchase_order_items", {
  id: int("id").autoincrement().primaryKey(),
  purchaseOrderId: int("purchase_order_id").notNull(),
  ingredientId: int("ingredient_id").notNull(),
  quantity: int("quantity").notNull(),
  unitPrice: int("unit_price").notNull(),
  // in cents
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var stockMovements = mysqlTable("stock_movements", {
  id: int("id").autoincrement().primaryKey(),
  ingredientId: int("ingredient_id").notNull(),
  type: mysqlEnum("type", ["in", "out", "adjustment"]),
  quantity: int("quantity").notNull(),
  reference: varchar("reference", { length: 100 }),
  // e.g., "PO-123", "ORDER-456"
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var employees = mysqlTable("employees", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  email: varchar("email", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  position: varchar("position", { length: 100 }).notNull(),
  // e.g., "Manager", "Chef", "Waiter"
  role: mysqlEnum("role", ["manager", "cashier", "chef", "waiter", "staff"]).default("staff"),
  hireDate: date("hire_date"),
  salary: int("salary"),
  // Monthly salary in cents
  status: mysqlEnum("status", ["active", "inactive", "on_leave"]).default("active"),
  address: text("address"),
  emergencyContact: varchar("emergency_contact", { length: 150 }),
  emergencyPhone: varchar("emergency_phone", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var shifts = mysqlTable("shifts", {
  id: int("id").autoincrement().primaryKey(),
  employeeId: int("employee_id").notNull(),
  shiftDate: date("shift_date").notNull(),
  startTime: varchar("start_time", { length: 5 }).notNull(),
  // HH:MM format
  endTime: varchar("end_time", { length: 5 }).notNull(),
  status: mysqlEnum("status", ["scheduled", "completed", "cancelled", "no_show"]).default("scheduled"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var customers = mysqlTable("customers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  email: varchar("email", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  loyaltyPoints: int("loyalty_points").default(0),
  totalSpent: int("total_spent").default(0),
  // in cents
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var tables = mysqlTable("tables", {
  id: int("id").autoincrement().primaryKey(),
  tableNumber: varchar("table_number", { length: 50 }).notNull(),
  capacity: int("capacity").notNull(),
  location: varchar("location", { length: 100 }),
  // e.g., "Indoor", "Patio"
  status: mysqlEnum("status", ["available", "occupied", "reserved", "maintenance"]).default("available"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var reservations = mysqlTable("reservations", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customer_id"),
  tableId: int("table_id"),
  reservationDate: date("reservation_date").notNull(),
  reservationTime: varchar("reservation_time", { length: 5 }).notNull(),
  // HH:MM format
  partySize: int("party_size").notNull(),
  status: mysqlEnum("status", ["confirmed", "checked_in", "completed", "cancelled", "no_show"]).default("confirmed"),
  specialRequests: text("special_requests"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customer_id"),
  tableId: int("table_id"),
  orderDate: timestamp("order_date").defaultNow(),
  orderType: mysqlEnum("order_type", ["dine_in", "takeout", "delivery"]).default("dine_in"),
  status: mysqlEnum("status", ["pending", "confirmed", "preparing", "ready", "served", "completed", "cancelled"]).default("pending"),
  subtotal: int("subtotal").default(0),
  // in cents
  discount: int("discount").default(0),
  // in cents
  tax: int("tax").default(0),
  // in cents
  total: int("total").default(0),
  // in cents
  paymentMethod: mysqlEnum("payment_method", ["cash", "card", "online", "other"]),
  paymentStatus: mysqlEnum("payment_status", ["pending", "paid", "refunded"]).default("pending"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var orderItems = mysqlTable("order_items", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("order_id").notNull(),
  menuItemId: int("menu_item_id").notNull(),
  quantity: int("quantity").notNull(),
  unitPrice: int("unit_price").notNull(),
  // in cents
  specialInstructions: text("special_instructions"),
  status: mysqlEnum("status", ["pending", "preparing", "ready", "served"]).default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("order_id").notNull(),
  amount: int("amount").notNull(),
  // in cents
  method: mysqlEnum("method", ["cash", "card", "online", "other"]),
  reference: varchar("reference", { length: 100 }),
  // Transaction ID
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var cashierSessions = mysqlTable("cashier_sessions", {
  id: int("id").autoincrement().primaryKey(),
  openedAt: timestamp("opened_at").defaultNow().notNull(),
  closedAt: timestamp("closed_at"),
  openingBalance: int("opening_balance").notNull(),
  // in cents
  closingBalance: int("closing_balance"),
  // in cents
  totalCash: int("total_cash"),
  // in cents
  totalCardPayments: int("total_card_payments"),
  // in cents
  discrepancy: int("discrepancy"),
  // in cents
  notes: text("notes"),
  status: mysqlEnum("status", ["open", "closed"]).default("open"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var cashierTransactions = mysqlTable("cashier_transactions", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("session_id").notNull(),
  type: mysqlEnum("type", ["payment", "adjustment", "expense", "deposit"]).notNull(),
  amount: int("amount").notNull(),
  // in cents
  description: text("description"),
  reference: varchar("reference", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var financialAccounts = mysqlTable("financial_accounts", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  type: mysqlEnum("type", ["revenue", "expense", "asset", "liability"]).notNull(),
  code: varchar("code", { length: 50 }).unique(),
  description: text("description"),
  balance: int("balance").default(0),
  // in cents
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var financialTransactions = mysqlTable("financial_transactions", {
  id: int("id").autoincrement().primaryKey(),
  accountId: int("account_id").notNull(),
  type: mysqlEnum("type", ["debit", "credit"]).notNull(),
  amount: int("amount").notNull(),
  // in cents
  description: text("description"),
  reference: varchar("reference", { length: 100 }),
  transactionDate: timestamp("transaction_date").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var expenses = mysqlTable("expenses", {
  id: int("id").autoincrement().primaryKey(),
  category: varchar("category", { length: 100 }).notNull(),
  amount: int("amount").notNull(),
  // in cents
  description: text("description"),
  vendor: varchar("vendor", { length: 100 }),
  receipt: text("receipt"),
  // URL to receipt image
  expenseDate: timestamp("expense_date").defaultNow().notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var auditLogs = mysqlTable("audit_logs", {
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
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var settings = mysqlTable("settings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value"),
  type: mysqlEnum("type", ["string", "number", "boolean", "json"]).default("string"),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
};

// server/db.ts
var _db = null;
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getMenuCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(menuCategories).orderBy(menuCategories.displayOrder);
}
async function getMenuItemsByCategory(categoryId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(menuItems).where(eq(menuItems.categoryId, categoryId));
}
async function getAllMenuItems() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(menuItems).orderBy(menuItems.name);
}
async function getMenuItemById(id) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(menuItems).where(eq(menuItems.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}
async function getAllIngredients() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(ingredients).orderBy(ingredients.name);
}
async function getIngredientById(id) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(ingredients).where(eq(ingredients.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}
async function getLowStockIngredients() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(ingredients).where(
    lte(ingredients.currentStock, ingredients.minimumStock)
  );
}
async function getAllSuppliers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(suppliers).orderBy(suppliers.name);
}
async function getPurchaseOrders(status) {
  const db = await getDb();
  if (!db) return [];
  if (status) {
    return db.select().from(purchaseOrders).where(eq(purchaseOrders.status, status)).orderBy(desc(purchaseOrders.createdAt));
  }
  return db.select().from(purchaseOrders).orderBy(desc(purchaseOrders.createdAt));
}
async function getStockMovements(ingredientId, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  if (ingredientId) {
    return db.select().from(stockMovements).where(eq(stockMovements.ingredientId, ingredientId)).orderBy(desc(stockMovements.createdAt)).limit(limit);
  }
  return db.select().from(stockMovements).orderBy(desc(stockMovements.createdAt)).limit(limit);
}
async function getAllEmployees() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(employees).where(eq(employees.status, "active")).orderBy(employees.name);
}
async function getEmployeeById(id) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(employees).where(eq(employees.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}
async function getEmployeeShifts(employeeId, date2) {
  const db = await getDb();
  if (!db) return [];
  if (date2) {
    return db.select().from(shifts).where(and(eq(shifts.employeeId, employeeId), eq(shifts.shiftDate, date2))).orderBy(shifts.startTime);
  }
  return db.select().from(shifts).where(eq(shifts.employeeId, employeeId)).orderBy(desc(shifts.shiftDate));
}
async function getAllCustomers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(customers).orderBy(customers.name);
}
async function getCustomerById(id) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}
async function searchCustomers(query) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(customers).where(like(customers.name, `%${query}%`)).limit(10);
}
async function getAllTables() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tables).orderBy(tables.tableNumber);
}
async function getTableById(id) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(tables).where(eq(tables.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}
async function getAvailableTables(capacity) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tables).where(and(
    eq(tables.status, "available"),
    gte(tables.capacity, capacity)
  )).orderBy(tables.capacity);
}
async function getReservations(date2) {
  const db = await getDb();
  if (!db) return [];
  if (date2) {
    return db.select().from(reservations).where(eq(reservations.reservationDate, date2)).orderBy(reservations.reservationTime);
  }
  return db.select().from(reservations).orderBy(desc(reservations.createdAt));
}
async function getAllOrders(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).orderBy(desc(orders.createdAt)).limit(limit);
}
async function getOrderById(id) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}
async function getOrdersByStatus(status) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.status, status)).orderBy(desc(orders.createdAt));
}
async function getOrdersByDateRange(startDate, endDate) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(and(
    gte(orders.createdAt, startDate),
    lte(orders.createdAt, endDate)
  )).orderBy(desc(orders.createdAt));
}
async function getPayments(orderId) {
  const db = await getDb();
  if (!db) return [];
  if (orderId) {
    return db.select().from(payments).where(eq(payments.orderId, orderId));
  }
  return db.select().from(payments).orderBy(desc(payments.createdAt));
}
async function getDailySalesTotal(date2) {
  const db = await getDb();
  if (!db) return 0;
  const startOfDay = new Date(date2);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date2);
  endOfDay.setHours(23, 59, 59, 999);
  const result = await db.select().from(orders).where(and(
    gte(orders.createdAt, startOfDay),
    lte(orders.createdAt, endOfDay),
    eq(orders.paymentStatus, "paid")
  ));
  return result.reduce((sum, order) => sum + (order.total || 0), 0);
}
async function getTopSellingItems(limit = 10) {
  const db = await getDb();
  if (!db) return [];
  const items = await db.select().from(orderItems).orderBy(desc(orderItems.quantity)).limit(limit);
  return items;
}

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers.ts
import { z as z2 } from "zod";
import { eq as eq2 } from "drizzle-orm";
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true
      };
    })
  }),
  // ============ MENU MANAGEMENT ============
  menu: router({
    categories: router({
      list: publicProcedure.query(async () => {
        return await getMenuCategories();
      }),
      create: publicProcedure.input(z2.object({
        name: z2.string().min(1),
        description: z2.string().optional(),
        displayOrder: z2.number().optional()
      })).mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        return await database.insert(menuCategories).values(input);
      }),
      update: publicProcedure.input(z2.object({
        id: z2.number(),
        name: z2.string().optional(),
        description: z2.string().optional(),
        displayOrder: z2.number().optional()
      })).mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        const { id, ...data } = input;
        await database.update(menuCategories).set(data).where(eq2(menuCategories.id, id));
        return { success: true };
      }),
      delete: publicProcedure.input(z2.number()).mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        await database.delete(menuCategories).where(eq2(menuCategories.id, input));
        return { success: true };
      })
    }),
    items: router({
      list: publicProcedure.query(async () => {
        return await getAllMenuItems();
      }),
      byCategory: publicProcedure.input(z2.number()).query(async ({ input }) => {
        return await getMenuItemsByCategory(input);
      }),
      getById: publicProcedure.input(z2.number()).query(async ({ input }) => {
        return await getMenuItemById(input);
      }),
      create: publicProcedure.input(z2.object({
        categoryId: z2.number(),
        name: z2.string().min(1),
        description: z2.string().optional(),
        price: z2.number().min(0),
        cost: z2.number().optional(),
        imageUrl: z2.string().optional(),
        isAvailable: z2.boolean().optional(),
        preparationTime: z2.number().optional()
      })).mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        return await database.insert(menuItems).values(input);
      }),
      update: publicProcedure.input(z2.object({
        id: z2.number(),
        categoryId: z2.number().optional(),
        name: z2.string().optional(),
        description: z2.string().optional(),
        price: z2.number().optional(),
        cost: z2.number().optional(),
        imageUrl: z2.string().optional(),
        isAvailable: z2.boolean().optional(),
        preparationTime: z2.number().optional()
      })).mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        const { id, ...data } = input;
        await database.update(menuItems).set(data).where(eq2(menuItems.id, id));
        return { success: true };
      }),
      delete: publicProcedure.input(z2.number()).mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        await database.delete(menuItems).where(eq2(menuItems.id, input));
        return { success: true };
      })
    })
  }),
  // ============ INVENTORY MANAGEMENT ============
  inventory: router({
    ingredients: router({
      list: publicProcedure.query(async () => {
        return await getAllIngredients();
      }),
      getById: publicProcedure.input(z2.number()).query(async ({ input }) => {
        return await getIngredientById(input);
      }),
      lowStock: publicProcedure.query(async () => {
        return await getLowStockIngredients();
      }),
      create: publicProcedure.input(z2.object({
        name: z2.string().min(1),
        unit: z2.string(),
        currentStock: z2.number().optional(),
        minimumStock: z2.number().optional(),
        reorderLevel: z2.number().optional(),
        unitCost: z2.number().optional(),
        supplierId: z2.number().optional()
      })).mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        return await database.insert(ingredients).values(input);
      }),
      update: publicProcedure.input(z2.object({
        id: z2.number(),
        name: z2.string().optional(),
        unit: z2.string().optional(),
        currentStock: z2.number().optional(),
        minimumStock: z2.number().optional(),
        reorderLevel: z2.number().optional(),
        unitCost: z2.number().optional(),
        supplierId: z2.number().optional()
      })).mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        const { id, ...data } = input;
        await database.update(ingredients).set(data).where(eq2(ingredients.id, id));
        return { success: true };
      }),
      delete: publicProcedure.input(z2.number()).mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        await database.delete(ingredients).where(eq2(ingredients.id, input));
        return { success: true };
      })
    }),
    suppliers: router({
      list: publicProcedure.query(async () => {
        return await getAllSuppliers();
      }),
      create: publicProcedure.input(z2.object({
        name: z2.string().min(1),
        contactPerson: z2.string().optional(),
        phone: z2.string().optional(),
        email: z2.string().optional(),
        address: z2.string().optional(),
        paymentTerms: z2.string().optional()
      })).mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        return await database.insert(suppliers).values(input);
      }),
      update: publicProcedure.input(z2.object({
        id: z2.number(),
        name: z2.string().optional(),
        contactPerson: z2.string().optional(),
        phone: z2.string().optional(),
        email: z2.string().optional(),
        address: z2.string().optional(),
        paymentTerms: z2.string().optional()
      })).mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        const { id, ...data } = input;
        await database.update(suppliers).set(data).where(eq2(suppliers.id, id));
        return { success: true };
      })
    }),
    purchaseOrders: router({
      list: publicProcedure.input(z2.object({ status: z2.string().optional() }).optional()).query(async ({ input }) => {
        return await getPurchaseOrders(input?.status);
      }),
      updateStatus: publicProcedure.input(z2.object({
        id: z2.number(),
        status: z2.enum(["pending", "confirmed", "delivered", "cancelled"])
      })).mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        await database.update(purchaseOrders).set({ status: input.status }).where(eq2(purchaseOrders.id, input.id));
        return { success: true };
      })
    }),
    stockMovements: router({
      list: publicProcedure.input(z2.object({ ingredientId: z2.number().optional(), limit: z2.number().optional() }).optional()).query(async ({ input }) => {
        return await getStockMovements(input?.ingredientId, input?.limit);
      }),
      record: publicProcedure.input(z2.object({
        ingredientId: z2.number(),
        type: z2.enum(["in", "out", "adjustment"]),
        quantity: z2.number(),
        reference: z2.string().optional(),
        notes: z2.string().optional()
      })).mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        await database.insert(stockMovements).values({
          ...input,
          type: input.type
        });
        const ingredient = await getIngredientById(input.ingredientId);
        if (ingredient && ingredient.currentStock !== null) {
          let newStock = ingredient.currentStock;
          if (input.type === "in") {
            newStock += input.quantity;
          } else if (input.type === "out") {
            newStock -= input.quantity;
          } else {
            newStock = input.quantity;
          }
          await database.update(ingredients).set({ currentStock: newStock }).where(eq2(ingredients.id, input.ingredientId));
        }
        return { success: true };
      })
    })
  }),
  // ============ EMPLOYEE MANAGEMENT ============
  employees: router({
    list: publicProcedure.query(async () => {
      return await getAllEmployees();
    }),
    getById: publicProcedure.input(z2.number()).query(async ({ input }) => {
      return await getEmployeeById(input);
    }),
    create: publicProcedure.input(z2.object({
      name: z2.string().min(1),
      email: z2.string().optional(),
      phone: z2.string().optional(),
      position: z2.string(),
      role: z2.enum(["manager", "cashier", "chef", "waiter", "staff"]).optional(),
      hireDate: z2.string().optional(),
      salary: z2.number().optional(),
      address: z2.string().optional(),
      emergencyContact: z2.string().optional(),
      emergencyPhone: z2.string().optional()
    })).mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      return await database.insert(employees).values({
        ...input,
        hireDate: input.hireDate ? new Date(input.hireDate) : void 0
      });
    }),
    update: publicProcedure.input(z2.object({
      id: z2.number(),
      name: z2.string().optional(),
      email: z2.string().optional(),
      phone: z2.string().optional(),
      position: z2.string().optional(),
      role: z2.enum(["manager", "cashier", "chef", "waiter", "staff"]).optional(),
      salary: z2.number().optional(),
      status: z2.enum(["active", "inactive", "on_leave"]).optional(),
      address: z2.string().optional(),
      emergencyContact: z2.string().optional(),
      emergencyPhone: z2.string().optional()
    })).mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const { id, ...data } = input;
      await database.update(employees).set(data).where(eq2(employees.id, id));
      return { success: true };
    }),
    shifts: router({
      list: publicProcedure.input(z2.object({ employeeId: z2.number(), date: z2.string().optional() }).optional()).query(async ({ input }) => {
        if (!input) return [];
        return await getEmployeeShifts(input.employeeId, input.date);
      }),
      create: publicProcedure.input(z2.object({
        employeeId: z2.number(),
        shiftDate: z2.string(),
        startTime: z2.string(),
        endTime: z2.string(),
        notes: z2.string().optional()
      })).mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        return await database.insert(shifts).values({
          ...input,
          shiftDate: new Date(input.shiftDate)
        });
      }),
      updateStatus: publicProcedure.input(z2.object({
        id: z2.number(),
        status: z2.enum(["scheduled", "completed", "cancelled", "no_show"])
      })).mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        await database.update(shifts).set({ status: input.status }).where(eq2(shifts.id, input.id));
        return { success: true };
      })
    })
  }),
  // ============ CUSTOMER MANAGEMENT ============
  customers: router({
    list: publicProcedure.query(async () => {
      return await getAllCustomers();
    }),
    getById: publicProcedure.input(z2.number()).query(async ({ input }) => {
      return await getCustomerById(input);
    }),
    search: publicProcedure.input(z2.string()).query(async ({ input }) => {
      return await searchCustomers(input);
    }),
    create: publicProcedure.input(z2.object({
      name: z2.string().min(1),
      email: z2.string().optional(),
      phone: z2.string().optional(),
      address: z2.string().optional(),
      notes: z2.string().optional()
    })).mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      return await database.insert(customers).values(input);
    }),
    update: publicProcedure.input(z2.object({
      id: z2.number(),
      name: z2.string().optional(),
      email: z2.string().optional(),
      phone: z2.string().optional(),
      address: z2.string().optional(),
      loyaltyPoints: z2.number().optional(),
      totalSpent: z2.number().optional(),
      notes: z2.string().optional()
    })).mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const { id, ...data } = input;
      await database.update(customers).set(data).where(eq2(customers.id, id));
      return { success: true };
    })
  }),
  // ============ TABLE MANAGEMENT ============
  tables: router({
    list: publicProcedure.query(async () => {
      return await getAllTables();
    }),
    getById: publicProcedure.input(z2.number()).query(async ({ input }) => {
      return await getTableById(input);
    }),
    available: publicProcedure.input(z2.number()).query(async ({ input }) => {
      return await getAvailableTables(input);
    }),
    create: publicProcedure.input(z2.object({
      tableNumber: z2.string(),
      capacity: z2.number(),
      location: z2.string().optional()
    })).mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      return await database.insert(tables).values(input);
    }),
    updateStatus: publicProcedure.input(z2.object({
      id: z2.number(),
      status: z2.enum(["available", "occupied", "reserved", "maintenance"])
    })).mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      await database.update(tables).set({ status: input.status }).where(eq2(tables.id, input.id));
      return { success: true };
    }),
    reservations: router({
      list: publicProcedure.input(z2.object({ date: z2.string().optional() }).optional()).query(async ({ input }) => {
        return await getReservations(input?.date);
      }),
      create: publicProcedure.input(z2.object({
        customerId: z2.number().optional(),
        tableId: z2.number().optional(),
        reservationDate: z2.string(),
        reservationTime: z2.string(),
        partySize: z2.number(),
        specialRequests: z2.string().optional()
      })).mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        return await database.insert(reservations).values({
          ...input,
          reservationDate: new Date(input.reservationDate)
        });
      }),
      updateStatus: publicProcedure.input(z2.object({
        id: z2.number(),
        status: z2.enum(["confirmed", "checked_in", "completed", "cancelled", "no_show"])
      })).mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        await database.update(reservations).set({ status: input.status }).where(eq2(reservations.id, input.id));
        return { success: true };
      })
    })
  }),
  // ============ POS & ORDERS ============
  orders: router({
    list: publicProcedure.input(z2.object({ limit: z2.number().optional() }).optional()).query(async ({ input }) => {
      return await getAllOrders(input?.limit);
    }),
    getById: publicProcedure.input(z2.number()).query(async ({ input }) => {
      return await getOrderById(input);
    }),
    byStatus: publicProcedure.input(z2.string()).query(async ({ input }) => {
      return await getOrdersByStatus(input);
    }),
    create: publicProcedure.input(z2.object({
      customerId: z2.number().optional(),
      tableId: z2.number().optional(),
      orderType: z2.enum(["dine_in", "takeout", "delivery"]).optional(),
      items: z2.array(z2.object({
        menuItemId: z2.number(),
        quantity: z2.number(),
        unitPrice: z2.number(),
        specialInstructions: z2.string().optional()
      })),
      notes: z2.string().optional()
    })).mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const { items, ...orderData } = input;
      const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
      const result = await database.insert(orders).values({
        ...orderData,
        subtotal,
        total: subtotal
      });
      const insertId = result.insertId || result[0];
      for (const item of items) {
        await database.insert(orderItems).values({
          orderId: insertId,
          ...item
        });
      }
      return result;
    }),
    updateStatus: publicProcedure.input(z2.object({
      id: z2.number(),
      status: z2.enum(["pending", "confirmed", "preparing", "ready", "served", "completed", "cancelled"])
    })).mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      await database.update(orders).set({ status: input.status }).where(eq2(orders.id, input.id));
      return { success: true };
    }),
    addItem: publicProcedure.input(z2.object({
      orderId: z2.number(),
      menuItemId: z2.number(),
      quantity: z2.number(),
      unitPrice: z2.number(),
      specialInstructions: z2.string().optional()
    })).mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const { orderId, ...itemData } = input;
      await database.insert(orderItems).values({
        orderId,
        ...itemData
      });
      const order = await getOrderById(orderId);
      if (order && order.subtotal !== null) {
        const newSubtotal = order.subtotal + input.unitPrice * input.quantity;
        await database.update(orders).set({ subtotal: newSubtotal, total: newSubtotal }).where(eq2(orders.id, orderId));
      }
      return { success: true };
    }),
    applyDiscount: publicProcedure.input(z2.object({
      id: z2.number(),
      discount: z2.number()
    })).mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      const order = await getOrderById(input.id);
      if (order && order.subtotal !== null) {
        const newTotal = order.subtotal - input.discount + (order.tax || 0);
        await database.update(orders).set({ discount: input.discount, total: newTotal }).where(eq2(orders.id, input.id));
      }
      return { success: true };
    })
  }),
  payments: router({
    list: publicProcedure.input(z2.object({ orderId: z2.number().optional() }).optional()).query(async ({ input }) => {
      return await getPayments(input?.orderId);
    }),
    create: publicProcedure.input(z2.object({
      orderId: z2.number(),
      amount: z2.number(),
      method: z2.enum(["cash", "card", "online", "other"]),
      reference: z2.string().optional()
    })).mutation(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database not available");
      await database.insert(payments).values({
        ...input,
        status: "completed"
      });
      await database.update(orders).set({ paymentStatus: "paid" }).where(eq2(orders.id, input.orderId));
      return { success: true };
    })
  }),
  // ============ REPORTING ============
  reports: router({
    dailySales: publicProcedure.input(z2.string()).query(async ({ input }) => {
      const date2 = new Date(input);
      const total = await getDailySalesTotal(date2);
      return { date: input, total };
    }),
    topItems: publicProcedure.input(z2.object({ limit: z2.number().optional() }).optional()).query(async ({ input }) => {
      return await getTopSellingItems(input?.limit);
    }),
    salesByDateRange: publicProcedure.input(z2.object({
      startDate: z2.string(),
      endDate: z2.string()
    })).query(async ({ input }) => {
      const start = new Date(input.startDate);
      const end = new Date(input.endDate);
      return await getOrdersByDateRange(start, end);
    })
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/vite.ts
import express from "express";
import fs from "fs";
import { nanoid } from "nanoid";
import path2 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
var plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime()];
var vite_config_default = defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1"
    ],
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/_core/vite.ts
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = process.env.NODE_ENV === "development" ? path2.resolve(import.meta.dirname, "../..", "dist", "public") : path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/_core/index.ts
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  const app = express2();
  const server = createServer(app);
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
  registerOAuthRoutes(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
startServer().catch(console.error);
