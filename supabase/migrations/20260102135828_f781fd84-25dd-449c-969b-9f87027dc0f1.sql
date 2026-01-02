-- Add Asaas fields to gateway_settings table
ALTER TABLE public.gateway_settings 
ADD COLUMN IF NOT EXISTS asaas_api_key TEXT,
ADD COLUMN IF NOT EXISTS asaas_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS asaas_webhook_url TEXT,
ADD COLUMN IF NOT EXISTS asaas_environment TEXT DEFAULT 'sandbox',
ADD COLUMN IF NOT EXISTS asaas_wallet_id TEXT;