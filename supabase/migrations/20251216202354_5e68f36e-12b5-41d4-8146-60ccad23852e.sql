-- Fix sessions_inventory to require authentication
DROP POLICY IF EXISTS "Anyone can view inventory" ON public.sessions_inventory;

CREATE POLICY "Authenticated users can view inventory" 
ON public.sessions_inventory FOR SELECT TO authenticated
USING (true);

-- Keep admins can manage
-- (policy already exists from previous setup)