'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatWeight } from '@/lib/utils'
import { Scale, ShoppingCart, Trash2, CreditCard, DollarSign, CheckCircle } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3002'

interface Product {
  id: string
  barcode: string
  name: string
  price: number
  soldByWeight: boolean
  stock: number
  category: {
    name: string
  }
}

interface CartItem {
  product: Product
  quantity: number
  subtotal: number
}

interface ScaleData {
  weight: number
  stable: boolean
  isActive: boolean
}

export default function POSPage() {
  const [barcode, setBarcode] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [scaleData, setScaleData] = useState<ScaleData>({
    weight: 0,
    stable: false,
    isActive: false,
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [ws, setWs] = useState<WebSocket | null>(null)
  const barcodeInputRef = useRef<HTMLInputElement>(null)

  // Conectar a WebSocket de la balanza
  useEffect(() => {
    const websocket = new WebSocket(WS_URL)

    websocket.onopen = () => {
      console.log('✅ Conectado a la balanza')
    }

    websocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        if (message.type === 'weight-update') {
          setScaleData(message.data)
        }
      } catch (error) {
        console.error('Error al procesar mensaje de balanza:', error)
      }
    }

    websocket.onerror = (error) => {
      console.error('Error en WebSocket:', error)
    }

    websocket.onclose = () => {
      console.log('🔌 Desconectado de la balanza')
    }

    setWs(websocket)

    return () => {
      websocket.close()
    }
  }, [])

  // Buscar producto por código de barras
  const searchProduct = async (code: string) => {
    try {
      const response = await fetch(`${API_URL}/api/products/barcode/${code}`)

      if (!response.ok) {
        alert('Producto no encontrado')
        return
      }

      const product: Product = await response.json()

      // Si es por peso, activar la balanza
      if (product.soldByWeight) {
        startWeighing()
      } else {
        addToCart(product, 1)
      }
    } catch (error) {
      console.error('Error al buscar producto:', error)
      alert('Error al buscar producto')
    }
  }

  // Agregar producto al carrito
  const addToCart = (product: Product, quantity: number) => {
    const existingIndex = cart.findIndex((item) => item.product.id === product.id)

    if (existingIndex !== -1) {
      // Actualizar cantidad si ya existe
      const newCart = [...cart]
      newCart[existingIndex].quantity += quantity
      newCart[existingIndex].subtotal = newCart[existingIndex].quantity * product.price
      setCart(newCart)
    } else {
      // Agregar nuevo item
      setCart([
        ...cart,
        {
          product,
          quantity,
          subtotal: quantity * product.price,
        },
      ])
    }

    setBarcode('')
    barcodeInputRef.current?.focus()
  }

  // Eliminar item del carrito
  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index))
  }

  // Activar balanza
  const startWeighing = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'start-weighing' }))
    }
  }

  // Detener balanza
  const stopWeighing = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'stop-weighing' }))
    }
  }

  // Agregar peso actual al último producto
  const addWeightToCart = () => {
    if (scaleData.weight > 0 && scaleData.stable) {
      // Buscar el último producto escaneado (debería ser por peso)
      const lastBarcode = barcode
      if (lastBarcode) {
        fetch(`${API_URL}/api/products/barcode/${lastBarcode}`)
          .then((res) => res.json())
          .then((product: Product) => {
            addToCart(product, scaleData.weight)
            stopWeighing()
          })
      }
    }
  }

  // Calcular total
  const total = cart.reduce((sum, item) => sum + item.subtotal, 0)

  // Procesar venta
  const processSale = async (paymentMethod: 'cash' | 'card') => {
    if (cart.length === 0) {
      alert('El carrito está vacío')
      return
    }

    setIsProcessing(true)

    try {
      const response = await fetch(`${API_URL}/api/sales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
          paymentMethod,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al procesar venta')
      }

      // Venta exitosa
      setShowSuccess(true)
      setCart([])
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error: any) {
      console.error('Error al procesar venta:', error)
      alert(error.message || 'Error al procesar venta')
    } finally {
      setIsProcessing(false)
      barcodeInputRef.current?.focus()
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Columna Izquierda - Escaneo y Balanza */}
      <div className="lg:col-span-2 space-y-6">
        {/* Lector de Código de Barras */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Punto de Venta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Código de Barras
              </label>
              <Input
                ref={barcodeInputRef}
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && barcode) {
                    searchProduct(barcode)
                  }
                }}
                placeholder="Escanee o escriba el código de barras..."
                className="text-lg"
                autoFocus
              />
              <p className="text-sm text-gray-500 mt-1">
                Presione Enter después de escanear o escribir el código
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Balanza Digital */}
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-orange-600" />
              Balanza Digital
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-black text-green-400 rounded-lg p-6 font-mono text-center">
              <div className="text-5xl font-bold mb-2">
                {scaleData.weight.toFixed(3)}
              </div>
              <div className="text-xl">kg</div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={scaleData.isActive ? 'default' : 'secondary'}>
                  {scaleData.isActive ? 'Activa' : 'Inactiva'}
                </Badge>
                {scaleData.stable && scaleData.isActive && (
                  <Badge variant="default" className="bg-green-500">
                    Peso Estable
                  </Badge>
                )}
              </div>

              <div className="space-x-2">
                {!scaleData.isActive ? (
                  <Button onClick={startWeighing} variant="default">
                    Activar Balanza
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={addWeightToCart}
                      variant="default"
                      disabled={!scaleData.stable || scaleData.weight === 0}
                    >
                      Agregar al Carrito
                    </Button>
                    <Button onClick={stopWeighing} variant="outline">
                      Detener
                    </Button>
                  </>
                )}
              </div>
            </div>

            <p className="text-sm text-gray-600">
              {scaleData.isActive
                ? 'Coloque el producto en la balanza y espere a que el peso se estabilice'
                : 'Active la balanza para pesar productos a granel'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Columna Derecha - Carrito */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Carrito de Compras</CardTitle>
          </CardHeader>
          <CardContent>
            {cart.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <ShoppingCart className="w-12 h-12 mx-auto mb-2" />
                <p>El carrito está vacío</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{item.product.name}</h4>
                      <p className="text-sm text-gray-600">
                        {item.product.soldByWeight
                          ? formatWeight(item.quantity)
                          : `${item.quantity} unidad(es)`}{' '}
                        × {formatCurrency(item.product.price)}
                        {item.product.soldByWeight && '/kg'}
                      </p>
                      <p className="text-sm font-semibold text-green-600 mt-1">
                        {formatCurrency(item.subtotal)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromCart(index)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Total y Pago */}
        {cart.length > 0 && (
          <Card className="bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="pt-6 space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Total</p>
                <p className="text-4xl font-bold text-green-700">
                  {formatCurrency(total)}
                </p>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={() => processSale('cash')}
                  className="w-full"
                  size="lg"
                  disabled={isProcessing}
                >
                  <DollarSign className="w-5 h-5 mr-2" />
                  Pagar en Efectivo
                </Button>
                <Button
                  onClick={() => processSale('card')}
                  className="w-full"
                  size="lg"
                  variant="outline"
                  disabled={isProcessing}
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Pagar con Tarjeta
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mensaje de Éxito */}
        {showSuccess && (
          <Card className="bg-green-500 text-white">
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="w-12 h-12 mx-auto mb-2" />
                <p className="text-xl font-bold">¡Venta Procesada!</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
