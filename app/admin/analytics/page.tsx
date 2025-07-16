"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  ChefHat,
  Calendar,
  BarChart3,
  Users,
  Target,
  ArrowLeft,
} from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import type { Order } from "@/lib/types"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useToast } from "@/hooks/use-toast"

interface AnalyticsData {
  todayEarnings: number
  monthlyEarnings: number
  totalOrders: number
  pendingOrders: number
  inProgressOrders: number
  completedOrders: number
  cancelledOrders: number
  todayOrders: number
  monthlyOrders: number
  averageOrderValue: number
  topSellingItems: Array<{
    name: string
    quantity: number
    revenue: number
  }>
  hourlyStats: Array<{
    hour: number
    orders: number
    revenue: number
  }>
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<"today" | "week" | "month">("today")
  const supabase = createClient()
  const { toast } = useToast()

  // Add these new state variables after the existing useState declarations
  const [clearingAnalytics, setClearingAnalytics] = useState(false)

  useEffect(() => {
    fetchAnalytics()
    fetchRecentOrders()

    // Set up real-time updates
    const channel = supabase
      .channel("analytics-orders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => {
          // Refresh analytics when orders change
          fetchAnalytics()
          fetchRecentOrders()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])



  const fetchAnalytics = async () => {
    try {
      // Get all orders
      const { data: allOrders, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error

      const orders = allOrders || []
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

      // Calculate analytics
      const todayOrders = orders.filter((order) => new Date(order.created_at) >= today)

      const monthlyOrders = orders.filter((order) => new Date(order.created_at) >= thisMonth)

      const completedOrders = orders.filter((order) => order.status === "completed")
      const todayCompletedOrders = todayOrders.filter((order) => order.status === "completed")
      const monthlyCompletedOrders = monthlyOrders.filter((order) => order.status === "completed")

      // Calculate earnings (only from completed orders)
      const todayEarnings = todayCompletedOrders.reduce((sum, order) => sum + order.total_amount, 0)
      const monthlyEarnings = monthlyCompletedOrders.reduce((sum, order) => sum + order.total_amount, 0)

      // Order status counts
      const pendingOrders = orders.filter((order) => order.status === "pending").length
      const inProgressOrders = orders.filter((order) => order.status === "in_progress").length
      const cancelledOrders = orders.filter((order) => order.status === "cancelled").length

      // Calculate average order value
      const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total_amount, 0)
      const averageOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0

      // Calculate top selling items
      const itemCounts: { [key: string]: { quantity: number; revenue: number } } = {}

      completedOrders.forEach((order) => {
        order.items.forEach((item) => {
          if (!itemCounts[item.name]) {
            itemCounts[item.name] = { quantity: 0, revenue: 0 }
          }
          itemCounts[item.name].quantity += item.quantity
          itemCounts[item.name].revenue += item.price * item.quantity
        })
      })

      const topSellingItems = Object.entries(itemCounts)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5)

      // Calculate hourly stats for today
      const hourlyStats = Array.from({ length: 24 }, (_, hour) => {
        const hourOrders = todayOrders.filter((order) => {
          const orderHour = new Date(order.created_at).getHours()
          return orderHour === hour
        })

        const hourCompletedOrders = hourOrders.filter((order) => order.status === "completed")
        const hourRevenue = hourCompletedOrders.reduce((sum, order) => sum + order.total_amount, 0)

        return {
          hour,
          orders: hourOrders.length,
          revenue: hourRevenue,
        }
      })

      setAnalytics({
        todayEarnings,
        monthlyEarnings,
        totalOrders: orders.length,
        pendingOrders,
        inProgressOrders,
        completedOrders: completedOrders.length,
        cancelledOrders,
        todayOrders: todayOrders.length,
        monthlyOrders: monthlyOrders.length,
        averageOrderValue,
        topSellingItems,
        hourlyStats,
      })
    } catch (error) {
      console.error("Error fetching analytics:", error)
      toast({
        title: "Error loading analytics",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) throw error
      setRecentOrders(data || [])
    } catch (error) {
      console.error("Error fetching recent orders:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
    }).format(amount)
  }

  const formatTime = (hour: number) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hour12: true,
    }).format(new Date().setHours(hour, 0, 0, 0))
  }

  // Add this new function after the existing functions

  const clearAllAnalytics = async () => {
    if (
      !confirm(
        "⚠️ DANGER: This will permanently delete ALL order data and reset analytics to zero. This action cannot be undone. Are you absolutely sure?",
      )
    ) {
      return
    }

    // Double confirmation for such a destructive action
    if (
      !confirm(
        "🚨 FINAL WARNING: You are about to delete ALL orders (pending, in progress, completed, cancelled) and ALL analytics data. Type 'DELETE' in the next prompt to confirm.",
      )
    ) {
      return
    }

    const userConfirmation = prompt("Type 'DELETE' to confirm permanent deletion of all data:")
    if (userConfirmation !== "DELETE") {
      toast({
        title: "Reset cancelled",
        description: "Data deletion was cancelled.",
      })
      return
    }

    setClearingAnalytics(true)
    try {
      // Delete all orders (this will reset all analytics)
      const { error: ordersError } = await supabase
        .from("orders")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000") // Delete all orders

      if (ordersError) throw ordersError

      // Delete all order status logs
      const { error: logsError } = await supabase
        .from("order_status_logs")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000") // Delete all logs

      if (logsError) throw logsError

      // Reset analytics state
      setAnalytics({
        todayEarnings: 0,
        monthlyEarnings: 0,
        totalOrders: 0,
        pendingOrders: 0,
        inProgressOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        todayOrders: 0,
        monthlyOrders: 0,
        averageOrderValue: 0,
        topSellingItems: [],
        hourlyStats: Array.from({ length: 24 }, (_, hour) => ({
          hour,
          orders: 0,
          revenue: 0,
        })),
      })

      setRecentOrders([])

      toast({
        title: "Analytics reset complete! 🔄",
        description: "All order data and analytics have been permanently deleted.",
      })
    } catch (error) {
      console.error("Error clearing analytics:", error)
      toast({
        title: "Error clearing analytics",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setClearingAnalytics(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-600">No analytics data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-2 sm:p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8 w-full">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="mb-2 sm:mb-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 w-full min-w-0">
            <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate">
              Restaurant Analytics
            </h1>
            <p className="text-gray-600 text-xs xs:text-sm sm:text-base truncate">Complete overview of your restaurant performance</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <div className="text-left sm:text-right w-full sm:w-auto">
              <p className="text-xs sm:text-sm text-gray-500">Last updated</p>
              <p className="font-medium text-xs sm:text-base">{new Date().toLocaleString()}</p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={clearAllAnalytics}
              disabled={clearingAnalytics}
              className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
            >
              {clearingAnalytics ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Resetting...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reset All Analytics
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 xs:gap-4 sm:gap-6 mb-8">
          {/* Today's Earnings */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800">Today's Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">{formatCurrency(analytics.todayEarnings)}</div>
              <p className="text-xs text-green-600 mt-1">From {analytics.todayOrders} orders today</p>
            </CardContent>
          </Card>

          {/* Monthly Earnings */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">Monthly Earnings</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{formatCurrency(analytics.monthlyEarnings)}</div>
              <p className="text-xs text-blue-600 mt-1">From {analytics.monthlyOrders} orders this month</p>
            </CardContent>
          </Card>

          {/* Average Order Value */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-800">Avg Order Value</CardTitle>
              <Target className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700">{formatCurrency(analytics.averageOrderValue)}</div>
              <p className="text-xs text-purple-600 mt-1">Across {analytics.completedOrders} completed orders</p>
            </CardContent>
          </Card>

          {/* Total Orders */}
          <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-800">Total Orders</CardTitle>
              <Users className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-700">{analytics.totalOrders}</div>
              <p className="text-xs text-orange-600 mt-1">All time orders</p>
            </CardContent>
          </Card>
        </div>

        {/* Order Status Overview */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 xs:gap-4 mb-8">
          <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-800">Pending Orders</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-700">{analytics.pendingOrders}</div>
              <Badge className="bg-yellow-100 text-yellow-800 mt-2">Needs Attention</Badge>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">In Progress</CardTitle>
              <ChefHat className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700">{analytics.inProgressOrders}</div>
              <Badge className="bg-blue-100 text-blue-800 mt-2">Being Prepared</Badge>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700">{analytics.completedOrders}</div>
              <Badge className="bg-green-100 text-green-800 mt-2">Delivered</Badge>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-800">Cancelled</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-700">{analytics.cancelledOrders}</div>
              <Badge className="bg-red-100 text-red-800 mt-2">Cancelled</Badge>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Top Selling Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Top Selling Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topSellingItems.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-gray-600">{item.quantity} sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{formatCurrency(item.revenue)}</p>
                      <p className="text-xs text-gray-500">Revenue</p>
                    </div>
                  </div>
                ))}
                {analytics.topSellingItems.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No sales data available</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-600" />
                Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentOrders.slice(0, 8).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold">Table #{order.table_number}</p>
                      <p className="text-sm text-gray-600">{new Date(order.created_at).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(order.total_amount)}</p>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                ))}
                {recentOrders.length === 0 && <p className="text-center text-gray-500 py-8">No recent orders</p>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hourly Performance */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Clock className="h-5 w-5 text-purple-600" />
              Today's Hourly Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-6 md:grid-cols-12 gap-1 xs:gap-2">
              {analytics.hourlyStats.map((stat) => (
                <div key={stat.hour} className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-600">{formatTime(stat.hour)}</p>
                  <p className="text-sm font-bold text-blue-600">{stat.orders}</p>
                  <p className="text-xs text-green-600">{formatCurrency(stat.revenue)}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-col xs:flex-row sm:flex-row justify-center gap-2 xs:gap-4 sm:gap-6 text-xs xs:text-sm sm:text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded"></div>
                <span>Orders</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-600 rounded"></div>
                <span>Revenue</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}



