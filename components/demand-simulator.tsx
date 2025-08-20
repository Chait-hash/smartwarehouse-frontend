"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TrendingUp, Play, AlertTriangle, Info } from "lucide-react"
import type { Product, ReorderRecommendation } from "@/lib/database"
import { ApiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

interface DemandSimulatorProps {
  products: Product[]
}

export function DemandSimulator({ products }: DemandSimulatorProps) {
  const [selectedProductId, setSelectedProductId] = useState<string>("")
  const [multiplier, setMultiplier] = useState<string>("2")
  const [durationDays, setDurationDays] = useState<string>("7")
  const [simulation, setSimulation] = useState<ReorderRecommendation | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const selectedProduct = products.find((p) => p.productId === selectedProductId)

  const runSimulation = async () => {
    if (!selectedProductId || !multiplier || !durationDays) {
      toast({
        title: "Missing Parameters",
        description: "Please fill in all simulation parameters",
        variant: "destructive",
      })
      return
    }

    const multiplierValue = Number.parseFloat(multiplier)
    const durationValue = Number.parseInt(durationDays)

    if (isNaN(multiplierValue) || multiplierValue <= 0 || isNaN(durationValue) || durationValue <= 0) {
      toast({
        title: "Invalid Parameters",
        description: "Please enter valid positive numbers",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    const result = await ApiClient.simulateDemand(selectedProductId, multiplierValue, durationValue)

    if (result.error) {
      toast({
        title: "Simulation Failed",
        description: result.error,
        variant: "destructive",
      })
    } else {
      setSimulation(result.data)
      toast({
        title: "Simulation Complete",
        description: "Demand spike scenario has been analyzed",
      })
    }
    setLoading(false)
  }

  const resetSimulation = () => {
    setSimulation(null)
    setSelectedProductId("")
    setMultiplier("2")
    setDurationDays("7")
  }

  const getImpactSeverity = (simulation: ReorderRecommendation) => {
    if (simulation.daysOfStockRemaining <= 1) {
      return { level: "Critical", color: "destructive", description: "Stock will run out immediately" }
    } else if (simulation.daysOfStockRemaining <= 3) {
      return { level: "Severe", color: "destructive", description: "Stock critically low" }
    } else if (simulation.daysOfStockRemaining <= 7) {
      return { level: "High", color: "default", description: "Stock will run low quickly" }
    } else if (simulation.needsReorder) {
      return { level: "Moderate", color: "secondary", description: "Reorder needed sooner" }
    } else {
      return { level: "Low", color: "outline", description: "Minimal impact on stock" }
    }
  }

  return (
    <div className="space-y-6">
      {/* Simulation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Demand Spike Simulator
          </CardTitle>
          <CardDescription>
            Test how sudden demand increases affect your inventory and reorder recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product">Select Product</Label>
              <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.productId} value={product.productId}>
                      {product.name} ({product.productId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="multiplier">Demand Multiplier</Label>
              <Input
                id="multiplier"
                type="number"
                step="0.1"
                min="1"
                value={multiplier}
                onChange={(e) => setMultiplier(e.target.value)}
                placeholder="e.g., 2.5"
              />
              <p className="text-xs text-muted-foreground">How many times normal sales (e.g., 3x = triple sales)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (Days)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                placeholder="e.g., 7"
              />
              <p className="text-xs text-muted-foreground">How long the spike lasts</p>
            </div>
          </div>

          {selectedProduct && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>{selectedProduct.name}</strong> currently has <strong>{selectedProduct.currentStock}</strong>{" "}
                units with average daily sales of <strong>{selectedProduct.averageDailySales}</strong> units/day
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button onClick={runSimulation} disabled={loading || !selectedProductId}>
              <Play className="h-4 w-4 mr-2" />
              {loading ? "Running Simulation..." : "Run Simulation"}
            </Button>
            <Button variant="outline" onClick={resetSimulation}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Simulation Results */}
      {simulation && (
        <Card>
          <CardHeader>
            <CardTitle>Simulation Results</CardTitle>
            <CardDescription>Impact analysis of the demand spike scenario</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <p className="text-2xl font-bold">{simulation.daysOfStockRemaining}</p>
                <p className="text-sm text-muted-foreground">Days of Stock Left</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <p className="text-2xl font-bold">{simulation.needsReorder ? "Yes" : "No"}</p>
                <p className="text-sm text-muted-foreground">Needs Reorder</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <p className="text-2xl font-bold">{simulation.suggestedReorderQuantity.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Suggested Quantity</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <p className="text-2xl font-bold">${simulation.estimatedCost.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Estimated Cost</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Impact Severity</p>
                  <p className="text-sm text-muted-foreground">{getImpactSeverity(simulation).description}</p>
                </div>
                <Badge variant={getImpactSeverity(simulation).color as any}>
                  {getImpactSeverity(simulation).level}
                </Badge>
              </div>

              <div className="p-4 border rounded-lg">
                <p className="font-medium mb-2">Scenario Details</p>
                <p className="text-sm text-muted-foreground">{simulation.reason}</p>
              </div>

              {simulation.needsReorder && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Action Required:</strong> This demand spike would trigger an immediate reorder of{" "}
                    <strong>{simulation.suggestedReorderQuantity.toLocaleString()}</strong> units at an estimated cost
                    of <strong>${simulation.estimatedCost.toLocaleString()}</strong>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Simulation Scenarios */}
      <Card>
        <CardHeader>
          <CardTitle>Common Simulation Scenarios</CardTitle>
          <CardDescription>Pre-configured scenarios to test different demand situations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Holiday Rush</h4>
              <p className="text-sm text-muted-foreground mb-3">3x normal demand for 14 days</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setMultiplier("3")
                  setDurationDays("14")
                }}
              >
                Apply Scenario
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Viral Product</h4>
              <p className="text-sm text-muted-foreground mb-3">5x normal demand for 7 days</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setMultiplier("5")
                  setDurationDays("7")
                }}
              >
                Apply Scenario
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Supply Disruption</h4>
              <p className="text-sm text-muted-foreground mb-3">2x demand for 30 days</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setMultiplier("2")
                  setDurationDays("30")
                }}
              >
                Apply Scenario
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
