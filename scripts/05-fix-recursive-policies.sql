-------------------------------------------------------------------------------
-- 0. SAFETY CHECK
-------------------------------------------------------------------------------
-- Make sure this script is applied AFTER 01-03 migrations.
-- It only adjusts policies; no data is touched.

-------------------------------------------------------------------------------
-- 1. USERS TABLE  ➜  disable RLS (internal use only)
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users"        ON public.users;

ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-------------------------------------------------------------------------------
-- 2. MENU_ITEMS  ──────────────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage menu items" ON public.menu_items;

-- Anyone can read items that are in stock  (already exists, keep it)
-- CREATE POLICY "Anyone can view in-stock menu items" ...

-- ADMIN / STAFF can INSERT, UPDATE, DELETE (uses JWT claim instead of sub-query)
CREATE POLICY "Admins/staff can write menu items"
  ON public.menu_items
  FOR INSERT, UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff'));  -- required for INSERT

-------------------------------------------------------------------------------
-- 3. TABLES  ─────────────────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage tables" ON public.tables;

-- Anyone can read tables  (already exists, keep it)
-- CREATE POLICY "Anyone can view tables" ...

CREATE POLICY "Admins/staff can write tables"
  ON public.tables
  FOR INSERT, UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff'));

-------------------------------------------------------------------------------
-- 4. BILLING_SETTINGS  ───────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage billing settings" ON public.billing_settings;

-- Anyone can read settings (already exists)

CREATE POLICY "Admins only write billing settings"
  ON public.billing_settings
  FOR INSERT, UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-------------------------------------------------------------------------------
-- 5. ORDERS  ─────────────────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;

-- Anyone can INSERT an order & SELECT their own (already exists, keep them)

CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

-------------------------------------------------------------------------------
-- 6. ORDER_STATUS_LOGS  ──────────────────────────────────────────────────────
-------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage order logs" ON public.order_status_logs;

CREATE POLICY "Admins/staff/kitchen write order logs"
  ON public.order_status_logs
  FOR ALL
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));
CREATE POLICY "Admins/staff/kitchen can view all orders"
  ON public.orders
  FOR SELECT
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

CREATE POLICY "Admins/staff/kitchen write orders"
  ON public.orders
  FOR UPDATE, DELETE
  USING  (auth.jwt() ->> 'role' IN ('admin','staff','kitchen'));

------------------------
