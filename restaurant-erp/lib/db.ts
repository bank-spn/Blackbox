import { User, InventoryItem, Order, MenuItem, Staff, Supplier, PurchaseOrder, Expense } from './types';

class Database {
  private users: User[] = [
    {
      id: '1',
      email: 'admin@restaurant.com',
      password: 'admin123',
      name: 'Admin User',
      role: 'admin',
      createdAt: new Date('2024-01-01'),
    },
    {
      id: '2',
      email: 'manager@restaurant.com',
      password: 'manager123',
      name: 'Manager User',
      role: 'manager',
      createdAt: new Date('2024-01-15'),
    },
  ];

  private inventory: InventoryItem[] = [
    {
      id: '1',
      name: 'Tomatoes',
      category: 'Vegetables',
      quantity: 50,
      unit: 'kg',
      minStock: 20,
      maxStock: 100,
      unitPrice: 3.5,
      supplierId: '1',
      lastRestocked: new Date('2024-10-28'),
      expiryDate: new Date('2024-11-10'),
    },
    {
      id: '2',
      name: 'Chicken Breast',
      category: 'Meat',
      quantity: 15,
      unit: 'kg',
      minStock: 25,
      maxStock: 80,
      unitPrice: 12.5,
      supplierId: '2',
      lastRestocked: new Date('2024-10-30'),
      expiryDate: new Date('2024-11-05'),
    },
    {
      id: '3',
      name: 'Olive Oil',
      category: 'Oils',
      quantity: 30,
      unit: 'liters',
      minStock: 15,
      maxStock: 50,
      unitPrice: 8.0,
      supplierId: '1',
      lastRestocked: new Date('2024-10-25'),
    },
    {
      id: '4',
      name: 'Pasta',
      category: 'Grains',
      quantity: 80,
      unit: 'kg',
      minStock: 30,
      maxStock: 150,
      unitPrice: 2.5,
      supplierId: '3',
      lastRestocked: new Date('2024-10-20'),
    },
  ];

  private orders: Order[] = [
    {
      id: '1',
      orderNumber: 'ORD-001',
      tableNumber: '5',
      items: [
        { menuItemId: '1', name: 'Margherita Pizza', quantity: 2, price: 12.99 },
        { menuItemId: '3', name: 'Caesar Salad', quantity: 1, price: 8.99 },
      ],
      subtotal: 34.97,
      tax: 3.50,
      total: 38.47,
      status: 'preparing',
      paymentStatus: 'unpaid',
      customerName: 'John Doe',
      createdAt: new Date('2024-11-02T10:30:00'),
    },
    {
      id: '2',
      orderNumber: 'ORD-002',
      tableNumber: '3',
      items: [
        { menuItemId: '2', name: 'Pepperoni Pizza', quantity: 1, price: 14.99 },
        { menuItemId: '5', name: 'Tiramisu', quantity: 2, price: 6.99 },
      ],
      subtotal: 28.97,
      tax: 2.90,
      total: 31.87,
      status: 'completed',
      paymentStatus: 'paid',
      paymentMethod: 'card',
      customerName: 'Jane Smith',
      createdAt: new Date('2024-11-02T09:15:00'),
      completedAt: new Date('2024-11-02T10:00:00'),
    },
  ];

  private menuItems: MenuItem[] = [
    {
      id: '1',
      name: 'Margherita Pizza',
      description: 'Classic pizza with tomato sauce, mozzarella, and basil',
      category: 'Pizza',
      price: 12.99,
      cost: 4.50,
      available: true,
      ingredients: ['Dough', 'Tomato Sauce', 'Mozzarella', 'Basil'],
      preparationTime: 15,
    },
    {
      id: '2',
      name: 'Pepperoni Pizza',
      description: 'Pizza with tomato sauce, mozzarella, and pepperoni',
      category: 'Pizza',
      price: 14.99,
      cost: 5.20,
      available: true,
      ingredients: ['Dough', 'Tomato Sauce', 'Mozzarella', 'Pepperoni'],
      preparationTime: 15,
    },
    {
      id: '3',
      name: 'Caesar Salad',
      description: 'Fresh romaine lettuce with Caesar dressing and croutons',
      category: 'Salads',
      price: 8.99,
      cost: 3.00,
      available: true,
      ingredients: ['Romaine Lettuce', 'Caesar Dressing', 'Croutons', 'Parmesan'],
      preparationTime: 5,
    },
    {
      id: '4',
      name: 'Spaghetti Carbonara',
      description: 'Classic Italian pasta with eggs, cheese, and bacon',
      category: 'Pasta',
      price: 13.99,
      cost: 4.80,
      available: true,
      ingredients: ['Spaghetti', 'Eggs', 'Parmesan', 'Bacon', 'Black Pepper'],
      preparationTime: 12,
    },
    {
      id: '5',
      name: 'Tiramisu',
      description: 'Italian dessert with coffee-soaked ladyfingers and mascarpone',
      category: 'Desserts',
      price: 6.99,
      cost: 2.50,
      available: true,
      ingredients: ['Ladyfingers', 'Mascarpone', 'Coffee', 'Cocoa'],
      preparationTime: 5,
    },
  ];

  private staff: Staff[] = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@restaurant.com',
      phone: '+1234567890',
      role: 'Chef',
      position: 'Head Chef',
      salary: 55000,
      hireDate: new Date('2023-01-15'),
      status: 'active',
      schedule: [
        { day: 'Monday', startTime: '09:00', endTime: '17:00' },
        { day: 'Tuesday', startTime: '09:00', endTime: '17:00' },
        { day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
        { day: 'Thursday', startTime: '09:00', endTime: '17:00' },
        { day: 'Friday', startTime: '09:00', endTime: '17:00' },
      ],
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.j@restaurant.com',
      phone: '+1234567891',
      role: 'Server',
      position: 'Senior Server',
      salary: 35000,
      hireDate: new Date('2023-03-20'),
      status: 'active',
    },
    {
      id: '3',
      name: 'Mike Brown',
      email: 'mike.b@restaurant.com',
      phone: '+1234567892',
      role: 'Cook',
      position: 'Line Cook',
      salary: 32000,
      hireDate: new Date('2023-06-10'),
      status: 'active',
    },
  ];

  private suppliers: Supplier[] = [
    {
      id: '1',
      name: 'Fresh Produce Co.',
      contactPerson: 'Robert Green',
      email: 'robert@freshproduce.com',
      phone: '+1234567893',
      address: '123 Market St, City',
      category: 'Vegetables & Fruits',
      rating: 4.5,
      paymentTerms: 'Net 30',
    },
    {
      id: '2',
      name: 'Premium Meats Ltd.',
      contactPerson: 'Lisa White',
      email: 'lisa@premiummeats.com',
      phone: '+1234567894',
      address: '456 Industrial Ave, City',
      category: 'Meat & Poultry',
      rating: 4.8,
      paymentTerms: 'Net 15',
    },
    {
      id: '3',
      name: 'Grain & More',
      contactPerson: 'Tom Black',
      email: 'tom@grainmore.com',
      phone: '+1234567895',
      address: '789 Warehouse Rd, City',
      category: 'Dry Goods',
      rating: 4.2,
      paymentTerms: 'Net 30',
    },
  ];

  private purchaseOrders: PurchaseOrder[] = [
    {
      id: '1',
      poNumber: 'PO-001',
      supplierId: '1',
      supplierName: 'Fresh Produce Co.',
      items: [
        { inventoryItemId: '1', name: 'Tomatoes', quantity: 50, unitPrice: 3.5, total: 175 },
      ],
      subtotal: 175,
      tax: 17.5,
      total: 192.5,
      status: 'received',
      orderDate: new Date('2024-10-25'),
      expectedDelivery: new Date('2024-10-28'),
      actualDelivery: new Date('2024-10-28'),
    },
  ];

  private expenses: Expense[] = [
    {
      id: '1',
      category: 'Utilities',
      description: 'Electricity Bill - October',
      amount: 450.00,
      date: new Date('2024-10-01'),
      paymentMethod: 'Bank Transfer',
      vendor: 'City Power Company',
    },
    {
      id: '2',
      category: 'Maintenance',
      description: 'Kitchen Equipment Repair',
      amount: 280.00,
      date: new Date('2024-10-15'),
      paymentMethod: 'Cash',
      vendor: 'Quick Fix Services',
    },
  ];

  getUsers() { return this.users; }
  getInventory() { return this.inventory; }
  getOrders() { return this.orders; }
  getMenuItems() { return this.menuItems; }
  getStaff() { return this.staff; }
  getSuppliers() { return this.suppliers; }
  getPurchaseOrders() { return this.purchaseOrders; }
  getExpenses() { return this.expenses; }

  addInventoryItem(item: InventoryItem) {
    this.inventory.push(item);
    return item;
  }

  updateInventoryItem(id: string, updates: Partial<InventoryItem>) {
    const index = this.inventory.findIndex(item => item.id === id);
    if (index !== -1) {
      this.inventory[index] = { ...this.inventory[index], ...updates };
      return this.inventory[index];
    }
    return null;
  }

  deleteInventoryItem(id: string) {
    const index = this.inventory.findIndex(item => item.id === id);
    if (index !== -1) {
      this.inventory.splice(index, 1);
      return true;
    }
    return false;
  }

  addOrder(order: Order) {
    this.orders.push(order);
    return order;
  }

  updateOrder(id: string, updates: Partial<Order>) {
    const index = this.orders.findIndex(order => order.id === id);
    if (index !== -1) {
      this.orders[index] = { ...this.orders[index], ...updates };
      return this.orders[index];
    }
    return null;
  }

  addMenuItem(item: MenuItem) {
    this.menuItems.push(item);
    return item;
  }

  updateMenuItem(id: string, updates: Partial<MenuItem>) {
    const index = this.menuItems.findIndex(item => item.id === id);
    if (index !== -1) {
      this.menuItems[index] = { ...this.menuItems[index], ...updates };
      return this.menuItems[index];
    }
    return null;
  }

  deleteMenuItem(id: string) {
    const index = this.menuItems.findIndex(item => item.id === id);
    if (index !== -1) {
      this.menuItems.splice(index, 1);
      return true;
    }
    return false;
  }

  addStaff(staff: Staff) {
    this.staff.push(staff);
    return staff;
  }

  updateStaff(id: string, updates: Partial<Staff>) {
    const index = this.staff.findIndex(s => s.id === id);
    if (index !== -1) {
      this.staff[index] = { ...this.staff[index], ...updates };
      return this.staff[index];
    }
    return null;
  }

  deleteStaff(id: string) {
    const index = this.staff.findIndex(s => s.id === id);
    if (index !== -1) {
      this.staff.splice(index, 1);
      return true;
    }
    return false;
  }

  addSupplier(supplier: Supplier) {
    this.suppliers.push(supplier);
    return supplier;
  }

  updateSupplier(id: string, updates: Partial<Supplier>) {
    const index = this.suppliers.findIndex(s => s.id === id);
    if (index !== -1) {
      this.suppliers[index] = { ...this.suppliers[index], ...updates };
      return this.suppliers[index];
    }
    return null;
  }

  deleteSupplier(id: string) {
    const index = this.suppliers.findIndex(s => s.id === id);
    if (index !== -1) {
      this.suppliers.splice(index, 1);
      return true;
    }
    return false;
  }

  addPurchaseOrder(po: PurchaseOrder) {
    this.purchaseOrders.push(po);
    return po;
  }

  updatePurchaseOrder(id: string, updates: Partial<PurchaseOrder>) {
    const index = this.purchaseOrders.findIndex(po => po.id === id);
    if (index !== -1) {
      this.purchaseOrders[index] = { ...this.purchaseOrders[index], ...updates };
      return this.purchaseOrders[index];
    }
    return null;
  }

  addExpense(expense: Expense) {
    this.expenses.push(expense);
    return expense;
  }
}

export const db = new Database();
