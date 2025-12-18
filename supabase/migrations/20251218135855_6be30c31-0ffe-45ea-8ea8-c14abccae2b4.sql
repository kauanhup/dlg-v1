-- Add email template customization columns to gateway_settings
ALTER TABLE public.gateway_settings 
ADD COLUMN IF NOT EXISTS email_template_title TEXT DEFAULT '✉️ Verificação de Email',
ADD COLUMN IF NOT EXISTS email_template_greeting TEXT DEFAULT 'Olá {name}!',
ADD COLUMN IF NOT EXISTS email_template_message TEXT DEFAULT 'Seu código de verificação é:',
ADD COLUMN IF NOT EXISTS email_template_expiry_text TEXT DEFAULT 'Este código expira em 15 minutos.',
ADD COLUMN IF NOT EXISTS email_template_footer TEXT DEFAULT 'SWEXTRACTOR - Sistema de Gestão',
ADD COLUMN IF NOT EXISTS email_template_bg_color TEXT DEFAULT '#0a0a0a',
ADD COLUMN IF NOT EXISTS email_template_accent_color TEXT DEFAULT '#4ade80';