"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Package, TrendingUp, DollarSign, RefreshCw } from "lucide-react"
import { ApiClient } from "@/lib/api-client"
import type { Product, ReorderRecommendation } from "@/lib/database"
import { ProductsTable } from "./products-table"
import { ReorderReport } from "./reorder-report"
import { StockChart } from "./stock-chart"
import { DemandSimulator } from "./demand-simulator"

interface DashboardData {
  products: Product[]
  reorderReport: {
    recommendations: ReorderRecommendation[]
    summary: {
      totalProducts: number
      productsNeedingReorder: number
      totalEstimatedCost: number
      urgentProducts: number
    }
  }
}

export function WarehouseDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      const [productsResult, reorderResult] = await Promise.all([ApiClient.getProducts(), ApiClient.getReorderReport()])

      if (productsResult.error) {
        throw new Error(productsResult.error)
      }

      if (reorderResult.error) {
        throw new Error(reorderResult.error)
      }

      setData({
        products: productsResult.data,
        reorderReport: reorderResult.data,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading warehouse data...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchData} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) return null

  const { products, reorderReport } = data

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Smart Warehouse System</h1>
          <p className="text-muted-foreground">Intelligent inventory management and reordering</p>
        </div>
        <Button onClick={fetchData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reorderReport.summary.totalProducts}</div>
            <p className="text-xs text-muted-foreground">Active inventory items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Need Reordering</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{reorderReport.summary.productsNeedingReorder}</div>
            <p className="text-xs text-muted-foreground">Products below safety stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{reorderReport.summary.urgentProducts}</div>
            <p className="text-xs text-muted-foreground">Critical stock levels</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reorder Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${reorderReport.summary.totalEstimatedCost.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Estimated total investment</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="reorders">Reorder Report</TabsTrigger>
          <TabsTrigger value="simulation">Demand Simulation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StockChart products={products} />
            <Card>
              <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
                <CardDescription>Products requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {reorderReport.recommendations
                  .filter((r) => r.needsReorder)
                  .slice(0, 5)
                  .map((recommendation) => (
                    <div
                      key={recommendation.productId}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <AlertTriangle
                          className={`h-4 w-4 ${
                            recommendation.daysOfStockRemaining <= 3 ? "text-red-500" : "text-orange-500"
                          }`}
                        />
                        <div>
                          <p className="font-medium">{recommendation.productName}</p>
                          <p className="text-sm text-muted-foreground">
                            {recommendation.daysOfStockRemaining} days remaining
                          </p>
                        </div>
                      </div>
                      <Badge variant={recommendation.criticalityLevel === "high" ? "destructive" : "secondary"}>
                        {recommendation.criticalityLevel}
                      </Badge>
                    </div>
                  ))}
                {reorderReport.recommendations.filter((r) => r.needsReorder).length === 0 && (
                  <p className="text-center text-muted-foreground py-4">All products have adequate stock levels</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products">
          <ProductsTable products={products} onRefresh={fetchData} />
        </TabsContent>

        <TabsContent value="reorders">
          <ReorderReport recommendations={reorderReport.recommendations} summary={reorderReport.summary} />
        </TabsContent>

        <TabsContent value="simulation">
          <DemandSimulator products={products} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
