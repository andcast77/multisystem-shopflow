'use client'

import { useStoreConfig } from '@/hooks/useStoreConfig'
import { useCartStore } from '@/store/cartStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Trash2, ShoppingCart as CartIcon } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/format'

export function ShoppingCart() {
  const { data: storeConfig } = useStoreConfig()
  const items = useCartStore((state) => state.items)
  const removeItem = useCartStore((state) => state.removeItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const updateDiscount = useCartStore((state) => state.updateDiscount)
  const currency = storeConfig?.currency ?? 'USD'

  const handleDiscountChange = (productId: string, value: string) => {
    const pct = parseFloat(value)
    updateDiscount(productId, isNaN(pct) ? 0 : pct)
  }

  if (items.length === 0) {
    return (
      <Card className="h-full border-2">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CartIcon className="h-5 w-5" />
            Carrito de compra
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10 text-muted-foreground">
            El carrito está vacío
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col border-2">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CartIcon className="h-5 w-5" />
          Carrito de compra
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({items.length} {items.length === 1 ? 'producto' : 'productos'})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
        <ScrollArea className="flex-1">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold w-[min(140px,30%)]">Producto</TableHead>
                <TableHead className="font-semibold w-[64px] text-center">Cant.</TableHead>
                <TableHead className="font-semibold w-[70px] text-right">P. unit.</TableHead>
                <TableHead className="font-semibold w-[52px] text-right">Desc. %</TableHead>
                <TableHead className="font-semibold text-right">Subtotal</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => {
                const price = Number(item.product.price)
                const itemSubtotal =
                  price * item.quantity * (1 - (item.discount || 0) / 100)
                return (
                  <TableRow key={item.product.id}>
                    <TableCell className="py-2 align-top">
                      <div className="flex items-baseline gap-2 min-w-0">
                        <span className="text-[11px] text-muted-foreground/70 tabular-nums shrink-0">
                          {item.product.sku ?? '—'}
                        </span>
                        <span className="font-medium line-clamp-2 min-w-0">{item.product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-2 align-top">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(
                            item.product.id,
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="h-7 w-12 text-center text-sm tabular-nums"
                        min={1}
                      />
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground py-2 align-top text-sm tabular-nums">
                      {formatCurrency(price, currency)}
                    </TableCell>
                    <TableCell className="py-2 align-top">
                      <Input
                        type="number"
                        placeholder="0"
                        value={item.discount ? String(item.discount) : ''}
                        onChange={(e) =>
                          handleDiscountChange(item.product.id, e.target.value)
                        }
                        className="h-7 w-12 text-right text-sm tabular-nums p-1"
                        min={0}
                        max={100}
                        step={0.1}
                      />
                    </TableCell>
                    <TableCell className="text-right font-semibold py-2 align-top tabular-nums">
                      {formatCurrency(itemSubtotal, currency)}
                    </TableCell>
                    <TableCell className="py-2 align-top">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => removeItem(item.product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

