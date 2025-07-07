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

  useEffect(() => {
    fetchOrder()

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="text-center animate-bounce-in">
          <Clock className="h-16 w-16 text-orange-500 mx-auto mb-4 animate-pulse" />
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-600">Loading your order...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="text-center animate-slide-up">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-4">The order you're looking for doesn't exist.</p>
          <Button onClick={() => router.push("/menu")} className="bg-gradient-to-r from-orange-500 to-red-500">
            Back to Menu
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Enhanced Header */}
        <div className="flex items-center gap-4 mb-8 animate-slide-up">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/table-selection")}
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

        <div className="grid lg:grid-cols-3 gap-8">
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
                <div className="flex justify-between items-center text-sm mb-6">
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
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
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
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Action Buttons */}
            <Card
              className="bg-white/80 backdrop-blur-sm border-0 shadow-lg animate-slide-up sticky top-6"
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

                  {order.status === "pending" && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => router.push("/menu")}
                        className="w-full border-2 border-orange-200 hover:bg-orange-50"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add More Items
                      </Button>
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
