-- Add policy for users to update their own license's auto_renew field
CREATE POLICY "Users can update own license auto_renew" 
ON public.licenses 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);