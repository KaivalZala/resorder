"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, CreditCard, Clock } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { createClient } from "@/utils/supabase/client"
import type { BillingSettings } from "@/lib/types"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function CartPage() {
  const [billingSettings, setBillingSettings] = useState<BillingSettings[]>([])
  const [specialNotes, setSpecialNotes] = useState("")
  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const { state, dispatch, getCartTotal, getCartCount } = useCart()
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    if (!state.tableNumber) {
      router.push("/table-selection")
      return
    }
    if (state.items.length === 0) {
      router.push("/menu")
      return
    }
    fetchBillingSettings()
  }, [state.tableNumber, state.items.length, router])

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
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      dispatch({ type: "REMOVE_ITEM", payload: itemId })
    } else {
      dispatch({ type: "UPDATE_QUANTITY", payload: { item_id: itemId, quantity: newQuantity } })
    }
  }

  const removeItem = (itemId: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: itemId })
  }

  const calculateBilling = () => {
    const subtotal = getCartTotal()
    let runningTotal = subtotal
    const calculations: Array<{ label: string; amount: number; type: string }> = []

    billingSettings.forEach((field) => {
      let amount = 0
      const baseAmount = field.applies_to === "subtotal" ? subtotal : runningTotal

      if (field.field_type === "percentage" || field.field_type === "tax") {
        amount = (baseAmount * field.field_value) / 100
      } else if (field.field_type === "fixed_amount") {
        amount = field.field_value
      }

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

    return {
      subtotal,
      calculations,
      total: Math.max(0, runningTotal),
    }
  }

  const placeOrder = async () => {
    if (!state.tableNumber || state.items.length === 0) return

    setPlacing(true)
    try {
      const billing = calculateBilling()

      const { data, error } = await supabase
        .from("orders")
        .insert({
          table_number: state.tableNumber,
          items: state.items,
          total_amount: billing.total,
          special_notes: specialNotes.trim() || null,
          status: "pending",
        })
        .select()
        .single()

      if (error) throw error

      // Clear cart immediately
      dispatch({ type: "CLEAR_CART" })

      // Enhanced success feedback
      toast({
        title: "Order placed successfully! 🎉",
        description: "Redirecting to order tracking...",
      })

      // Add a small delay for better UX, then redirect
      setTimeout(() => {
        router.push(`/order-status/${data.id}`)
      }, 1000)
    } catch (error) {
      console.error("Error placing order:", error)
      toast({
        title: "Error placing order",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setPlacing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="text-center animate-bounce-in">
          <ShoppingBag className="h-16 w-16 text-orange-500 mx-auto mb-4 animate-pulse" />
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-600">Loading your cart...</p>
        </div>
      </div>
    )
  }

  const billing = calculateBilling()

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Enhanced Header */}
        <div className="flex items-center gap-4 mb-8 animate-slide-up">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="hover:bg-white/50 backdrop-blur-sm rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Your Order
            </h1>
            <div className="flex items-center gap-4 text-gray-600">
              <span>Table #{state.tableNumber}</span>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Est. 15-25 min</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Enhanced Cart Items */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg animate-slide-up">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-orange-500" />
                  Order Items ({getCartCount()})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {state.items.map((item, index) => (
                  <div
                    key={item.item_id}
                    className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-800">{item.name}</h3>
                      <p className="text-gray-600">₹{item.price.toFixed(2)} each</p>
                      {item.note && (
                        <p className="text-sm text-blue-600 italic bg-blue-50 px-2 py-1 rounded mt-1">
                          Note: {item.note}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 bg-gray-50 rounded-full p-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateQuantity(item.item_id, item.quantity - 1)}
                        className="rounded-full hover:bg-white"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-bold text-lg">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateQuantity(item.item_id, item.quantity + 1)}
                        className="rounded-full hover:bg-white"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-lg text-green-600">₹{(item.price * item.quantity).toFixed(2)}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.item_id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Enhanced Special Notes */}
            <Card
              className="bg-white/80 backdrop-blur-sm border-0 shadow-lg animate-slide-up"
              style={{ animationDelay: "0.2s" }}
            >
              <CardHeader>
                <CardTitle>Special Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Any special requests, dietary requirements, or cooking preferences..."
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  className="resize-none bg-white/50 backdrop-blur-sm"
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Enhanced Billing Summary */}
            <Card
              className="bg-white/80 backdrop-blur-sm border-0 shadow-lg animate-slide-up sticky top-6"
              style={{ animationDelay: "0.3s" }}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-green-500" />
                  Bill Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-lg">
                  <span>Subtotal</span>
                  <span className="font-semibold">₹{billing.subtotal.toFixed(2)}</span>
                </div>

                {billing.calculations.map((calc, index) => (
                  <div
                    key={index}
                    className={`flex justify-between ${calc.amount < 0 ? "text-green-600" : "text-gray-600"}`}
                  >
                    <span>{calc.label}</span>
                    <span className="font-medium">
                      {calc.amount < 0 ? "-" : ""}₹{Math.abs(calc.amount).toFixed(2)}
                    </span>
                  </div>
                ))}

                <Separator className="my-4" />

                <div className="flex justify-between text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  <span>Total</span>
                  <span>₹{billing.total.toFixed(2)}</span>
                </div>

                <Button
                  onClick={() => router.push("/menu")}
                  className="w-full mt-2 bg-gradient-to-r from-orange-400 to-red-400 hover:from-orange-500 hover:to-red-500 text-white font-bold py-3 text-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
                  size="lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add More Items
                </Button>
                <Button
                  onClick={() => setConfirmDialogOpen(true)}
                  disabled={placing || state.items.length === 0}
                  className="w-full mt-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  size="lg"
                >
                  {placing ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-3" />
                      Processing Order...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5 mr-3" />
                      Place Order - ₹{billing.total.toFixed(2)}
                    </>
                  )}
                </Button>
                <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold text-gray-800">Please Confirm Your Order</DialogTitle>
                    </DialogHeader>
                    <div className="text-gray-700 mb-4">
                      Please confirm your order. After this, if you want to change it, you have to cancel the order or place a new order.
                    </div>
                    <div className="flex gap-4 justify-end">
                      <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={() => { setConfirmDialogOpen(false); placeOrder(); }}
                        className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold"
                        disabled={placing}
                      >
                        Confirm Order
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
