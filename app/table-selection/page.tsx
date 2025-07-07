"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/lib/cart-context"
import { createClient } from "@/utils/supabase/client"
import type { Table } from "@/lib/types"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Settings, Sparkles, Users, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TableSelectionPage() {
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTable, setSelectedTable] = useState<number | null>(null)
  const [hoveredTable, setHoveredTable] = useState<number | null>(null)
  const { dispatch } = useCart()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    fetchTables()
  }, [])

  const fetchTables = async () => {
    try {
      const { data, error } = await supabase.from("tables").select("*").order("table_number")

      if (error) throw error
      setTables(data || [])
    } catch (error) {
      console.error("Error fetching tables:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleTableSelect = (tableNumber: number) => {
    setSelectedTable(tableNumber)

    // Set table number in cart context - this will automatically load the table's cart
    dispatch({ type: "SET_TABLE", payload: tableNumber })

    // Add a small delay for visual feedback
    setTimeout(() => {
      router.push("/menu")
    }, 300)
  }

  const getTableStatusColor = (status: string) => {
    switch (status) {
      case "free":
        return "from-emerald-400 to-emerald-600"
      case "serving":
        return "from-amber-400 to-orange-500"
      default:
        return "from-gray-400 to-gray-500"
    }
  }

  const getTableStatusIcon = (status: string) => {
    switch (status) {
      case "free":
        return <Users className="h-4 w-4" />
      case "serving":
        return <Clock className="h-4 w-4" />
      default:
        return <Users className="h-4 w-4 opacity-50" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
        <div className="text-center">
          <div className="animate-bounce-in">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-600">Loading tables...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-200 to-pink-200 rounded-full opacity-20 animate-float"></div>
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-red-200 to-orange-200 rounded-full opacity-20 animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-pink-200 to-red-200 rounded-full opacity-10 animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-6">
        {/* Header Section */}
        <div className="text-center mb-12 animate-slide-up">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-orange-500 animate-pulse" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-600 via-red-500 to-pink-600 bg-clip-text text-transparent">
              Bella Vista Restaurant
            </h1>
            <Sparkles className="h-8 w-8 text-pink-500 animate-pulse" style={{ animationDelay: "0.5s" }} />
          </div>
          <p className="text-xl text-gray-700 mb-2">Authentic Italian Cuisine</p>
          <p className="text-lg text-gray-600">Please select your table to start your culinary journey</p>
        </div>

        {/* Admin Login Button */}
        <div className="flex justify-end mb-8 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin/login")}
            className="glass text-gray-600 hover:text-gray-800 hover:bg-white/20 transition-all duration-300 backdrop-blur-sm border border-white/30"
          >
            <Settings className="h-4 w-4 mr-2" />
            Staff Portal
          </Button>
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 mb-12">
          {tables.map((table, index) => (
            <div
              key={table.id}
              className={`cursor-pointer hover-lift transition-all duration-300 border-0 shadow-lg animate-slide-up ${
                selectedTable === table.table_number ? "animate-pulse-glow" : ""
              } ${hoveredTable === table.table_number ? "scale-105" : ""}`}
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => handleTableSelect(table.table_number)}
              onMouseEnter={() => setHoveredTable(table.table_number)}
              onMouseLeave={() => setHoveredTable(null)}
            >
              <div className="p-0 relative overflow-hidden">
                <div
                  className={`h-24 bg-gradient-to-br ${getTableStatusColor(table.status)} flex items-center justify-center relative`}
                >
                  {/* Animated background pattern */}
                  <div
                    className={
                      "absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http://www.w3.org/2000/svg%22%3E%3Cdefs%3E%3Cpattern%20id%3D%22grid%22%20width%3D%2220%22%20height%3D%2220%22%20patternUnits%3D%22userSpaceOnUse%22%3E%3Cpath%20d%3D%22M%2020%200%20L%200%200%200%2020%22%20fill%3D%22none%22%20stroke%3D%22white%22%20stroke-width%3D%221%22%20opacity%3D%220.3%22/%3E%3C/pattern%3E%3C/defs%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22url(%23grid)%22/%3E%3C/svg%3E')]"
                    }
                  />

                  <div className="text-center z-10">
                    <div className="text-2xl font-bold text-white mb-1 drop-shadow-lg">{table.table_number}</div>
                    <div className="flex items-center justify-center gap-1 text-white/90">
                      {getTableStatusIcon(table.status)}
                      <span className="text-xs font-medium">
                        {table.status === "free"
                          ? "Available"
                          : table.status === "serving"
                            ? "In Service"
                            : "Completed"}
                      </span>
                    </div>
                  </div>

                  {/* Hover effect overlay */}
                  <div
                    className={`absolute inset-0 bg-white/20 transition-opacity duration-300 ${
                      hoveredTable === table.table_number ? "opacity-100" : "opacity-0"
                    }`}
                  ></div>

                  {/* Selection effect */}
                  {selectedTable === table.table_number && (
                    <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="text-center animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <div className="inline-flex items-center gap-4 bg-white/60 backdrop-blur-sm rounded-full px-8 py-4 shadow-lg border border-white/30">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">In Service</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Completed</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">Tap any available table to begin your dining experience</p>
          <p className="text-xs text-gray-400 mt-2">Each table maintains its own separate order</p>
        </div>
      </div>
    </div>
  )
}
