




"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Clock, CheckCircle, XCircle, Star, ShoppingCart, Plus, ArrowLeft } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import type { Order } from "@/lib/types"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useToast } from "@/hooks/use-toast"
import { useCart } from "@/lib/cart-context"
import type { BillingSettings } from "@/lib/types"
import jsPDF from "jspdf"




export default function OrderStatusPage({ params }: { params: { orderId: string } }) {
  const { orderId } = React.use(params)
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [submittingFeedback, setSubmittingFeedback] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const { dispatch } = useCart()
  const [billingSettings, setBillingSettings] = useState<BillingSettings[]>([])

  useEffect(() => {
    fetchOrder()
    fetchBillingSettings()

    // Set up real-time subscription with better handling
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          console.log("Order status updated:", payload.new)
          setOrder((prevOrder) => {
            const newOrder = payload.new as Order
            return newOrder
          })
          // Show toast notification for status changes
          setTimeout(() => {
            setOrder((prevOrder) => {
              const newOrder = payload.new as Order
              if (newOrder.status !== prevOrder?.status) {
                toast({
                  title: "Order Status Updated! 🔔",
                  description: `Your order is now ${newOrder.status.replace("_", " ")}`,
                })
              }
              if (newOrder.admin_message && newOrder.admin_message !== prevOrder?.admin_message) {
                toast({
                  title: "Message from Kitchen 👨‍🍳",
                  description: newOrder.admin_message,
                })
              }
              return prevOrder
            })
          }, 0)
        },
      )
      .subscribe((status) => {
        console.log("Order subscription status:", status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [orderId])

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase.from("orders").select("*").eq("id", orderId).single()

      if (error) throw error
      setOrder(data)
    } catch (error) {
      console.error("Error fetching order:", error)
      toast({
        title: "Error loading order",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchBillingSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("billing_settings")
        .select("*")
        .eq("is_active", true)
        .order("calculation_order")
      if (error) throw error
      setBillingSettings(data || [])
    } catch (error) {
      console.error("Error fetching billing settings:", error)
    }
  }

  const cancelOrder = async () => {
    if (!order || order.status !== "pending") return

    try {
      const { error } = await supabase.from("orders").update({ status: "cancelled" }).eq("id", order.id)

      if (error) throw error

      toast({
        title: "Order cancelled ❌",
        description: "Your order has been cancelled successfully.",
      })
    } catch (error) {
      console.error("Error cancelling order:", error)
      toast({
        title: "Error cancelling order",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }

  const continueOrdering = () => {
    if (!order) return

    // Set the table number in cart context
    dispatch({ type: "SET_TABLE", payload: order.table_number })

    // Navigate to menu
    router.push("/menu")
  }

  const submitFeedback = async () => {
    if (!order || rating === 0) return

    setSubmittingFeedback(true)
    try {
      const { error } = await supabase
        .from("orders")
        .update({
          rating,
          feedback: feedback.trim() || null,
        })
        .eq("id", order.id)

      if (error) throw error

      toast({
        title: "Thank you for your feedback! 🙏",
        description: "Your rating has been submitted.",
      })

      setOrder({ ...order, rating, feedback })
    } catch (error) {
      console.error("Error submitting feedback:", error)
      toast({
        title: "Error submitting feedback",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmittingFeedback(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-6 w-6 text-yellow-600 animate-pulse" />
      case "in_progress":
        return <Clock className="h-6 w-6 text-blue-600 animate-spin" />
      case "completed":
        return <CheckCircle className="h-6 w-6 text-green-600" />
      case "cancelled":
        return <XCircle className="h-6 w-6 text-red-600" />
      default:
        return <Clock className="h-6 w-6 text-gray-600" />
    }
  }

  function downloadBill() {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    // Header
    doc.setFontSize(28);
    doc.setFont(undefined, "bold");
    doc.text("Bella Vista", 297.5, 60, { align: "center" });
    doc.setFontSize(16);
    doc.setFont(undefined, "normal");
    doc.text("Order Receipt", 297.5, 90, { align: "center" });
    doc.setLineWidth(1.2);
    doc.line(60, 105, 535, 105);
    // Order Info
    let y = 130;
    doc.setFontSize(12);
    doc.setFont(undefined, "normal");
    doc.text("Order ID:", 70, y);
    doc.text(`${order?.id?.slice(0, 8) || "-"}`, 170, y);
    y += 20;
    doc.text("Table:", 70, y);
    doc.text(`${order?.table_number || "-"}`, 170, y);
    y += 20;
    doc.text("Date:", 70, y);
    doc.text(`${order?.created_at ? new Date(order.created_at).toLocaleString() : "-"}`, 170, y);
    y += 30;
    // Items Table Header
    doc.setFont(undefined, "bold");
    doc.setFontSize(13);
    doc.text("Item", 70, y);
    doc.text("Qty", 300, y, { align: "right" });
    doc.text("Price", 370, y, { align: "right" });
    doc.text("Total", 470, y, { align: "right" });
    y += 8;
    doc.setLineWidth(0.8);
    doc.line(60, y, 535, y);
    y += 18;
    doc.setFont(undefined, "normal");
    doc.setFontSize(12);
    (order?.items || []).forEach(item => {
      doc.text(`${item.name}`, 70, y);
      doc.text(`${item.quantity}`, 300, y, { align: "right" });
      doc.text(`Rs. ${item.price.toFixed(2)}`, 370, y, { align: "right" });
      doc.text(`Rs. ${(item.price * item.quantity).toFixed(2)}`, 470, y, { align: "right" });
      y += 18;
    });
    y += 5;
    doc.setLineWidth(0.8);
    doc.line(60, y, 535, y);
    y += 20;
    // Billing Fields
    (billingSettings || []).forEach(field => {
      let baseAmount = field.applies_to === "subtotal" ? order?.total_amount || 0 : order?.total_amount || 0;
      let amount = 0;
      if (field.field_type === "percentage" || field.field_type === "tax") {
        amount = (baseAmount * field.field_value) / 100;
      } else if (field.field_type === "fixed_amount") {
        amount = field.field_value;
      }
      doc.text(`${field.field_label}:`, 320, y);
      doc.text(`Rs. ${amount.toFixed(2)}`, 470, y, { align: "right" });
      y += 18;
    });
    y += 5;
    doc.setLineWidth(0.8);
    doc.line(60, y, 535, y);
    y += 20;
    // Total
    doc.setFont(undefined, "bold");
    doc.setFontSize(15);
    doc.text("Total:", 320, y);
    doc.text(`Rs. ${order?.total_amount?.toFixed(2) || "-"}`, 470, y, { align: "right" });
    y += 30;
    // Footer
    doc.setFont(undefined, "normal");
    doc.setFontSize(13);
    doc.text("Thank you for dining with us!", 297.5, y, { align: "center" });
    doc.save(`Order_${order?.id?.slice(0, 8) || "-"}_Bill.pdf`);
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "from-yellow-400 to-orange-500"
      case "in_progress":
        return "from-blue-400 to-blue-600"
      case "completed":
        return "from-green-400 to-green-600"
      case "cancelled":
        return "from-red-400 to-red-600"
      default:
        return "from-gray-400 to-gray-600"
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
        <div className="mt-4 text-lg font-semibold">Loading order details...</div>
      </div>
    )
  }
  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <XCircle className="h-12 w-12 text-red-500 mb-4" />
        <div className="text-lg font-semibold">Order not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <style>{`
        @page {
          size: 80mm auto;
          margin: 0;
        }
        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 80mm;
            font-family: Arial, sans-serif;
            font-size: 13px;
            background: #fff;
          }
          .print\\:block {
            page-break-inside: avoid;
            width: 80mm !important;
            box-sizing: border-box;
            margin: 0 auto !important;
            padding: 10px !important;
            border: 1px solid #000 !important;
            background: #fff !important;
            box-shadow: none !important;
            font-size: 13px !important;
            min-width: 80mm !important;
            max-width: 80mm !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
          }
          .print\\:block * {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .print\\:block h2, .print\\:block .text-xl, .print\\:block .font-bold {
            font-size: 16px !important;
          }
          .print\\:block .text-lg {
            font-size: 14px !important;
          }
          .print\\:block .text-sm {
            font-size: 12px !important;
          }
          .print\\:block .text-center {
            text-align: center !important;
          }
          .print\\:block .print-hidden {
            display: none !important;
          }
        }
      `}</style>



<div
  onClick={() => router.push("/spin")}
  className="relative group cursor-pointer p-4 rounded-xl bg-[#4B2994] transition-all duration-300 shadow-xl"
>
  <div className="absolute inset-0 bg-lime-400 opacity-10 rounded-xl blur-lg -z-10" />
  
  <div className="flex items-center gap-3">
    {/* Minimal dice icon via custom SVG */}
    <div className="p-3 bg-white/10 rounded-full">
      <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" className="w-5 h-5 text-white">
        <circle cx="6" cy="6" r="1.5" />
        <circle cx="18" cy="6" r="1.5" />
        <circle cx="12" cy="12" r="1.5" />
        <circle cx="6" cy="18" r="1.5" />
        <circle cx="18" cy="18" r="1.5" />
      </svg>
    </div>
    <div className="flex flex-col">
      <span className="text-sm font-semibold text-white leading-tight">⏳ Waiting? Let’s Make it Fun!</span>
    </div>
  </div>
</div>





      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {/* Enhanced Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-8 animate-slide-up text-center sm:text-left">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/menu")}
            className="hover:bg-white/50 backdrop-blur-sm rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Order Status
            </h1>
            <div className="flex items-center justify-center gap-4 text-gray-600 mt-2">
              <span>Order ID: {order.id.slice(0, 8)}</span>
              <span>•</span>
              <span>Table #{order.table_number}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Enhanced Status Progress */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  {getStatusIcon(order.status)}
                  Current Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center mb-6">
                  <div
                    className={`px-6 py-3 rounded-full bg-gradient-to-r ${getStatusColor(order.status)} text-white font-bold text-lg shadow-lg`}
                  >
                    {order.status.replace("_", " ").toUpperCase()}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-center text-sm gap-4 mb-6">
                  <div
                    className={`text-center ${order.status === "pending" ? "text-orange-600 font-semibold" : "text-gray-400"}`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full mx-auto mb-2 ${order.status === "pending" ? "bg-orange-500 animate-pulse" : "bg-gray-300"}`}
                    ></div>
                    Pending
                  </div>
                  <div className="flex-1 h-1 bg-gray-200 mx-4 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${["in_progress", "completed"].includes(order.status) ? "bg-gradient-to-r from-blue-500 to-green-500 w-1/2" : "w-0"}`}
                    ></div>
                  </div>
                  <div
                    className={`text-center ${order.status === "in_progress" ? "text-blue-600 font-semibold" : order.status === "completed" ? "text-green-600 font-semibold" : "text-gray-400"}`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full mx-auto mb-2 ${order.status === "in_progress" ? "bg-blue-500 animate-pulse" : order.status === "completed" ? "bg-green-500" : "bg-gray-300"}`}
                    ></div>
                    In Progress
                  </div>
                  <div className="flex-1 h-1 bg-gray-200 mx-4 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${order.status === "completed" ? "bg-gradient-to-r from-green-500 to-emerald-500 w-full" : "w-0"}`}
                    ></div>
                  </div>
                  <div
                    className={`text-center ${order.status === "completed" ? "text-green-600 font-semibold" : "text-gray-400"}`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full mx-auto mb-2 ${order.status === "completed" ? "bg-green-500" : "bg-gray-300"}`}
                    ></div>
                    Completed
                  </div>
                </div>

                {order.status === "pending" && (
                  <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                    <Clock className="h-8 w-8 text-orange-500 mx-auto mb-2 animate-pulse" />
                    <p className="text-orange-700 font-medium">Estimated wait time: 15-25 minutes</p>
                  </div>
                )}

                {order.admin_message && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-l-4 border-blue-500">
                    <p className="text-sm font-medium text-blue-900 mb-1">👨‍🍳 Message from kitchen:</p>
                    <p className="text-blue-800">{order.admin_message}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            

            {/* Enhanced Order Items */}
            <Card
              className="bg-white/80 backdrop-blur-sm border-0 shadow-lg animate-slide-up"
              style={{ animationDelay: "0.1s" }}
            >
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-lg">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity} × ₹{item.price.toFixed(2)}
                        </p>
                        {item.note && (
                          <p className="text-sm text-blue-600 italic bg-blue-50 px-2 py-1 rounded mt-1">
                            Note: {item.note}
                          </p>
                        )}
                      </div>
                      <p className="font-bold text-lg text-green-600">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                {order.special_notes && (
                  <>
                    <Separator className="my-4" />
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <p className="font-medium mb-1 text-yellow-800">Special Instructions:</p>
                      <p className="text-yellow-700">{order.special_notes}</p>
                    </div>
                  </>
                )}

                <Separator className="my-4" />
                <div className="flex justify-between items-center text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  <span>Total Amount</span>
                  <span>₹{order.total_amount.toFixed(2)}</span>
                </div>
                {/* Bill and Print Button - Only show when order is completed */}
                {order.status === "completed" && (
                  <div className="mt-6 p-4 bg-white rounded-lg shadow border border-gray-200 print:block print:shadow-none print:border-0 print:mt-0 print:p-0">
                    <h2 className="text-xl font-bold mb-2 print:hidden">Bill</h2>
                    <div className="mb-2 text-center">
                      <span className="block text-lg font-bold">Bella Vista</span>
                      <span className="block text-sm text-gray-500">Order Receipt</span>
                    </div>
                    <div className="mb-2">
                      <div className="flex justify-between"><span>Order ID:</span><span>{order.id.slice(0, 8)}</span></div>
                      <div className="flex justify-between"><span>Table:</span><span>{order.table_number}</span></div>
                      <div className="flex justify-between"><span>Date:</span><span>{new Date(order.created_at).toLocaleString()}</span></div>
                    </div>
                    <Separator className="my-2" />
                    <div className="mb-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>{item.name} x{item.quantity}</span>
                          <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <Separator className="my-2" />
                    {billingSettings.map((field, idx) => {
                      let baseAmount = field.applies_to === "subtotal" ? order.total_amount : order.total_amount
                      let amount = 0
                      if (field.field_type === "percentage" || field.field_type === "tax") {
                        amount = (baseAmount * field.field_value) / 100
                      } else if (field.field_type === "fixed_amount") {
                        amount = field.field_value
                      }
                      return (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>{field.field_label}</span>
                          <span>₹{amount.toFixed(2)}</span>
                        </div>
                      )
                    })}
                    <Separator className="my-2" />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>₹{order.total_amount.toFixed(2)}</span>
                    </div>
                    <Button
                      className="mt-4 w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold print:hidden"
                      onClick={downloadBill}
                    >
                      Download Bill
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Action Buttons */}
            <Card
              className="bg-white/80 backdrop-blur-sm border-0 shadow-lg animate-slide-up lg:sticky lg:top-6"
              style={{ animationDelay: "0.2s" }}
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Continue Ordering Button - Always visible */}
                  <Button
                    onClick={continueOrdering}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Continue Ordering
                  </Button>
                  
                  {/* Who Pays the Bill Button */}
                  <Button
                    onClick={() => router.push("/spin/all-games/billpay")}
                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" className="w-5 h-5 mr-2">
                      <circle cx="6" cy="6" r="1.5" />
                      <circle cx="18" cy="6" r="1.5" />
                      <circle cx="12" cy="12" r="1.5" />
                      <circle cx="6" cy="18" r="1.5" />
                      <circle cx="18" cy="18" r="1.5" />
                    </svg>
                    Who Pays the Bill?
                  </Button>

                  {/* Google Feedback Button - Always visible */}
                  <a
                    href="https://search.google.com/local/writereview?placeid=ChIJL-oxRgDT4jsRShN9f0MJg90"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-2"
                  >
                    <Button
                      variant="outline"
                      className="w-full border-2 border-green-400 hover:bg-green-50 text-green-700 font-bold flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5"><g><path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.23l6.87-6.87C35.67 2.15 30.18 0 24 0 14.82 0 6.71 5.48 2.69 13.44l8.06 6.26C12.67 13.13 17.89 9.5 24 9.5z"/><path fill="#34A853" d="M46.1 24.55c0-1.64-.15-3.22-.43-4.74H24v9.01h12.42c-.54 2.89-2.18 5.34-4.66 7.01l7.18 5.59C43.93 37.13 46.1 31.38 46.1 24.55z"/><path fill="#FBBC05" d="M10.75 28.69A14.5 14.5 0 0 1 9.5 24c0-1.63.28-3.21.75-4.69l-8.06-6.26A23.93 23.93 0 0 0 0 24c0 3.93.94 7.65 2.69 10.95l8.06-6.26z"/><path fill="#EA4335" d="M24 48c6.18 0 11.36-2.05 15.13-5.59l-7.18-5.59c-2.01 1.35-4.59 2.16-7.95 2.16-6.11 0-11.33-3.63-13.25-8.71l-8.06 6.26C6.71 42.52 14.82 48 24 48z"/></g></svg>
                      Give Feedback on Google
                    </Button>
                  </a>

                  {order.status === "pending" && (
                    <>
                      {/* <Button
                        variant="outline"
                        onClick={() => router.push("/menu")}
                        className="w-full border-2 border-orange-200 hover:bg-orange-50"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add More Items
                      </Button> */}
                      <Button variant="destructive" onClick={cancelOrder} className="w-full">
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancel Order
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Feedback Section */}
            
            {/* Show submitted rating */}
            {order.rating && (
              <Card
                className="bg-white/80 backdrop-blur-sm border-0 shadow-lg animate-slide-up"
                style={{ animationDelay: "0.3s" }}
              >
                <CardHeader>
                  <CardTitle>Your Rating</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="flex justify-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-6 w-6 ${order.rating! >= star ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                    {order.feedback && (
                      <p className="text-sm text-gray-600 italic bg-gray-50 p-3 rounded-lg">"{order.feedback}"</p>
                    )}
                    <p className="text-sm text-green-600 mt-2 font-medium">Thank you for your feedback! 🙏</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Add this style block at the top level of the component (before the return statement)

// Add this helper function inside the component, before the return statement
// (Moved inside OrderStatusPage for state access)
