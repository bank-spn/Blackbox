import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Plus, Trash2, Edit2 } from "lucide-react";

export default function Menu() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    price: 0,
    description: "",
  });

  const categories = trpc.menu.categories.list.useQuery();
  const items = trpc.menu.items.list.useQuery();
  const createItem = trpc.menu.items.create.useMutation();
  const deleteItem = trpc.menu.items.delete.useMutation();

  const handleAddItem = async () => {
    if (!selectedCategory || !newItem.name) return;
    
    try {
      await createItem.mutateAsync({
        categoryId: selectedCategory,
        name: newItem.name,
        description: newItem.description,
        price: Math.round(newItem.price * 100),
        isAvailable: true,
      });
      setNewItem({ name: "", price: 0, description: "" });
      setShowAddItem(false);
      items.refetch();
    } catch (error) {
      console.error("Failed to create item:", error);
    }
  };

  const handleDeleteItem = async (id: number) => {
    try {
      await deleteItem.mutateAsync(id);
      items.refetch();
    } catch (error) {
      console.error("Failed to delete item:", error);
    }
  };

  const filteredItems = selectedCategory
    ? items.data?.filter((item) => item.categoryId === selectedCategory)
    : items.data;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Menu Management</h1>
          <p className="text-muted-foreground">Manage your restaurant menu items and categories</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>Select a category to view items</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setSelectedCategory(null)}
              >
                All Items
              </Button>
              {categories.data?.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Menu Items */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {selectedCategory ? "Items in Category" : "All Menu Items"}
              </h2>
              <Button onClick={() => setShowAddItem(!showAddItem)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            {showAddItem && selectedCategory && (
              <Card>
                <CardHeader>
                  <CardTitle>Add New Item</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Item name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  />
                  <Input
                    placeholder="Description"
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Price"
                    step="0.01"
                    value={newItem.price}
                    onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) })}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleAddItem} disabled={createItem.isPending}>
                      {createItem.isPending ? "Adding..." : "Add Item"}
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddItem(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Items List */}
            <div className="space-y-2">
              {filteredItems?.map((item) => (
                <Card key={item.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                        <p className="text-lg font-bold mt-2">
                          ${(item.price / 100).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteItem(item.id)}
                          disabled={deleteItem.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
