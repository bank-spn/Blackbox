import { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "th";

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

const translations: Translations = {
  en: {
    // Navigation
    dashboard: "Dashboard",
    pos: "POS",
    cashier: "Cashier",
    inventory: "Inventory",
    employees: "Employees",
    financial: "Financial",
    auditLog: "Audit Log",
    settings: "Settings",
    menu: "Menu Management",
    tables: "Tables & Reservations",
    reports: "Reports & Analytics",

    // Dashboard
    dashboardTitle: "Restaurant ERP Dashboard",
    welcomeBack: "Welcome back! Manage your restaurant operations efficiently.",
    todaysSales: "Today's Sales",
    activeOrders: "Active Orders",
    lowStockItems: "Low Stock Items",
    staffOnDuty: "Staff On Duty",
    ordersInProgress: "Orders in progress",
    requireAttention: "Require attention",
    employeesWorking: "Employees working",
    modules: "Modules",

    // POS
    posTitle: "Point of Sale",
    selectTable: "Select Table",
    menuItems: "Menu Items",
    cart: "Cart",
    total: "Total",
    subtotal: "Subtotal",
    tax: "Tax",
    discount: "Discount",
    payment: "Payment",
    checkout: "Checkout",
    addItem: "Add Item",
    removeItem: "Remove Item",
    quantity: "Quantity",
    price: "Price",

    // Cashier
    cashierTitle: "Cashier Management",
    openSession: "Open Session",
    closeSession: "Close Session",
    openingBalance: "Opening Balance",
    closingBalance: "Closing Balance",
    totalCash: "Total Cash",
    totalCard: "Total Card",
    discrepancy: "Discrepancy",
    recentSessions: "Recent Sessions",

    // Inventory
    inventoryTitle: "Inventory Management",
    ingredients: "Ingredients",
    suppliers: "Suppliers",
    stock: "Stock",
    minimumLevel: "Minimum Level",
    reorderLevel: "Reorder Level",
    currentStock: "Current Stock",
    addIngredient: "Add Ingredient",

    // Employees
    employeesTitle: "Employees Management",
    staffList: "Staff List",
    addEmployee: "Add Employee",
    position: "Position",
    salary: "Salary",
    status: "Status",
    active: "Active",
    inactive: "Inactive",

    // Financial
    financialTitle: "Financial Management",
    revenue: "Revenue",
    expenses: "Expenses",
    profit: "Profit",
    accounts: "Accounts",
    transactions: "Transactions",
    addExpense: "Add Expense",

    // Audit Log
    auditLogTitle: "Audit Log",
    action: "Action",
    module: "Module",
    timestamp: "Timestamp",
    user: "User",
    details: "Details",

    // Settings
    settingsTitle: "Settings",
    restaurantInfo: "Restaurant Information",
    systemSettings: "System Settings",
    databaseConfig: "Database Configuration",
    backup: "Backup",
    language: "Language",
    currency: "Currency",
    timezone: "Timezone",

    // Common
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    close: "Close",
    open: "Open",
    search: "Search",
    filter: "Filter",
    export: "Export",
    import: "Import",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    warning: "Warning",
    info: "Info",
    noData: "No data available",
    confirm: "Confirm",
    confirmDelete: "Are you sure you want to delete this item?",
  },
  th: {
    // Navigation
    dashboard: "แดชบอร์ด",
    pos: "ระบบ POS",
    cashier: "แคชเชียร์",
    inventory: "คลังสินค้า",
    employees: "พนักงาน",
    financial: "การเงิน",
    auditLog: "บันทึกกิจกรรม",
    settings: "ตั้งค่า",
    menu: "จัดการเมนู",
    tables: "โต๊ะและการจอง",
    reports: "รายงานและการวิเคราะห์",

    // Dashboard
    dashboardTitle: "แดชบอร์ด Restaurant ERP",
    welcomeBack: "ยินดีต้อนรับกลับ! จัดการการดำเนินงานร้านอาหารของคุณอย่างมีประสิทธิภาพ",
    todaysSales: "ยอดขายวันนี้",
    activeOrders: "ออเดอร์ที่ใช้งาน",
    lowStockItems: "สินค้าคงคลังต่ำ",
    staffOnDuty: "พนักงานที่ปฏิบัติงาน",
    ordersInProgress: "ออเดอร์ที่กำลังดำเนินการ",
    requireAttention: "ต้องการความสนใจ",
    employeesWorking: "พนักงานที่ทำงาน",
    modules: "โมดูล",

    // POS
    posTitle: "ระบบจุดขาย",
    selectTable: "เลือกโต๊ะ",
    menuItems: "รายการเมนู",
    cart: "ตะกร้า",
    total: "รวมทั้งสิ้น",
    subtotal: "รวมย่อย",
    tax: "ภาษี",
    discount: "ส่วนลด",
    payment: "ชำระเงิน",
    checkout: "ชำระเงิน",
    addItem: "เพิ่มรายการ",
    removeItem: "ลบรายการ",
    quantity: "จำนวน",
    price: "ราคา",

    // Cashier
    cashierTitle: "การจัดการแคชเชียร์",
    openSession: "เปิด Session",
    closeSession: "ปิด Session",
    openingBalance: "ยอดเปิด",
    closingBalance: "ยอดปิด",
    totalCash: "เงินสดทั้งหมด",
    totalCard: "บัตรทั้งหมด",
    discrepancy: "ความแตกต่าง",
    recentSessions: "Session ล่าสุด",

    // Inventory
    inventoryTitle: "การจัดการคลังสินค้า",
    ingredients: "วัตถุดิบ",
    suppliers: "ผู้จัดจำหน่าย",
    stock: "คงคลัง",
    minimumLevel: "ระดับต่ำสุด",
    reorderLevel: "ระดับการสั่งซื้อใหม่",
    currentStock: "คงคลังปัจจุบัน",
    addIngredient: "เพิ่มวัตถุดิบ",

    // Employees
    employeesTitle: "การจัดการพนักงาน",
    staffList: "รายชื่อพนักงาน",
    addEmployee: "เพิ่มพนักงาน",
    position: "ตำแหน่ง",
    salary: "เงินเดือน",
    status: "สถานะ",
    active: "ใช้งาน",
    inactive: "ไม่ใช้งาน",

    // Financial
    financialTitle: "การจัดการการเงิน",
    revenue: "รายรับ",
    expenses: "รายจ่าย",
    profit: "กำไร",
    accounts: "บัญชี",
    transactions: "รายการ",
    addExpense: "เพิ่มรายจ่าย",

    // Audit Log
    auditLogTitle: "บันทึกกิจกรรม",
    action: "การกระทำ",
    module: "โมดูล",
    timestamp: "เวลา",
    user: "ผู้ใช้",
    details: "รายละเอียด",

    // Settings
    settingsTitle: "ตั้งค่า",
    restaurantInfo: "ข้อมูลร้านอาหาร",
    systemSettings: "ตั้งค่าระบบ",
    databaseConfig: "ตั้งค่าฐานข้อมูล",
    backup: "สำรองข้อมูล",
    language: "ภาษา",
    currency: "สกุลเงิน",
    timezone: "เขตเวลา",

    // Common
    save: "บันทึก",
    cancel: "ยกเลิก",
    delete: "ลบ",
    edit: "แก้ไข",
    add: "เพิ่ม",
    close: "ปิด",
    open: "เปิด",
    search: "ค้นหา",
    filter: "ตัวกรอง",
    export: "ส่งออก",
    import: "นำเข้า",
    loading: "กำลังโหลด...",
    error: "ข้อผิดพลาด",
    success: "สำเร็จ",
    warning: "คำเตือน",
    info: "ข้อมูล",
    noData: "ไม่มีข้อมูล",
    confirm: "ยืนยัน",
    confirmDelete: "คุณแน่ใจหรือว่าต้องการลบรายการนี้?",
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved as Language) || "en";
  });

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
