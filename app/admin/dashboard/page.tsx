"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Clock, CheckCircle, XCircle, MessageSquare, Printer, LogOut } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import type { Order } from "@/lib/types"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useToast } from "@/hooks/use-toast"

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const [previewOrder, setPreviewOrder] = useState<Order | null>(null)
  const [clearingCompleted, setClearingCompleted] = useState(false)
  const [clearingCancelled, setClearingCancelled] = useState(false)
  const [activeTab, setActiveTab] = useState("pending")
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    checkAuth()
    fetchOrders()

    // Set up real-time subscription with better error handling
    const channel = supabase
      .channel("admin-orders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        (payload) => {
          console.log("Real-time order update:", payload)

          if (payload.eventType === "INSERT") {
            setOrders((prevOrders) => [payload.new as Order, ...prevOrders])
          } else if (payload.eventType === "UPDATE") {
            setOrders((prevOrders) =>
              prevOrders.map((order) => (order.id === payload.new.id ? (payload.new as Order) : order)),
            )
          } else if (payload.eventType === "DELETE") {
            setOrders((prevOrders) => prevOrders.filter((order) => order.id !== payload.old.id))
          }
        },
      )
      .subscribe((status) => {
        console.log("Subscription status:", status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      router.push("/admin/login")
      return
    }

    const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (!userData || !["admin", "staff", "kitchen"].includes(userData.role)) {
      await supabase.auth.signOut()
      router.push("/admin/login")
    }
  }

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    // Optimistically update the UI immediately
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId
          ? { ...order, status: status as Order["status"], updated_at: new Date().toISOString() }
          : order,
      ),
    )

    // Switch tab after status update
    if (status === "in_progress") {
      setActiveTab("in_progress")
    } else if (status === "completed") {
      setActiveTab("completed")
    } else if (status === "cancelled") {
      setActiveTab("cancelled")
    }

    try {
      const { error } = await supabase
        .from("orders")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)

      if (error) throw error

      await supabase.from("order_status_logs").insert({
        order_id: orderId,
        status,
        timestamp: new Date().toISOString(),
      })

      toast({
        title: "Order updated",
        description: `Order status changed to ${status.replace("_", " ")}`,
      })
    } catch (error) {
      console.error("Error updating order:", error)
      fetchOrders()
      toast({
        title: "Error updating order",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }


  const printOrder = async (order: Order) => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) {
      toast({
        title: "Print blocked",
        description: "Please allow popups to print orders.",
        variant: "destructive",
      })
      return
    }

    // Fetch LATEST billing settings in real-time - this ensures any changes are reflected immediately
    let billingSettings: any[] = []
    try {
      // Force fresh data by adding timestamp to prevent caching
      const { data, error } = await supabase
        .from("billing_settings")
        .select("*")
        .eq("is_active", true)
        .order("calculation_order")
        .order("updated_at", { ascending: false }) // Get most recently updated first

      if (!error && data) {
        billingSettings = data
        console.log("✅ Fetched latest billing settings for print:", billingSettings.length, "active fields")
      } else {
        console.warn("⚠️ Could not fetch billing settings:", error)
      }
    } catch (error) {
      console.error("❌ Error fetching billing settings for print:", error)
      toast({
        title: "Warning",
        description: "Could not fetch latest billing settings. Using basic calculation.",
        variant: "destructive",
      })
    }

    // Calculate billing breakdown with LATEST settings
    const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    let runningTotal = subtotal
    const calculations: Array<{ label: string; amount: number; type: string }> = []

    // Apply each billing field in the correct order
    billingSettings.forEach((field) => {
      let amount = 0
      const baseAmount = field.applies_to === "subtotal" ? subtotal : runningTotal

      if (field.field_type === "percentage" || field.field_type === "tax") {
        amount = (baseAmount * field.field_value) / 100
      } else if (field.field_type === "fixed_amount") {
        amount = field.field_value
      }

      // Handle discounts as negative amounts
      if (field.field_name.includes("discount") && amount > 0) {
        amount = -amount
      }

      calculations.push({
        label: field.field_label,
        amount,
        type: field.field_type,
      })

      runningTotal += amount
    })

    const finalTotal = Math.max(0, runningTotal)

    console.log("🧾 Print calculations:", {
      subtotal: subtotal.toFixed(2),
      calculations: calculations.map((c) => `${c.label}: ${c.amount.toFixed(2)}`),
      finalTotal: finalTotal.toFixed(2),
      originalOrderTotal: order.total_amount.toFixed(2),
    })

    const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Order Receipt - ${order.id.slice(0, 8)}</title>
      <style>
        @media print {
          html, body {
            width: 80mm;
            min-width: 80mm;
            max-width: 80mm;
            margin: 0;
            padding: 0;
            font-size: 14px;
            background: #fff;
          }
          .header h1 {
            font-size: 20px;
          }
          .total {
            font-size: 20px;
          }
        }
        body { 
          font-family: Arial, sans-serif; 
          max-width: 400px; 
          margin: 0 auto; 
          padding: 20px;
          line-height: 1.4;
          font-size: 14px;
        }
        .header { 
          text-align: center; 
          border-bottom: 2px solid #000; 
          padding-bottom: 10px; 
          margin-bottom: 20px;
        }
        .order-info { 
          margin-bottom: 20px; 
        }
        .items { 
          border-bottom: 1px solid #ccc; 
          padding-bottom: 10px; 
          margin-bottom: 10px;
        }
        .item { 
          display: flex; 
          justify-content: space-between; 
          margin-bottom: 5px;
        }
        .billing-section {
          margin: 15px 0;
          padding: 10px 0;
          border-top: 1px dashed #ccc;
        }
        .billing-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
          font-size: 14px;
        }
        .subtotal-row {
          font-weight: bold;
          border-top: 1px solid #ccc;
          padding-top: 5px;
          margin-top: 10px;
        }
        .total { 
          font-weight: bold; 
          font-size: 18px; 
          text-align: right;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 2px solid #000;
        }
        .notes {
          background: #f5f5f5;
          padding: 10px;
          margin: 10px 0;
          border-radius: 4px;
        }
        .discount {
          color: #16a34a;
        }
        .charge {
          color: #dc2626;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Bella Vista Restaurant</h1>
        <p>Order Receipt</p>
      </div>
      
      <div class="order-info">
        <p><strong>Order ID:</strong> ${order.id.slice(0, 8)}</p>
        <p><strong>Table:</strong> #${order.table_number}</p>
        <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleString()}</p>
        <p><strong>Status:</strong> ${order.status.replace("_", " ").toUpperCase()}</p>
      </div>

      <div class="items">
        <h3>Order Items:</h3>
        ${order.items
          .map(
            (item) => `
          <div class="item">
            <span>${item.quantity}x ${item.name}</span>
            <span>₹${(item.price * item.quantity).toFixed(2)}</span>
          </div>
          ${item.note ? `<div style="font-size: 12px; color: #666; margin-left: 20px;">Note: ${item.note}</div>` : ""}
        `,
          )
          .join("")}
      </div>

      ${
        order.special_notes
          ? `
        <div class="notes">
          <strong>Special Instructions:</strong><br>
          ${order.special_notes}
        </div>
      `
          : ""
      }

      <div class="billing-section">
        <div class="billing-row subtotal-row">
          <span>Subtotal:</span>
          <span>₹${subtotal.toFixed(2)}</span>
        </div>
        
        ${calculations
          .map(
            (calc) => `
          <div class="billing-row ${calc.amount < 0 ? "discount" : "charge"}">
            <span>${calc.label}:</span>
            <span>${calc.amount < 0 ? "-" : ""}₹${Math.abs(calc.amount).toFixed(2)}</span>
          </div>
        `,
          )
          .join("")}
      </div>

      <div class="total">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>TOTAL:</span>
          <span>₹${finalTotal.toFixed(2)}</span>
        </div>
      </div>

      <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #666;">
        <p>Thank you for dining with us!</p>
        <p>Printed on ${new Date().toLocaleString()}</p>
        ${billingSettings.length > 0 ? "<p>All charges calculated as per restaurant policy</p>" : ""}
      </div>
    </body>
    </html>
  `

    printWindow.document.write(printContent)
    printWindow.document.close()

    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print()
      printWindow.close()
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/admin/login")
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

  const filterOrdersByStatus = (status: string) => {
    return orders.filter((order) => order.status === status)
  }

  const OrderCard = ({ order }: { order: Order }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <CardTitle className="text-base sm:text-lg">Table #{order.table_number}</CardTitle>
            <p className="text-xs sm:text-sm text-gray-600">{new Date(order.created_at).toLocaleString()}</p>
            <p className="text-xs sm:text-sm text-gray-600">Order ID: {order.id.slice(0, 8)}</p>
          </div>
          <div className="text-right mt-2 sm:mt-0">
            <Badge className={getStatusColor(order.status)}>{order.status.replace("_", " ").toUpperCase()}</Badge>
            <p className="text-base sm:text-lg font-bold mt-1">₹{order.total_amount.toFixed(2)}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-4">
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between text-xs sm:text-sm">
              <span>
                {item.quantity}x {item.name}
              </span>
              <span>₹{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        {order.special_notes && (
          <div className="mb-4 p-2 bg-yellow-50 rounded">
            <p className="text-xs sm:text-sm font-medium text-yellow-800">Special Notes:</p>
            <p className="text-xs sm:text-sm text-yellow-700">{order.special_notes}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {order.status === "pending" && (
            <>
              <Button size="sm" onClick={() => updateOrderStatus(order.id, "in_progress")} className="w-full sm:w-auto">
                <CheckCircle className="h-4 w-4 mr-1" />Confirm
              </Button>
              <Button size="sm" variant="destructive" onClick={() => updateOrderStatus(order.id, "cancelled")} className="w-full sm:w-auto">
                <XCircle className="h-4 w-4 mr-1" />Cancel Order
              </Button>
            </>
          )}

          {order.status === "in_progress" && (
            <Button
              size="sm"
              onClick={() => completeOrderWithMerge(order.id)}
              className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
            >
              <CheckCircle className="h-4 w-4 mr-1" />Complete
            </Button>
          )}

          <Button variant="outline" size="sm" onClick={() => printOrder(order)} className="w-full sm:w-auto">
            <Printer className="h-4 w-4 mr-1" />Print
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPreviewOrder(order)} className="w-full sm:w-auto">
            Preview Bill
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  // Add these new functions after the existing functions

  const clearCompletedOrders = async () => {
    if (!confirm("Are you sure you want to permanently delete all completed orders? This action cannot be undone.")) {
      return
    }

    setClearingCompleted(true)
    try {
      const { error } = await supabase.from("orders").delete().eq("status", "completed")

      if (error) throw error

      // Update local state to remove completed orders
      setOrders((prevOrders) => prevOrders.filter((order) => order.status !== "completed"))

      toast({
        title: "Completed orders cleared! ✅",
        description: "All completed orders have been permanently deleted.",
      })
    } catch (error) {
      console.error("Error clearing completed orders:", error)
      toast({
        title: "Error clearing orders",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setClearingCompleted(false)
    }
  }

  const clearCancelledOrders = async () => {
    if (!confirm("Are you sure you want to permanently delete all cancelled orders? This action cannot be undone.")) {
      return
    }

    setClearingCancelled(true)
    try {
      const { error } = await supabase.from("orders").delete().eq("status", "cancelled")

      if (error) throw error

      // Update local state to remove cancelled orders
      setOrders((prevOrders) => prevOrders.filter((order) => order.status !== "cancelled"))

      toast({
        title: "Cancelled orders cleared! ✅",
        description: "All cancelled orders have been permanently deleted.",
      })
    } catch (error) {
      console.error("Error clearing cancelled orders:", error)
      toast({
        title: "Error clearing orders",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setClearingCancelled(false)
    }
  }

  // Helper to merge CartItems by item_id and sum quantities
  function mergeCartItems(itemsArr: CartItem[][]): CartItem[] {
    const itemMap = new Map<string, CartItem>()
    for (const items of itemsArr) {
      for (const item of items) {
        if (itemMap.has(item.item_id)) {
          const existing = itemMap.get(item.item_id)!
          itemMap.set(item.item_id, {
            ...existing,
            quantity: existing.quantity + item.quantity
          })
        } else {
          itemMap.set(item.item_id, { ...item })
        }
      }
    }
    return Array.from(itemMap.values())
  }

  // New logic for merging and completing in-progress orders by table
  const completeOrderWithMerge = async (orderId: string) => {
    const orderToComplete = orders.find(o => o.id === orderId)
    if (!orderToComplete) return
    const tableNum = orderToComplete.table_number
    // Find all in-progress orders for this table
    const inProgressOrders = orders.filter(o => o.status === "in_progress" && o.table_number === tableNum)
    if (inProgressOrders.length <= 1) {
      // No merge needed, just complete as usual
      await updateOrderStatus(orderId, "completed")
      return
    }
    // Merge items
    const mergedItems = mergeCartItems(inProgressOrders.map(o => o.items))
    // Sum total_amount
    const mergedTotal = inProgressOrders.reduce((sum, o) => sum + o.total_amount, 0)
    // Use latest updated_at as completion time
    const latestUpdated = inProgressOrders.reduce((latest, o) => new Date(o.updated_at) > new Date(latest) ? o.updated_at : latest, inProgressOrders[0].updated_at)
    // Remove all original in-progress orders
    const idsToRemove = inProgressOrders.map(o => o.id)
    // Delete originals and insert merged completed order
    try {
      // Remove originals
      const { error: delErr } = await supabase.from("orders").delete().in("id", idsToRemove)
      if (delErr) throw delErr
      // Insert merged completed order
      const { error: insErr } = await supabase.from("orders").insert([
        {
          table_number: tableNum,
          items: mergedItems,
          total_amount: mergedTotal,
          status: "completed",
          special_notes: null,
          admin_message: null,
          customer_message: null,
          rating: null,
          feedback: null,
          created_at: new Date().toISOString(),
          updated_at: latestUpdated
        }
      ])
      if (insErr) throw insErr
      // Log status for each original order
      for (const oid of idsToRemove) {
        await supabase.from("order_status_logs").insert({
          order_id: oid,
          status: "completed",
          timestamp: new Date().toISOString(),
        })
      }
      toast({
        title: "Orders merged & completed",
        description: `All in-progress orders for table #${tableNum} merged and completed.`
      })
      // Refresh orders
      fetchOrders()
      setActiveTab("completed")
    } catch (err) {
      console.error("Error merging/completing orders:", err)
      toast({
        title: "Error completing orders",
        description: "Please try again.",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-2 sm:p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-600 text-sm sm:text-base">Manage orders and restaurant operations</p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={() => router.push('/admin/analytics')} className="w-full sm:w-auto">Analytics</Button>
            <Button variant="outline" onClick={() => router.push('/admin/tables')} className="w-full sm:w-auto">Table Management</Button>
            <Button variant="outline" onClick={() => router.push('/admin/menu')} className="w-full sm:w-auto">Menu Management</Button>
            <Button variant="outline" onClick={() => router.push('/admin/settings')} className="w-full sm:w-auto">Settings</Button>
            <Button variant="outline" onClick={handleLogout} className="w-full sm:w-auto">
              <LogOut className="h-4 w-4 mr-2" />Logout
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="pending" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="pending" className="relative">
              Pending
              {filterOrdersByStatus("pending").length > 0 && (
                <Badge className="ml-2 bg-red-500 text-white">{filterOrdersByStatus("pending").length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="in_progress">
              In Progress
              {filterOrdersByStatus("in_progress").length > 0 && (
                <Badge className="ml-2 bg-blue-500 text-white">{filterOrdersByStatus("in_progress").length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled" className="relative">
              Cancelled
              {filterOrdersByStatus("cancelled").length > 0 && (
                <Badge className="ml-2 bg-red-500 text-white">{filterOrdersByStatus("cancelled").length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <div className="space-y-4">
              {filterOrdersByStatus("pending").length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No pending orders</p>
                  </CardContent>
                </Card>
              ) : (
                filterOrdersByStatus("pending")
                  .slice()
                  .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                  .map((order) => <OrderCard key={order.id} order={order} />)
              )}
            </div>
          </TabsContent>

          <TabsContent value="in_progress">
            <div className="space-y-4">
              {filterOrdersByStatus("in_progress").length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No orders in progress</p>
                  </CardContent>
                </Card>
              ) : (
                filterOrdersByStatus("in_progress").map((order) => <OrderCard key={order.id} order={order} />)
              )}
            </div>
          </TabsContent>

          <TabsContent value="completed">
            <div className="space-y-4">
              {filterOrdersByStatus("completed").length > 0 && (
                <div className="flex justify-end">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={clearCompletedOrders}
                    disabled={clearingCompleted}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {clearingCompleted ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Clearing...
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Clear All Completed Orders
                      </>
                    )}
                  </Button>
                </div>
              )}

              {filterOrdersByStatus("completed").length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No completed orders</p>
                  </CardContent>
                </Card>
              ) : (
                filterOrdersByStatus("completed").map((order) => <OrderCard key={order.id} order={order} />)
              )}
            </div>
          </TabsContent>

          <TabsContent value="cancelled">
            <div className="space-y-4">
              {filterOrdersByStatus("cancelled").length > 0 && (
                <div className="flex justify-end">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={clearCancelledOrders}
                    disabled={clearingCancelled}
                    className="bg-red-600 hover:bg-red-700 mt-6"
                  >
                    {clearingCancelled ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Clearing...
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Clear All Cancelled Orders
                      </>
                    )}
                  </Button>
                </div>
              )}

              {filterOrdersByStatus("cancelled").length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No cancelled orders</p>
                  </CardContent>
                </Card>
              ) : (
                filterOrdersByStatus("cancelled").map((order) => <OrderCard key={order.id} order={order} />)
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    {previewOrder && (
      <Dialog open={!!previewOrder} onOpenChange={(open) => !open && setPreviewOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bill Preview</DialogTitle>
          </DialogHeader>
          <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {/* Bill preview HTML, reuse printOrder logic for content */}
            {/* You may want to refactor printOrder to extract bill HTML generation into a function for reuse */}
            {/* For now, show a simple summary */}
            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{JSON.stringify(previewOrder, null, 2)}</pre>
          </div>
          <Button onClick={() => printOrder(previewOrder)} className="mt-4 w-full">Print</Button>
          <Button onClick={() => setPreviewOrder(null)} className="mt-2 w-full">Close</Button>
        </DialogContent>
      </Dialog>
    )}
    </div>
  )
}

// Move these functions inside the AdminDashboardPage component, just above the return statement
