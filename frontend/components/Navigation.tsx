'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingCart, BarChart3, Package, Home } from 'lucide-react'

export function Navigation() {
  const pathname = usePathname()

  const links = [
    { href: '/', label: 'Inicio', icon: Home },
    { href: '/pos', label: 'Punto de Venta', icon: ShoppingCart },
    { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/inventory', label: 'Inventario', icon: Package },
  ]

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-green-600">
              Dietética ERP
            </Link>
            <div className="hidden md:flex space-x-4">
              {links.map((link) => {
                const Icon = link.icon
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{link.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
