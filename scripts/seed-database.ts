import { connectToDatabase, type Product } from "../lib/database"

// Sample products data
const sampleProducts: Omit<Product, "_id">[] = [
  {
    productId: "PROD001",
    name: "Wireless Headphones",
    currentStock: 45,
    averageDailySales: 8,
    supplierLeadTime: 7,
    minimumReorderQuantity: 50,
    costPerUnit: 75.99,
    criticalityLevel: "high",
    lastUpdated: new Date(),
    salesHistory: generateSalesHistory(8, 30),
  },
  {
    productId: "PROD002",
    name: "Smartphone Case",
    currentStock: 120,
    averageDailySales: 15,
    supplierLeadTime: 5,
    minimumReorderQuantity: 100,
    costPerUnit: 12.5,
    criticalityLevel: "medium",
    lastUpdated: new Date(),
    salesHistory: generateSalesHistory(15, 30),
  },
  {
    productId: "PROD003",
    name: "USB Cable",
    currentStock: 25,
    averageDailySales: 12,
    supplierLeadTime: 3,
    minimumReorderQuantity: 200,
    costPerUnit: 8.99,
    criticalityLevel: "high",
    lastUpdated: new Date(),
    salesHistory: generateSalesHistory(12, 30),
  },
  {
    productId: "PROD004",
    name: "Bluetooth Speaker",
    currentStock: 80,
    averageDailySales: 5,
    supplierLeadTime: 10,
    minimumReorderQuantity: 30,
    costPerUnit: 45.0,
    criticalityLevel: "medium",
    lastUpdated: new Date(),
    salesHistory: generateSalesHistory(5, 30),
  },
  {
    productId: "PROD005",
    name: "Screen Protector",
    currentStock: 15,
    averageDailySales: 20,
    supplierLeadTime: 4,
    minimumReorderQuantity: 500,
    costPerUnit: 3.99,
    criticalityLevel: "high",
    lastUpdated: new Date(),
    salesHistory: generateSalesHistory(20, 30),
  },
  {
    productId: "PROD006",
    name: "Power Bank",
    currentStock: 200,
    averageDailySales: 3,
    supplierLeadTime: 14,
    minimumReorderQuantity: 50,
    costPerUnit: 29.99,
    criticalityLevel: "low",
    lastUpdated: new Date(),
    salesHistory: generateSalesHistory(3, 30),
  },
]

function generateSalesHistory(averageSales: number, days: number) {
  const history = []
  const today = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    // Add some randomness to sales (±30% of average)
    const variation = (Math.random() - 0.5) * 0.6
    const quantity = Math.max(0, Math.round(averageSales * (1 + variation)))

    history.push({
      date,
      quantity,
    })
  }

  return history
}

async function seedDatabase() {
  try {
    console.log("Connecting to database...")
    const db = await connectToDatabase()
    const collection = db.collection("products")

    // Clear existing data
    await collection.deleteMany({})
    console.log("Cleared existing products")

    // Insert sample data
    const result = await collection.insertMany(sampleProducts)
    console.log(`Inserted ${result.insertedCount} products`)

    // Display inserted products
    const products = await collection.find({}).toArray()
    console.log("\nSample products created:")
    products.forEach((product) => {
      console.log(
        `- ${product.name} (${product.productId}): ${product.currentStock} units, ${product.averageDailySales} daily sales`,
      )
    })

    console.log("\nDatabase seeded successfully!")
  } catch (error) {
    console.error("Error seeding database:", error)
  }
}

// Run the seeding function
seedDatabase()
