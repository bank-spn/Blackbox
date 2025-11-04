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
import { Plus, Edit2, Trash2, Clock } from "lucide-react";

interface Employee {
  id: number;
  name: string;
  position: string;
  email: string;
  phone: string;
  salary: number;
  status: "active" | "inactive";
  hireDate: string;
}

interface Shift {
  id: number;
  employeeId: number;
  date: string;
  startTime: string;
  endTime: string;
}

export default function Employees() {
  const { t } = useLanguage();
  const { addNotification } = useNotification();

  const [employees, setEmployees] = useState<Employee[]>([
    { id: 1, name: "John Doe", position: "Chef", email: "john@restaurant.com", phone: "555-0101", salary: 2500, status: "active", hireDate: "2023-01-15" },
    { id: 2, name: "Jane Smith", position: "Waitress", email: "jane@restaurant.com", phone: "555-0102", salary: 1800, status: "active", hireDate: "2023-02-20" },
    { id: 3, name: "Mike Johnson", position: "Manager", email: "mike@restaurant.com", phone: "555-0103", salary: 3000, status: "active", hireDate: "2022-12-01" },
  ]);

  const [shifts, setShifts] = useState<Shift[]>([
    { id: 1, employeeId: 1, date: "2024-01-15", startTime: "09:00", endTime: "17:00" },
    { id: 2, employeeId: 2, date: "2024-01-15", startTime: "10:00", endTime: "18:00" },
  ]);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showShiftDialog, setShowShiftDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<Employee>>({});
  const [shiftData, setShiftData] = useState<Partial<Shift>>({});

  const handleAddEmployee = () => {
    if (!formData.name || !formData.position || !formData.salary) {
      addNotification("error", "Error", "Please fill all required fields");
      return;
    }

    const newEmployee: Employee = {
      id: Math.max(...employees.map(e => e.id), 0) + 1,
      name: formData.name,
      position: formData.position,
      email: formData.email || "",
      phone: formData.phone || "",
      salary: formData.salary || 0,
      status: "active",
      hireDate: new Date().toISOString().split('T')[0],
    };

    setEmployees([...employees, newEmployee]);
    setFormData({});
    setShowAddDialog(false);
    addNotification("success", "Success", "Employee added");
  };

  const handleEditEmployee = () => {
    if (!editingId || !formData.name || !formData.position || !formData.salary) {
      addNotification("error", "Error", "Please fill all required fields");
      return;
    }

    setEmployees(
      employees.map(e =>
        e.id === editingId
          ? {
              ...e,
              name: formData.name || e.name,
              position: formData.position || e.position,
              email: formData.email || e.email,
              phone: formData.phone || e.phone,
              salary: formData.salary || e.salary,
            }
          : e
      )
    );
    setFormData({});
    setEditingId(null);
    setShowEditDialog(false);
    addNotification("success", "Success", "Employee updated");
  };

  const handleDeleteEmployee = (id: number) => {
    setEmployees(employees.filter(e => e.id !== id));
    addNotification("success", "Success", "Employee deleted");
  };

  const handleAddShift = () => {
    if (!shiftData.employeeId || !shiftData.date || !shiftData.startTime || !shiftData.endTime) {
      addNotification("error", "Error", "Please fill all required fields");
      return;
    }

    const newShift: Shift = {
      id: Math.max(...shifts.map(s => s.id), 0) + 1,
      employeeId: shiftData.employeeId || 0,
      date: shiftData.date || "",
      startTime: shiftData.startTime || "",
      endTime: shiftData.endTime || "",
    };

    setShifts([...shifts, newShift]);
    setShiftData({});
    setShowShiftDialog(false);
    addNotification("success", "Success", "Shift added");
  };

  const openEditDialog = (employee: Employee) => {
    setFormData(employee);
    setEditingId(employee.id);
    setShowEditDialog(true);
  };

  const getEmployeeName = (id: number) => {
    return employees.find(e => e.id === id)?.name || "Unknown";
  };

  const totalPayroll = employees.reduce((sum, e) => sum + e.salary, 0);
  const activeEmployees = employees.filter(e => e.status === "active").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Employees Management</h1>
            <p className="text-muted-foreground">Manage staff and schedules</p>
          </div>
          <Button onClick={() => { setFormData({}); setShowAddDialog(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{employees.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{activeEmployees}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Monthly Payroll</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">${totalPayroll.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Employees Table */}
        <Card>
          <CardHeader>
            <CardTitle>Employees</CardTitle>
            <CardDescription>All staff members</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Name</th>
                    <th className="text-left py-2 px-2">Position</th>
                    <th className="text-left py-2 px-2">Email</th>
                    <th className="text-left py-2 px-2">Phone</th>
                    <th className="text-left py-2 px-2">Salary</th>
                    <th className="text-left py-2 px-2">Status</th>
                    <th className="text-left py-2 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(employee => (
                    <tr key={employee.id} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-2 font-medium">{employee.name}</td>
                      <td className="py-2 px-2">{employee.position}</td>
                      <td className="py-2 px-2 text-xs">{employee.email}</td>
                      <td className="py-2 px-2">{employee.phone}</td>
                      <td className="py-2 px-2 font-bold">${employee.salary.toFixed(2)}</td>
                      <td className="py-2 px-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${employee.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                          {employee.status}
                        </span>
                      </td>
                      <td className="py-2 px-2">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(employee)}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteEmployee(employee.id)}
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

        {/* Shifts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Shifts</CardTitle>
              <CardDescription>Employee schedules</CardDescription>
            </div>
            <Button size="sm" onClick={() => { setShiftData({}); setShowShiftDialog(true); }}>
              <Clock className="h-4 w-4 mr-2" />
              Add Shift
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {shifts.map(shift => (
                <div key={shift.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">{getEmployeeName(shift.employeeId)}</p>
                    <p className="text-xs text-muted-foreground">{shift.date}</p>
                  </div>
                  <p className="font-semibold">{shift.startTime} - {shift.endTime}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Employee</DialogTitle>
            <DialogDescription>Add a new employee to the system</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name *</label>
              <Input
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Full name"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Position *</label>
              <Input
                value={formData.position || ""}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="e.g., Chef, Waitress"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <Input
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="555-0000"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Salary *</label>
              <Input
                type="number"
                value={formData.salary || ""}
                onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) })}
                placeholder="0.00"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddEmployee}>Add Employee</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>Update employee details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name *</label>
              <Input
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Full name"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Position *</label>
              <Input
                value={formData.position || ""}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="e.g., Chef, Waitress"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <Input
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="555-0000"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Salary *</label>
              <Input
                type="number"
                value={formData.salary || ""}
                onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) })}
                placeholder="0.00"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditEmployee}>Update Employee</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Shift Dialog */}
      <Dialog open={showShiftDialog} onOpenChange={setShowShiftDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Shift</DialogTitle>
            <DialogDescription>Schedule an employee shift</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Employee *</label>
              <select
                value={shiftData.employeeId || ""}
                onChange={(e) => setShiftData({ ...shiftData, employeeId: parseInt(e.target.value) })}
                className="w-full border rounded px-2 py-1 mt-1"
              >
                <option value="">Select employee</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Date *</label>
              <Input
                type="date"
                value={shiftData.date || ""}
                onChange={(e) => setShiftData({ ...shiftData, date: e.target.value })}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Start Time *</label>
                <Input
                  type="time"
                  value={shiftData.startTime || ""}
                  onChange={(e) => setShiftData({ ...shiftData, startTime: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">End Time *</label>
                <Input
                  type="time"
                  value={shiftData.endTime || ""}
                  onChange={(e) => setShiftData({ ...shiftData, endTime: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShiftDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddShift}>Add Shift</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
