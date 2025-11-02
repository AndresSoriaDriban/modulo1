import { Router } from 'express';
import { prisma } from '../server';

export const dashboardRoutes = Router();

// Obtener estadísticas del dashboard
dashboardRoutes.get('/stats', async (req, res) => {
  try {
    // Fecha de hoy a las 00:00:00
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Ventas de hoy
    const todaySales = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: today,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);
    const todaySalesCount = todaySales.length;

    // Ventas totales (último mes)
    const lastMonth = new Date();
    lastMonth.setDate(lastMonth.getDate() - 30);

    const monthSales = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: lastMonth,
        },
      },
    });

    const monthRevenue = monthSales.reduce((sum, sale) => sum + sale.total, 0);

    // Productos más vendidos hoy
    const productSales: Record<string, { product: any; quantity: number; revenue: number }> = {};

    todaySales.forEach((sale) => {
      sale.items.forEach((item) => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            product: item.product,
            quantity: 0,
            revenue: 0,
          };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += item.subtotal;
      });
    });

    const topProductsToday = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Productos con stock bajo
    const allProducts = await prisma.product.findMany({
      include: {
        category: true,
      },
    });

    const lowStockProducts = allProducts
      .filter((p) => p.stock <= p.minStock)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 10);

    // Total de productos
    const totalProducts = await prisma.product.count();

    // Ventas por hora (últimas 24 horas)
    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);

    const recentSales = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: last24Hours,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Agrupar ventas por hora
    const salesByHour: Record<string, { hour: string; sales: number; revenue: number }> = {};

    recentSales.forEach((sale) => {
      const hour = sale.createdAt.toISOString().substring(0, 13); // YYYY-MM-DDTHH
      if (!salesByHour[hour]) {
        salesByHour[hour] = {
          hour,
          sales: 0,
          revenue: 0,
        };
      }
      salesByHour[hour].sales += 1;
      salesByHour[hour].revenue += sale.total;
    });

    const salesChart = Object.values(salesByHour);

    res.json({
      today: {
        revenue: todayRevenue,
        salesCount: todaySalesCount,
        topProducts: topProductsToday,
      },
      month: {
        revenue: monthRevenue,
        salesCount: monthSales.length,
      },
      inventory: {
        totalProducts,
        lowStockProducts,
        lowStockCount: lowStockProducts.length,
      },
      salesChart,
    });
  } catch (error: any) {
    console.error('Error al obtener estadísticas del dashboard:', error);
    res.status(500).json({
      error: 'Error al obtener estadísticas',
      message: error.message,
    });
  }
});
