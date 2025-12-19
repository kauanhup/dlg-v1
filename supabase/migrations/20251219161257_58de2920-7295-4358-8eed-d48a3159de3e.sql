-- Add EvoPay columns to gateway_settings
ALTER TABLE public.gateway_settings
ADD COLUMN IF NOT EXISTS evopay_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS evopay_api_key text;