-- Insert sample menu items
INSERT INTO public.menu_items (name, description, price, category, tags, image_url) VALUES
-- Starters
('Chicken Wings', 'Crispy buffalo wings served with ranch dip', 12.99, 'Starters', '{"spicy", "non-veg"}', '/placeholder.svg?height=200&width=300'),
('Mozzarella Sticks', 'Golden fried mozzarella with marinara sauce', 8.99, 'Starters', '{"veg"}', '/placeholder.svg?height=200&width=300'),
('Nachos Supreme', 'Loaded nachos with cheese, jalapeños, and sour cream', 10.99, 'Starters', '{"veg", "spicy"}', '/placeholder.svg?height=200&width=300'),
('Caesar Salad', 'Fresh romaine lettuce with caesar dressing and croutons', 9.99, 'Starters', '{"veg", "healthy"}', '/placeholder.svg?height=200&width=300'),

-- Mains
('Grilled Chicken Burger', 'Juicy grilled chicken with lettuce, tomato, and fries', 15.99, 'Mains', '{"non-veg"}', '/placeholder.svg?height=200&width=300'),
('Margherita Pizza', 'Classic pizza with fresh mozzarella and basil', 14.99, 'Mains', '{"veg"}', '/placeholder.svg?height=200&width=300'),
('Beef Steak', 'Premium ribeye steak cooked to perfection', 24.99, 'Mains', '{"non-veg"}', '/placeholder.svg?height=200&width=300'),
('Vegetable Pasta', 'Penne pasta with seasonal vegetables in tomato sauce', 12.99, 'Mains', '{"veg"}', '/placeholder.svg?height=200&width=300'),
('Fish and Chips', 'Beer-battered fish with crispy fries and tartar sauce', 16.99, 'Mains', '{"non-veg"}', '/placeholder.svg?height=200&width=300'),

-- Beverages
('Coca Cola', 'Classic refreshing cola', 2.99, 'Beverages', '{}', '/placeholder.svg?height=200&width=300'),
('Fresh Orange Juice', 'Freshly squeezed orange juice', 4.99, 'Beverages', '{"healthy"}', '/placeholder.svg?height=200&width=300'),
('Coffee', 'Freshly brewed coffee', 3.99, 'Beverages', '{}', '/placeholder.svg?height=200&width=300'),
('Iced Tea', 'Refreshing iced tea with lemon', 3.49, 'Beverages', '{}', '/placeholder.svg?height=200&width=300');
