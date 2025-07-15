-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'staff', 'kitchen')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tables table
CREATE TABLE public.tables (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  table_number INTEGER UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'free' CHECK (status IN ('free', 'serving', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create menu_items table
CREATE TABLE public.menu_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  image_url TEXT,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  in_stock BOOLEAN DEFAULT true,
  discount DECIMAL(10,2),
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create billing_settings table
CREATE TABLE public.billing_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  gst_percent DECIMAL(5,2) DEFAULT 5.00,
  service_charge_percent DECIMAL(5,2) DEFAULT 10.00,
  default_discount_percent DECIMAL(5,2) DEFAULT 0.00,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  table_number INTEGER NOT NULL,
  items JSONB NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  special_notes TEXT,
  admin_message TEXT,
  customer_message TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_status_logs table
CREATE TABLE public.order_status_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default billing settings
INSERT INTO public.billing_settings (gst_percent, service_charge_percent, default_discount_percent)
VALUES (5.00, 10.00, 0.00);

-- Insert sample tables (1-30)
INSERT INTO public.tables (table_number)
SELECT generate_series(1, 30);
