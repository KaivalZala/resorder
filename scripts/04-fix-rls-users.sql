-- 1. Drop the recursive policy if it exists
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;

-- 2. Disable RLS on the users table to avoid recursion.
--    Only Supabase internal procedures (or future explicit policies)
--    will access this table.
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 3. (Optional) If you still want an admin-only SELECT policy
--    that does NOT recurse, uncomment the block below and make
--    sure you add a custom JWT claim like `role=admin`.
--
-- CREATE POLICY "Admins can view all users (jwt)"
--   ON public.users
--   FOR SELECT
--   USING (auth.jwt() ->> 'role' = 'admin');
