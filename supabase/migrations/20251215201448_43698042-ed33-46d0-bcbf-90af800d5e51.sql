-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own login history" ON public.login_history;
DROP POLICY IF EXISTS "Users can insert their own login history" ON public.login_history;
DROP POLICY IF EXISTS "Admins can view all login history" ON public.login_history;

-- Recreate as PERMISSIVE policies (default)
CREATE POLICY "Users can view their own login history"
ON public.login_history
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own login history"
ON public.login_history
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all login history"
ON public.login_history
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));