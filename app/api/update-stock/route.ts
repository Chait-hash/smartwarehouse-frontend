import { NextResponse } from "next/server"
import { getProductsCollection } from "@/lib/database"

export async function POST(request: Request) {
  try {
    const { productId, newStock, reason } = await request.json()

    if (!productId || newStock === undefined) {
      return NextResponse.json({ error: "Missing required parameters: productId, newStock" }, { status: 400 })
    }

    const collection = await getProductsCollection()

    // Get current product to update sales history if this is a sale
    const product = await collection.findOne({ productId })
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const stockChange = newStock - product.currentStock
    const updates: any = {
      currentStock: newStock,
      lastUpdated: new Date(),
    }

    // If stock decreased (sale), add to sales history
    if (stockChange < 0) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Check if there's already an entry for today
      const todayEntry = product.salesHistory.find((entry) => entry.date.toDateString() === today.toDateString())

      if (todayEntry) {
        // Update existing entry
        updates["salesHistory"] = product.salesHistory.map((entry) =>
          entry.date.toDateString() === today.toDateString()
            ? { ...entry, quantity: entry.quantity + Math.abs(stockChange) }
            : entry,
        )
      } else {
        // Add new entry
        updates["$push"] = {
          salesHistory: {
            date: today,
            quantity: Math.abs(stockChange),
          },
        }
      }

      // Recalculate average daily sales (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const recentSales = product.salesHistory.filter((entry) => entry.date >= thirtyDaysAgo)

      if (recentSales.length > 0) {
        const totalSales = recentSales.reduce((sum, entry) => sum + entry.quantity, 0)
        updates.averageDailySales = Math.round((totalSales / 30) * 100) / 100
      }
    }

    const result = await collection.updateOne(
      { productId },
      updates["$push"] ? { $set: updates, $push: updates["$push"] } : { $set: updates },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: `Stock updated for ${product.name}. ${reason || "Stock adjustment"}`,
    })
  } catch (error) {
    console.error("Error updating stock:", error)
    return NextResponse.json({ error: "Failed to update stock" }, { status: 500 })
  }
}
