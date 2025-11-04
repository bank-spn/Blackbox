import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  UtensilsCrossed, 
  ShoppingCart, 
  Package, 
  Users, 
  BarChart3, 
  Table2,
  TrendingUp,
  AlertCircle,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNotification } from "@/contexts/NotificationContext";
import { useState, useEffect } from "react";

interface DashboardStats {
  todaysSales: number;
  salesChange: number;
  activeOrders: number;
  lowStockItems: number;
  staffOnDuty: number;
  totalRevenue: number;
}

export default function DashboardEnhanced() {
  const { t } = useLanguage();
  const { addNotification } = useNotification();
  const [stats, setStats] = useState<DashboardStats>({
    todaysSales: 0,
    salesChange: 0,
    activeOrders: 0,
    lowStockItems: 0,
    staffOnDuty: 0,
    totalRevenue: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching dashboard data
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // In a real app, this would call an API
        // For now, we'll use mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setStats({
          todaysSales: 4250,
          salesChange: 12.5,
          activeOrders: 8,
          lowStockItems: 3,
          staffOnDuty: 5,
          totalRevenue: 45680,
        });

        // Show welcome notification
        addNotification(
          "success",
          t("success"),
          "Dashboard loaded successfully"
        );
      } catch (error) {
        addNotification(
          "error",
          t("error"),
          "Failed to load dashboard data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [addNotification, t]);

  const modules = [
    {
      title: t('menu') || "Menu Management",
      description: "Manage menu items, categories, and pricing",
      icon: UtensilsCrossed,
      href: "/menu",
      color: "bg-blue-500",
    },
    {
      title: t('pos') || "POS System",
      description: "Create and manage orders, process payments",
      icon: ShoppingCart,
      href: "/pos",
      color: "bg-green-500",
    },
    {
      title: t('inventory') || "Inventory",
      description: "Track stock levels, manage suppliers",
      icon: Package,
      href: "/inventory",
      color: "bg-purple-500",
    },
    {
      title: t('employees') || "Employees",
      description: "Manage staff, schedules, and roles",
      icon: Users,
      href: "/employees",
      color: "bg-orange-500",
    },
    {
      title: t('tables') || "Tables & Reservations",
      description: "Manage tables and customer reservations",
      icon: Table2,
      href: "/tables",
      color: "bg-pink-500",
    },
    {
      title: t('reports') || "Reports & Analytics",
      description: "View sales reports and performance metrics",
      icon: BarChart3,
      href: "/reports",
      color: "bg-indigo-500",
    },
  ];

  const StatCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    trend 
  }: { 
    title: string; 
    value: string | number; 
    change?: number; 
    icon: any; 
    trend?: "up" | "down" 
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs mt-1 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            <span>{Math.abs(change)}% from yesterday</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('dashboardTitle')}</h1>
          <p className="text-muted-foreground mt-2">{t('welcomeBack')}</p>
        </div>

        {/* Quick Stats */}
        {!loading && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title={t('todaysSales')}
              value={`$${stats.todaysSales.toFixed(2)}`}
              change={stats.salesChange}
              icon={TrendingUp}
              trend="up"
            />
            <StatCard
              title={t('activeOrders')}
              value={stats.activeOrders}
              icon={ShoppingCart}
            />
            <StatCard
              title={t('lowStockItems')}
              value={stats.lowStockItems}
              icon={AlertCircle}
            />
            <StatCard
              title={t('staffOnDuty')}
              value={stats.staffOnDuty}
              icon={Users}
            />
          </div>
        )}

        {/* Additional Metrics */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Total Revenue (This Month)</CardTitle>
              <CardDescription>Cumulative sales performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Average daily: ${(stats.totalRevenue / 30).toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <ShoppingCart className="h-4 w-4 mr-2" />
                New Order
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Package className="h-4 w-4 mr-2" />
                Check Inventory
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Module Grid */}
        <div>
          <h2 className="text-xl font-semibold mb-4">{t('modules')}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <Link key={module.href} href={module.href}>
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{module.title}</CardTitle>
                          <CardDescription>{module.description}</CardDescription>
                        </div>
                        <div className={`${module.color} p-3 rounded-lg`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" size="sm" className="w-full">
                        {t('open')}
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
