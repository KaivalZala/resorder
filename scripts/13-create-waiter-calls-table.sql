-- Create waiter_calls table for tracking pending waiter calls
-- (Paste the full SQL table definition here)
CREATE TABLE public.waiter_calls (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  table_number INTEGER NOT NULL REFERENCES public.tables(table_number) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'attended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  attended_at TIMESTAMP WITH TIME ZONE
);

-- Add index to quickly find active calls
CREATE INDEX idx_waiter_calls_pending ON public.waiter_calls (status, created_at);

ALTER TABLE public.waiter_calls ENABLE ROW LEVEL SECURITY;


-- Allow anyone authenticated to insert (adjust as needed for your app)
CREATE POLICY "Allow insert for authenticated" ON public.waiter_calls
FOR INSERT USING (auth.role() = 'authenticated');

-- Allow authenticated users to select (admins/staff can see all)
CREATE POLICY "Allow select for authenticated" ON public.waiter_calls
FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Allow authenticated users to update (e.g., mark as attended)
CREATE POLICY "Allow update for authenticated" ON public.waiter_calls
FOR UPDATE USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');