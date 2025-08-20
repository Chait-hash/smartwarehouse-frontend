// Client-side API functions for easy use in components

export interface ApiResponse<T> {
  data?: T
  error?: string
}

export class ApiClient {
  static async getProducts() {
    try {
      const response = await fetch("/api/products")
      const data = await response.json()

      if (!response.ok) {
        return { error: data.error || "Failed to fetch products" }
      }

      return { data }
    } catch (error) {
      return { error: "Network error" }
    }
  }

  static async getReorderReport() {
    try {
      const response = await fetch("/api/reorder-report")
      const data = await response.json()

      if (!response.ok) {
        return { error: data.error || "Failed to fetch reorder report" }
      }

      return { data }
    } catch (error) {
      return { error: "Network error" }
    }
  }

  static async simulateDemand(productId: string, multiplier: number, durationDays: number) {
    try {
      const response = await fetch("/api/simulate-demand", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId, multiplier, durationDays }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { error: data.error || "Failed to simulate demand" }
      }

      return { data }
    } catch (error) {
      return { error: "Network error" }
    }
  }

  static async updateStock(productId: string, newStock: number, reason?: string) {
    try {
      const response = await fetch("/api/update-stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId, newStock, reason }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { error: data.error || "Failed to update stock" }
      }

      return { data }
    } catch (error) {
      return { error: "Network error" }
    }
  }

  static async updateProduct(productId: string, updates: any) {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      const data = await response.json()

      if (!response.ok) {
        return { error: data.error || "Failed to update product" }
      }

      return { data }
    } catch (error) {
      return { error: "Network error" }
    }
  }
}
