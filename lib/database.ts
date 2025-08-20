import { MongoClient, type Db, type Collection } from "mongodb"

// Database connection
let client: MongoClient
let db: Db

export interface Product {
  _id?: string
  productId: string
  name: string
  currentStock: number
  averageDailySales: number
  supplierLeadTime: number // in days
  minimumReorderQuantity: number
  costPerUnit: number
  criticalityLevel: "high" | "medium" | "low"
  lastUpdated: Date
  salesHistory: DailySales[]
}

export interface DailySales {
  date: Date
  quantity: number
}

export interface ReorderRecommendation {
  productId: string
  productName: string
  currentStock: number
  daysOfStockRemaining: number
  needsReorder: boolean
  suggestedReorderQuantity: number
  estimatedCost: number
  criticalityLevel: string
  reason: string
}

export async function connectToDatabase(): Promise<Db> {
  if (db) {
    return db
  }

  try {
    // For development, we'll use a mock connection
    // In production, you would use: mongodb://localhost:27017 or your MongoDB Atlas connection string
    const connectionString = process.env.MONGODB_URI || "mongodb://localhost:27017"

    client = new MongoClient(connectionString)
    await client.connect()
    db = client.db("warehouse_system")

    console.log("Connected to MongoDB")
    return db
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error)
    throw error
  }
}

export async function getProductsCollection(): Promise<Collection<Product>> {
  const database = await connectToDatabase()
  return database.collection<Product>("products")
}

export async function closeConnection(): Promise<void> {
  if (client) {
    await client.close()
  }
}
