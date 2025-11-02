#!/bin/bash

echo "================================"
echo "🗄️  Configurando Base de Datos"
echo "================================"
echo ""

cd backend

echo "📝 Generando cliente de Prisma..."
npx prisma generate

echo ""
echo "🗄️  Creando base de datos..."
npx prisma db push

echo ""
echo "🌱 Insertando datos de prueba..."
npx prisma db seed

echo ""
echo "✅ ¡Base de datos configurada!"
echo ""
echo "Ahora puede ejecutar: npm run dev"
echo "Para iniciar el sistema"
