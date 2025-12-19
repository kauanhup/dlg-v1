-- Add evopay_webhook_url column to gateway_settings
ALTER TABLE public.gateway_settings 
ADD COLUMN IF NOT EXISTS evopay_webhook_url text;