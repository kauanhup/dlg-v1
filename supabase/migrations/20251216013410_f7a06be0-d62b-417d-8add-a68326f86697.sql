-- Add promotional price column to subscription_plans
ALTER TABLE public.subscription_plans 
ADD COLUMN promotional_price numeric DEFAULT NULL;