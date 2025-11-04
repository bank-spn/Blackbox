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
import { Plus, Minus, Trash2, DollarSign, ChevronLeft, ChevronRight, CreditCard, Banknote } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNotification } from "@/contexts/NotificationContext";

interface CartItem {
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
}

interface Table {
  id: number;
  tableNumber: number;
  status: string;
}

export default function POS() {
  const { t } = useLanguage();
  const { addNotification } = useNotification();
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "online">("cash");
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [cartCollapsed, setCartCollapsed] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [amountPaid, setAmountPaid] = useState(0);

  // Mock data
  const menuItems = [
    { id: 1, name: "Pad Thai", price: 8.99 },
    { id: 2, name: "Green Curry", price: 10.99 },
    { id: 3, name: "Tom Yum Soup", price: 7.99 },
    { id: 4, name: "Spring Rolls", price: 5.99 },
    { id: 5, name: "Fried Rice", price: 8.99 },
    { id: 6, name: "Satay Chicken", price: 9.99 },
  ];

  const tables: Table[] = [
    { id: 1, tableNumber: 1, status: "available" },
    { id: 2, tableNumber: 2, status: "available" },
    { id: 3, tableNumber: 3, status: "occupied" },
    { id: 4, tableNumber: 4, status: "available" },
  ];

  const addToCart = (item: any) => {
    const existingItem = cart.find((i) => i.menuItemId === item.id);
    if (existingItem) {
      setCart(
        cart.map((i) =>
          i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      setCart([
        ...cart,
        {
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
        },
      ]);
    }
    addNotification("success", "Added", `${item.name} added to cart`);
  };

  const removeFromCart = (menuItemId: number) => {
    setCart(cart.filter((i) => i.menuItemId !== menuItemId));
  };

  const updateQuantity = (menuItemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(menuItemId);
    } else {
      setCart(
        cart.map((i) =>
          i.menuItemId === menuItemId ? { ...i, quantity } : i
        )
      );
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal - discount;
  const change = amountPaid - total;

  const handleCheckout = async () => {
    if (cart.length === 0) {
      addNotification("error", "Error", "Cart is empty");
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      addNotification("success", "Success", "Order completed successfully!");
      setCart([]);
      setDiscount(0);
      setSelectedTable(null);
      setAmountPaid(0);
      setShowPaymentModal(false);
    } catch (error) {
      addNotification("error", "Error", "Failed to create order");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Point of Sale</h1>
          <p className="text-muted-foreground">Create and manage orders</p>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          {/* Menu Items */}
          <div className={`space-y-4 ${cartCollapsed ? "md:col-span-4" : "md:col-span-3"}`}>
            <h2 className="text-xl font-semibold">Menu Items</h2>
            <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {menuItems.map((item) => (
                <Card
                  key={item.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => addToCart(item)}
                >
                  <CardContent className="p-4 text-center">
                    <p className="font-semibold text-sm">{item.name}</p>
                    <p className="text-lg font-bold text-primary">
                      ${item.price.toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Order Summary - Collapsible Sidebar */}
          <div className={`transition-all duration-300 ${cartCollapsed ? "md:col-span-1" : "md:col-span-1"}`}>
            <Card className={`h-full flex flex-col ${cartCollapsed ? "sticky top-4" : ""}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className={cartCollapsed ? "text-sm" : ""}>Order Summary</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCartCollapsed(!cartCollapsed)}
                    className="h-6 w-6 p-0"
                  >
                    {cartCollapsed ? (
                      <ChevronLeft className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>

              {!cartCollapsed && (
                <CardContent className="flex-1 space-y-4 overflow-y-auto">
                  {/* Table Selection */}
                  <div>
                    <label className="text-sm font-medium">Table</label>
                    <select
                      className="w-full border rounded px-2 py-1 mt-1"
                      value={selectedTable || ""}
                      onChange={(e) => setSelectedTable(e.target.value ? parseInt(e.target.value) : null)}
                    >
                      <option value="">Takeout</option>
                      {tables.map((table) => (
                        <option key={table.id} value={table.id}>
                          Table {table.tableNumber} ({table.status})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Cart Items */}
                  <div className="space-y-2 max-h-48 overflow-y-auto border rounded p-2 bg-muted/50">
                    {cart.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No items in cart
                      </p>
                    ) : (
                      cart.map((item) => (
                        <div key={item.menuItemId} className="flex items-center justify-between text-xs">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{item.name}</p>
                            <p className="text-muted-foreground">
                              ${item.price.toFixed(2)} x {item.quantity}
                            </p>
                          </div>
                          <div className="flex items-center gap-0.5 ml-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 w-6 p-0"
                              onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                            >
                              <Minus className="h-2 w-2" />
                            </Button>
                            <span className="w-5 text-center text-xs">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 w-6 p-0"
                              onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                            >
                              <Plus className="h-2 w-2" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 w-6 p-0"
                              onClick={() => removeFromCart(item.menuItemId)}
                            >
                              <Trash2 className="h-2 w-2" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Discount */}
                  <div>
                    <label className="text-sm font-medium">Discount</label>
                    <Input
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                      className="mt-1"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Totals */}
                  <div className="space-y-2 border-t pt-4">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Discount:</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="text-sm font-medium">Payment Method</label>
                    <select
                      className="w-full border rounded px-2 py-1 mt-1"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="online">Online</option>
                    </select>
                  </div>

                  {/* Checkout */}
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => setShowPaymentModal(true)}
                    disabled={cart.length === 0}
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Checkout
                  </Button>
                </CardContent>
              )}

              {cartCollapsed && (
                <CardContent className="flex flex-col items-center justify-center py-4">
                  <div className="text-2xl font-bold text-primary">
                    {cart.length}
                  </div>
                  <p className="text-xs text-muted-foreground">items</p>
                  <div className="text-lg font-bold mt-2">
                    ${total.toFixed(2)}
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Payment</DialogTitle>
            <DialogDescription>
              Complete the payment for this order
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Order Summary */}
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount:</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Method Icons */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={paymentMethod === "cash" ? "default" : "outline"}
                onClick={() => setPaymentMethod("cash")}
                className="flex flex-col items-center gap-2 h-auto py-3"
              >
                <Banknote className="h-6 w-6" />
                <span className="text-xs">Cash</span>
              </Button>
              <Button
                variant={paymentMethod === "card" ? "default" : "outline"}
                onClick={() => setPaymentMethod("card")}
                className="flex flex-col items-center gap-2 h-auto py-3"
              >
                <CreditCard className="h-6 w-6" />
                <span className="text-xs">Card</span>
              </Button>
              <Button
                variant={paymentMethod === "online" ? "default" : "outline"}
                onClick={() => setPaymentMethod("online")}
                className="flex flex-col items-center gap-2 h-auto py-3"
              >
                <DollarSign className="h-6 w-6" />
                <span className="text-xs">Online</span>
              </Button>
            </div>

            {/* Amount Paid Input */}
            {paymentMethod === "cash" && (
              <div>
                <label className="text-sm font-medium">Amount Paid</label>
                <Input
                  type="number"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="mt-1"
                />
                {amountPaid > 0 && (
                  <div className={`mt-2 p-2 rounded ${change >= 0 ? "bg-green-50" : "bg-red-50"}`}>
                    <p className={`text-sm font-medium ${change >= 0 ? "text-green-700" : "text-red-700"}`}>
                      Change: ${change.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowPaymentModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCheckout}
              disabled={paymentMethod === "cash" && amountPaid < total}
            >
              Complete Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
