export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'manager' | 'staff';
  createdAt: Date;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
  maxStock: number;
  unitPrice: number;
  supplierId: string;
  lastRestocked: Date;
  expiryDate?: Date;
}

export interface Order {
  id: string;
  orderNumber: string;
  tableNumber?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  paymentMethod?: 'cash' | 'card' | 'online';
  customerId?: string;
  customerName?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  cost: number;
  image?: string;
  available: boolean;
  ingredients: string[];
  preparationTime: number;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  position: string;
  salary: number;
  hireDate: Date;
  status: 'active' | 'inactive' | 'on-leave';
  schedule?: Schedule[];
}

export interface Schedule {
  day: string;
  startTime: string;
  endTime: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  rating: number;
  paymentTerms: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'confirmed' | 'received' | 'cancelled';
  orderDate: Date;
  expectedDelivery: Date;
  actualDelivery?: Date;
}

export interface PurchaseOrderItem {
  inventoryItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: Date;
  paymentMethod: string;
  vendor?: string;
  receipt?: string;
}

export interface SalesReport {
  date: string;
  revenue: number;
  orders: number;
  averageOrderValue: number;
}

export interface DashboardStats {
  todayRevenue: number;
  todayOrders: number;
  activeOrders: number;
  lowStockItems: number;
  totalStaff: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  orderGrowth: number;
}
