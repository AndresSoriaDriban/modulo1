# Guía de Instalación - Sistema ERP Dietética

## Requisitos Previos

- Node.js 18+ instalado
- npm o yarn

## Instalación Paso a Paso

### 1. Clonar o Descargar el Proyecto

Si aún no lo has hecho, descarga el proyecto en tu computadora.

### 2. Instalar Dependencias

Ejecuta el siguiente comando en la raíz del proyecto:

```bash
npm run install:all
```

O manualmente:

```bash
# Raíz
npm install

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
cd ..
```

### 3. Configurar Base de Datos

```bash
npm run setup
```

Este comando hará lo siguiente:
- Generará el cliente de Prisma
- Creará la base de datos SQLite
- Insertará datos de prueba (productos de dietética)

### 4. Ejecutar el Sistema

```bash
npm run dev
```

Este comando iniciará:
- **Backend** en http://localhost:3001
- **Frontend** en http://localhost:3000

## Verificación

### Backend

Abre http://localhost:3001 en tu navegador. Deberías ver un mensaje JSON con información de la API.

### Frontend

Abre http://localhost:3000 en tu navegador. Deberías ver la página de inicio del sistema ERP.

## Estructura de URLs

- **Inicio**: http://localhost:3000
- **Punto de Venta**: http://localhost:3000/pos
- **Dashboard**: http://localhost:3000/dashboard
- **Inventario**: http://localhost:3000/inventory

## Troubleshooting

### Error: "Cannot find module '@prisma/client'"

Ejecuta:
```bash
cd backend
npx prisma generate
```

### Error: "EADDRINUSE: address already in use"

Alguno de los puertos está en uso. Puedes:
1. Cerrar la aplicación que está usando el puerto
2. Cambiar el puerto en los archivos `.env`

### La balanza no se conecta

Verifica que:
1. El backend esté corriendo
2. El puerto 3002 esté disponible
3. La URL de WebSocket sea correcta en el frontend

## Comandos Útiles

### Desarrollo

```bash
# Ejecutar todo
npm run dev

# Solo backend
npm run dev:backend

# Solo frontend
npm run dev:frontend
```

### Base de Datos

```bash
cd backend

# Ver base de datos en el navegador
npx prisma studio

# Resetear base de datos
npx prisma db push --force-reset
npx prisma db seed
```

### Producción

```bash
# Build
npm run build

# Iniciar
npm start
```

## Datos de Prueba

El sistema viene con productos precargados:

### Frutos Secos (por peso)
- Almendras - 7790001001001
- Nueces - 7790001001002
- Maní Tostado - 7790001001003
- Cashews - 7790001001004

### Cereales (por peso)
- Avena Arrollada - 7790002002001
- Quinoa Real - 7790002002002
- Semillas de Chía - 7790002002003
- Lentejas - 7790002002004
- Garbanzos - 7790002002005

### Productos Envasados (por unidad)
- Leche de Almendras 1L - 7790003003001
- Tofu Natural 250g - 7790003003002
- Hamburguesas Veganas x4 - 7790003003003
- Aceite de Coco 500ml - 7790003003004

### Suplementos (por unidad)
- Proteína Vegana 500g - 7790004004001
- Spirulina en Polvo 100g - 7790004004002
- Colágeno Hidrolizado 300g - 7790004004003

### Harinas (por unidad)
- Harina de Almendras 500g - 7790005005001
- Harina de Coco 400g - 7790005005002
- Pan Integral sin TACC - 7790005005003

## Uso del Sistema

### Punto de Venta

1. Ingresa el código de barras en el campo
2. Presiona Enter
3. Si es un producto por peso:
   - La balanza se activará automáticamente
   - Coloca el producto
   - Espera a que el peso se estabilice
   - Click en "Agregar al Carrito"
4. Si es por unidad:
   - Se agregará automáticamente al carrito
5. Click en "Pagar en Efectivo" o "Pagar con Tarjeta"

### Dashboard

- Ver ventas del día
- Productos más vendidos
- Alertas de stock bajo

### Inventario

- Ver todos los productos
- Ajustar stock con los botones + y -
- Buscar productos

## Soporte

Para reportar problemas o sugerencias, crea un issue en el repositorio.
