import { eq, desc, and, gte, lte, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  menuCategories, menuItems, menuItemVariants,
  ingredients, suppliers, purchaseOrders, purchaseOrderItems, stockMovements,
  employees, shifts,
  customers,
  tables, reservations,
  orders, orderItems, payments
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
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

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ MENU QUERIES ============
export async function getMenuCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(menuCategories).orderBy(menuCategories.displayOrder);
}

export async function getMenuItemsByCategory(categoryId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(menuItems).where(eq(menuItems.categoryId, categoryId));
}

export async function getAllMenuItems() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(menuItems).orderBy(menuItems.name);
}

export async function getMenuItemById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(menuItems).where(eq(menuItems.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// ============ INVENTORY QUERIES ============
export async function getAllIngredients() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(ingredients).orderBy(ingredients.name);
}

export async function getIngredientById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(ingredients).where(eq(ingredients.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getLowStockIngredients() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(ingredients).where(
    lte(ingredients.currentStock, ingredients.minimumStock)
  );
}

export async function getAllSuppliers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(suppliers).orderBy(suppliers.name);
}

export async function getPurchaseOrders(status?: string) {
  const db = await getDb();
  if (!db) return [];
  if (status) {
    return db.select().from(purchaseOrders)
      .where(eq(purchaseOrders.status, status as any))
      .orderBy(desc(purchaseOrders.createdAt));
  }
  return db.select().from(purchaseOrders).orderBy(desc(purchaseOrders.createdAt));
}

export async function getStockMovements(ingredientId?: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  if (ingredientId) {
    return db.select().from(stockMovements)
      .where(eq(stockMovements.ingredientId, ingredientId))
      .orderBy(desc(stockMovements.createdAt))
      .limit(limit);
  }
  return db.select().from(stockMovements).orderBy(desc(stockMovements.createdAt)).limit(limit);
}

// ============ EMPLOYEE QUERIES ============
export async function getAllEmployees() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(employees).where(eq(employees.status, "active")).orderBy(employees.name);
}

export async function getEmployeeById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(employees).where(eq(employees.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getEmployeeShifts(employeeId: number, date?: string) {
  const db = await getDb();
  if (!db) return [];
  if (date) {
    return db.select().from(shifts)
      .where(and(eq(shifts.employeeId, employeeId), eq(shifts.shiftDate, date as any)))
      .orderBy(shifts.startTime);
  }
  return db.select().from(shifts).where(eq(shifts.employeeId, employeeId)).orderBy(desc(shifts.shiftDate));
}

// ============ CUSTOMER QUERIES ============
export async function getAllCustomers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(customers).orderBy(customers.name);
}

export async function getCustomerById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function searchCustomers(query: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(customers)
    .where(like(customers.name, `%${query}%`))
    .limit(10);
}

// ============ TABLE QUERIES ============
export async function getAllTables() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tables).orderBy(tables.tableNumber);
}

export async function getTableById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(tables).where(eq(tables.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getAvailableTables(capacity: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tables)
    .where(and(
      eq(tables.status, "available"),
      gte(tables.capacity, capacity)
    ))
    .orderBy(tables.capacity);
}

export async function getReservations(date?: string) {
  const db = await getDb();
  if (!db) return [];
  if (date) {
    return db.select().from(reservations)
      .where(eq(reservations.reservationDate, date as any))
      .orderBy(reservations.reservationTime);
  }
  return db.select().from(reservations).orderBy(desc(reservations.createdAt));
}

// ============ ORDER QUERIES ============
export async function getAllOrders(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).orderBy(desc(orders.createdAt)).limit(limit);
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

export async function getOrdersByStatus(status: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders)
    .where(eq(orders.status, status as any))
    .orderBy(desc(orders.createdAt));
}

export async function getOrdersByDateRange(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders)
    .where(and(
      gte(orders.createdAt, startDate),
      lte(orders.createdAt, endDate)
    ))
    .orderBy(desc(orders.createdAt));
}

export async function getPayments(orderId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (orderId) {
    return db.select().from(payments).where(eq(payments.orderId, orderId));
  }
  return db.select().from(payments).orderBy(desc(payments.createdAt));
}

// ============ REPORTING QUERIES ============
export async function getDailySalesTotal(date: Date) {
  const db = await getDb();
  if (!db) return 0;
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const result = await db.select().from(orders)
    .where(and(
      gte(orders.createdAt, startOfDay),
      lte(orders.createdAt, endOfDay),
      eq(orders.paymentStatus, "paid")
    ));
  
  return result.reduce((sum, order) => sum + (order.total || 0), 0);
}

export async function getTopSellingItems(limit = 10) {
  const db = await getDb();
  if (!db) return [];
  // This would require a more complex query with grouping
  // For now, return all order items sorted by frequency
  const items = await db.select().from(orderItems).orderBy(desc(orderItems.quantity)).limit(limit);
  return items;
}
