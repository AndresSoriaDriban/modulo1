import Link from 'next/link'
import { ShoppingCart, Package, BarChart3, Scale } from 'lucide-react'

export default function Home() {
  const features = [
    {
      title: 'Punto de Venta',
      description: 'Sistema POS completo con lectura de códigos de barras',
      icon: ShoppingCart,
      href: '/pos',
      color: 'bg-green-500',
    },
    {
      title: 'Dashboard',
      description: 'Estadísticas de ventas y productos más vendidos',
      icon: BarChart3,
      href: '/dashboard',
      color: 'bg-blue-500',
    },
    {
      title: 'Inventario',
      description: 'Gestión completa de productos y stock',
      icon: Package,
      href: '/inventory',
      color: 'bg-purple-500',
    },
    {
      title: 'Balanza',
      description: 'Integración en tiempo real con balanza digital',
      icon: Scale,
      href: '/pos',
      color: 'bg-orange-500',
    },
  ]

  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Sistema ERP para Dietética
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Gestión completa de tu negocio con punto de venta, inventario y balanza integrada
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <Link
              key={feature.title}
              href={feature.href}
              className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h2>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </Link>
          )
        })}
      </div>

      <div className="mt-12 bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Características Principales
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-lg mb-2 text-green-600">
              Punto de Venta
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li>✓ Lectura de códigos de barras</li>
              <li>✓ Integración con balanza en tiempo real</li>
              <li>✓ Carrito de compras intuitivo</li>
              <li>✓ Múltiples métodos de pago</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2 text-blue-600">
              Dashboard
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li>✓ Ventas del día en tiempo real</li>
              <li>✓ Productos más vendidos</li>
              <li>✓ Alertas de stock bajo</li>
              <li>✓ Gráficos de ventas</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2 text-purple-600">
              Inventario
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li>✓ Gestión de productos</li>
              <li>✓ Control de stock</li>
              <li>✓ Alertas de reposición</li>
              <li>✓ Historial de movimientos</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2 text-orange-600">
              Balanza Digital
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li>✓ Lectura en tiempo real</li>
              <li>✓ Simulador incluido</li>
              <li>✓ Función de tara</li>
              <li>✓ Detección de peso estable</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
