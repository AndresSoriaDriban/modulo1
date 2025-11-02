import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar datos existentes
  await prisma.inventoryMovement.deleteMany();
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  console.log('🗑️  Datos anteriores eliminados');

  // Crear categorías
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Frutos Secos',
        description: 'Frutos secos a granel',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Cereales y Semillas',
        description: 'Cereales, semillas y legumbres',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Productos Envasados',
        description: 'Productos envasados y bebidas vegetales',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Suplementos',
        description: 'Suplementos nutricionales y proteínas',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Harinas y Panificados',
        description: 'Harinas sin TACC y panificados',
      },
    }),
  ]);

  console.log('✅ Categorías creadas');

  // Crear productos
  const products = await Promise.all([
    // FRUTOS SECOS (por peso)
    prisma.product.create({
      data: {
        barcode: '7790001001001',
        name: 'Almendras',
        description: 'Almendras naturales sin sal',
        soldByWeight: true,
        price: 8500, // precio por kg
        stock: 15.5,
        minStock: 5,
        categoryId: categories[0].id,
      },
    }),
    prisma.product.create({
      data: {
        barcode: '7790001001002',
        name: 'Nueces',
        description: 'Nueces de California',
        soldByWeight: true,
        price: 9200,
        stock: 12.3,
        minStock: 5,
        categoryId: categories[0].id,
      },
    }),
    prisma.product.create({
      data: {
        barcode: '7790001001003',
        name: 'Maní Tostado',
        description: 'Maní tostado sin sal',
        soldByWeight: true,
        price: 3500,
        stock: 20.8,
        minStock: 10,
        categoryId: categories[0].id,
      },
    }),
    prisma.product.create({
      data: {
        barcode: '7790001001004',
        name: 'Cashews',
        description: 'Anacardos naturales',
        soldByWeight: true,
        price: 11500,
        stock: 8.2,
        minStock: 3,
        categoryId: categories[0].id,
      },
    }),

    // CEREALES Y SEMILLAS (algunos por peso, otros envasados)
    prisma.product.create({
      data: {
        barcode: '7790002002001',
        name: 'Avena Arrollada',
        description: 'Avena arrollada tradicional',
        soldByWeight: true,
        price: 1800,
        stock: 35.5,
        minStock: 15,
        categoryId: categories[1].id,
      },
    }),
    prisma.product.create({
      data: {
        barcode: '7790002002002',
        name: 'Quinoa Real',
        description: 'Quinoa blanca de Bolivia',
        soldByWeight: true,
        price: 4200,
        stock: 18.3,
        minStock: 8,
        categoryId: categories[1].id,
      },
    }),
    prisma.product.create({
      data: {
        barcode: '7790002002003',
        name: 'Semillas de Chía',
        description: 'Semillas de chía premium',
        soldByWeight: true,
        price: 3800,
        stock: 12.7,
        minStock: 5,
        categoryId: categories[1].id,
      },
    }),
    prisma.product.create({
      data: {
        barcode: '7790002002004',
        name: 'Lentejas',
        description: 'Lentejas calibradas',
        soldByWeight: true,
        price: 1500,
        stock: 28.4,
        minStock: 10,
        categoryId: categories[1].id,
      },
    }),
    prisma.product.create({
      data: {
        barcode: '7790002002005',
        name: 'Garbanzos',
        description: 'Garbanzos calibrados',
        soldByWeight: true,
        price: 1600,
        stock: 25.2,
        minStock: 10,
        categoryId: categories[1].id,
      },
    }),

    // PRODUCTOS ENVASADOS (por unidad)
    prisma.product.create({
      data: {
        barcode: '7790003003001',
        name: 'Leche de Almendras 1L',
        description: 'Leche de almendras sin azúcar',
        soldByWeight: false,
        price: 1850,
        stock: 24,
        minStock: 12,
        categoryId: categories[2].id,
      },
    }),
    prisma.product.create({
      data: {
        barcode: '7790003003002',
        name: 'Tofu Natural 250g',
        description: 'Tofu orgánico',
        soldByWeight: false,
        price: 1200,
        stock: 18,
        minStock: 8,
        categoryId: categories[2].id,
      },
    }),
    prisma.product.create({
      data: {
        barcode: '7790003003003',
        name: 'Hamburguesas Veganas x4',
        description: 'Hamburguesas de lentejas y quinoa',
        soldByWeight: false,
        price: 2300,
        stock: 15,
        minStock: 8,
        categoryId: categories[2].id,
      },
    }),
    prisma.product.create({
      data: {
        barcode: '7790003003004',
        name: 'Aceite de Coco 500ml',
        description: 'Aceite de coco virgen extra',
        soldByWeight: false,
        price: 3200,
        stock: 12,
        minStock: 6,
        categoryId: categories[2].id,
      },
    }),

    // SUPLEMENTOS (por unidad)
    prisma.product.create({
      data: {
        barcode: '7790004004001',
        name: 'Proteína Vegana 500g',
        description: 'Proteína de arveja sabor chocolate',
        soldByWeight: false,
        price: 8500,
        stock: 8,
        minStock: 3,
        categoryId: categories[3].id,
      },
    }),
    prisma.product.create({
      data: {
        barcode: '7790004004002',
        name: 'Spirulina en Polvo 100g',
        description: 'Spirulina orgánica',
        soldByWeight: false,
        price: 2800,
        stock: 15,
        minStock: 5,
        categoryId: categories[3].id,
      },
    }),
    prisma.product.create({
      data: {
        barcode: '7790004004003',
        name: 'Colágeno Hidrolizado 300g',
        description: 'Colágeno tipo 1 y 3',
        soldByWeight: false,
        price: 5200,
        stock: 10,
        minStock: 4,
        categoryId: categories[3].id,
      },
    }),

    // HARINAS Y PANIFICADOS
    prisma.product.create({
      data: {
        barcode: '7790005005001',
        name: 'Harina de Almendras 500g',
        description: 'Harina de almendras sin TACC',
        soldByWeight: false,
        price: 3800,
        stock: 12,
        minStock: 6,
        categoryId: categories[4].id,
      },
    }),
    prisma.product.create({
      data: {
        barcode: '7790005005002',
        name: 'Harina de Coco 400g',
        description: 'Harina de coco orgánica',
        soldByWeight: false,
        price: 2500,
        stock: 14,
        minStock: 6,
        categoryId: categories[4].id,
      },
    }),
    prisma.product.create({
      data: {
        barcode: '7790005005003',
        name: 'Pan Integral sin TACC',
        description: 'Pan de molde integral sin gluten',
        soldByWeight: false,
        price: 1900,
        stock: 8,
        minStock: 4,
        categoryId: categories[4].id,
      },
    }),
  ]);

  console.log(`✅ ${products.length} productos creados`);

  // Crear algunos movimientos de inventario iniciales
  for (const product of products.slice(0, 5)) {
    await prisma.inventoryMovement.create({
      data: {
        productId: product.id,
        type: 'in',
        quantity: product.stock,
        stockAfter: product.stock,
        reason: 'Stock inicial',
        notes: 'Carga inicial del sistema',
      },
    });
  }

  console.log('✅ Movimientos de inventario creados');

  // Crear una venta de ejemplo
  const exampleSale = await prisma.sale.create({
    data: {
      total: 0, // Se calculará después
      paymentMethod: 'cash',
      items: {
        create: [
          {
            productId: products[0].id, // Almendras
            quantity: 0.5,
            unitPrice: products[0].price,
            subtotal: 0.5 * products[0].price,
          },
          {
            productId: products[9].id, // Leche de almendras
            quantity: 2,
            unitPrice: products[9].price,
            subtotal: 2 * products[9].price,
          },
        ],
      },
    },
    include: {
      items: true,
    },
  });

  // Actualizar el total de la venta
  const total = exampleSale.items.reduce((sum, item) => sum + item.subtotal, 0);
  await prisma.sale.update({
    where: { id: exampleSale.id },
    data: { total },
  });

  console.log('✅ Venta de ejemplo creada');

  console.log('');
  console.log('🎉 Seed completado exitosamente!');
  console.log(`📦 ${categories.length} categorías creadas`);
  console.log(`🏷️  ${products.length} productos creados`);
  console.log('💰 1 venta de ejemplo creada');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
