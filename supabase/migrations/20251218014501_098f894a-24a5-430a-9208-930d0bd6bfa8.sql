-- Add email settings to gateway_settings (or create new table)
-- We'll add new columns for Resend configuration to gateway_settings
-- This keeps all API configurations in one place

ALTER TABLE public.gateway_settings 
ADD COLUMN IF NOT EXISTS resend_api_key text,
ADD COLUMN IF NOT EXISTS resend_from_email text,
ADD COLUMN IF NOT EXISTS resend_from_name text DEFAULT 'SWEXTRACTOR',
ADD COLUMN IF NOT EXISTS email_enabled boolean DEFAULT false;

-- Update the existing row if it exists, or insert default
INSERT INTO public.gateway_settings (provider, is_active, email_enabled)
VALUES ('pixup', false, false)
ON CONFLICT DO NOTHING;