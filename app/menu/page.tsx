"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ShoppingCart, Plus, Minus, Leaf, Flame, Heart, Star, Clock, ChefHat, ArrowLeft, AlertCircle } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { createClient } from "@/utils/supabase/client"
import type { MenuItem } from "@/lib/types"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useToast } from "@/hooks/use-toast"
import type { Order } from "@/lib/types"

export default function MenuPage() {
  const [waiterCallPending, setWaiterCallPending] = useState(false)
  const [waiterCallError, setWaiterCallError] = useState("")

  const handleCallWaiter = async () => {
    setWaiterCallError("")
    setWaiterCallPending(true)
    try {
      // Check for existing pending call
      const { data: existing, error: checkError } = await supabase
        .from("waiter_calls")
        .select("id")
        .eq("table_number", state.tableNumber)
        .eq("status", "pending")
        .maybeSingle()
      if (checkError) throw checkError
      if (existing) {
        setWaiterCallError("Waiter already called for this table. Please wait.")
        setWaiterCallPending(false)
        return
      }
      // Insert new call
      const { error } = await supabase.from("waiter_calls").insert({
        table_number: state.tableNumber,
        status: "pending"
      })
      if (error) throw error
      toast({ title: "Waiter Called!", description: `A waiter will attend Table #${state.tableNumber} shortly.` })
    } catch (err) {
      setWaiterCallError("Failed to call waiter. Please try again.")
    } finally {
      setWaiterCallPending(false)
    }
  }

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
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);


  useEffect(() => {
    // Try to restore tableNumber from localStorage if not present in state
    if (!state.tableNumber) {
      const storedTableNumber = localStorage.getItem("tableNumber");
      if (storedTableNumber) {
        dispatch({ type: "SET_TABLE", payload: Number(storedTableNumber) });
        // Let the effect re-run with updated state
        return;
      } else {
        router.push("/table-selection");
        return;
      }
    }
    fetchMenuItems();
    fetchActiveOrders();
  }, [state.tableNumber, router, dispatch]);

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
        .order("order", { ascending: true })
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

    // toast({
    //   title: "Added to cart! 🎉",
    //   description: `${quantity}x ${selectedItem.name} added to Table #${state.tableNumber} cart`,
    // })

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
      case "Tandoori Starters Vegetaria":
        return "🥗"
      case "Tandoori Starters Non-Vegetaria":
        return "🍝"
      case "Main Course(Indian) Vegetarian":
        return "🥤"
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
      <div className="relative h-[28rem] bg-gradient-to-b from-[#F8F7EC] to-[#F3F2E7] overflow-hidden border-b border-[#C7C6A1] shadow-lg" style={{backgroundImage: 'url(/aaa.png)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
        <div className="absolute inset-0 bg-white/90 pointer-events-none" />
        {/* Oona logo and name */}
        <div className="relative h-full flex flex-col items-center justify-center text-[#7A7A4D] text-center px-4">
          <div className="animate-fade-in-up">
            <div className="flex flex-col items-center gap-2 mb-3">
              <div className="bg-white/80 rounded-full shadow-xl p-3 border border-[#B7B78A] flex items-center justify-center">
                <img src="/logo.png" alt="Oona Logo" className="w-20 h-20 object-contain mr-2" />
              </div>
              <span className="text-7xl font-extrabold tracking-[.25em] text-[#7A7A4D] drop-shadow-lg font-serif" style={{fontFamily: 'Playfair Display, serif', letterSpacing: '0.25em', textShadow: '0 4px 24px rgba(122,122,77,0.15)'}}>oona</span>
              <span className="text-sm tracking-[.3em] font-semibold text-[#B7B78A] uppercase font-serif" style={{fontFamily: 'Playfair Display, serif'}}>The One</span>
            </div>
            <p className="text-xl mb-3 opacity-95 text-[#7A7A4D] font-medium tracking-wide">Authentic Indian Cuisine</p>
            <div className="flex items-center justify-center gap-6 text-base mt-2">
              <div className="flex items-center gap-2 bg-[#7a7a4d]  border border-[#D2D1B2] rounded-full px-5 py-2 shadow-md">
                <span className="font-bold text-[#fffffe]">Table #{state.tableNumber}</span>
              </div>
              <div className="flex items-center gap-2 bg-[#7a7a4d] border border-[#D2D1B2] rounded-full px-5 py-2 shadow-md">
                <Clock className="h-5 w-5 text-[#fffffe]" />
                <span className="font-semibold text-[#fffffe]">15-25 min</span>
              </div>
              <Button
                onClick={handleCallWaiter}
                disabled={waiterCallPending}
                className="bg-gradient-to-r from-orange-400 to-red-400 text-white font-bold px-6 py-2 rounded-full shadow-md hover:scale-105 transition-all duration-300"
              >
                {waiterCallPending ? "Calling..." : "Call Waiter"}
              </Button>
            </div>
            {waiterCallError && (
              <div className="flex items-center justify-center mt-2">
                <AlertCircle className="text-red-500 mr-2" />
                <span className="text-red-600 font-semibold">{waiterCallError}</span>
              </div>
            )}
          </div>
        </div>
        {/* Subtle arch pattern at bottom */}
        <svg className="absolute bottom-0 left-0 w-full" height="70" viewBox="0 0 900 70" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g opacity="0.13">
            {Array.from({length: 26}).map((_,i) => (
              <rect key={i} x={i*35} y="15" width="30" height="40" rx="15" stroke="#B7B78A" strokeWidth="2" fill="none" />
            ))}
          </g>
        </svg>
      </div>

      {/* Enhanced Category Filter */}
      <div className="sticky top-0 bg-[#7a7a4d] backdrop-blur-lg shadow-xl z-30 p-6 border-b border-[#C7C6A1] rounded-b-3xl">
        <div className="max-w-6xl mx-auto">
          {/* Responsive Category Filter */}
          <div className="block md:hidden flex justify-center" >
            <Button
              variant="outline"
              size="md"
              onClick={() => setShowCategoryMenu(true)}
              className="rounded-full bg-white/80 text-[#7A7A4D] border-2 border-[#C7C6A1] shadow-md flex items-center gap-2 px-4 py-2 font-serif text-base font-semibold mx-auto "
            >
              <span>{getCategoryIcon(selectedCategory)}</span>
              <span>Select Category</span>
            </Button>
            {showCategoryMenu && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowCategoryMenu(false)}>
                <div className="bg-white rounded-2xl shadow-xl p-6 max-w-xs w-full" onClick={e => e.stopPropagation()}>
                  <div className="flex flex-col gap-3">
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => { setSelectedCategory(category); setShowCategoryMenu(false); }}
                        className={`flex items-center gap-2 whitespace-nowrap font-serif tracking-wide text-sm px-2 py-1 md:text-base md:px-4 md:py-2 rounded-full border-2 border-[#C7C6A1] shadow-md ${selectedCategory === category ? "bg-gradient-to-r from-orange-500 to-red-500 text-white border-none" : "bg-white/80 text-[#7A7A4D] hover:bg-[#B7B78A] hover:text-[#7A7A4D]"}`}
                      >
                        <span>{getCategoryIcon(category)}</span>
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="hidden md:flex gap-3 overflow-x-auto pb-2 scrollbar-hide hide-horizontal-scrollbar">
            {categories.map((category, index) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={`whitespace-nowrap transition-all duration-300 animate-slide-up font-serif tracking-wide text-base px-6 py-2 rounded-full border-2 border-[#C7C6A1] shadow-md ${selectedCategory === category ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg scale-105 border-none" : "bg-white/80 text-[#7A7A4D] hover:bg-[#B7B78A] hover:text-[#7A7A4D] hover:scale-105 hover:shadow-lg"}`}
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
              className="w-full max-w-md px-5 py-3 border border-[#C7C6A1] rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/90 text-[#7A7A4D] font-serif text-lg transition-all"
            />
          </div>
        </div>
      </div>

      {/* Enhanced Menu Items */}
      <div className="max-w-6xl mx-auto p-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {searchedItems.map((item, index) => (
            <Card
              key={item.id}
              className="overflow-hidden hover-lift bg-white/95 backdrop-blur-lg border border-[#C7C6A1] shadow-xl animate-slide-up rounded-2xl p-2 sm:rounded-3xl sm:p-0"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative">
                <div className="relative h-36 overflow-hidden rounded-t-2xl sm:h-56 sm:rounded-t-3xl">
                  <Image
                    src={item.image_url || "/placeholder.svg?height=224&width=336"}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <button
                    onClick={() => toggleFavorite(item.id)}
                    className="absolute top-4 right-4 p-2 bg-white/95 backdrop-blur-md rounded-full shadow-lg transition-all duration-300 hover:scale-110"
                  >
                    <Heart
                      className={`h-5 w-5 transition-colors duration-300 ${
                        favorites.has(item.id) ? "text-red-500 fill-current" : "text-[#7A7A4D]"
                      }`}
                    />
                  </button>
                  <div className="absolute bottom-4 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full font-bold shadow-lg text-lg">
                    {item.discount && item.discount > 0 ? (
                      <>
                        <span className="line-through text-red-200 mr-2 text-base">₹{item.price.toFixed(2)}</span>
                        <span className="text-white text-lg font-bold">
                          ₹{item.discount_type === 'percentage'
                            ? (item.price * (1 - item.discount / 100)).toFixed(2)
                            : (item.price - item.discount).toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <>₹{item.price.toFixed(2)}</>
                    )}
                  </div>
                  {item.discount && item.discount > 0 && (
                    <div className="absolute bottom-4 left-4 bg-yellow-400 text-black px-3 py-1 rounded-full font-bold shadow text-xs">
                      {item.discount_type === 'percentage'
                        ? `${item.discount}% OFF`
                        : `₹${item.discount} OFF`}
                    </div>
                  )}
                </div>
                <div className="p-3 sm:p-7">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-extrabold text-lg sm:text-2xl text-[#7A7A4D] font-serif">{item.name}</h3>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="h-5 w-5 fill-current" />
                      <span className="text-xs sm:text-base font-semibold">4.8</span>
                    </div>
                  </div>
                  <p className="text-[#A6A67A] mb-3 sm:mb-5 line-clamp-2 font-medium text-xs sm:text-base">{item.description}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2 flex-wrap">
                      {item.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-[10px] sm:text-xs bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 transition-all duration-300 rounded-full px-2 py-0.5 sm:px-3 sm:py-1 font-serif text-[#7A7A4D]"
                        >
                          {getTagIcon(tag)}
                          <span className="ml-1">{tag}</span>
                        </Badge>
                      ))}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => openItemDialog(item)}
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 rounded-full px-4 py-1.5 text-sm sm:px-6 sm:py-2 font-serif sm:text-base"
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
      {/* <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md  rounded-3xl shadow-2xl border border-[#C7C6A1] bg-white/95">
          <DialogHeader>
            <DialogTitle className="text-3xl font-extrabold text-[#7A7A4D] font-serif">{selectedItem?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-8">
            <div className="relative h-72 rounded-2xl overflow-hidden">
              <Image
                src={selectedItem?.image_url || "/placeholder.svg?height=288&width=448"}
                alt={selectedItem?.name || ""}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
            <p className="text-[#A6A67A] leading-relaxed font-medium text-lg">{selectedItem?.description}</p>
            <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-xl">
              <span className="text-4xl font-extrabold text-green-600 font-serif">₹{selectedItem?.price.toFixed(2)}</span>
              <div className="flex items-center gap-4 bg-white rounded-full p-2 shadow-md">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="rounded-full hover:bg-gray-100"
                >
                  <Minus className="h-5 w-5" />
                </Button>
                <span className="text-2xl font-bold w-10 text-center font-serif">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  className="rounded-full hover:bg-gray-100"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div>
              <label className="block text-base font-semibold mb-3 text-[#7A7A4D] font-serif">Special Instructions (Optional)</label>
              <Textarea
                placeholder="e.g., No onions, extra cheese, light spice..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="resize-none bg-white/90 border border-[#C7C6A1] rounded-xl text-[#7A7A4D] font-serif text-lg"
              />
            </div>
            <Button
              onClick={handleAddToCart}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 text-xl shadow-lg hover:shadow-xl transition-all duration-300 rounded-full font-serif"
            >
              Add to Table #{state.tableNumber} Cart - ₹{((selectedItem?.price || 0) * quantity).toFixed(2)}
            </Button>
          </div>
        </DialogContent>
      </Dialog> */}


      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
  <DialogContent className="max-w-md rounded-2xl shadow-xl border border-[#C7C6A1] bg-white/95 p-4">
    <DialogHeader>
      <DialogTitle className="text-xl font-bold text-[#7A7A4D] font-serif">
        {selectedItem?.name}
      </DialogTitle>
    </DialogHeader>
    <div className="space-y-4">
      <div className="relative h-52 rounded-xl overflow-hidden">
        <Image
          src={selectedItem?.image_url || "/placeholder.svg?height=208&width=368"}
          alt={selectedItem?.name || ""}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>
      <p className="text-[#A6A67A] leading-relaxed font-medium text-base">
        {selectedItem?.description}
      </p>
      <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg">
        <span className="text-2xl font-bold text-green-600 font-serif">
          ₹{selectedItem?.price.toFixed(2)}
        </span>
        <div className="flex items-center gap-3 bg-white rounded-full p-1 shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="rounded-full hover:bg-gray-100"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="text-lg font-bold w-8 text-center font-serif">
            {quantity}
          </span>
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
        <label className="block text-sm font-semibold mb-2 text-[#7A7A4D] font-serif">
          Special Instructions (Optional)
        </label>
        <Textarea
          placeholder="e.g., No onions, extra cheese..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="resize-none bg-white/90 border border-[#C7C6A1] rounded-lg text-[#7A7A4D] font-serif text-base"
        />
      </div>
      <Button
        onClick={handleAddToCart}
        className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 text-lg shadow-md hover:shadow-lg transition-all duration-300 rounded-full font-serif"
      >
        Add to Table #{state.tableNumber} Cart - ₹{((selectedItem?.price || 0) * quantity).toFixed(2)}
      </Button>
    </div>
  </DialogContent>
</Dialog>


      {/* Enhanced Floating Cart Button */}
      {(activeOrders.length > 0 || getCartCount() > 0) && (
        <div className="fixed bottom-8 right-8 z-40 flex flex-col gap-6 items-end">
          {activeOrders.length > 0 && (
            <>
<Button
  onClick={() => setOrdersDialogOpen(true)}
  size="lg"
  className="rounded-full shadow-2xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold px-10 py-5 hover:scale-105 transition-all duration-300"
>
  <Clock className="h-6 w-6 mr-3" />
  <div className="text-left leading-tight">
    <div className="text-sm">View All Orders</div>
    <div className="text-lg font-bold">Table #{state.tableNumber}</div>
  </div>
</Button>

              <Dialog open={ordersDialogOpen} onOpenChange={setOrdersDialogOpen}>
                <DialogContent className="max-w-xl rounded-3xl shadow-2xl border border-[#C7C6A1] bg-white/95">
                  <DialogHeader>
                    <DialogTitle className="text-3xl font-extrabold text-[#7A7A4D] font-serif">Active Orders</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    {activeOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-5 bg-gray-50 rounded-xl shadow">
                        <div>
                          <div className="font-semibold text-[#7A7A4D] text-lg font-serif">Order #{order.id.slice(-6)}</div>
                          <div className="text-base text-[#A6A67A] font-serif">{order.items?.map((item) => item.name).join(", ")}</div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => { setOrdersDialogOpen(false); router.push(`/order-status/${order.id}`) }}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold px-6 py-3 rounded-full font-serif text-base"
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
              className="rounded-full shadow-2xl bg-[#7a7a4d] text-white font-bold px-8 py-5 text-[1.2rem] flex items-center min-w-[240px] min-h-[60px]"
            >
              <ShoppingCart className="h-8 w-8 mr-5" />
              <div className="flex flex-col justify-center text-left w-full">
                <div className="text-lg opacity-90 leading-tight whitespace-nowrap font-semibold">
                  Table #{state.tableNumber} • {getCartCount()} items
                </div>
                <div className="text-xl font-extrabold leading-tight">₹{getCartTotal().toFixed(2)}</div>
              </div>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}



