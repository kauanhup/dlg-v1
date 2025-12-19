-- Add email template logo fields to gateway_settings
ALTER TABLE public.gateway_settings
ADD COLUMN IF NOT EXISTS email_template_show_logo boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS email_template_logo_url text DEFAULT NULL;