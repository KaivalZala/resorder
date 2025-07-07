"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"
import type { CartItem } from "./types"

interface CartState {
  items: CartItem[]
  tableNumber: number | null
}

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { item_id: string; quantity: number } }
  | { type: "UPDATE_NOTE"; payload: { item_id: string; note: string } }
  | { type: "CLEAR_CART" }
  | { type: "SET_TABLE"; payload: number }
  | { type: "LOAD_CART"; payload: CartState }

const CartContext = createContext<{
  state: CartState
  dispatch: React.Dispatch<CartAction>
  getCartTotal: () => number
  getCartCount: () => number
} | null>(null)

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItem = state.items.find((item) => item.item_id === action.payload.item_id)
      if (existingItem) {
        return {
          ...state,
          items: state.items.map((item) =>
            item.item_id === action.payload.item_id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item,
          ),
        }
      }
      return {
        ...state,
        items: [...state.items, action.payload],
      }
    }
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((item) => item.item_id !== action.payload),
      }
    case "UPDATE_QUANTITY":
      return {
        ...state,
        items: state.items
          .map((item) =>
            item.item_id === action.payload.item_id ? { ...item, quantity: action.payload.quantity } : item,
          )
          .filter((item) => item.quantity > 0),
      }
    case "UPDATE_NOTE":
      return {
        ...state,
        items: state.items.map((item) =>
          item.item_id === action.payload.item_id ? { ...item, note: action.payload.note } : item,
        ),
      }
    case "CLEAR_CART":
      return {
        ...state,
        items: [],
      }
    case "SET_TABLE":
      return {
        tableNumber: action.payload,
        items: [], // Clear items when switching tables
      }
    case "LOAD_CART":
      return action.payload
    default:
      return state
  }
}

// Helper function to get table-specific localStorage key
function getTableCartKey(tableNumber: number | null): string {
  return tableNumber ? `restaurant-cart-table-${tableNumber}` : "restaurant-cart-no-table"
}

// Helper function to save cart to localStorage for specific table
function saveCartToStorage(state: CartState) {
  if (state.tableNumber) {
    const key = getTableCartKey(state.tableNumber)
    localStorage.setItem(key, JSON.stringify(state))
  }
}

// Helper function to load cart from localStorage for specific table
function loadCartFromStorage(tableNumber: number): CartState {
  const key = getTableCartKey(tableNumber)
  try {
    const savedCart = localStorage.getItem(key)
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart)
      // Ensure the cart belongs to the correct table
      if (parsedCart.tableNumber === tableNumber) {
        return parsedCart
      }
    }
  } catch (error) {
    console.error("Error loading cart from localStorage:", error)
  }

  // Return empty cart for this table if no valid cart found
  return {
    items: [],
    tableNumber: tableNumber,
  }
}

// Helper function to clear all table carts (useful for cleanup)
function clearAllTableCarts() {
  const keys = Object.keys(localStorage)
  keys.forEach((key) => {
    if (key.startsWith("restaurant-cart-table-")) {
      localStorage.removeItem(key)
    }
  })
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    tableNumber: null,
  })

  // Load cart when table number changes
  useEffect(() => {
    if (state.tableNumber) {
      const tableCart = loadCartFromStorage(state.tableNumber)
      // Only load if it's different from current state
      if (JSON.stringify(tableCart) !== JSON.stringify(state)) {
        dispatch({ type: "LOAD_CART", payload: tableCart })
      }
    }
  }, [state.tableNumber])

  // Save cart to localStorage whenever cart state changes (but not on initial load)
  useEffect(() => {
    if (state.tableNumber && state.items.length >= 0) {
      saveCartToStorage(state)
    }
  }, [state.items, state.tableNumber])

  // Enhanced dispatch function to handle table-specific operations
  const enhancedDispatch = (action: CartAction) => {
    if (action.type === "SET_TABLE") {
      // Save current cart before switching tables
      if (state.tableNumber && state.items.length > 0) {
        saveCartToStorage(state)
      }

      // Load cart for new table
      const newTableCart = loadCartFromStorage(action.payload)
      dispatch({ type: "LOAD_CART", payload: newTableCart })
    } else if (action.type === "CLEAR_CART" && state.tableNumber) {
      // Clear cart from localStorage when clearing
      const key = getTableCartKey(state.tableNumber)
      localStorage.removeItem(key)
      dispatch(action)
    } else {
      dispatch(action)
    }
  }

  const getCartTotal = () => {
    return state.items.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getCartCount = () => {
    return state.items.reduce((count, item) => count + item.quantity, 0)
  }

  return (
    <CartContext.Provider
      value={{
        state,
        dispatch: enhancedDispatch,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

// Export utility functions for advanced cart management
export { clearAllTableCarts, getTableCartKey }
