-- Add column to track when expiration notification was sent
ALTER TABLE public.user_subscriptions 
ADD COLUMN IF NOT EXISTS expiration_notified_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add index for efficient queries on expiring subscriptions
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_expiration_notify 
ON public.user_subscriptions (status, next_billing_date, expiration_notified_at) 
WHERE status = 'active';