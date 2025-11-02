import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { productRoutes } from './routes/products';
import { saleRoutes } from './routes/sales';
import { inventoryRoutes } from './routes/inventory';
import { dashboardRoutes } from './routes/dashboard';
import { startWebSocketServer } from './websocket/scaleSimulator';

// Inicializar Prisma
export const prisma = new PrismaClient();

// Crear aplicación Express
const app = express();
const PORT = process.env.PORT || 3001;
const WS_PORT = process.env.WS_PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Logger simple
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas
app.get('/', (req, res) => {
  res.json({
    message: '🏥 Sistema ERP Dietética - API',
    version: '1.0.0',
    endpoints: {
      products: '/api/products',
      sales: '/api/sales',
      inventory: '/api/inventory',
      dashboard: '/api/dashboard',
    },
  });
});

// APIs
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Manejo de errores
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: err.message,
  });
});

// Iniciar servidor HTTP
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ================================');
  console.log(`✅ Servidor HTTP corriendo en http://localhost:${PORT}`);
  console.log('🚀 ================================');
  console.log('');
});

// Iniciar servidor WebSocket para la balanza
startWebSocketServer(WS_PORT);

// Manejar cierre graceful
process.on('SIGINT', async () => {
  console.log('\n🛑 Cerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});
