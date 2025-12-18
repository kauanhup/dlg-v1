-- Add reCAPTCHA fields to gateway_settings
ALTER TABLE public.gateway_settings
ADD COLUMN IF NOT EXISTS recaptcha_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS recaptcha_site_key text,
ADD COLUMN IF NOT EXISTS recaptcha_secret_key text;