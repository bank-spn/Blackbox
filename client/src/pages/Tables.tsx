import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Plus, Calendar } from "lucide-react";

export default function Tables() {
  const [showAddTable, setShowAddTable] = useState(false);
  const [showAddReservation, setShowAddReservation] = useState(false);
  const [newTable, setNewTable] = useState({
    tableNumber: "",
    capacity: 2,
  });
  const [newReservation, setNewReservation] = useState({
    reservationDate: "",
    reservationTime: "",
    partySize: 1,
  });

  const tables = trpc.tables.list.useQuery();
  const reservations = trpc.tables.reservations.list.useQuery();
  const createTable = trpc.tables.create.useMutation();
  const createReservation = trpc.tables.reservations.create.useMutation();
  const updateTableStatus = trpc.tables.updateStatus.useMutation();

  const handleAddTable = async () => {
    if (!newTable.tableNumber) return;

    try {
      await createTable.mutateAsync({
        tableNumber: newTable.tableNumber,
        capacity: newTable.capacity,
      });
      setNewTable({ tableNumber: "", capacity: 2 });
      setShowAddTable(false);
      tables.refetch();
    } catch (error) {
      console.error("Failed to create table:", error);
    }
  };

  const handleAddReservation = async () => {
    if (!newReservation.reservationDate || !newReservation.reservationTime) return;

    try {
      await createReservation.mutateAsync({
        reservationDate: newReservation.reservationDate,
        reservationTime: newReservation.reservationTime,
        partySize: newReservation.partySize,
      });
      setNewReservation({
        reservationDate: "",
        reservationTime: "",
        partySize: 1,
      });
      setShowAddReservation(false);
      reservations.refetch();
    } catch (error) {
      console.error("Failed to create reservation:", error);
    }
  };

  const getStatusColor = (status: string | null) => {
    const colors: Record<string, string> = {
      available: "bg-green-100 text-green-800",
      occupied: "bg-red-100 text-red-800",
      reserved: "bg-blue-100 text-blue-800",
      maintenance: "bg-gray-100 text-gray-800",
    };
    return colors[status || "available"] || colors.available;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tables & Reservations</h1>
          <p className="text-muted-foreground">Manage your restaurant tables and reservations</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Tables Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Tables</h2>
              <Button onClick={() => setShowAddTable(!showAddTable)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Table
              </Button>
            </div>

            {showAddTable && (
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <Input
                    placeholder="Table Number"
                    value={newTable.tableNumber}
                    onChange={(e) =>
                      setNewTable({ ...newTable, tableNumber: e.target.value })
                    }
                  />
                  <div>
                    <label className="text-sm font-medium">Capacity</label>
                    <Input
                      type="number"
                      value={newTable.capacity}
                      onChange={(e) =>
                        setNewTable({ ...newTable, capacity: parseInt(e.target.value) || 2 })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddTable} disabled={createTable.isPending}>
                      {createTable.isPending ? "Adding..." : "Add Table"}
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddTable(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
              {tables.data?.map((table) => (
                <Card
                  key={table.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    const newStatus =
                      table.status === "available" ? "occupied" : "available";
                    updateTableStatus.mutate({
                      id: table.id,
                      status: newStatus as any,
                    });
                  }}
                >
                  <CardContent className="p-4 text-center">
                    <p className="font-bold text-lg">Table {table.tableNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      Capacity: {table.capacity}
                    </p>
                    <span
                      className={`inline-block mt-2 px-2 py-1 rounded text-xs font-semibold ${getStatusColor(
                        table.status
                      )}`}
                    >
                      {table.status || "available"}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Reservations Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Reservations</h2>
              <Button onClick={() => setShowAddReservation(!showAddReservation)} size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Add Reservation
              </Button>
            </div>

            {showAddReservation && (
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <label className="text-sm font-medium">Date</label>
                    <Input
                      type="date"
                      value={newReservation.reservationDate}
                      onChange={(e) =>
                        setNewReservation({
                          ...newReservation,
                          reservationDate: e.target.value,
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Time</label>
                    <Input
                      type="time"
                      value={newReservation.reservationTime}
                      onChange={(e) =>
                        setNewReservation({
                          ...newReservation,
                          reservationTime: e.target.value,
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Party Size</label>
                    <Input
                      type="number"
                      value={newReservation.partySize}
                      onChange={(e) =>
                        setNewReservation({
                          ...newReservation,
                          partySize: parseInt(e.target.value) || 1,
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddReservation}
                      disabled={createReservation.isPending}
                    >
                      {createReservation.isPending ? "Adding..." : "Add Reservation"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowAddReservation(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-2">
              {reservations.data?.map((reservation) => (
                <Card key={reservation.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">
                          Party of {reservation.partySize}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(reservation.reservationDate).toLocaleDateString()} at{" "}
                          {reservation.reservationTime}
                        </p>
                        <span
                          className={`inline-block mt-2 px-2 py-1 rounded text-xs font-semibold ${getStatusColor(
                            reservation.status
                          )}`}
                        >
                          {reservation.status || "confirmed"}
                        </span>
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
