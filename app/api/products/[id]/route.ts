import { NextResponse } from "next/server"
import { getProductsCollection } from "@/lib/database"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const collection = await getProductsCollection()
    const product = await collection.findOne({ productId: params.id })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const updates = await request.json()
    const collection = await getProductsCollection()

    const result = await collection.updateOne(
      { productId: params.id },
      {
        $set: {
          ...updates,
          lastUpdated: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}
