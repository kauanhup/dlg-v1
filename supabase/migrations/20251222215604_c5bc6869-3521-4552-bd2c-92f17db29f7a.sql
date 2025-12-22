-- Add upgrade_from_subscription_id column to track which subscription to cancel on upgrade
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS upgrade_from_subscription_id uuid REFERENCES public.user_subscriptions(id) ON DELETE SET NULL;

-- Add upgrade_credit_amount column to store the credit applied
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS upgrade_credit_amount numeric DEFAULT 0;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_upgrade_from_subscription ON public.orders(upgrade_from_subscription_id) WHERE upgrade_from_subscription_id IS NOT NULL;