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
import { Plus, LogOut, LogIn, TrendingUp, TrendingDown } from "lucide-react";

interface CashierSession {
  id: number;
  openingBalance: number;
  currentBalance: number;
  startTime: Date;
  endTime?: Date;
  isActive: boolean;
}

interface Transaction {
  id: number;
  type: "in" | "out";
  amount: number;
  description: string;
  timestamp: Date;
}

export default function Cashier() {
  const { t } = useLanguage();
  const { addNotification } = useNotification();

  const [sessions, setSessions] = useState<CashierSession[]>([
    {
      id: 1,
      openingBalance: 1000,
      currentBalance: 4250,
      startTime: new Date(Date.now() - 8 * 60 * 60 * 1000),
      isActive: true,
    },
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 1, type: "in", amount: 150, description: "Order #001", timestamp: new Date(Date.now() - 30 * 60 * 1000) },
    { id: 2, type: "in", amount: 200, description: "Order #002", timestamp: new Date(Date.now() - 20 * 60 * 1000) },
    { id: 3, type: "out", amount: 50, description: "Cash Withdrawal", timestamp: new Date(Date.now() - 10 * 60 * 1000) },
  ]);

  const [showOpenSession, setShowOpenSession] = useState(false);
  const [showCloseSession, setShowCloseSession] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [openingBalance, setOpeningBalance] = useState("");
  const [transactionAmount, setTransactionAmount] = useState("");
  const [transactionDesc, setTransactionDesc] = useState("");
  const [transactionType, setTransactionType] = useState<"in" | "out">("in");

  const activeSession = sessions.find((s) => s.isActive);

  const handleOpenSession = () => {
    const balance = parseFloat(openingBalance);
    if (!balance || balance < 0) {
      addNotification("error", "Error", "Invalid opening balance");
      return;
    }

    const newSession: CashierSession = {
      id: sessions.length + 1,
      openingBalance: balance,
      currentBalance: balance,
      startTime: new Date(),
      isActive: true,
    };

    setSessions([...sessions, newSession]);
    setOpeningBalance("");
    setShowOpenSession(false);
    addNotification("success", "Success", "Cashier session opened");
  };

  const handleCloseSession = () => {
    if (!activeSession) return;

    const closedSession = {
      ...activeSession,
      isActive: false,
      endTime: new Date(),
    };

    setSessions(sessions.map((s) => (s.id === activeSession.id ? closedSession : s)));
    setShowCloseSession(false);
    addNotification("success", "Success", "Cashier session closed");
  };

  const handleAddTransaction = () => {
    const amount = parseFloat(transactionAmount);
    if (!amount || amount <= 0 || !transactionDesc.trim()) {
      addNotification("error", "Error", "Invalid transaction details");
      return;
    }

    if (!activeSession) {
      addNotification("error", "Error", "No active session");
      return;
    }

    const newTransaction: Transaction = {
      id: transactions.length + 1,
      type: transactionType,
      amount,
      description: transactionDesc,
      timestamp: new Date(),
    };

    setTransactions([newTransaction, ...transactions]);

    const newBalance =
      transactionType === "in"
        ? activeSession.currentBalance + amount
        : activeSession.currentBalance - amount;

    setSessions(
      sessions.map((s) =>
        s.id === activeSession.id ? { ...s, currentBalance: newBalance } : s
      )
    );

    setTransactionAmount("");
    setTransactionDesc("");
    setShowAddTransaction(false);
    addNotification("success", "Success", "Transaction recorded");
  };

  const totalIn = transactions.reduce((sum, t) => (t.type === "in" ? sum + t.amount : sum), 0);
  const totalOut = transactions.reduce((sum, t) => (t.type === "out" ? sum + t.amount : sum), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cashier Management</h1>
          <p className="text-muted-foreground">Manage cash register and transactions</p>
        </div>

        {/* Active Session */}
        {activeSession && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Active Session</CardTitle>
                  <CardDescription>
                    Started at {activeSession.startTime.toLocaleTimeString()}
                  </CardDescription>
                </div>
                <Button variant="destructive" onClick={() => setShowCloseSession(true)}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Close Session
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <p className="text-sm text-muted-foreground">Opening Balance</p>
                  <p className="text-2xl font-bold">${activeSession.openingBalance.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total In</p>
                  <p className="text-2xl font-bold text-green-600">${totalIn.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Out</p>
                  <p className="text-2xl font-bold text-red-600">-${totalOut.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Balance</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ${activeSession.currentBalance.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Active Session */}
        {!activeSession && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle>No Active Session</CardTitle>
              <CardDescription>Open a new cashier session to start</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setShowOpenSession(true)}>
                <LogIn className="h-4 w-4 mr-2" />
                Open New Session
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        {activeSession && (
          <div className="grid gap-4 md:grid-cols-2">
            <Button
              size="lg"
              onClick={() => setShowAddTransaction(true)}
              className="h-auto py-6"
            >
              <Plus className="h-5 w-5 mr-2" />
              <div className="text-left">
                <div>Add Transaction</div>
                <div className="text-xs opacity-75">Record income or expense</div>
              </div>
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setShowCloseSession(true)}
              className="h-auto py-6"
            >
              <LogOut className="h-5 w-5 mr-2" />
              <div className="text-left">
                <div>Close Session</div>
                <div className="text-xs opacity-75">End cashier session</div>
              </div>
            </Button>
          </div>
        )}

        {/* Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Last 10 transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {transactions.slice(0, 10).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    {transaction.type === "in" ? (
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    )}
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {transaction.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <p
                    className={`font-bold ${
                      transaction.type === "in" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {transaction.type === "in" ? "+" : "-"}${transaction.amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Session History */}
        <Card>
          <CardHeader>
            <CardTitle>Session History</CardTitle>
            <CardDescription>Previous cashier sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">
                      Session #{session.id} {session.isActive && <span className="text-green-600">(Active)</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {session.startTime.toLocaleString()} - {session.endTime?.toLocaleString() || "Ongoing"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">Opening: ${session.openingBalance.toFixed(2)}</p>
                    <p className="font-bold">Closing: ${session.currentBalance.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Open Session Dialog */}
      <Dialog open={showOpenSession} onOpenChange={setShowOpenSession}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Open New Cashier Session</DialogTitle>
            <DialogDescription>Enter the opening balance for this session</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Opening Balance</label>
              <Input
                type="number"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
                placeholder="0.00"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOpenSession(false)}>
              Cancel
            </Button>
            <Button onClick={handleOpenSession}>Open Session</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Close Session Dialog */}
      <Dialog open={showCloseSession} onOpenChange={setShowCloseSession}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close Cashier Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to close this session? Current balance: $
              {activeSession?.currentBalance.toFixed(2)}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCloseSession(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleCloseSession}>
              Close Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Transaction Dialog */}
      <Dialog open={showAddTransaction} onOpenChange={setShowAddTransaction}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
            <DialogDescription>Record a new transaction</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Type</label>
              <select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value as "in" | "out")}
                className="w-full border rounded px-2 py-1 mt-1"
              >
                <option value="in">Income</option>
                <option value="out">Expense</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Amount</label>
              <Input
                type="number"
                value={transactionAmount}
                onChange={(e) => setTransactionAmount(e.target.value)}
                placeholder="0.00"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                value={transactionDesc}
                onChange={(e) => setTransactionDesc(e.target.value)}
                placeholder="e.g., Order #001, Cash withdrawal"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddTransaction(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTransaction}>Add Transaction</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
