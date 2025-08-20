"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import type { Product } from "@/lib/database"

interface StockChartProps {
  products: Product[]
}

export function StockChart({ products }: StockChartProps) {
  // Prepare data for stock levels chart
  const stockData = products.map((product) => ({
    name: product.name.length > 15 ? product.name.substring(0, 15) + "..." : product.name,
    stock: product.currentStock,
    dailySales: product.averageDailySales,
    daysRemaining: Math.floor(product.currentStock / product.averageDailySales),
  }))

  // Prepare data for criticality pie chart
  const criticalityData = [
    {
      name: "High",
      value: products.filter((p) => p.criticalityLevel === "high").length,
      color: "#ef4444",
    },
    {
      name: "Medium",
      value: products.filter((p) => p.criticalityLevel === "medium").length,
      color: "#f97316",
    },
    {
      name: "Low",
      value: products.filter((p) => p.criticalityLevel === "low").length,
      color: "#22c55e",
    },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Stock Levels Overview</CardTitle>
          <CardDescription>Current inventory levels vs daily sales</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stockData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [
                  value,
                  name === "stock" ? "Current Stock" : name === "dailySales" ? "Daily Sales" : "Days Remaining",
                ]}
              />
              <Bar dataKey="stock" fill="#3b82f6" name="stock" />
              <Bar dataKey="dailySales" fill="#10b981" name="dailySales" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Product Criticality Distribution</CardTitle>
          <CardDescription>Breakdown of products by criticality level</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={criticalityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {criticalityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
