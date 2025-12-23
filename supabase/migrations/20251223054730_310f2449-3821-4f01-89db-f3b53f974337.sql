-- Drop the existing policy for viewing plans
DROP POLICY IF EXISTS "Anyone can view active plans" ON public.subscription_plans;

-- Create a new policy that allows both authenticated AND anonymous users to view active plans
CREATE POLICY "Public can view active plans" 
ON public.subscription_plans 
FOR SELECT 
TO public
USING (is_active = true);