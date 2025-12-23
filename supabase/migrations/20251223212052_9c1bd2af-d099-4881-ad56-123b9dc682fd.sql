-- FIX F2: Remove RLS INSERT policy for users on login_history
-- Users should NOT be able to insert directly - only via service_role (edge function)

-- Drop the vulnerable policy that allows users to insert their own records
DROP POLICY IF EXISTS "Users can insert own login history" ON public.login_history;

-- Add comment explaining security decision
COMMENT ON TABLE public.login_history IS 'Login attempts are logged only via service_role (edge functions) to prevent manipulation. Users can only SELECT their own records.';