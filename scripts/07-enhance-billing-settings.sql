-- Drop the existing billing_settings table and recreate with more flexibility
DROP TABLE IF EXISTS public.billing_settings CASCADE;

-- Create a more flexible billing_settings table
CREATE TABLE public.billing_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  field_name TEXT NOT NULL,
  field_label TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('percentage', 'fixed_amount', 'tax')),
  field_value DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  is_active BOOLEAN DEFAULT true,
  applies_to TEXT NOT NULL DEFAULT 'subtotal' CHECK (applies_to IN ('subtotal', 'total')),
  calculation_order INTEGER DEFAULT 1,
  is_system_field BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(field_name)
);

-- Insert default billing fields
INSERT INTO public.billing_settings (field_name, field_label, field_type, field_value, calculation_order, is_system_field) VALUES
('gst', 'GST', 'percentage', 5.00, 1, true),
('service_charge', 'Service Charge', 'percentage', 10.00, 2, true),
('delivery_fee', 'Delivery Fee', 'fixed_amount', 0.00, 3, false),
('discount', 'Discount', 'percentage', 0.00, 4, false);

-- Update RLS policy for billing_settings
DROP POLICY IF EXISTS "Anyone can view billing settings" ON public.billing_settings;
DROP POLICY IF EXISTS "Admins only write billing settings" ON public.billing_settings;

CREATE POLICY "Anyone can view active billing settings" ON public.billing_settings
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage billing settings" ON public.billing_settings
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');
