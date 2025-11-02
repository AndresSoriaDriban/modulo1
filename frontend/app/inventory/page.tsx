'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { Package, Search, Plus, Minus, AlertCircle } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Product {
  id: string
  barcode: string
  name: string
  description: string | null
  price: number
  soldByWeight: boolean
  stock: number
  minStock: number
  category: {
    id: string
    name: string
  }
}

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [adjustingStock, setAdjustingStock] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.barcode.includes(searchTerm) ||
          p.category.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredProducts(filtered)
    } else {
      setFilteredProducts(products)
    }
  }, [searchTerm, products])

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products`)
      const data = await response.json()
      setProducts(data)
      setFilteredProducts(data)
    } catch (error) {
      console.error('Error al cargar productos:', error)
    } finally {
      setLoading(false)
    }
  }

  const adjustStock = async (productId: string, quantity: number) => {
    setAdjustingStock(productId)
    try {
      const response = await fetch(`${API_URL}/api/inventory/adjust`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          quantity,
          reason: quantity > 0 ? 'Entrada de stock' : 'Ajuste de stock',
        }),
      })

      if (!response.ok) {
        throw new Error('Error al ajustar stock')
      }

      // Actualizar la lista
      await fetchProducts()
    } catch (error) {
      console.error('Error al ajustar stock:', error)
      alert('Error al ajustar stock')
    } finally {
      setAdjustingStock(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando inventario...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Inventario</h1>
        <p className="text-gray-600">Gestión de productos y stock</p>
      </div>

      {/* Búsqueda */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Buscar por nombre, código de barras o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Total Productos</p>
              <p className="text-3xl font-bold text-gray-900">
                {filteredProducts.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Stock Bajo</p>
              <p className="text-3xl font-bold text-orange-600">
                {filteredProducts.filter((p) => p.stock <= p.minStock).length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Sin Stock</p>
              <p className="text-3xl font-bold text-red-600">
                {filteredProducts.filter((p) => p.stock === 0).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Productos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Productos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredProducts.map((product) => {
              const isLowStock = product.stock <= product.minStock
              const isOutOfStock = product.stock === 0

              return (
                <div
                  key={product.id}
                  className={`p-4 rounded-lg border-2 ${
                    isOutOfStock
                      ? 'border-red-200 bg-red-50'
                      : isLowStock
                      ? 'border-orange-200 bg-orange-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Información del Producto */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">
                          {product.name}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {product.category.name}
                        </Badge>
                        {product.soldByWeight && (
                          <Badge variant="secondary" className="text-xs">
                            Por Peso
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Código: {product.barcode}
                      </p>
                      {product.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {product.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-medium">
                          Precio: {formatCurrency(product.price)}
                          {product.soldByWeight && '/kg'}
                        </span>
                        <span
                          className={`font-medium ${
                            isOutOfStock
                              ? 'text-red-600'
                              : isLowStock
                              ? 'text-orange-600'
                              : 'text-green-600'
                          }`}
                        >
                          Stock: {product.stock.toFixed(1)}{' '}
                          {product.soldByWeight ? 'kg' : 'un.'}
                        </span>
                        <span className="text-gray-500">
                          Mín: {product.minStock}
                        </span>
                      </div>
                      {isLowStock && (
                        <div className="mt-2 flex items-center gap-2 text-orange-600">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {isOutOfStock
                              ? '¡Producto sin stock!'
                              : '¡Stock bajo! Requiere reposición'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Controles de Stock */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => adjustStock(product.id, -1)}
                        disabled={
                          adjustingStock === product.id || product.stock === 0
                        }
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <div className="w-20 text-center">
                        <div className="text-2xl font-bold">
                          {product.stock.toFixed(product.soldByWeight ? 1 : 0)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {product.soldByWeight ? 'kg' : 'unid'}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          adjustStock(product.id, product.soldByWeight ? 1 : 1)
                        }
                        disabled={adjustingStock === product.id}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}

            {filteredProducts.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No se encontraron productos</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
