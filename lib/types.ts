export interface MenuItem {
  id: string
  name: string
  image_url: string | null
  description: string | null
  price: number
  category: string
  tags: string[]
  in_stock: boolean
  created_at: string
  updated_at: string
}

export interface CartItem {
  item_id: string
  name: string
  price: number
  quantity: number
  note?: string
}

export interface Order {
  id: string
  table_number: number
  items: CartItem[]
  total_amount: number
  status: "pending" | "in_progress" | "completed" | "cancelled"
  special_notes: string | null
  admin_message: string | null
  customer_message: string | null
  rating: number | null
  feedback: string | null
  created_at: string
  updated_at: string
}

export interface BillingSettings {
  id: string
  field_name: string
  field_label: string
  field_type: "percentage" | "fixed_amount" | "tax"
  field_value: number
  is_active: boolean
  applies_to: "subtotal" | "total"
  calculation_order: number
  is_system_field: boolean
  created_at: string
  updated_at: string
}

export interface Table {
  id: string
  table_number: number
  status: "free" | "serving" | "completed"
  created_at: string
}
