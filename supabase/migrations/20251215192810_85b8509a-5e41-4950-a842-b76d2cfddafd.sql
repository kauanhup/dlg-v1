-- Drop existing restrictive policies on subscription_plans
DROP POLICY IF EXISTS "Admins can manage plans" ON public.subscription_plans;
DROP POLICY IF EXISTS "Anyone can view active plans" ON public.subscription_plans;

-- Create PERMISSIVE policies
CREATE POLICY "Admins can manage plans" 
ON public.subscription_plans 
FOR ALL 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active plans" 
ON public.subscription_plans 
FOR SELECT 
TO authenticated
USING (is_active = true);

-- Fix session_combos policies too
DROP POLICY IF EXISTS "Admins can manage combos" ON public.session_combos;
DROP POLICY IF EXISTS "Anyone can view active combos" ON public.session_combos;

CREATE POLICY "Admins can manage combos" 
ON public.session_combos 
FOR ALL 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active combos" 
ON public.session_combos 
FOR SELECT 
TO authenticated
USING (is_active = true);

-- Fix sessions_inventory policies
DROP POLICY IF EXISTS "Admins can manage inventory" ON public.sessions_inventory;
DROP POLICY IF EXISTS "Anyone can view inventory quantities" ON public.sessions_inventory;

CREATE POLICY "Admins can manage inventory" 
ON public.sessions_inventory 
FOR ALL 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view inventory" 
ON public.sessions_inventory 
FOR SELECT 
TO authenticated
USING (true);

-- Insert sample data for session_combos
INSERT INTO public.session_combos (type, quantity, price, is_popular, is_active)
VALUES 
  ('brasileiras', 5, 99.90, false, true),
  ('brasileiras', 10, 179.90, true, true),
  ('brasileiras', 25, 399.90, false, true),
  ('estrangeiras', 5, 49.90, false, true),
  ('estrangeiras', 10, 89.90, true, true),
  ('estrangeiras', 25, 199.90, false, true)
ON CONFLICT DO NOTHING;

-- Insert sample data for sessions_inventory
INSERT INTO public.sessions_inventory (type, quantity, cost_per_session, sale_price_per_session)
VALUES 
  ('brasileiras', 150, 8.00, 25.00),
  ('estrangeiras', 200, 5.00, 15.00)
ON CONFLICT DO NOTHING;