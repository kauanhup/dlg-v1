-- Drop existing restrictive policy and create permissive one for admin DELETE
DROP POLICY IF EXISTS "Admins can manage subscriptions" ON public.user_subscriptions;

-- Create permissive policy for admin full access
CREATE POLICY "Admins can manage subscriptions" 
ON public.user_subscriptions 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));