import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { DashboardStats } from '@/lib/types';

export async function GET() {
  try {
    const orders = db.getOrders();
    const inventory = db.getInventory();
    const staff = db.getStaff();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime();
    });

    const todayRevenue = todayOrders
      .filter(order => order.paymentStatus === 'paid')
      .reduce((sum, order) => sum + order.total, 0);

    const activeOrders = orders.filter(
      order => order.status === 'pending' || order.status === 'preparing'
    ).length;

    const lowStockItems = inventory.filter(
      item => item.quantity <= item.minStock
    ).length;

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlyOrders = orders.filter(order => 
      new Date(order.createdAt) >= firstDayOfMonth
    );

    const monthlyRevenue = monthlyOrders
      .filter(order => order.paymentStatus === 'paid')
      .reduce((sum, order) => sum + order.total, 0);

    const stats: DashboardStats = {
      todayRevenue,
      todayOrders: todayOrders.length,
      activeOrders,
      lowStockItems,
      totalStaff: staff.filter(s => s.status === 'active').length,
      monthlyRevenue,
      revenueGrowth: 12.5,
      orderGrowth: 8.3,
    };

    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
