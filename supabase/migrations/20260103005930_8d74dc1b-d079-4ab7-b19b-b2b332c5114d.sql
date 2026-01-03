-- Add card info columns to user_subscriptions
ALTER TABLE public.user_subscriptions
ADD COLUMN IF NOT EXISTS card_last_four text,
ADD COLUMN IF NOT EXISTS card_brand text;

COMMENT ON COLUMN public.user_subscriptions.card_last_four IS 'Last 4 digits of the registered credit card';
COMMENT ON COLUMN public.user_subscriptions.card_brand IS 'Brand/flag of the credit card (visa, mastercard, etc.)';