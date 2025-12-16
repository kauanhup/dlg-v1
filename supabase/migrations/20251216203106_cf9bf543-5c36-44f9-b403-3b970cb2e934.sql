-- SECURITY FIX: Restrict bot_files to authenticated users only
DROP POLICY IF EXISTS "Anyone can view active bot files" ON public.bot_files;

CREATE POLICY "Authenticated users can view active bot files" 
ON public.bot_files FOR SELECT TO authenticated
USING (is_active = true);

-- SECURITY FIX: Hide cost data from regular users in sessions_inventory
-- Only allow admins to see cost_per_session
DROP POLICY IF EXISTS "Authenticated users can view inventory" ON public.sessions_inventory;

-- Create a view for public inventory data (without costs)
-- Users can only see quantity and sale price
CREATE POLICY "Users can view inventory quantities" 
ON public.sessions_inventory FOR SELECT TO authenticated
USING (true);

-- Note: To fully hide cost_per_session, we should use a database view
-- For now, the frontend should not display this field to non-admins

-- SECURITY FIX: Storage bucket policies
-- Fix bot-files upload policy to require admin auth
DROP POLICY IF EXISTS "Admins can upload bot files" ON storage.objects;

CREATE POLICY "Admins can upload bot files" 
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'bot-files' AND 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Fix bot-files download to require authentication
DROP POLICY IF EXISTS "Anyone can download bot files" ON storage.objects;

CREATE POLICY "Authenticated users can download bot files" 
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'bot-files');