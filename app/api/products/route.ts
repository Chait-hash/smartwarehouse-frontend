import { NextResponse } from "next/server"
import { getProductsCollection } from "@/lib/database"

export async function GET() {
  try {
    const collection = await getProductsCollection()
    const products = await collection.find({}).toArray()

    return NextResponse.json(products)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const productData = await request.json()
    const collection = await getProductsCollection()

    const result = await collection.insertOne({
      ...productData,
      lastUpdated: new Date(),
    })

    return NextResponse.json({
      success: true,
      insertedId: result.insertedId,
    })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
