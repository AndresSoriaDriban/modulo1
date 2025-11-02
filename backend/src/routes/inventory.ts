import { Router } from 'express';
import { prisma } from '../server';

export const inventoryRoutes = Router();

// Obtener todos los movimientos de inventario
inventoryRoutes.get('/movements', async (req, res) => {
  try {
    const { productId, startDate, endDate, limit = '100' } = req.query;

    const where: any = {};

    if (productId) {
      where.productId = productId as string;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }

    const movements = await prisma.inventoryMovement.findMany({
      where,
      include: {
        product: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: parseInt(limit as string),
    });

    res.json(movements);
  } catch (error: any) {
    console.error('Error al obtener movimientos:', error);
    res.status(500).json({ error: 'Error al obtener movimientos', message: error.message });
  }
});

// Ajustar stock de un producto
inventoryRoutes.post('/adjust', async (req, res) => {
  try {
    const { productId, quantity, reason, notes } = req.body;

    if (!productId || quantity === undefined) {
      return res.status(400).json({ error: 'productId y quantity son requeridos' });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const newStock = product.stock + quantity;

    if (newStock < 0) {
      return res.status(400).json({ error: 'El stock no puede ser negativo' });
    }

    // Actualizar stock
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { stock: newStock },
    });

    // Registrar movimiento
    const movement = await prisma.inventoryMovement.create({
      data: {
        productId,
        type: quantity > 0 ? 'in' : quantity < 0 ? 'out' : 'adjustment',
        quantity,
        stockAfter: newStock,
        reason: reason || 'Ajuste manual',
        notes,
      },
      include: {
        product: true,
      },
    });

    res.json({
      product: updatedProduct,
      movement,
    });
  } catch (error: any) {
    console.error('Error al ajustar inventario:', error);
    res.status(500).json({ error: 'Error al ajustar inventario', message: error.message });
  }
});

// Obtener productos con stock bajo
inventoryRoutes.get('/low-stock', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        stock: {
          lte: prisma.product.fields.minStock,
        },
      },
      include: {
        category: true,
      },
      orderBy: {
        stock: 'asc',
      },
    });

    // Filtrar manualmente porque Prisma no soporta comparación entre campos en SQLite
    const lowStockProducts = products.filter((p) => p.stock <= p.minStock);

    res.json(lowStockProducts);
  } catch (error: any) {
    console.error('Error al obtener productos con stock bajo:', error);
    res.status(500).json({
      error: 'Error al obtener productos con stock bajo',
      message: error.message,
    });
  }
});

// Registrar entrada de stock (compra/recepción)
inventoryRoutes.post('/stock-in', async (req, res) => {
  try {
    const { productId, quantity, reason, notes } = req.body;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ error: 'productId y quantity positivo son requeridos' });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const newStock = product.stock + quantity;

    // Actualizar stock
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { stock: newStock },
    });

    // Registrar movimiento
    const movement = await prisma.inventoryMovement.create({
      data: {
        productId,
        type: 'in',
        quantity,
        stockAfter: newStock,
        reason: reason || 'Entrada de stock',
        notes,
      },
      include: {
        product: true,
      },
    });

    console.log(`📦 Stock aumentado: ${product.name} +${quantity}`);

    res.json({
      product: updatedProduct,
      movement,
    });
  } catch (error: any) {
    console.error('Error al registrar entrada de stock:', error);
    res.status(500).json({ error: 'Error al registrar entrada', message: error.message });
  }
});
