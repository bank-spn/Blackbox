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
import { Plus, TrendingUp, TrendingDown, Trash2 } from "lucide-react";

interface FinancialTransaction {
  id: number;
  type: "income" | "expense";
  category: string;
  amount: number;
  description: string;
  date: string;
  paymentMethod: string;
}

export default function FinancialManagement() {
  const { t } = useLanguage();
  const { addNotification } = useNotification();

  const [transactions, setTransactions] = useState<FinancialTransaction[]>([
    { id: 1, type: "income", category: "Sales", amount: 4250, description: "Daily sales", date: "2024-01-15", paymentMethod: "Cash" },
    { id: 2, type: "expense", category: "Supplies", amount: 500, description: "Food supplies", date: "2024-01-15", paymentMethod: "Bank Transfer" },
    { id: 3, type: "income", category: "Sales", amount: 3800, description: "Daily sales", date: "2024-01-14", paymentMethod: "Card" },
    { id: 4, type: "expense", category: "Utilities", amount: 200, description: "Electricity bill", date: "2024-01-14", paymentMethod: "Bank Transfer" },
  ]);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState<Partial<FinancialTransaction>>({});

  const handleAddTransaction = () => {
    if (!formData.type || !formData.category || !formData.amount || !formData.description) {
      addNotification("error", "Error", "Please fill all required fields");
      return;
    }

    const newTransaction: FinancialTransaction = {
      id: Math.max(...transactions.map(t => t.id), 0) + 1,
      type: formData.type as "income" | "expense",
      category: formData.category,
      amount: formData.amount || 0,
      description: formData.description,
      date: formData.date || new Date().toISOString().split('T')[0],
      paymentMethod: formData.paymentMethod || "Cash",
    };

    setTransactions([newTransaction, ...transactions]);
    setFormData({});
    setShowAddDialog(false);
    addNotification("success", "Success", "Transaction recorded");
  };

  const handleDeleteTransaction = (id: number) => {
    setTransactions(transactions.filter(t => t.id !== id));
    addNotification("success", "Success", "Transaction deleted");
  };

  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalIncome - totalExpense;

  const incomeByCategory = transactions
    .filter(t => t.type === "income")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const expenseByCategory = transactions
    .filter(t => t.type === "expense")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Financial Management</h1>
            <p className="text-muted-foreground">Track income and expenses</p>
          </div>
          <Button onClick={() => { setFormData({}); setShowAddDialog(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                Total Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">${totalIncome.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                Total Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">-${totalExpense.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card className={netProfit >= 0 ? "border-blue-200 bg-blue-50" : "border-orange-200 bg-orange-50"}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${netProfit >= 0 ? "text-blue-600" : "text-orange-600"}`}>
                ${netProfit.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Income by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Income by Category</CardTitle>
            <CardDescription>Breakdown of income sources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(incomeByCategory).map(([category, amount]) => (
                <div key={category} className="flex items-center justify-between p-2 border rounded">
                  <span className="font-medium">{category}</span>
                  <span className="text-green-600 font-bold">${amount.toFixed(2)}</span>
                </div>
              ))}
              {Object.keys(incomeByCategory).length === 0 && (
                <p className="text-muted-foreground text-sm">No income recorded</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Expenses by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
            <CardDescription>Breakdown of expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(expenseByCategory).map(([category, amount]) => (
                <div key={category} className="flex items-center justify-between p-2 border rounded">
                  <span className="font-medium">{category}</span>
                  <span className="text-red-600 font-bold">-${amount.toFixed(2)}</span>
                </div>
              ))}
              {Object.keys(expenseByCategory).length === 0 && (
                <p className="text-muted-foreground text-sm">No expenses recorded</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* All Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>All Transactions</CardTitle>
            <CardDescription>Complete transaction history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {transactions.map(transaction => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded hover:bg-muted/50">
                  <div className="flex items-center gap-3 flex-1">
                    {transaction.type === "income" ? (
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.category} • {transaction.date} • {transaction.paymentMethod}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className={`font-bold text-lg ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                      {transaction.type === "income" ? "+" : "-"}${transaction.amount.toFixed(2)}
                    </p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteTransaction(transaction.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Transaction Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
            <DialogDescription>Record a new financial transaction</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Type *</label>
              <select
                value={formData.type || ""}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as "income" | "expense" })}
                className="w-full border rounded px-2 py-1 mt-1"
              >
                <option value="">Select type</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Category *</label>
              <Input
                value={formData.category || ""}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Sales, Supplies, Utilities"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Amount *</label>
              <Input
                type="number"
                value={formData.amount || ""}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                placeholder="0.00"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description *</label>
              <Input
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Transaction description"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                value={formData.date || ""}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Payment Method</label>
              <select
                value={formData.paymentMethod || "Cash"}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full border rounded px-2 py-1 mt-1"
              >
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Check">Check</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTransaction}>Add Transaction</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
