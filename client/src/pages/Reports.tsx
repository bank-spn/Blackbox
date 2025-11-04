import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { BarChart3, TrendingUp, Calendar } from "lucide-react";

export default function Reports() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  const topItems = trpc.reports.topItems.useQuery({ limit: 10 });
  const salesByRange = trpc.reports.salesByDateRange.useQuery(dateRange);

  const totalSales = salesByRange.data?.reduce((sum, order) => {
    return sum + (order.total || 0);
  }, 0) || 0;

  const totalOrders = salesByRange.data?.length || 0;
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">View sales reports and performance metrics</p>
        </div>

        {/* Date Range Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Filter by Date Range</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4 items-end">
            <div>
              <label className="text-sm font-medium">Start Date</label>
              <Input
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, startDate: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">End Date</label>
              <Input
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, endDate: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <Button onClick={() => salesByRange.refetch()}>
              <Calendar className="h-4 w-4 mr-2" />
              Apply Filter
            </Button>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(totalSales / 100).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {dateRange.startDate} to {dateRange.endDate}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
              <p className="text-xs text-muted-foreground">Orders completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(averageOrderValue / 100).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">Per order</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">100%</div>
              <p className="text-xs text-muted-foreground">All orders completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Top Selling Items */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Items</CardTitle>
            <CardDescription>Most popular menu items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topItems.data && topItems.data.length > 0 ? (
                topItems.data.map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold">Item #{item.menuItemId}</p>
                        <p className="text-sm text-muted-foreground">
                          ${(item.unitPrice / 100).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        {item.quantity} sold
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ${(item.quantity * item.unitPrice / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">No sales data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest orders in the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {salesByRange.data && salesByRange.data.length > 0 ? (
                salesByRange.data.slice(0, 10).map((order) => (
                  <div key={order.id} className="flex items-center justify-between border-b pb-4">
                    <div>
                      <p className="font-semibold">Order #{order.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        ${((order.total ?? 0) / 100).toFixed(2)}
                      </p>
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          order.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">No orders in this period</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
