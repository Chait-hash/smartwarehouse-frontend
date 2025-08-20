import { NextResponse } from "next/server"
import { InventoryService } from "@/lib/inventory-service"

export async function POST(request: Request) {
  try {
    const { productId, multiplier, durationDays } = await request.json()

    if (!productId || !multiplier || !durationDays) {
      return NextResponse.json(
        { error: "Missing required parameters: productId, multiplier, durationDays" },
        { status: 400 },
      )
    }

    const simulation = await InventoryService.simulateDemandSpike(productId, multiplier, durationDays)

    if (!simulation) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(simulation)
  } catch (error) {
    console.error("Error simulating demand:", error)
    return NextResponse.json({ error: "Failed to simulate demand" }, { status: 500 })
  }
}
