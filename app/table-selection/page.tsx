


"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/lib/cart-context"
import { createClient } from "@/utils/supabase/client"
import type { Table } from "@/lib/types"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Settings, Users, Clock } from "lucide-react"
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
    dispatch({ type: "SET_TABLE", payload: tableNumber })
    setTimeout(() => {
      router.push("/menu")
    }, 300)
  }

  const getTableStatusColor = (status: string) => {
    switch (status) {
      case "free":
        return "bg-[#d8e8d1]"
      case "serving":
        return "bg-[#f4e3c1]"
      case "completed":
        return "bg-[#e8d3cf]"
      default:
        return "bg-[#e8d3cf]"
    }
  }

  const getTableStatusIcon = (status: string) => {
    switch (status) {
      case "free":
        return <Users className="h-4 w-4 text-[#5a5a44]" />
      case "serving":
        return <Clock className="h-4 w-4 text-[#5a5a44]" />
      default:
        return <Users className="h-4 w-4 text-[#9a9a88]" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfcf7]">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-lg font-medium text-[#5a5a44]">Loading tables...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative bg-[#fdfcf7] font-sans text-[#5a5a44] overflow-hidden">
      {/* Botanical Background & Glow */}
<div className="absolute inset-0 bg-[url('/aaa.png')] bg-cover bg-center bg-no-repeat opacity-10" />
      <div className="absolute top-1/2 left-1/2 w-[80vw] h-[80vw] bg-white rounded-full blur-[120px] opacity-[0.07] transform -translate-x-1/2 -translate-y-1/2 z-0" />

      <div className="relative z-10 max-w-screen-xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Oona Logo" className="mx-auto w-32 h-auto drop-shadow-md" />
          <h1 className="text-5xl font-serif font-medium tracking-wide text-[#7a7a5c] mt-2">oona</h1>
          <p className="uppercase tracking-wide text-sm text-[#9a9a88]">The One</p>
          <hr className="w-10 border-[#c8c8aa] mx-auto my-2" />
          <p className="text-sm text-[#77775f]">Please select your table to begin</p>
        </div>

        {/* Staff Button */}
        <div className="flex justify-end mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin/login")}
            className="border border-[#dadac3] text-[#606047] hover:bg-[#eaeada] transition rounded-full px-4"
          >
            <Settings className="h-4 w-4 mr-2" />
            Staff Portal
          </Button>
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-10">
          {tables.map((table, index) => (
            <div
              key={table.id}
              className={`cursor-pointer rounded-xl overflow-hidden shadow-md transition-transform duration-300 transform ${
                selectedTable === table.table_number ? "border-2 border-[#7a7a5c]" : "border border-[#e2e2d0]"
              } ${hoveredTable === table.table_number ? "scale-105" : ""} bg-white backdrop-blur-md`}
              onClick={() => handleTableSelect(table.table_number)}
              onMouseEnter={() => setHoveredTable(table.table_number)}
              onMouseLeave={() => setHoveredTable(null)}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className={`h-24 ${getTableStatusColor(table.status)} relative flex items-center justify-center`}>
                <div className="absolute inset-0 bg-[url('/botanical-bg-light.svg')] opacity-5" />

                <div className="relative z-10 text-center">
                  <div className="text-2xl font-semibold mb-1">{table.table_number}</div>
                  <div className="flex items-center justify-center gap-1 text-sm font-medium">
                    {getTableStatusIcon(table.status)}
                    <span>
                      {table.status === "free"
                        ? "Available"
                        : table.status === "serving"
                        ? "In Service"
                        : "Completed"}
                    </span>
                  </div>
                </div>

                {hoveredTable === table.table_number && (
                  <div className="absolute inset-0 bg-white/30 rounded-xl" />
                )}

                {selectedTable === table.table_number && (
                  <div className="absolute inset-0 border-2 border-[#7a7a5c] rounded-xl" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="text-center">
          <div className="inline-flex flex-wrap justify-center items-center gap-4 bg-[#f6f6eb] px-6 py-3 rounded-full border border-[#e0e0ce] shadow-md">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#a8cfa1] rounded-full" />
              <span className="text-sm">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#f4d79a] rounded-full" />
              <span className="text-sm">In Service</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#e8d3cf] rounded-full" />
              <span className="text-sm">Completed</span>
            </div>
          </div>
          <p className="text-sm text-[#88886e] mt-4">Tap any available table to begin your dining experience</p>
          <p className="text-xs text-[#aaa] italic mt-1">Each table maintains its own separate order</p>
        </div>
      </div>
    </div>
  )
}
