"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ShoppingCart, Plus, Minus, Leaf, Flame, Heart, Star, Clock, ChefHat, ArrowLeft } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { createClient } from "@/utils/supabase/client"
import type { MenuItem } from "@/lib/types"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useToast } from "@/hooks/use-toast"
import type { Order } from "@/lib/types"

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [note, setNote] = useState("")
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeOrders, setActiveOrders] = useState<Order[]>([])
  const [ordersDialogOpen, setOrdersDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const { state, dispatch, getCartCount, getCartTotal } = useCart()
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    if (!state.tableNumber) {
      router.push("/table-selection")
      return
    }
    fetchMenuItems()
    fetchActiveOrders()
  }, [state.tableNumber, router])

  // Fetch active orders for this table
  const fetchActiveOrders = async () => {
    if (!state.tableNumber) return
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("table_number", state.tableNumber)
        .in("status", ["pending", "in_progress"])
        .order("created_at", { ascending: false })
      if (error) throw error
      setActiveOrders(data || [])
      // Persist active order IDs in localStorage for this table
      const ids = (data || []).map((o: Order) => o.id)
      localStorage.setItem(`active-orders-table-${state.tableNumber}`, JSON.stringify(ids))
    } catch (error) {
      console.error("Error fetching active orders:", error)
    }
  }

  // On mount, restore active order IDs from localStorage if present
  useEffect(() => {
    if (!state.tableNumber) return
    const ids = localStorage.getItem(`active-orders-table-${state.tableNumber}`)
    if (ids) {
      // Optionally, could refetch to verify status, but for now just restore
      setActiveOrders((prev) => {
        // Only add if not already present
        const parsed = JSON.parse(ids)
        return prev.length ? prev : parsed.map((id: string) => ({ id } as Order))
      })
    }
  }, [state.tableNumber])

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("in_stock", true)
        .order("category")
        .order("name")

      if (error) throw error
      setMenuItems(data || [])
    } catch (error) {
      console.error("Error fetching menu items:", error)
    } finally {
      setLoading(false)
    }
  }

  const categories = ["All", ...Array.from(new Set(menuItems.map((item) => item.category)))]
  const filteredItems =
    selectedCategory === "All"
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory)
  const searchedItems = searchQuery.trim() === ""
    ? filteredItems
    : filteredItems.filter((item) => {
        const q = searchQuery.toLowerCase()
        return (
          item.name.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          (item.tags && item.tags.some((tag) => tag.toLowerCase().includes(q)))
        )
      })

  const handleAddToCart = () => {
    if (!selectedItem) return

    dispatch({
      type: "ADD_ITEM",
      payload: {
        item_id: selectedItem.id,
        name: selectedItem.name,
        price: selectedItem.price,
        quantity,
        note: note.trim() || undefined,
      },
    })

    toast({
      title: "Added to cart! 🎉",
      description: `${quantity}x ${selectedItem.name} added to Table #${state.tableNumber} cart`,
    })

    // Close the dialog and reset form
    setDialogOpen(false)
    setSelectedItem(null)
    setQuantity(1)
    setNote("")
  }

  const openItemDialog = (item: MenuItem) => {
    setSelectedItem(item)
    setQuantity(1)
    setNote("")
    setDialogOpen(true)
  }

  const toggleFavorite = (itemId: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(itemId)) {
      newFavorites.delete(itemId)
    } else {
      newFavorites.add(itemId)
    }
    setFavorites(newFavorites)
  }

  const getTagIcon = (tag: string) => {
    switch (tag.toLowerCase()) {
      case "veg":
        return <Leaf className="h-3 w-3 text-green-600" />
      case "spicy":
        return <Flame className="h-3 w-3 text-red-600" />
      case "healthy":
        return <Heart className="h-3 w-3 text-pink-600" />
      default:
        return null
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "starters":
        return "🥗"
      case "mains":
        return "🍝"
      case "beverages":
        return "🥤"
      case "desserts":
        return "🍰"
      default:
        return "🍽️"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="text-center animate-bounce-in">
          <ChefHat className="h-16 w-16 text-orange-500 mx-auto mb-4 animate-pulse" />
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-600">Preparing our delicious menu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Enhanced Hero Section */}
      <div className="relative h-80 bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 overflow-hidden">
        <div className="absolute inset-0 bg-black/30" />

        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          {/* Grid pattern overlay */}
          <div
            className={
              "absolute inset-0 opacity-10 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20xmlns%3D%22http://www.w3.org/2000/svg%22%3E%3Cdefs%3E%3Cpattern%20id%3D%22grid60%22%20width%3D%2260%22%20height%3D%2260%22%20patternUnits%3D%22userSpaceOnUse%22%3E%3Cpath%20d%3D%22M%2060%200%20L%200%200%200%2060%22%20fill%3D%22none%22%20stroke%3D%22white%22%20stroke-width%3D%222%22%20opacity%3D%220.15%22/%3E%3C/pattern%3E%3C/defs%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22url(%23grid60)%22/%3E%3C/svg%3E')]"
            }
          />
        </div>

        {/* Floating elements */}
        <div className="absolute top-10 left-10 text-6xl animate-float">🍝</div>
        <div className="absolute top-20 right-20 text-4xl animate-float" style={{ animationDelay: "1s" }}>
          🍷
        </div>
        <div className="absolute bottom-10 left-1/4 text-5xl animate-float" style={{ animationDelay: "2s" }}>
          🧄
        </div>

        {/* Back button
        <div className="absolute top-6 left-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              router.back()
              // Fallback if there's no history
              setTimeout(() => {
                if (document.location.pathname === '/menu') {
                  router.push('/table-selection')
                }
              }, 100)
            }}
            className="text-white hover:bg-white/20 backdrop-blur-sm rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div> */}

        <div className="relative h-full flex items-center justify-center text-white text-center px-4">
          <div className="animate-slide-up">
            <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">Bella Vista Restaurant</h1>
            <p className="text-xl mb-2 opacity-90">Authentic Italian Cuisine</p>
            <div className="flex items-center justify-center gap-4 text-lg">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <span className="font-bold">Table #{state.tableNumber}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <Clock className="h-4 w-4" />
                <span>15-25 min</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Category Filter */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md shadow-lg z-20 p-4 border-b border-white/20">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category, index) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={`whitespace-nowrap transition-all duration-300 animate-slide-up ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg scale-105"
                    : "hover:scale-105 hover:shadow-md"
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <span className="mr-2">{getCategoryIcon(category)}</span>
                {category}
              </Button>
            ))}
          </div>
          <div className="mt-4 flex justify-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search menu items..."
              className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Enhanced Menu Items */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {searchedItems.map((item, index) => (
            <Card
              key={item.id}
              className="overflow-hidden hover-lift bg-white/80 backdrop-blur-sm border-0 shadow-lg animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={item.image_url || "/placeholder.svg?height=192&width=300"}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                  {/* Favorite button */}
                  <button
                    onClick={() => toggleFavorite(item.id)}
                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg transition-all duration-300 hover:scale-110"
                  >
                    <Heart
                      className={`h-4 w-4 transition-colors duration-300 ${
                        favorites.has(item.id) ? "text-red-500 fill-current" : "text-gray-600"
                      }`}
                    />
                  </button>

                  {/* Price badge */}
                  <div className="absolute bottom-3 right-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full font-bold shadow-lg">
                    ₹{item.price.toFixed(2)}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-xl text-gray-800">{item.name}</h3>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm font-medium">4.8</span>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-2">{item.description}</p>

                  <div className="flex justify-between items-center">
                    <div className="flex gap-2 flex-wrap">
                      {item.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 transition-all duration-300"
                        >
                          {getTagIcon(tag)}
                          <span className="ml-1">{tag}</span>
                        </Badge>
                      ))}
                    </div>

                    <Button
                      size="sm"
                      onClick={() => openItemDialog(item)}
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Enhanced Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-800">{selectedItem?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="relative h-64 rounded-lg overflow-hidden">
              <Image
                src={selectedItem?.image_url || "/placeholder.svg?height=256&width=400"}
                alt={selectedItem?.name || ""}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>

            <p className="text-gray-600 leading-relaxed">{selectedItem?.description}</p>

            <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
              <span className="text-3xl font-bold text-green-600">₹{selectedItem?.price.toFixed(2)}</span>
              <div className="flex items-center gap-3 bg-white rounded-full p-1 shadow-md">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="rounded-full hover:bg-gray-100"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-xl font-bold w-8 text-center">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  className="rounded-full hover:bg-gray-100"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Special Instructions (Optional)</label>
              <Textarea
                placeholder="e.g., No onions, extra cheese, light spice..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="resize-none"
              />
            </div>

            <Button
              onClick={handleAddToCart}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Add to Table #{state.tableNumber} Cart - ₹{((selectedItem?.price || 0) * quantity).toFixed(2)}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Floating Cart Button */}
      {(activeOrders.length > 0 || getCartCount() > 0) && (
        <div className="fixed bottom-6 right-6 z-30 flex flex-col gap-4 items-end">
          {activeOrders.length > 0 && (
            <>
              <Button
                onClick={() => setOrdersDialogOpen(true)}
                size="lg"
                className="rounded-full shadow-2xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold px-6 py-4 animate-pulse-glow hover:scale-110 transition-all duration-300"
              >
                <Clock className="h-6 w-6 mr-3" />
                <div className="text-left">
                  <div className="text-sm opacity-90">View All Orders</div>
                  <div className="text-lg font-bold">Table #{state.tableNumber}</div>
                </div>
              </Button>
              <Dialog open={ordersDialogOpen} onOpenChange={setOrdersDialogOpen}>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-gray-800">Active Orders</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {activeOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg shadow">
                        <div>
                          <div className="font-semibold text-gray-800">Order #{order.id.slice(-6)}</div>
                          <div className="text-sm text-gray-600">{order.items?.map((item) => item.name).join(", ")}</div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => { setOrdersDialogOpen(false); router.push(`/order-status/${order.id}`) }}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold px-4 py-2"
                        >
                          View Status
                        </Button>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
          {getCartCount() > 0 && (
            <Button
              onClick={() => router.push("/cart")}
              size="lg"
              className="rounded-full shadow-2xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold px-6 py-4 animate-pulse-glow hover:scale-110 transition-all duration-300"
            >
              <ShoppingCart className="h-6 w-6 mr-3" />
              <div className="text-left">
                <div className="text-sm opacity-90">
                  Table #{state.tableNumber} • {getCartCount()} items
                </div>
                <div className="text-lg font-bold">₹{getCartTotal().toFixed(2)}</div>
              </div>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
