#!/bin/bash

echo "================================"
echo "🚀 Sistema ERP Dietética"
echo "================================"
echo ""

echo "📦 Paso 1: Instalando dependencias raíz..."
npm install

echo ""
echo "📦 Paso 2: Instalando dependencias del backend..."
cd backend
npm install

echo ""
echo "📦 Paso 3: Instalando dependencias del frontend..."
cd ../frontend
npm install

echo ""
echo "✅ ¡Instalación completada!"
echo ""
echo "Ahora ejecute: npm run setup"
echo "Para configurar la base de datos"
