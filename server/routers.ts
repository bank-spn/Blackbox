import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import * as db from "./db";
import { 
  menuCategories, menuItems,
  ingredients, suppliers, purchaseOrders, purchaseOrderItems, stockMovements,
  employees, shifts,
  customers,
  tables, reservations,
  orders, orderItems, payments
} from "../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============ MENU MANAGEMENT ============
  menu: router({
    categories: router({
      list: publicProcedure.query(async () => {
        return await db.getMenuCategories();
      }),
      create: publicProcedure
        .input(z.object({
          name: z.string().min(1),
          description: z.string().optional(),
          displayOrder: z.number().optional(),
        }))
        .mutation(async ({ input }) => {
          const database = await getDb();
          if (!database) throw new Error("Database not available");
          return await database.insert(menuCategories).values(input);
        }),
      update: publicProcedure
        .input(z.object({
          id: z.number(),
          name: z.string().optional(),
          description: z.string().optional(),
          displayOrder: z.number().optional(),
        }))
        .mutation(async ({ input }) => {
          const database = await getDb();
          if (!database) throw new Error("Database not available");
          const { id, ...data } = input;
          await database.update(menuCategories).set(data as any).where(eq(menuCategories.id, id));
          return { success: true };
        }),
      delete: publicProcedure
        .input(z.number())
        .mutation(async ({ input }) => {
          const database = await getDb();
          if (!database) throw new Error("Database not available");
          await database.delete(menuCategories).where(eq(menuCategories.id, input));
          return { success: true };
        }),
    }),
    items: router({
      list: publicProcedure.query(async () => {
        return await db.getAllMenuItems();
      }),
      byCategory: publicProcedure
        .input(z.number())
        .query(async ({ input }) => {
          return await db.getMenuItemsByCategory(input);
        }),
      getById: publicProcedure
        .input(z.number())
        .query(async ({ input }) => {
          return await db.getMenuItemById(input);
        }),
      create: publicProcedure
        .input(z.object({
          categoryId: z.number(),
          name: z.string().min(1),
          description: z.string().optional(),
          price: z.number().min(0),
          cost: z.number().optional(),
          imageUrl: z.string().optional(),
          isAvailable: z.boolean().optional(),
          preparationTime: z.number().optional(),
        }))
        .mutation(async ({ input }) => {
          const database = await getDb();
          if (!database) throw new Error("Database not available");
          return await database.insert(menuItems).values(input);
        }),
      update: publicProcedure
        .input(z.object({
          id: z.number(),
          categoryId: z.number().optional(),
          name: z.string().optional(),
          description: z.string().optional(),
          price: z.number().optional(),
          cost: z.number().optional(),
          imageUrl: z.string().optional(),
          isAvailable: z.boolean().optional(),
          preparationTime: z.number().optional(),
        }))
        .mutation(async ({ input }) => {
          const database = await getDb();
          if (!database) throw new Error("Database not available");
          const { id, ...data } = input;
          await database.update(menuItems).set(data as any).where(eq(menuItems.id, id));
          return { success: true };
        }),
      delete: publicProcedure
        .input(z.number())
        .mutation(async ({ input }) => {
          const database = await getDb();
          if (!database) throw new Error("Database not available");
          await database.delete(menuItems).where(eq(menuItems.id, input));
          return { success: true };
        }),
    }),
  }),

  // ============ INVENTORY MANAGEMENT ============
  inventory: router({
    ingredients: router({
      list: publicProcedure.query(async () => {
        return await db.getAllIngredients();
      }),
      getById: publicProcedure
        .input(z.number())
        .query(async ({ input }) => {
          return await db.getIngredientById(input);
        }),
      lowStock: publicProcedure.query(async () => {
        return await db.getLowStockIngredients();
      }),
      create: publicProcedure
        .input(z.object({
          name: z.string().min(1),
          unit: z.string(),
          currentStock: z.number().optional(),
          minimumStock: z.number().optional(),
          reorderLevel: z.number().optional(),
          unitCost: z.number().optional(),
          supplierId: z.number().optional(),
        }))
        .mutation(async ({ input }) => {
          const database = await getDb();
          if (!database) throw new Error("Database not available");
          return await database.insert(ingredients).values(input);
        }),
      update: publicProcedure
        .input(z.object({
          id: z.number(),
          name: z.string().optional(),
          unit: z.string().optional(),
          currentStock: z.number().optional(),
          minimumStock: z.number().optional(),
          reorderLevel: z.number().optional(),
          unitCost: z.number().optional(),
          supplierId: z.number().optional(),
        }))
        .mutation(async ({ input }) => {
          const database = await getDb();
          if (!database) throw new Error("Database not available");
          const { id, ...data } = input;
          await database.update(ingredients).set(data as any).where(eq(ingredients.id, id));
          return { success: true };
        }),
      delete: publicProcedure
        .input(z.number())
        .mutation(async ({ input }) => {
          const database = await getDb();
          if (!database) throw new Error("Database not available");
          await database.delete(ingredients).where(eq(ingredients.id, input));
          return { success: true };
        }),
    }),
    suppliers: router({
      list: publicProcedure.query(async () => {
        return await db.getAllSuppliers();
      }),
      create: publicProcedure
        .input(z.object({
          name: z.string().min(1),
          contactPerson: z.string().optional(),
          phone: z.string().optional(),
          email: z.string().optional(),
          address: z.string().optional(),
          paymentTerms: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
          const database = await getDb();
          if (!database) throw new Error("Database not available");
          return await database.insert(suppliers).values(input);
        }),
      update: publicProcedure
        .input(z.object({
          id: z.number(),
          name: z.string().optional(),
          contactPerson: z.string().optional(),
          phone: z.string().optional(),
          email: z.string().optional(),
          address: z.string().optional(),
          paymentTerms: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
          const database = await getDb();
          if (!database) throw new Error("Database not available");
          const { id, ...data } = input;
          await database.update(suppliers).set(data as any).where(eq(suppliers.id, id));
          return { success: true };
        }),
    }),
    purchaseOrders: router({
      list: publicProcedure
        .input(z.object({ status: z.string().optional() }).optional())
        .query(async ({ input }) => {
          return await db.getPurchaseOrders(input?.status);
        }),
      updateStatus: publicProcedure
        .input(z.object({
          id: z.number(),
          status: z.enum(["pending", "confirmed", "delivered", "cancelled"]),
        }))
        .mutation(async ({ input }) => {
          const database = await getDb();
          if (!database) throw new Error("Database not available");
          await database.update(purchaseOrders)
            .set({ status: input.status as any })
            .where(eq(purchaseOrders.id, input.id));
          return { success: true };
        }),
    }),
    stockMovements: router({
      list: publicProcedure
        .input(z.object({ ingredientId: z.number().optional(), limit: z.number().optional() }).optional())
        .query(async ({ input }) => {
          return await db.getStockMovements(input?.ingredientId, input?.limit);
        }),
      record: publicProcedure
        .input(z.object({
          ingredientId: z.number(),
          type: z.enum(["in", "out", "adjustment"]),
          quantity: z.number(),
          reference: z.string().optional(),
          notes: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
          const database = await getDb();
          if (!database) throw new Error("Database not available");
          await database.insert(stockMovements).values({
            ...input,
            type: input.type as any,
          });
          
          const ingredient = await db.getIngredientById(input.ingredientId);
          if (ingredient && ingredient.currentStock !== null) {
            let newStock = ingredient.currentStock;
            if (input.type === "in") {
              newStock += input.quantity;
            } else if (input.type === "out") {
              newStock -= input.quantity;
            } else {
              newStock = input.quantity;
            }
            await database.update(ingredients)
              .set({ currentStock: newStock })
              .where(eq(ingredients.id, input.ingredientId));
          }
          return { success: true };
        }),
    }),
  }),

  // ============ EMPLOYEE MANAGEMENT ============
  employees: router({
    list: publicProcedure.query(async () => {
      return await db.getAllEmployees();
    }),
    getById: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return await db.getEmployeeById(input);
      }),
    create: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().optional(),
        phone: z.string().optional(),
        position: z.string(),
        role: z.enum(["manager", "cashier", "chef", "waiter", "staff"]).optional(),
        hireDate: z.string().optional(),
        salary: z.number().optional(),
        address: z.string().optional(),
        emergencyContact: z.string().optional(),
        emergencyPhone: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        return await database.insert(employees).values({
          ...input,
          hireDate: input.hireDate ? (new Date(input.hireDate) as any) : undefined,
        });
      }),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        position: z.string().optional(),
        role: z.enum(["manager", "cashier", "chef", "waiter", "staff"]).optional(),
        salary: z.number().optional(),
        status: z.enum(["active", "inactive", "on_leave"]).optional(),
        address: z.string().optional(),
        emergencyContact: z.string().optional(),
        emergencyPhone: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        const { id, ...data } = input;
        await database.update(employees).set(data as any).where(eq(employees.id, id));
        return { success: true };
      }),
    shifts: router({
      list: publicProcedure
        .input(z.object({ employeeId: z.number(), date: z.string().optional() }).optional())
        .query(async ({ input }) => {
          if (!input) return [];
          return await db.getEmployeeShifts(input.employeeId, input.date);
        }),
      create: publicProcedure
        .input(z.object({
          employeeId: z.number(),
          shiftDate: z.string(),
          startTime: z.string(),
          endTime: z.string(),
          notes: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
          const database = await getDb();
          if (!database) throw new Error("Database not available");
          return await database.insert(shifts).values({
            ...input,
            shiftDate: new Date(input.shiftDate) as any,
          });
        }),
      updateStatus: publicProcedure
        .input(z.object({
          id: z.number(),
          status: z.enum(["scheduled", "completed", "cancelled", "no_show"]),
        }))
        .mutation(async ({ input }) => {
          const database = await getDb();
          if (!database) throw new Error("Database not available");
          await database.update(shifts)
            .set({ status: input.status as any })
            .where(eq(shifts.id, input.id));
          return { success: true };
        }),
    }),
  }),

  // ============ CUSTOMER MANAGEMENT ============
  customers: router({
    list: publicProcedure.query(async () => {
      return await db.getAllCustomers();
    }),
    getById: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return await db.getCustomerById(input);
      }),
    search: publicProcedure
      .input(z.string())
      .query(async ({ input }) => {
        return await db.searchCustomers(input);
      }),
    create: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        return await database.insert(customers).values(input);
      }),
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        loyaltyPoints: z.number().optional(),
        totalSpent: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        const { id, ...data } = input;
        await database.update(customers).set(data as any).where(eq(customers.id, id));
        return { success: true };
      }),
  }),

  // ============ TABLE MANAGEMENT ============
  tables: router({
    list: publicProcedure.query(async () => {
      return await db.getAllTables();
    }),
    getById: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return await db.getTableById(input);
      }),
    available: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return await db.getAvailableTables(input);
      }),
    create: publicProcedure
      .input(z.object({
        tableNumber: z.string(),
        capacity: z.number(),
        location: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        return await database.insert(tables).values(input);
      }),
    updateStatus: publicProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["available", "occupied", "reserved", "maintenance"]),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        await database.update(tables)
          .set({ status: input.status as any })
          .where(eq(tables.id, input.id));
        return { success: true };
      }),
    reservations: router({
      list: publicProcedure
        .input(z.object({ date: z.string().optional() }).optional())
        .query(async ({ input }) => {
          return await db.getReservations(input?.date);
        }),
      create: publicProcedure
        .input(z.object({
          customerId: z.number().optional(),
          tableId: z.number().optional(),
          reservationDate: z.string(),
          reservationTime: z.string(),
          partySize: z.number(),
          specialRequests: z.string().optional(),
        }))
        .mutation(async ({ input }) => {
          const database = await getDb();
          if (!database) throw new Error("Database not available");
          return await database.insert(reservations).values({
            ...input,
            reservationDate: new Date(input.reservationDate) as any,
          });
        }),
      updateStatus: publicProcedure
        .input(z.object({
          id: z.number(),
          status: z.enum(["confirmed", "checked_in", "completed", "cancelled", "no_show"]),
        }))
        .mutation(async ({ input }) => {
          const database = await getDb();
          if (!database) throw new Error("Database not available");
          await database.update(reservations)
            .set({ status: input.status as any })
            .where(eq(reservations.id, input.id));
          return { success: true };
        }),
    }),
  }),

  // ============ POS & ORDERS ============
  orders: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return await db.getAllOrders(input?.limit);
      }),
    getById: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return await db.getOrderById(input);
      }),
    byStatus: publicProcedure
      .input(z.string())
      .query(async ({ input }) => {
        return await db.getOrdersByStatus(input);
      }),
    create: publicProcedure
      .input(z.object({
        customerId: z.number().optional(),
        tableId: z.number().optional(),
        orderType: z.enum(["dine_in", "takeout", "delivery"]).optional(),
        items: z.array(z.object({
          menuItemId: z.number(),
          quantity: z.number(),
          unitPrice: z.number(),
          specialInstructions: z.string().optional(),
        })),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        const { items, ...orderData } = input;
        const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
        
        const result = await database.insert(orders).values({
          ...orderData,
          subtotal,
          total: subtotal,
        } as any);
        
        const insertId = (result as any).insertId || result[0];
        for (const item of items) {
          await database.insert(orderItems).values({
            orderId: insertId as number,
            ...item,
          } as any);
        }
        
        return result;
      }),
    updateStatus: publicProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "confirmed", "preparing", "ready", "served", "completed", "cancelled"]),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        await database.update(orders)
          .set({ status: input.status as any })
          .where(eq(orders.id, input.id));
        return { success: true };
      }),
    addItem: publicProcedure
      .input(z.object({
        orderId: z.number(),
        menuItemId: z.number(),
        quantity: z.number(),
        unitPrice: z.number(),
        specialInstructions: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        const { orderId, ...itemData } = input;
        await database.insert(orderItems).values({
          orderId,
          ...itemData,
        });
        
        const order = await db.getOrderById(orderId);
        if (order && order.subtotal !== null) {
          const newSubtotal = order.subtotal + (input.unitPrice * input.quantity);
          await database.update(orders)
            .set({ subtotal: newSubtotal, total: newSubtotal })
            .where(eq(orders.id, orderId));
        }
        
        return { success: true };
      }),
    applyDiscount: publicProcedure
      .input(z.object({
        id: z.number(),
        discount: z.number(),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        const order = await db.getOrderById(input.id);
        if (order && order.subtotal !== null) {
          const newTotal = (order.subtotal - input.discount) + (order.tax || 0);
          await database.update(orders)
            .set({ discount: input.discount, total: newTotal })
            .where(eq(orders.id, input.id));
        }
        return { success: true };
      }),
  }),

  payments: router({
    list: publicProcedure
      .input(z.object({ orderId: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return await db.getPayments(input?.orderId);
      }),
    create: publicProcedure
      .input(z.object({
        orderId: z.number(),
        amount: z.number(),
        method: z.enum(["cash", "card", "online", "other"]),
        reference: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        await database.insert(payments).values({
          ...input,
          status: "completed" as any,
        } as any);
        
        await database.update(orders)
          .set({ paymentStatus: "paid" as any })
          .where(eq(orders.id, input.orderId));
        
        return { success: true };
      }),
  }),

  // ============ REPORTING ============
  reports: router({
    dailySales: publicProcedure
      .input(z.string())
      .query(async ({ input }) => {
        const date = new Date(input);
        const total = await db.getDailySalesTotal(date);
        return { date: input, total };
      }),
    topItems: publicProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return await db.getTopSellingItems(input?.limit);
      }),
    salesByDateRange: publicProcedure
      .input(z.object({
        startDate: z.string(),
        endDate: z.string(),
      }))
      .query(async ({ input }) => {
        const start = new Date(input.startDate);
        const end = new Date(input.endDate);
        return await db.getOrdersByDateRange(start, end);
      }),
  }),
});

export type AppRouter = typeof appRouter;
