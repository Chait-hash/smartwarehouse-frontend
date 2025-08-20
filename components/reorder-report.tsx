"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Download, ShoppingCart } from "lucide-react"
import type { ReorderRecommendation } from "@/lib/database"

interface ReorderReportProps {
  recommendations: ReorderRecommendation[]
  summary: {
    totalProducts: number
    productsNeedingReorder: number
    totalEstimatedCost: number
    urgentProducts: number
  }
}

export function ReorderReport({ recommendations, summary }: ReorderReportProps) {
  const exportReport = () => {
    const csvContent = [
      "Product ID,Product Name,Current Stock,Days Remaining,Needs Reorder,Suggested Quantity,Estimated Cost,Criticality,Reason",
      ...recommendations.map((r) =>
        [
          r.productId,
          r.productName,
          r.currentStock,
          r.daysOfStockRemaining,
          r.needsReorder ? "Yes" : "No",
          r.suggestedReorderQuantity,
          r.estimatedCost,
          r.criticalityLevel,
          r.reason,
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `reorder-report-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const reorderItems = recommendations.filter((r) => r.needsReorder)

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Reorder Summary
              </CardTitle>
              <CardDescription>Overview of products requiring reordering</CardDescription>
            </div>
            <Button onClick={exportReport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{summary.productsNeedingReorder}</p>
              <p className="text-sm text-muted-foreground">Products to Reorder</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{summary.urgentProducts}</p>
              <p className="text-sm text-muted-foreground">Urgent Items</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">${summary.totalEstimatedCost.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Investment</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {reorderItems.reduce((sum, r) => sum + r.suggestedReorderQuantity, 0).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Total Units</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reorder Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Reorder Recommendations</CardTitle>
          <CardDescription>Products requiring immediate attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Days Left</TableHead>
                  <TableHead>Suggested Quantity</TableHead>
                  <TableHead>Estimated Cost</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reorderItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No products need reordering at this time
                    </TableCell>
                  </TableRow>
                ) : (
                  reorderItems.map((recommendation) => (
                    <TableRow key={recommendation.productId}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{recommendation.productName}</p>
                          <p className="text-sm text-muted-foreground">{recommendation.productId}</p>
                        </div>
                      </TableCell>
                      <TableCell>{recommendation.currentStock}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {recommendation.daysOfStockRemaining <= 3 && (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                          <span
                            className={
                              recommendation.daysOfStockRemaining <= 3
                                ? "text-red-600 font-medium"
                                : recommendation.daysOfStockRemaining <= 7
                                  ? "text-orange-600"
                                  : ""
                            }
                          >
                            {recommendation.daysOfStockRemaining}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {recommendation.suggestedReorderQuantity.toLocaleString()}
                      </TableCell>
                      <TableCell>${recommendation.estimatedCost.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            recommendation.criticalityLevel === "high"
                              ? "destructive"
                              : recommendation.criticalityLevel === "medium"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {recommendation.criticalityLevel}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{recommendation.reason}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
