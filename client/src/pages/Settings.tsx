import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNotification } from "@/contexts/NotificationContext";
import { Settings as SettingsIcon, Plus, Edit2, Trash2, Save } from "lucide-react";
import DatabaseConfig from "@/components/DatabaseConfig";

interface MenuItem {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
}

interface Table {
  id: number;
  number: number;
  capacity: number;
  status: "available" | "occupied" | "reserved";
}

export default function Settings() {
  const { t } = useLanguage();
  const { addNotification } = useNotification();

  const [settings, setSettings] = useState({
    restaurantName: "My Restaurant",
    restaurantPhone: "+1 (555) 123-4567",
    restaurantEmail: "info@restaurant.com",
    restaurantAddress: "123 Main St, City, State",
    currency: "USD",
    timezone: "America/New_York",
    taxRate: "8.5",
    discountPercentage: "10",
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    { id: 1, name: "Pasta Carbonara", category: "Pasta", price: 12.99, description: "Classic Italian pasta" },
    { id: 2, name: "Caesar Salad", category: "Salad", price: 8.99, description: "Fresh greens with parmesan" },
    { id: 3, name: "Grilled Salmon", category: "Main Course", price: 18.99, description: "Fresh salmon fillet" },
  ]);

  const [tables, setTables] = useState<Table[]>([
    { id: 1, number: 1, capacity: 2, status: "available" },
    { id: 2, number: 2, capacity: 4, status: "occupied" },
    { id: 3, number: 3, capacity: 6, status: "available" },
    { id: 4, number: 4, capacity: 4, status: "reserved" },
  ]);

  const [isSaving, setIsSaving] = useState(false);
  const [showAddMenuItem, setShowAddMenuItem] = useState(false);
  const [showEditMenuItem, setShowEditMenuItem] = useState(false);
  const [showAddTable, setShowAddTable] = useState(false);
  const [showEditTable, setShowEditTable] = useState(false);
  const [editingMenuId, setEditingMenuId] = useState<number | null>(null);
  const [editingTableId, setEditingTableId] = useState<number | null>(null);
  const [menuFormData, setMenuFormData] = useState<Partial<MenuItem>>({});
  const [tableFormData, setTableFormData] = useState<Partial<Table>>({});

  const handleSaveSettings = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    addNotification("success", "Success", "Settings saved");
  };

  // Menu Management
  const handleAddMenuItem = () => {
    if (!menuFormData.name || !menuFormData.category || !menuFormData.price) {
      addNotification("error", "Error", "Please fill all required fields");
      return;
    }

    const newItem: MenuItem = {
      id: Math.max(...menuItems.map(m => m.id), 0) + 1,
      name: menuFormData.name,
      category: menuFormData.category,
      price: menuFormData.price || 0,
      description: menuFormData.description || "",
    };

    setMenuItems([...menuItems, newItem]);
    setMenuFormData({});
    setShowAddMenuItem(false);
    addNotification("success", "Success", "Menu item added");
  };

  const handleEditMenuItem = () => {
    if (!editingMenuId || !menuFormData.name || !menuFormData.category || !menuFormData.price) {
      addNotification("error", "Error", "Please fill all required fields");
      return;
    }

    setMenuItems(
      menuItems.map(item =>
        item.id === editingMenuId
          ? {
              ...item,
              name: menuFormData.name || item.name,
              category: menuFormData.category || item.category,
              price: menuFormData.price || item.price,
              description: menuFormData.description || item.description,
            }
          : item
      )
    );
    setMenuFormData({});
    setEditingMenuId(null);
    setShowEditMenuItem(false);
    addNotification("success", "Success", "Menu item updated");
  };

  const handleDeleteMenuItem = (id: number) => {
    setMenuItems(menuItems.filter(item => item.id !== id));
    addNotification("success", "Success", "Menu item deleted");
  };

  const openEditMenuDialog = (item: MenuItem) => {
    setMenuFormData(item);
    setEditingMenuId(item.id);
    setShowEditMenuItem(true);
  };

  // Table Management
  const handleAddTable = () => {
    if (!tableFormData.number || !tableFormData.capacity) {
      addNotification("error", "Error", "Please fill all required fields");
      return;
    }

    const newTable: Table = {
      id: Math.max(...tables.map(t => t.id), 0) + 1,
      number: tableFormData.number || 0,
      capacity: tableFormData.capacity || 0,
      status: "available",
    };

    setTables([...tables, newTable]);
    setTableFormData({});
    setShowAddTable(false);
    addNotification("success", "Success", "Table added");
  };

  const handleEditTable = () => {
    if (!editingTableId || !tableFormData.number || !tableFormData.capacity) {
      addNotification("error", "Error", "Please fill all required fields");
      return;
    }

    setTables(
      tables.map(table =>
        table.id === editingTableId
          ? {
              ...table,
              number: tableFormData.number || table.number,
              capacity: tableFormData.capacity || table.capacity,
              status: (tableFormData.status || table.status) as "available" | "occupied" | "reserved",
            }
          : table
      )
    );
    setTableFormData({});
    setEditingTableId(null);
    setShowEditTable(false);
    addNotification("success", "Success", "Table updated");
  };

  const handleDeleteTable = (id: number) => {
    setTables(tables.filter(table => table.id !== id));
    addNotification("success", "Success", "Table deleted");
  };

  const openEditTableDialog = (table: Table) => {
    setTableFormData(table);
    setEditingTableId(table.id);
    setShowEditTable(true);
  };

  const getTableStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "occupied":
        return "bg-red-100 text-red-800";
      case "reserved":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const menuCategories = Array.from(new Set(menuItems.map(item => item.category)));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Configure system preferences and options</p>
        </div>

        {/* Restaurant Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" />
              Restaurant Information
            </CardTitle>
            <CardDescription>Basic restaurant details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Restaurant Name</label>
                <Input
                  value={settings.restaurantName}
                  onChange={(e) => setSettings({ ...settings, restaurantName: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input
                  value={settings.restaurantPhone}
                  onChange={(e) => setSettings({ ...settings, restaurantPhone: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={settings.restaurantEmail}
                  onChange={(e) => setSettings({ ...settings, restaurantEmail: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Address</label>
                <Input
                  value={settings.restaurantAddress}
                  onChange={(e) => setSettings({ ...settings, restaurantAddress: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Business Settings</CardTitle>
            <CardDescription>Tax, discount, and currency settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <label className="text-sm font-medium">Currency</label>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="w-full border rounded px-2 py-1 mt-1"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="THB">THB (฿)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Timezone</label>
                <select
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                  className="w-full border rounded px-2 py-1 mt-1"
                >
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Asia/Bangkok">Bangkok Time</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Tax Rate (%)</label>
                <Input
                  type="number"
                  value={settings.taxRate}
                  onChange={(e) => setSettings({ ...settings, taxRate: e.target.value })}
                  step="0.1"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Default Discount (%)</label>
                <Input
                  type="number"
                  value={settings.discountPercentage}
                  onChange={(e) => setSettings({ ...settings, discountPercentage: e.target.value })}
                  step="0.1"
                  className="mt-1"
                />
              </div>
            </div>
            <Button onClick={handleSaveSettings} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </CardContent>
        </Card>

        {/* Menu Management */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Menu Management</CardTitle>
              <CardDescription>Manage menu items and categories</CardDescription>
            </div>
            <Button size="sm" onClick={() => { setMenuFormData({}); setShowAddMenuItem(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {menuItems.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No menu items</p>
              ) : (
                menuItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded hover:bg-muted/50">
                    <div className="flex-1">
                      <p className="font-bold">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-bold text-lg">${item.price.toFixed(2)}</p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditMenuDialog(item)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteMenuItem(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Table Management */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Table Management</CardTitle>
              <CardDescription>Manage restaurant tables</CardDescription>
            </div>
            <Button size="sm" onClick={() => { setTableFormData({}); setShowAddTable(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Table
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {tables.length === 0 ? (
                <p className="text-muted-foreground col-span-full text-center py-4">No tables</p>
              ) : (
                tables.map(table => (
                  <div key={table.id} className="p-4 border rounded">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-bold text-lg">Table {table.number}</p>
                        <p className="text-xs text-muted-foreground">Capacity: {table.capacity}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getTableStatusColor(table.status)}`}>
                        {table.status}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => openEditTableDialog(table)}
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleDeleteTable(table.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Database Configuration */}
        <DatabaseConfig />
      </div>

      {/* Add Menu Item Dialog */}
      <Dialog open={showAddMenuItem} onOpenChange={setShowAddMenuItem}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Menu Item</DialogTitle>
            <DialogDescription>Add a new item to the menu</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Item Name *</label>
              <Input
                value={menuFormData.name || ""}
                onChange={(e) => setMenuFormData({ ...menuFormData, name: e.target.value })}
                placeholder="e.g., Pasta Carbonara"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Category *</label>
              <Input
                value={menuFormData.category || ""}
                onChange={(e) => setMenuFormData({ ...menuFormData, category: e.target.value })}
                placeholder="e.g., Pasta, Salad, Main Course"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Price *</label>
              <Input
                type="number"
                value={menuFormData.price || ""}
                onChange={(e) => setMenuFormData({ ...menuFormData, price: parseFloat(e.target.value) })}
                placeholder="0.00"
                step="0.01"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                value={menuFormData.description || ""}
                onChange={(e) => setMenuFormData({ ...menuFormData, description: e.target.value })}
                placeholder="Item description"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddMenuItem(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMenuItem}>Add Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Menu Item Dialog */}
      <Dialog open={showEditMenuItem} onOpenChange={setShowEditMenuItem}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
            <DialogDescription>Update menu item details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Item Name *</label>
              <Input
                value={menuFormData.name || ""}
                onChange={(e) => setMenuFormData({ ...menuFormData, name: e.target.value })}
                placeholder="e.g., Pasta Carbonara"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Category *</label>
              <Input
                value={menuFormData.category || ""}
                onChange={(e) => setMenuFormData({ ...menuFormData, category: e.target.value })}
                placeholder="e.g., Pasta, Salad, Main Course"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Price *</label>
              <Input
                type="number"
                value={menuFormData.price || ""}
                onChange={(e) => setMenuFormData({ ...menuFormData, price: parseFloat(e.target.value) })}
                placeholder="0.00"
                step="0.01"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                value={menuFormData.description || ""}
                onChange={(e) => setMenuFormData({ ...menuFormData, description: e.target.value })}
                placeholder="Item description"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditMenuItem(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditMenuItem}>Update Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Table Dialog */}
      <Dialog open={showAddTable} onOpenChange={setShowAddTable}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Table</DialogTitle>
            <DialogDescription>Add a new table to the restaurant</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Table Number *</label>
              <Input
                type="number"
                value={tableFormData.number || ""}
                onChange={(e) => setTableFormData({ ...tableFormData, number: parseInt(e.target.value) })}
                placeholder="1"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Capacity *</label>
              <Input
                type="number"
                value={tableFormData.capacity || ""}
                onChange={(e) => setTableFormData({ ...tableFormData, capacity: parseInt(e.target.value) })}
                placeholder="2"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTable(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTable}>Add Table</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Table Dialog */}
      <Dialog open={showEditTable} onOpenChange={setShowEditTable}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Table</DialogTitle>
            <DialogDescription>Update table details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Table Number *</label>
              <Input
                type="number"
                value={tableFormData.number || ""}
                onChange={(e) => setTableFormData({ ...tableFormData, number: parseInt(e.target.value) })}
                placeholder="1"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Capacity *</label>
              <Input
                type="number"
                value={tableFormData.capacity || ""}
                onChange={(e) => setTableFormData({ ...tableFormData, capacity: parseInt(e.target.value) })}
                placeholder="2"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <select
                value={tableFormData.status || "available"}
                onChange={(e) => setTableFormData({ ...tableFormData, status: e.target.value as "available" | "occupied" | "reserved" })}
                className="w-full border rounded px-2 py-1 mt-1"
              >
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="reserved">Reserved</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditTable(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditTable}>Update Table</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
