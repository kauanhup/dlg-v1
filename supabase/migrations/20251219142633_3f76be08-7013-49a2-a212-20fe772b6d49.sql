-- Add Mercado Pago configuration fields to gateway_settings
ALTER TABLE public.gateway_settings
ADD COLUMN IF NOT EXISTS mercadopago_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS mercadopago_access_token text,
ADD COLUMN IF NOT EXISTS mercadopago_public_key text;