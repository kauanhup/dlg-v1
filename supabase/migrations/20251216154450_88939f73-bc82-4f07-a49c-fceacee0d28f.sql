-- Add max subscriptions per user limit to subscription plans
ALTER TABLE public.subscription_plans 
ADD COLUMN max_subscriptions_per_user integer DEFAULT NULL;

-- NULL = unlimited subscriptions
-- 1 = can only subscribe once (good for trial plans)
-- Any other number = limit to that many subscriptions

COMMENT ON COLUMN public.subscription_plans.max_subscriptions_per_user IS 'Maximum times a user can subscribe to this plan. NULL means unlimited.';