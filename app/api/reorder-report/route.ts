import { NextResponse } from "next/server"
import { InventoryService } from "@/lib/inventory-service"

export async function GET() {
  try {
    const recommendations = await InventoryService.generateReorderReport()

    // Calculate summary statistics
    const totalProducts = recommendations.length
    const productsNeedingReorder = recommendations.filter((r) => r.needsReorder).length
    const totalEstimatedCost = recommendations
      .filter((r) => r.needsReorder)
      .reduce((sum, r) => sum + r.estimatedCost, 0)

    const urgentProducts = recommendations.filter((r) => r.needsReorder && r.daysOfStockRemaining <= 3).length

    return NextResponse.json({
      recommendations,
      summary: {
        totalProducts,
        productsNeedingReorder,
        totalEstimatedCost: Math.round(totalEstimatedCost * 100) / 100,
        urgentProducts,
      },
    })
  } catch (error) {
    console.error("Error generating reorder report:", error)
    return NextResponse.json({ error: "Failed to generate reorder report" }, { status: 500 })
  }
}
