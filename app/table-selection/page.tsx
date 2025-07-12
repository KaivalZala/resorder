// "use client"

// import { useState, useEffect } from "react"
// import { useRouter } from "next/navigation"
// import { useCart } from "@/lib/cart-context"
// import { createClient } from "@/utils/supabase/client"
// import type { Table } from "@/lib/types"
// import { LoadingSpinner } from "@/components/ui/loading-spinner"
// import { Settings, Sparkles, Users, Clock } from "lucide-react"
// import { Button } from "@/components/ui/button"

// export default function TableSelectionPage() {
//   const [tables, setTables] = useState<Table[]>([])
//   const [loading, setLoading] = useState(true)
//   const [selectedTable, setSelectedTable] = useState<number | null>(null)
//   const [hoveredTable, setHoveredTable] = useState<number | null>(null)
//   const { dispatch } = useCart()
//   const router = useRouter()
//   const supabase = createClient()

//   useEffect(() => {
//     fetchTables()
//   }, [])

//   const fetchTables = async () => {
//     try {
//       const { data, error } = await supabase.from("tables").select("*").order("table_number")

//       if (error) throw error
//       setTables(data || [])
//     } catch (error) {
//       console.error("Error fetching tables:", error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleTableSelect = (tableNumber: number) => {
//     setSelectedTable(tableNumber)

//     // Set table number in cart context - this will automatically load the table's cart
//     dispatch({ type: "SET_TABLE", payload: tableNumber })

//     // Add a small delay for visual feedback
//     setTimeout(() => {
//       router.push("/menu")
//     }, 300)
//   }

//   const getTableStatusColor = (status: string) => {
//     switch (status) {
//       case "free":
//         return "from-emerald-400 to-emerald-600"
//       case "serving":
//         return "from-amber-400 to-orange-500"
//       default:
//         return "from-gray-400 to-gray-500"
//     }
//   }

//   const getTableStatusIcon = (status: string) => {
//     switch (status) {
//       case "free":
//         return <Users className="h-4 w-4" />
//       case "serving":
//         return <Clock className="h-4 w-4" />
//       default:
//         return <Users className="h-4 w-4 opacity-50" />
//     }
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
//         <div className="text-center">
//           <div className="animate-bounce-in">
//             <LoadingSpinner size="lg" className="mx-auto mb-4" />
//             <p className="text-lg font-medium text-gray-600">Loading tables...</p>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 relative overflow-hidden">
//       {/* Animated background elements */}
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-200 to-pink-200 rounded-full opacity-20 animate-float"></div>
//         <div
//           className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-red-200 to-orange-200 rounded-full opacity-20 animate-float"
//           style={{ animationDelay: "1s" }}
//         ></div>
//         <div
//           className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-pink-200 to-red-200 rounded-full opacity-10 animate-float"
//           style={{ animationDelay: "2s" }}
//         ></div>
//       </div>

//       <div className="relative z-10 max-w-6xl mx-auto p-6">
//         {/* Header Section */}
//         <div className="text-center mb-12 animate-slide-up">
//           <div className="inline-flex items-center gap-2 mb-4">
//             <Sparkles className="h-8 w-8 text-orange-500 animate-pulse" />
//             <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-600 via-red-500 to-pink-600 bg-clip-text text-transparent">
//               Bella Vista Restaurant
//             </h1>
//             <Sparkles className="h-8 w-8 text-pink-500 animate-pulse" style={{ animationDelay: "0.5s" }} />
//           </div>
//           <p className="text-xl text-gray-700 mb-2">Authentic Italian Cuisine</p>
//           <p className="text-lg text-gray-600">Please select your table to start your culinary journey</p>
//         </div>

//         {/* Admin Login Button */}
//         <div className="flex justify-end mb-8 animate-slide-up" style={{ animationDelay: "0.2s" }}>
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => router.push("/admin/login")}
//             className="glass text-gray-600 hover:text-gray-800 hover:bg-white/20 transition-all duration-300 backdrop-blur-sm border border-white/30"
//           >
//             <Settings className="h-4 w-4 mr-2" />
//             Staff Portal
//           </Button>
//         </div>

//         {/* Tables Grid */}
//         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 mb-12">
//           {tables.map((table, index) => (
//             <div
//               key={table.id}
//               className={`cursor-pointer hover-lift transition-all duration-300 border-0 shadow-lg animate-slide-up ${
//                 selectedTable === table.table_number ? "animate-pulse-glow" : ""
//               } ${hoveredTable === table.table_number ? "scale-105" : ""}`}
//               style={{ animationDelay: `${index * 0.05}s` }}
//               onClick={() => handleTableSelect(table.table_number)}
//               onMouseEnter={() => setHoveredTable(table.table_number)}
//               onMouseLeave={() => setHoveredTable(null)}
//             >
//               <div className="p-0 relative overflow-hidden">
//                 <div
//                   className={`h-24 bg-gradient-to-br ${getTableStatusColor(table.status)} flex items-center justify-center relative`}
//                 >
//                   {/* Animated background pattern */}
//                   <div
//                     className={
//                       "absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http://www.w3.org/2000/svg%22%3E%3Cdefs%3E%3Cpattern%20id%3D%22grid%22%20width%3D%2220%22%20height%3D%2220%22%20patternUnits%3D%22userSpaceOnUse%22%3E%3Cpath%20d%3D%22M%2020%200%20L%200%200%200%2020%22%20fill%3D%22none%22%20stroke%3D%22white%22%20stroke-width%3D%221%22%20opacity%3D%220.3%22/%3E%3C/pattern%3E%3C/defs%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22url(%23grid)%22/%3E%3C/svg%3E')]"
//                     }
//                   />

//                   <div className="text-center z-10">
//                     <div className="text-2xl font-bold text-white mb-1 drop-shadow-lg">{table.table_number}</div>
//                     <div className="flex items-center justify-center gap-1 text-white/90">
//                       {getTableStatusIcon(table.status)}
//                       <span className="text-xs font-medium">
//                         {table.status === "free"
//                           ? "Available"
//                           : table.status === "serving"
//                             ? "In Service"
//                             : "Completed"}
//                       </span>
//                     </div>
//                   </div>

//                   {/* Hover effect overlay */}
//                   <div
//                     className={`absolute inset-0 bg-white/20 transition-opacity duration-300 ${
//                       hoveredTable === table.table_number ? "opacity-100" : "opacity-0"
//                     }`}
//                   ></div>

//                   {/* Selection effect */}
//                   {selectedTable === table.table_number && (
//                     <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Info Section */}
//         <div className="text-center animate-slide-up" style={{ animationDelay: "0.4s" }}>
//           <div className="inline-flex items-center gap-4 bg-white/60 backdrop-blur-sm rounded-full px-8 py-4 shadow-lg border border-white/30">
//             <div className="flex items-center gap-2">
//               <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"></div>
//               <span className="text-sm font-medium text-gray-700">Available</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <div className="w-3 h-3 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"></div>
//               <span className="text-sm font-medium text-gray-700">In Service</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <div className="w-3 h-3 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full"></div>
//               <span className="text-sm font-medium text-gray-700">Completed</span>
//             </div>
//           </div>
//           <p className="text-sm text-gray-500 mt-4">Tap any available table to begin your dining experience</p>
//           <p className="text-xs text-gray-400 mt-2">Each table maintains its own separate order</p>
//         </div>
//       </div>
//     </div>
//   )
// }























// "use client"

// import { useState, useEffect } from "react"
// import { useRouter } from "next/navigation"
// import { useCart } from "@/lib/cart-context"
// import { createClient } from "@/utils/supabase/client"
// import type { Table } from "@/lib/types"
// import { LoadingSpinner } from "@/components/ui/loading-spinner"
// import { Settings, Sparkles, Users, Clock } from "lucide-react"
// import { Button } from "@/components/ui/button"

// export default function TableSelectionPage() {
//   const [tables, setTables] = useState<Table[]>([])
//   const [loading, setLoading] = useState(true)
//   const [selectedTable, setSelectedTable] = useState<number | null>(null)
//   const [hoveredTable, setHoveredTable] = useState<number | null>(null)
//   const { dispatch } = useCart()
//   const router = useRouter()
//   const supabase = createClient()

//   useEffect(() => {
//     fetchTables()
//   }, [])

//   const fetchTables = async () => {
//     try {
//       const { data, error } = await supabase.from("tables").select("*").order("table_number")
//       if (error) throw error
//       setTables(data || [])
//     } catch (error) {
//       console.error("Error fetching tables:", error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleTableSelect = (tableNumber: number) => {
//     setSelectedTable(tableNumber)
//     dispatch({ type: "SET_TABLE", payload: tableNumber })
//     setTimeout(() => {
//       router.push("/menu")
//     }, 300)
//   }

//   const getTableStatusColor = (status: string) => {
//     switch (status) {
//       case "free":
//         return "from-emerald-400 to-emerald-600"
//       case "serving":
//         return "from-amber-400 to-orange-500"
//       default:
//         return "from-gray-400 to-gray-500"
//     }
//   }

//   const getTableStatusIcon = (status: string) => {
//     switch (status) {
//       case "free":
//         return <Users className="h-4 w-4" />
//       case "serving":
//         return <Clock className="h-4 w-4" />
//       default:
//         return <Users className="h-4 w-4 opacity-50" />
//     }
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
//         <div className="text-center">
//           <div className="animate-bounce-in">
//             <LoadingSpinner size="lg" className="mx-auto mb-4" />
//             <p className="text-lg font-medium text-gray-600">Loading tables...</p>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 relative overflow-hidden">
//       {/* Animated background elements */}
//       <div className="absolute inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-200 to-pink-200 rounded-full opacity-20 animate-float"></div>
//         <div
//           className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-red-200 to-orange-200 rounded-full opacity-20 animate-float"
//           style={{ animationDelay: "1s" }}
//         ></div>
//         <div
//           className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-pink-200 to-red-200 rounded-full opacity-10 animate-float"
//           style={{ animationDelay: "2s" }}
//         ></div>
//       </div>

//       <div className="relative z-10 max-w-6xl mx-auto p-6">
//         {/* Header Section */}
//         <div className="text-center mb-12 animate-slide-up">
//           <div className="inline-flex items-center gap-2 mb-4">
//             <Sparkles className="h-8 w-8 text-orange-500 animate-pulse" />
//             <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-600 via-red-500 to-pink-600 bg-clip-text text-transparent">
//               Bella Vista Restaurant
//             </h1>
//             <Sparkles className="h-8 w-8 text-pink-500 animate-pulse" style={{ animationDelay: "0.5s" }} />
//           </div>
//           <p className="text-xl text-gray-700 mb-2">Authentic Italian Cuisine</p>
//           <p className="text-lg text-gray-600">Please select your table to start your culinary journey</p>
//         </div>

//         {/* Admin Login Button */}
//         <div className="flex justify-end mb-8 animate-slide-up" style={{ animationDelay: "0.2s" }}>
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => router.push("/admin/login")}
//             className="glass text-gray-600 hover:text-gray-800 hover:bg-white/20 transition-all duration-300 backdrop-blur-sm border border-white/30"
//           >
//             <Settings className="h-4 w-4 mr-2" />
//             Staff Portal
//           </Button>
//         </div>

//         {/* Tables Grid */}
//         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 mb-16 px-2">
//           {tables.map((table, index) => (
//             <div
//               key={table.id}
//               className={`cursor-pointer transition-all duration-300 rounded-2xl shadow-md hover:shadow-xl bg-white/30 backdrop-blur-md border border-white/20 overflow-hidden animate-slide-up ${
//                 selectedTable === table.table_number ? "animate-pulse-glow ring-4 ring-white/30" : ""
//               } ${hoveredTable === table.table_number ? "scale-[1.03]" : ""}`}
//               style={{ animationDelay: `${index * 0.05}s` }}
//               onClick={() => handleTableSelect(table.table_number)}
//               onMouseEnter={() => setHoveredTable(table.table_number)}
//               onMouseLeave={() => setHoveredTable(null)}
//             >
//               <div className="p-0 relative overflow-hidden rounded-2xl">
//                 <div
//                   className={`h-24 bg-gradient-to-br ${getTableStatusColor(table.status)} flex items-center justify-center relative`}
//                 >
//                   {/* Animated background pattern */}
//                   <div
//                     className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http://www.w3.org/2000/svg%22%3E%3Cdefs%3E%3Cpattern%20id%3D%22grid%22%20width%3D%2220%22%20height%3D%2220%22%20patternUnits%3D%22userSpaceOnUse%22%3E%3Cpath%20d%3D%22M%2020%200%20L%200%200%200%2020%22%20fill%3D%22none%22%20stroke%3D%22white%22%20stroke-width%3D%221%22%20opacity%3D%220.15%22/%3E%3C/pattern%3E%3C/defs%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22url(%23grid)%22/%3E%3C/svg%3E')] blur-[1px]"
//                   />

//                   <div className="text-center z-10">
//                     <div className="text-2xl font-bold text-white mb-1 drop-shadow-lg">{table.table_number}</div>
//                     <div className="flex items-center justify-center gap-1 text-white/90 text-sm font-medium">
//                       {getTableStatusIcon(table.status)}
//                       <span>
//                         {table.status === "free"
//                           ? "Available"
//                           : table.status === "serving"
//                             ? "In Service"
//                             : "Completed"}
//                       </span>
//                     </div>
//                   </div>

//                   {/* Hover effect overlay */}
//                   <div
//                     className={`absolute inset-0 bg-white/30 backdrop-blur-sm transition-opacity duration-300 ${
//                       hoveredTable === table.table_number ? "opacity-100" : "opacity-0"
//                     }`}
//                   ></div>

//                   {/* Selection effect */}
//                   {selectedTable === table.table_number && (
//                     <div className="absolute inset-0 bg-white/30 animate-pulse rounded-2xl z-10"></div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Info Section */}
//         <div className="text-center animate-slide-up" style={{ animationDelay: "0.4s" }}>
//           <div className="inline-flex items-center gap-4 bg-white/70 backdrop-blur-md rounded-xl px-6 py-3 shadow-md border border-white/30 text-sm">
//             <div className="flex items-center gap-2">
//               <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full shadow ring ring-white/30" />
//               <span className="text-gray-700 font-medium">Available</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <div className="w-3 h-3 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full shadow ring ring-white/30" />
//               <span className="text-gray-700 font-medium">In Service</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <div className="w-3 h-3 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full shadow ring ring-white/30" />
//               <span className="text-gray-700 font-medium">Completed</span>
//             </div>
//           </div>
//           <p className="text-sm text-gray-600 mt-3">Tap any available table to begin your dining experience</p>
//           <p className="text-xs text-gray-400 mt-1 italic">Each table maintains its own separate order</p>
//         </div>
//       </div>
//     </div>
//   )
// }




// "use client"

// import { useState, useEffect } from "react"
// import { useRouter } from "next/navigation"
// import { useCart } from "@/lib/cart-context"
// import { createClient } from "@/utils/supabase/client"
// import type { Table } from "@/lib/types"
// import { LoadingSpinner } from "@/components/ui/loading-spinner"
// import { Settings, Users, Clock } from "lucide-react"
// import { Button } from "@/components/ui/button"

// export default function TableSelectionPage() {
//   const [tables, setTables] = useState<Table[]>([])
//   const [loading, setLoading] = useState(true)
//   const [selectedTable, setSelectedTable] = useState<number | null>(null)
//   const [hoveredTable, setHoveredTable] = useState<number | null>(null)
//   const { dispatch } = useCart()
//   const router = useRouter()
//   const supabase = createClient()

//   useEffect(() => {
//     fetchTables()
//   }, [])

//   const fetchTables = async () => {
//     try {
//       const { data, error } = await supabase.from("tables").select("*").order("table_number")
//       if (error) throw error
//       setTables(data || [])
//     } catch (error) {
//       console.error("Error fetching tables:", error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleTableSelect = (tableNumber: number) => {
//     setSelectedTable(tableNumber)
//     dispatch({ type: "SET_TABLE", payload: tableNumber })
//     setTimeout(() => {
//       router.push("/menu")
//     }, 300)
//   }

//   const getTableStatusColor = (status: string) => {
//     switch (status) {
//       case "free":
//         return "bg-[#d8e8d1]"
//       case "serving":
//         return "bg-[#f4e3c1]"
//       default:
//         return "bg-[#e2e2d0]"
//     }
//   }

//   const getTableStatusIcon = (status: string) => {
//     switch (status) {
//       case "free":
//         return <Users className="h-4 w-4 text-[#5a5a44]" />
//       case "serving":
//         return <Clock className="h-4 w-4 text-[#5a5a44]" />
//       default:
//         return <Users className="h-4 w-4 text-[#9a9a88]" />
//     }
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-[#fdfcf7]">
//         <div className="text-center">
//           <LoadingSpinner size="lg" className="mx-auto mb-4" />
//           <p className="text-lg font-medium text-[#5a5a44]">Loading tables...</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-[#fdfcf7] relative overflow-hidden font-sans text-[#5a5a44]">
//       <div className="relative z-10 max-w-6xl mx-auto p-6">
//         {/* Header Section */}
//         <div className="text-center mb-12">
// <img src="/logo.png" alt="Oona Logo" className="mx-auto w-40 h-auto  drop-shadow-md" />
//           <h1 className="text-5xl font-serif font-medium tracking-wider text-[#7a7a5c]">oona</h1>
//           <p className="uppercase tracking-wide text-sm text-[#9a9a88] mb-2">The One</p>
//           <hr className="w-10 border-[#c8c8aa] mx-auto my-3" />
//           <p className="text-md text-[#77775f]">Please select your table to begin</p>
//         </div>

//         {/* Admin Button */}
//         <div className="flex justify-end mb-8">
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => router.push("/admin/login")}
//             className="border border-[#dadac3] text-[#606047] hover:bg-[#eaeada] transition"
//           >
//             <Settings className="h-4 w-4 mr-2" />
//             Staff Portal
//           </Button>
//         </div>

//         {/* Tables Grid */}
//         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 mb-12">
//           {tables.map((table, index) => (
//             <div
//               key={table.id}
//               className={`cursor-pointer rounded-2xl overflow-hidden shadow-sm transition-all duration-300 border ${
//                 selectedTable === table.table_number ? "border-[#7a7a5c]" : "border-[#e2e2d0]"
//               } ${hoveredTable === table.table_number ? "scale-105" : ""}`}
//               onClick={() => handleTableSelect(table.table_number)}
//               onMouseEnter={() => setHoveredTable(table.table_number)}
//               onMouseLeave={() => setHoveredTable(null)}
//               style={{ animationDelay: `${index * 0.05}s` }}
//             >
//               <div className={`h-24 ${getTableStatusColor(table.status)} flex items-center justify-center relative`}>
//                 <div className="absolute inset-0 bg-[url('/ass.png')] opacity-5"></div>

//                 <div className="z-10 text-center">
//                   <div className="text-2xl font-semibold mb-1">{table.table_number}</div>
//                   <div className="flex items-center justify-center gap-1 text-sm font-medium">
//                     {getTableStatusIcon(table.status)}
//                     <span>
//                       {table.status === "free"
//                         ? "Available"
//                         : table.status === "serving"
//                         ? "In Service"
//                         : "Completed"}
//                     </span>
//                   </div>
//                 </div>

//                 {/* Hover Overlay */}
//                 {hoveredTable === table.table_number && (
//                   <div className="absolute inset-0 bg-white/20"></div>
//                 )}

//                 {/* Selection Highlight */}
//                 {selectedTable === table.table_number && (
//                   <div className="absolute inset-0 border-2 border-[#7a7a5c] rounded-2xl"></div>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Info Section */}
//         <div className="text-center">
//           <div className="inline-flex items-center gap-6 bg-[#f6f6eb] px-8 py-4 rounded-full border border-[#e0e0ce] shadow-sm">
//             <div className="flex items-center gap-2">
//               <div className="w-3 h-3 bg-[#a8cfa1] rounded-full"></div>
//               <span className="text-sm">Available</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <div className="w-3 h-3 bg-[#f4d79a] rounded-full"></div>
//               <span className="text-sm">In Service</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <div className="w-3 h-3 bg-[#c4c4b5] rounded-full"></div>
//               <span className="text-sm">Completed</span>
//             </div>
//           </div>
//           <p className="text-sm text-[#88886e] mt-4">Tap any available table to begin your dining experience</p>
//           <p className="text-xs text-[#aaa] mt-2 italic">Each table maintains its own separate order</p>
//         </div>
//       </div>
//     </div>
//   )
// }



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
