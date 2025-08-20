import { type Product, type ReorderRecommendation, getProductsCollection } from "./database"

export class InventoryService {
  // Calculate days of stock remaining
  static calculateDaysOfStock(currentStock: number, averageDailySales: number): number {
    if (averageDailySales <= 0) return Number.POSITIVE_INFINITY
    return Math.floor(currentStock / averageDailySales)
  }

  // Calculate safety stock threshold (lead time + 5 buffer days)
  static calculateSafetyStock(averageDailySales: number, supplierLeadTime: number): number {
    const bufferDays = 5
    return averageDailySales * (supplierLeadTime + bufferDays)
  }

  // Calculate optimal reorder quantity for next 60 days
  static calculateReorderQuantity(
    currentStock: number,
    averageDailySales: number,
    minimumReorderQuantity: number,
  ): number {
    const daysToStock = 60
    const requiredStock = averageDailySales * daysToStock
    const neededQuantity = Math.max(0, requiredStock - currentStock)

    return Math.max(neededQuantity, minimumReorderQuantity)
  }

  // Check if product needs reordering
  static needsReorder(product: Product): boolean {
    const safetyStock = this.calculateSafetyStock(product.averageDailySales, product.supplierLeadTime)
    return product.currentStock <= safetyStock
  }

  // Generate reorder recommendations for all products
  static async generateReorderReport(): Promise<ReorderRecommendation[]> {
    const collection = await getProductsCollection()
    const products = await collection.find({}).toArray()

    const recommendations: ReorderRecommendation[] = []

    for (const product of products) {
      const daysOfStock = this.calculateDaysOfStock(product.currentStock, product.averageDailySales)

      const needsReorder = this.needsReorder(product)

      let suggestedQuantity = 0
      let estimatedCost = 0
      let reason = ""

      if (needsReorder) {
        suggestedQuantity = this.calculateReorderQuantity(
          product.currentStock,
          product.averageDailySales,
          product.minimumReorderQuantity,
        )
        estimatedCost = suggestedQuantity * product.costPerUnit

        if (daysOfStock <= product.supplierLeadTime) {
          reason = "URGENT: Stock will run out before next delivery"
        } else {
          reason = "Stock below safety threshold"
        }
      } else {
        reason = "Stock levels adequate"
      }

      recommendations.push({
        productId: product.productId,
        productName: product.name,
        currentStock: product.currentStock,
        daysOfStockRemaining: daysOfStock,
        needsReorder,
        suggestedReorderQuantity: suggestedQuantity,
        estimatedCost,
        criticalityLevel: product.criticalityLevel,
        reason,
      })
    }

    // Sort by criticality and urgency
    return recommendations.sort((a, b) => {
      if (a.needsReorder && !b.needsReorder) return -1
      if (!a.needsReorder && b.needsReorder) return 1

      const criticalityOrder = { high: 3, medium: 2, low: 1 }
      const aCriticality = criticalityOrder[a.criticalityLevel as keyof typeof criticalityOrder]
      const bCriticality = criticalityOrder[b.criticalityLevel as keyof typeof criticalityOrder]

      if (aCriticality !== bCriticality) return bCriticality - aCriticality

      return a.daysOfStockRemaining - b.daysOfStockRemaining
    })
  }

  // Simulate demand spike
  static async simulateDemandSpike(
    productId: string,
    multiplier: number,
    durationDays: number,
  ): Promise<ReorderRecommendation | null> {
    const collection = await getProductsCollection()
    const product = await collection.findOne({ productId })

    if (!product) return null

    // Create a copy with simulated demand
    const simulatedProduct: Product = {
      ...product,
      averageDailySales: product.averageDailySales * multiplier,
    }

    const daysOfStock = this.calculateDaysOfStock(simulatedProduct.currentStock, simulatedProduct.averageDailySales)

    const needsReorder = this.needsReorder(simulatedProduct)

    let suggestedQuantity = 0
    let estimatedCost = 0
    const reason = `Demand spike simulation: ${multiplier}x normal sales for ${durationDays} days`

    if (needsReorder) {
      suggestedQuantity = this.calculateReorderQuantity(
        simulatedProduct.currentStock,
        simulatedProduct.averageDailySales,
        simulatedProduct.minimumReorderQuantity,
      )
      estimatedCost = suggestedQuantity * simulatedProduct.costPerUnit
    }

    return {
      productId: simulatedProduct.productId,
      productName: simulatedProduct.name,
      currentStock: simulatedProduct.currentStock,
      daysOfStockRemaining: daysOfStock,
      needsReorder,
      suggestedReorderQuantity: suggestedQuantity,
      estimatedCost,
      criticalityLevel: simulatedProduct.criticalityLevel,
      reason,
    }
  }
}
