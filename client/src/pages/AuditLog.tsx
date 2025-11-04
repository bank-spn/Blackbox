import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNotification } from "@/contexts/NotificationContext";
import { Download, Filter, Clock, User, AlertCircle } from "lucide-react";

interface AuditLog {
  id: number;
  timestamp: string;
  module: string;
  action: string;
  user: string;
  details: string;
  status: "success" | "error" | "warning";
  ipAddress: string;
}

export default function AuditLog() {
  const { t } = useLanguage();
  const { addNotification } = useNotification();

  const [logs, setLogs] = useState<AuditLog[]>([
    { id: 1, timestamp: "2024-01-15 14:32:15", module: "POS", action: "Create Order", user: "Admin", details: "Order #1001 created for table 1", status: "success", ipAddress: "192.168.1.100" },
    { id: 2, timestamp: "2024-01-15 14:31:45", module: "Cashier", action: "Open Session", user: "Admin", details: "Cashier session opened with initial balance $500", status: "success", ipAddress: "192.168.1.100" },
    { id: 3, timestamp: "2024-01-15 14:30:20", module: "Inventory", action: "Update Stock", user: "Admin", details: "Tomato stock updated from 50 to 45 units", status: "success", ipAddress: "192.168.1.100" },
    { id: 4, timestamp: "2024-01-15 14:29:00", module: "Employees", action: "Add Employee", user: "Admin", details: "New employee John Doe added", status: "success", ipAddress: "192.168.1.100" },
    { id: 5, timestamp: "2024-01-15 14:28:30", module: "Financial", action: "Record Expense", user: "Admin", details: "Expense recorded: Food supplies $500", status: "success", ipAddress: "192.168.1.100" },
    { id: 6, timestamp: "2024-01-15 14:27:15", module: "Menu", action: "Update Item", user: "Admin", details: "Menu item 'Pasta' price updated from $12 to $14", status: "success", ipAddress: "192.168.1.100" },
    { id: 7, timestamp: "2024-01-15 14:26:00", module: "Settings", action: "Change Config", user: "Admin", details: "Restaurant name updated", status: "success", ipAddress: "192.168.1.100" },
    { id: 8, timestamp: "2024-01-15 14:25:30", module: "POS", action: "Process Payment", user: "Admin", details: "Payment processed for order #1000", status: "success", ipAddress: "192.168.1.100" },
    { id: 9, timestamp: "2024-01-15 14:24:00", module: "Inventory", action: "Low Stock Alert", user: "System", details: "Low stock alert: Cheese (5 units remaining)", status: "warning", ipAddress: "System" },
    { id: 10, timestamp: "2024-01-15 14:23:15", module: "Dashboard", action: "View Dashboard", user: "Admin", details: "Dashboard accessed", status: "success", ipAddress: "192.168.1.100" },
  ]);

  const [filterModule, setFilterModule] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [searchText, setSearchText] = useState("");

  const filteredLogs = logs.filter(log => {
    const matchModule = !filterModule || log.module === filterModule;
    const matchStatus = !filterStatus || log.status === filterStatus;
    const matchSearch = !searchText || 
      log.action.toLowerCase().includes(searchText.toLowerCase()) ||
      log.details.toLowerCase().includes(searchText.toLowerCase()) ||
      log.user.toLowerCase().includes(searchText.toLowerCase());
    return matchModule && matchStatus && matchSearch;
  });

  const handleExportLogs = () => {
    const csv = [
      ["ID", "Timestamp", "Module", "Action", "User", "Details", "Status", "IP Address"],
      ...filteredLogs.map(log => [
        log.id,
        log.timestamp,
        log.module,
        log.action,
        log.user,
        log.details,
        log.status,
        log.ipAddress,
      ]),
    ]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    addNotification("success", "Success", "Audit log exported");
  };

  const modules = Array.from(new Set(logs.map(log => log.module)));
  const statuses: Array<"success" | "warning" | "error"> = ["success", "warning", "error"];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600 bg-green-50";
      case "warning":
        return "text-yellow-600 bg-yellow-50";
      case "error":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return "✓";
      case "warning":
        return "⚠";
      case "error":
        return "✕";
      default:
        return "•";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Audit Log</h1>
            <p className="text-muted-foreground">System activity tracking (Immutable Records)</p>
          </div>
          <Button onClick={handleExportLogs}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{logs.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Success</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                {logs.filter(l => l.status === "success").length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Warnings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-yellow-600">
                {logs.filter(l => l.status === "warning").length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Errors</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">
                {logs.filter(l => l.status === "error").length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium">Search</label>
                <Input
                  placeholder="Search action, details, user..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Module</label>
                <select
                  value={filterModule}
                  onChange={(e) => setFilterModule(e.target.value)}
                  className="w-full border rounded px-2 py-1 mt-1"
                >
                  <option value="">All Modules</option>
                  {modules.map((module: string) => (
                    <option key={module} value={module}>{module}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full border rounded px-2 py-1 mt-1"
                >
                  <option value="">All Status</option>
                  {statuses.map((status: string) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Showing {filteredLogs.length} of {logs.length} records
            </p>
          </CardContent>
        </Card>

        {/* Audit Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
            <CardDescription>All system activities are recorded and immutable</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredLogs.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No logs found</p>
              ) : (
                filteredLogs.map(log => (
                  <div key={log.id} className={`p-4 border rounded-lg ${getStatusColor(log.status)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-lg font-bold">{getStatusIcon(log.status)}</span>
                          <div>
                            <p className="font-bold">{log.action}</p>
                            <p className="text-sm">{log.module}</p>
                          </div>
                        </div>
                        <p className="text-sm mb-2">{log.details}</p>
                        <div className="flex gap-4 text-xs">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {log.timestamp}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {log.user}
                          </span>
                          <span>IP: {log.ipAddress}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-mono text-muted-foreground">ID: {log.id}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Important Notice */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <AlertCircle className="h-5 w-5" />
              Immutable Records
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800 text-sm">
            <p>
              All audit log records are immutable and cannot be edited or deleted. This ensures complete transparency and accountability of all system activities.
              Each record is timestamped and includes user information for full traceability.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
