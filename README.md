# Sistema ERP para Dietética

Sistema completo de gestión para dietética con punto de venta, inventario, integración con balanza y generación de etiquetas.

## Características

- 🛒 **Punto de Venta (POS)**: Sistema completo con lectura de códigos de barras
- ⚖️ **Integración con Balanza**: Conexión en tiempo real vía WebSocket
- 📦 **Gestión de Inventario**: Control completo de stock y productos
- 🏷️ **Etiquetas con Código de Barras**: Impresión de etiquetas para productos
- 📊 **Dashboard**: Estadísticas de ventas en tiempo real
- 💾 **Base de Datos**: SQLite con productos de dietética precargados

## Tecnologías

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM
- SQLite
- WebSocket (ws)

### Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- shadcn/ui
- WebSocket Client

## Instalación

### 1. Instalar todas las dependencias
```bash
npm run install:all
```

### 2. Configurar base de datos y datos de prueba
```bash
npm run setup
```

### 3. Ejecutar en modo desarrollo
```bash
npm run dev
```

El backend se ejecutará en http://localhost:3001
El frontend se ejecutará en http://localhost:3000

## Estructura del Proyecto

```
dietetic-erp/
├── backend/           # Servidor Express con TypeScript
│   ├── src/
│   │   ├── controllers/    # Controladores de las rutas
│   │   ├── routes/         # Definición de rutas
│   │   ├── services/       # Lógica de negocio
│   │   ├── websocket/      # Simulador de balanza
│   │   └── server.ts       # Punto de entrada
│   └── prisma/
│       ├── schema.prisma   # Modelos de base de datos
│       └── seed.ts         # Datos de prueba
│
└── frontend/          # Aplicación Next.js
    ├── app/
    │   ├── pos/            # Punto de venta
    │   ├── dashboard/      # Dashboard con estadísticas
    │   └── inventory/      # Gestión de inventario
    └── components/         # Componentes reutilizables
```

## Uso

### Punto de Venta
1. Navegar a `/pos`
2. Escanear código de barras (o escribirlo y presionar Enter)
3. Para productos por peso, la balanza mostrará el peso en tiempo real
4. Agregar productos al carrito
5. Procesar venta

### Dashboard
- Ver estadísticas de ventas del día
- Productos más vendidos
- Resumen de ingresos

### Inventario
- Ver todos los productos
- Editar stock
- Ver productos que necesitan reposición

## Datos de Prueba

El sistema viene precargado con productos típicos de dietética:
- Frutos secos a granel (almendras, nueces, maní)
- Cereales (avena, quinoa, chía)
- Productos envasados (leche vegetal, tofú)
- Suplementos (proteína vegana, spirulina)

## Desarrollo

### Ejecutar solo backend
```bash
npm run dev:backend
```

### Ejecutar solo frontend
```bash
npm run dev:frontend
```

### Build para producción
```bash
npm run build
npm start
```
