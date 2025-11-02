'use client';

import { useEffect, useState } from 'react';
import { Order, InventoryItem, MenuItem } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

export default function ReportsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/orders').then(res => res.json()),
      fetch('/api/inventory').then(res => res.json()),
      fetch('/api/menu').then(res => res.json()),
    ]).then(([ordersData, inventoryData, menuData]) => {
      setOrders(ordersData);
      setInventory(inventoryData);
      setMenuItems(menuData);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;

  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.total, 0);

  const totalOrders = orders.length;
  const averageOrderValue = totalRevenue / totalOrders || 0;

  const categoryRevenue = orders
    .filter(o => o.paymentStatus === 'paid')
    .flatMap(o => o.items)
    .reduce((acc, item) => {
      const menuItem = menuItems.find(m => m.id === item.menuItemId);
      const category = menuItem?.category || 'Other';
      acc[category] = (acc[category] || 0) + (item.price * item.quantity);
      return acc;
    }, {} as Record<string, number>);

  const categoryData = Object.entries(categoryRevenue).map(([name, value]) => ({
    name,
    value: Number(value.toFixed(2)),
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const inventoryValue = inventory.map(item => ({
    name: item.name,
    value: item.quantity * item.unitPrice,
  })).sort((a, b) => b.value - a.value).slice(0, 10);

  const profitMargins = menuItems.map(item => ({
    name: item.name,
    margin: ((item.price - item.cost) / item.price) * 100,
  })).sort((a, b) => b.margin - a.margin).slice(0, 10);

  const dailyRevenue = orders
    .filter(o => o.paymentStatus === 'paid')
    .reduce((acc, order) => {
      const date = new Date(order.createdAt).toLocaleDateString();
      acc[date] = (acc[date] || 0) + order.total;
      return acc;
    }, {} as Record<string, number>);

  const revenueData = Object.entries(dailyRevenue).map(([date, revenue]) => ({
    date,
    revenue: Number(revenue.toFixed(2)),
  })).slice(-7);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Reports & Analytics</h1>
        <p className="text-slate-600 mt-1">Comprehensive business insights and analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <h3 className="text-sm font-medium text-slate-600 mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold text-slate-900">${totalRevenue.toFixed(2)}</p>
          <p className="text-sm text-green-600 mt-2">All time</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <h3 className="text-sm font-medium text-slate-600 mb-2">Total Orders</h3>
          <p className="text-3xl font-bold text-slate-900">{totalOrders}</p>
          <p className="text-sm text-slate-600 mt-2">All time</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <h3 className="text-sm font-medium text-slate-600 mb-2">Avg Order Value</h3>
          <p className="text-3xl font-bold text-slate-900">${averageOrderValue.toFixed(2)}</p>
          <p className="text-sm text-slate-600 mt-2">Per order</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Revenue by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Daily Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                formatter={(value: number) => `$${value.toFixed(2)}`}
              />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Top 10 Inventory by Value</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={inventoryValue} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" stroke="#64748b" />
              <YAxis dataKey="name" type="category" stroke="#64748b" width={100} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                formatter={(value: number) => `$${value.toFixed(2)}`}
              />
              <Bar dataKey="value" fill="#10b981" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Top 10 Profit Margins</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={profitMargins} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" stroke="#64748b" />
              <YAxis dataKey="name" type="category" stroke="#64748b" width={100} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                formatter={(value: number) => `${value.toFixed(1)}%`}
              />
              <Bar dataKey="margin" fill="#f59e0b" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Order Status Breakdown</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {['pending', 'preparing', 'ready', 'served', 'completed'].map(status => {
              const count = orders.filter(o => o.status === status).length;
              const percentage = (count / totalOrders) * 100 || 0;
              return (
                <div key={status} className="text-center">
                  <div className="text-3xl font-bold text-slate-900">{count}</div>
                  <div className="text-sm text-slate-600 capitalize mt-1">{status}</div>
                  <div className="text-xs text-slate-500 mt-1">{percentage.toFixed(1)}%</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
