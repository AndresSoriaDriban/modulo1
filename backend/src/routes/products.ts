import { Router } from 'express';
import { prisma } from '../server';

export const productRoutes = Router();

// Obtener todos los productos
productRoutes.get('/', async (req, res) => {
  try {
    const { categoryId, search } = req.query;

    const where: any = {};

    if (categoryId) {
      where.categoryId = categoryId as string;
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { barcode: { contains: search as string } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    res.json(products);
  } catch (error: any) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos', message: error.message });
  }
});

// Obtener producto por código de barras
productRoutes.get('/barcode/:barcode', async (req, res) => {
  try {
    const { barcode } = req.params;

    const product = await prisma.product.findUnique({
      where: { barcode },
      include: {
        category: true,
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(product);
  } catch (error: any) {
    console.error('Error al buscar producto:', error);
    res.status(500).json({ error: 'Error al buscar producto', message: error.message });
  }
});

// Obtener un producto por ID
productRoutes.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(product);
  } catch (error: any) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ error: 'Error al obtener producto', message: error.message });
  }
});

// Crear un nuevo producto
productRoutes.post('/', async (req, res) => {
  try {
    const product = await prisma.product.create({
      data: req.body,
      include: {
        category: true,
      },
    });

    res.status(201).json(product);
  } catch (error: any) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ error: 'Error al crear producto', message: error.message });
  }
});

// Actualizar un producto
productRoutes.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.update({
      where: { id },
      data: req.body,
      include: {
        category: true,
      },
    });

    res.json(product);
  } catch (error: any) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ error: 'Error al actualizar producto', message: error.message });
  }
});

// Eliminar un producto
productRoutes.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: { id },
    });

    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error: any) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error al eliminar producto', message: error.message });
  }
});

// Obtener categorías
productRoutes.get('/categories/all', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    res.json(categories);
  } catch (error: any) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ error: 'Error al obtener categorías', message: error.message });
  }
});
