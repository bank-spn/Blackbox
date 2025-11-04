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
import { Plus, Edit2, Trash2, AlertCircle } from "lucide-react";

interface Ingredient {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  reorderLevel: number;
  unitCost: number;
  supplier: string;
}

export default function Inventory() {
  const { t } = useLanguage();
  const { addNotification } = useNotification();

  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: 1, name: "Chicken Breast", quantity: 50, unit: "kg", reorderLevel: 20, unitCost: 8.5, supplier: "Fresh Farm" },
    { id: 2, name: "Rice", quantity: 100, unit: "kg", reorderLevel: 50, unitCost: 2.5, supplier: "Rice Mill" },
    { id: 3, name: "Vegetables Mix", quantity: 30, unit: "kg", reorderLevel: 15, unitCost: 5.0, supplier: "Vegetable Co" },
  ]);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<Ingredient>>({});

  const handleAddIngredient = () => {
    if (!formData.name || !formData.quantity || !formData.unitCost) {
      addNotification("error", "Error", "Please fill all required fields");
      return;
    }

    const newIngredient: Ingredient = {
      id: Math.max(...ingredients.map(i => i.id), 0) + 1,
      name: formData.name,
      quantity: formData.quantity || 0,
      unit: formData.unit || "kg",
      reorderLevel: formData.reorderLevel || 0,
      unitCost: formData.unitCost || 0,
      supplier: formData.supplier || "",
    };

    setIngredients([...ingredients, newIngredient]);
    setFormData({});
    setShowAddDialog(false);
    addNotification("success", "Success", "Ingredient added");
  };

  const handleEditIngredient = () => {
    if (!editingId || !formData.name || !formData.quantity || !formData.unitCost) {
      addNotification("error", "Error", "Please fill all required fields");
      return;
    }

    setIngredients(
      ingredients.map(i =>
        i.id === editingId
          ? {
              ...i,
              name: formData.name || i.name,
              quantity: formData.quantity || i.quantity,
              unit: formData.unit || i.unit,
              reorderLevel: formData.reorderLevel || i.reorderLevel,
              unitCost: formData.unitCost || i.unitCost,
              supplier: formData.supplier || i.supplier,
            }
          : i
      )
    );
    setFormData({});
    setEditingId(null);
    setShowEditDialog(false);
    addNotification("success", "Success", "Ingredient updated");
  };

  const handleDeleteIngredient = (id: number) => {
    setIngredients(ingredients.filter(i => i.id !== id));
    addNotification("success", "Success", "Ingredient deleted");
  };

  const openEditDialog = (ingredient: Ingredient) => {
    setFormData(ingredient);
    setEditingId(ingredient.id);
    setShowEditDialog(true);
  };

  const lowStockItems = ingredients.filter(i => i.quantity <= i.reorderLevel);
  const totalValue = ingredients.reduce((sum, i) => sum + (i.quantity * i.unitCost), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
            <p className="text-muted-foreground">Manage ingredients and stock levels</p>
          </div>
          <Button onClick={() => { setFormData({}); setShowAddDialog(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Ingredient
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{ingredients.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">${totalValue.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card className={lowStockItems.length > 0 ? "border-yellow-200 bg-yellow-50" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-yellow-600">{lowStockItems.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alert */}
        {lowStockItems.length > 0 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <CardTitle>Low Stock Alert</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {lowStockItems.map(item => (
                  <li key={item.id} className="text-sm">
                    <strong>{item.name}</strong>: {item.quantity} {item.unit} (Reorder at: {item.reorderLevel} {item.unit})
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Ingredients Table */}
        <Card>
          <CardHeader>
            <CardTitle>Ingredients</CardTitle>
            <CardDescription>All ingredients in stock</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Name</th>
                    <th className="text-left py-2 px-2">Quantity</th>
                    <th className="text-left py-2 px-2">Unit Cost</th>
                    <th className="text-left py-2 px-2">Total Value</th>
                    <th className="text-left py-2 px-2">Supplier</th>
                    <th className="text-left py-2 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ingredients.map(ingredient => (
                    <tr key={ingredient.id} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-2 font-medium">{ingredient.name}</td>
                      <td className="py-2 px-2">
                        <span className={ingredient.quantity <= ingredient.reorderLevel ? "text-yellow-600 font-bold" : ""}>
                          {ingredient.quantity} {ingredient.unit}
                        </span>
                      </td>
                      <td className="py-2 px-2">${ingredient.unitCost.toFixed(2)}</td>
                      <td className="py-2 px-2 font-bold">${(ingredient.quantity * ingredient.unitCost).toFixed(2)}</td>
                      <td className="py-2 px-2">{ingredient.supplier}</td>
                      <td className="py-2 px-2">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(ingredient)}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteIngredient(ingredient.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Ingredient</DialogTitle>
            <DialogDescription>Add a new ingredient to inventory</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name *</label>
              <Input
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ingredient name"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Quantity *</label>
                <Input
                  type="number"
                  value={formData.quantity || ""}
                  onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                  placeholder="0"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Unit</label>
                <Input
                  value={formData.unit || "kg"}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="kg"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Unit Cost *</label>
                <Input
                  type="number"
                  value={formData.unitCost || ""}
                  onChange={(e) => setFormData({ ...formData, unitCost: parseFloat(e.target.value) })}
                  placeholder="0.00"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Reorder Level</label>
                <Input
                  type="number"
                  value={formData.reorderLevel || ""}
                  onChange={(e) => setFormData({ ...formData, reorderLevel: parseFloat(e.target.value) })}
                  placeholder="0"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Supplier</label>
              <Input
                value={formData.supplier || ""}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                placeholder="Supplier name"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddIngredient}>Add Ingredient</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Ingredient</DialogTitle>
            <DialogDescription>Update ingredient details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name *</label>
              <Input
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ingredient name"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Quantity *</label>
                <Input
                  type="number"
                  value={formData.quantity || ""}
                  onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                  placeholder="0"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Unit</label>
                <Input
                  value={formData.unit || "kg"}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="kg"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Unit Cost *</label>
                <Input
                  type="number"
                  value={formData.unitCost || ""}
                  onChange={(e) => setFormData({ ...formData, unitCost: parseFloat(e.target.value) })}
                  placeholder="0.00"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Reorder Level</label>
                <Input
                  type="number"
                  value={formData.reorderLevel || ""}
                  onChange={(e) => setFormData({ ...formData, reorderLevel: parseFloat(e.target.value) })}
                  placeholder="0"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Supplier</label>
              <Input
                value={formData.supplier || ""}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                placeholder="Supplier name"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditIngredient}>Update Ingredient</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
