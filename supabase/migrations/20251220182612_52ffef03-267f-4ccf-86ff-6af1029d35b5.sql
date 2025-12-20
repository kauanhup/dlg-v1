-- Allow users to cancel their own orders (update to cancelled status only)
CREATE POLICY "Users can cancel own orders" 
ON public.orders 
FOR UPDATE 
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id AND status = 'cancelled');

-- Allow users to cancel their own payments (update to cancelled status only)
CREATE POLICY "Users can cancel own payments" 
ON public.payments 
FOR UPDATE 
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (auth.uid() = user_id AND status = 'cancelled');