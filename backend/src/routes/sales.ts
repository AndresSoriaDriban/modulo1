import { Router } from 'express';
import { prisma } from '../server';

export const saleRoutes = Router();

// Obtener todas las ventas
saleRoutes.get('/', async (req, res) => {
  try {
    const { startDate, endDate, limit = '50' } = req.query;

    const where: any = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    const sales = await prisma.sale.findMany({
      where,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: parseInt(limit as string),
    });

    res.json(sales);
  } catch (error: any) {
    console.error('Error al obtener ventas:', error);
    res.status(500).json({ error: 'Error al obtener ventas', message: error.message });
  }
});

// Obtener una venta por ID
saleRoutes.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!sale) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    res.json(sale);
  } catch (error: any) {
    console.error('Error al obtener venta:', error);
    res.status(500).json({ error: 'Error al obtener venta', message: error.message });
  }
});

// Crear una nueva venta
saleRoutes.post('/', async (req, res) => {
  try {
    const { items, paymentMethod = 'cash', notes } = req.body;

    // Validar que haya items
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'La venta debe tener al menos un item' });
    }

    // Calcular el total
    let total = 0;
    const saleItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return res.status(404).json({ error: `Producto ${item.productId} no encontrado` });
      }

      // Validar stock
      if (product.stock < item.quantity) {
        return res.status(400).json({
          error: `Stock insuficiente para ${product.name}. Disponible: ${product.stock}, Solicitado: ${item.quantity}`,
        });
      }

      const subtotal = item.quantity * product.price;
      total += subtotal;

      saleItems.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.price,
        subtotal,
      });
    }

    // Crear la venta con sus items
    const sale = await prisma.sale.create({
      data: {
        total,
        paymentMethod,
        notes,
        items: {
          create: saleItems,
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

    // Actualizar el stock de los productos
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (product) {
        const newStock = product.stock - item.quantity;

        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: newStock },
        });

        // Registrar movimiento de inventario
        await prisma.inventoryMovement.create({
          data: {
            productId: item.productId,
            type: 'out',
            quantity: -item.quantity,
            stockAfter: newStock,
            reason: 'Venta',
            notes: `Venta #${sale.id}`,
          },
        });
      }
    }

    console.log(`✅ Venta creada: $${total}`);

    res.status(201).json(sale);
  } catch (error: any) {
    console.error('Error al crear venta:', error);
    res.status(500).json({ error: 'Error al crear venta', message: error.message });
  }
});

// Obtener estadísticas de ventas
saleRoutes.get('/stats/summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const where: any = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    const sales = await prisma.sale.findMany({
      where,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
    const averageSale = totalSales > 0 ? totalRevenue / totalSales : 0;

    // Productos más vendidos
    const productSales: Record<string, { product: any; quantity: number; revenue: number }> = {};

    sales.forEach((sale) => {
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

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    res.json({
      totalSales,
      totalRevenue,
      averageSale,
      topProducts,
    });
  } catch (error: any) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas', message: error.message });
  }
});
