"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Edit, Package } from "lucide-react"
import type { Product } from "@/lib/database"
import { ApiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

interface ProductsTableProps {
  products: Product[]
  onRefresh: () => void
}

export function ProductsTable({ products, onRefresh }: ProductsTableProps) {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [newStock, setNewStock] = useState("")
  const [updating, setUpdating] = useState(false)
  const { toast } = useToast()

  const handleStockUpdate = async (productId: string, currentStock: number) => {
    const stockValue = Number.parseInt(newStock)
    if (isNaN(stockValue) || stockValue < 0) {
      toast({
        title: "Invalid Stock",
        description: "Please enter a valid stock number",
        variant: "destructive",
      })
      return
    }

    setUpdating(true)
    const result = await ApiClient.updateStock(
      productId,
      stockValue,
      stockValue > currentStock ? "Stock replenishment" : "Stock adjustment",
    )

    if (result.error) {
      toast({
        title: "Update Failed",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Stock Updated",
        description: result.data?.message || "Stock updated successfully",
      })
      setEditingProduct(null)
      setNewStock("")
      onRefresh()
    }
    setUpdating(false)
  }

  const getCriticalityColor = (level: string) => {
    switch (level) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const getStockStatus = (product: Product) => {
    const daysOfStock =
      product.averageDailySales > 0 ? product.currentStock / product.averageDailySales : Number.POSITIVE_INFINITY
    const safetyStock = product.averageDailySales * (product.supplierLeadTime + 5)

    if (product.currentStock <= safetyStock) {
      if (daysOfStock <= 3) {
        return { status: "Critical", color: "destructive" }
      } else if (daysOfStock <= product.supplierLeadTime) {
        return { status: "Low", color: "default" }
      } else {
        return { status: "Reorder", color: "secondary" }
      }
    }
    return { status: "Good", color: "outline" }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Product Inventory
        </CardTitle>
        <CardDescription>Current stock levels and product details</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Daily Sales</TableHead>
                <TableHead>Lead Time</TableHead>
                <TableHead>Cost/Unit</TableHead>
                <TableHead>Criticality</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const stockStatus = getStockStatus(product)
                const daysRemaining = Math.floor(product.currentStock / product.averageDailySales)

                return (
                  <TableRow key={product.productId}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.productId}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{product.currentStock}</p>
                        <p className="text-sm text-muted-foreground">
                          {isFinite(daysRemaining) ? `${daysRemaining} days` : "∞ days"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{product.averageDailySales}/day</TableCell>
                    <TableCell>{product.supplierLeadTime} days</TableCell>
                    <TableCell>${product.costPerUnit}</TableCell>
                    <TableCell>
                      <Badge variant={getCriticalityColor(product.criticalityLevel)}>{product.criticalityLevel}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={stockStatus.color as any}>{stockStatus.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingProduct(product)
                              setNewStock(product.currentStock.toString())
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update Stock - {product.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="stock">New Stock Level</Label>
                              <Input
                                id="stock"
                                type="number"
                                value={newStock}
                                onChange={(e) => setNewStock(e.target.value)}
                                placeholder="Enter new stock level"
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button
                                onClick={() => handleStockUpdate(product.productId, product.currentStock)}
                                disabled={updating}
                              >
                                {updating ? "Updating..." : "Update Stock"}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
