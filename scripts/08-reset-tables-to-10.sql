-- Remove all existing tables and recreate with only 10
DELETE FROM public.tables;

-- Insert only 10 tables initially
INSERT INTO public.tables (table_number)
SELECT generate_series(1, 10);
