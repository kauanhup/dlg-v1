-- =====================================================
-- SECURITY FIX: Enforce authentication on all tables
-- Drop all existing policies and recreate as PERMISSIVE
-- =====================================================

-- 1. gateway_settings - CRITICAL: Contains API secrets
DROP POLICY IF EXISTS "Admins can manage gateway settings" ON public.gateway_settings;
CREATE POLICY "Only admins can access gateway settings" 
ON public.gateway_settings 
FOR ALL 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 2. profiles - Contains PII (email, whatsapp)
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Banned users cannot update their profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile if not banned" 
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = user_id AND banned = false)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update any profile" 
ON public.profiles FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 3. payments - Contains financial data
DROP POLICY IF EXISTS "Admins can manage payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;
DROP POLICY IF EXISTS "Users can create their own payments" ON public.payments;
DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;

CREATE POLICY "Users can view own payments" 
ON public.payments FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payments" 
ON public.payments FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can create own payments" 
ON public.payments FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage payments" 
ON public.payments FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 4. orders - Contains purchase history
DROP POLICY IF EXISTS "Admins can manage orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;

CREATE POLICY "Users can view own orders" 
ON public.orders FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders" 
ON public.orders FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can create own orders" 
ON public.orders FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage orders" 
ON public.orders FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 5. user_sessions - Contains session data
DROP POLICY IF EXISTS "Admins can manage sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Admins can view all sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.user_sessions;

CREATE POLICY "Users can view own sessions" 
ON public.user_sessions FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage sessions" 
ON public.user_sessions FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 6. licenses - Contains subscription info
DROP POLICY IF EXISTS "Admins can manage licenses" ON public.licenses;
DROP POLICY IF EXISTS "Admins can view all licenses" ON public.licenses;
DROP POLICY IF EXISTS "Users can view their own licenses" ON public.licenses;

CREATE POLICY "Users can view own licenses" 
ON public.licenses FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage licenses" 
ON public.licenses FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 7. user_subscriptions - Contains billing data
DROP POLICY IF EXISTS "Admins can manage subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.user_subscriptions;

CREATE POLICY "Users can view own subscriptions" 
ON public.user_subscriptions FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage subscriptions" 
ON public.user_subscriptions FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 8. login_history - Contains IP/device info
DROP POLICY IF EXISTS "Admins can view all login history" ON public.login_history;
DROP POLICY IF EXISTS "Users can insert their own login history" ON public.login_history;
DROP POLICY IF EXISTS "Users can view their own login history" ON public.login_history;

CREATE POLICY "Users can view own login history" 
ON public.login_history FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own login history" 
ON public.login_history FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all login history" 
ON public.login_history FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 9. user_roles - Contains privilege info
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;

CREATE POLICY "Users can view own role" 
ON public.user_roles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles" 
ON public.user_roles FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 10. session_files - Contains file paths
DROP POLICY IF EXISTS "Admins can manage session files" ON public.session_files;
DROP POLICY IF EXISTS "Users can view their purchased sessions" ON public.session_files;

CREATE POLICY "Users can view purchased sessions" 
ON public.session_files FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage session files" 
ON public.session_files FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));