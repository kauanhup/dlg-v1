-- ============================================
-- SWEXTRACTOR - DATABASE DATA (DADOS)
-- Gerado em: 2025-12-27
-- Use este arquivo APÓS rodar o database_schema.sql
-- ============================================

-- ============================================
-- 1. SUBSCRIPTION PLANS (Planos de Assinatura)
-- ============================================

INSERT INTO public.subscription_plans (id, name, price, promotional_price, period, features, is_active, max_subscriptions_per_user, created_at, updated_at) VALUES
('8e698264-70db-4a29-b0bc-eedac5d3eb92', 'teste gratís', 0.00, NULL, 7, ARRAY['1 dispositivo', '10 sessions de limite', 'boa pra testes'], true, 1, '2025-12-16 16:21:41.352075+00', '2025-12-22 20:52:29.5113+00'),
('083be3a4-da67-4e1c-bf34-86e8cc2176c1', '7d', 2.00, 1, 7, ARRAY['teste', 'teste', 'teste'], true, NULL, '2025-12-16 18:28:22.513406+00', '2025-12-24 01:14:55.275834+00'),
('e1c42cd6-287f-4aa2-a49c-724621de6f65', '15d', 3.00, 1.2, 15, ARRAY['r', 'r', 'r'], true, NULL, '2025-12-22 23:10:15.801717+00', '2025-12-24 01:14:55.275834+00'),
('76222bf8-7a39-4cbb-99c5-b0a5507414de', '30d', 25.00, 19.9, 30, ARRAY['até 30 session', '2 dispositivos', 'bom preço'], true, NULL, '2025-12-16 16:22:50.129861+00', '2025-12-24 01:14:55.275834+00'),
('db4ff5a0-2e7f-4f23-9860-c7c127213660', '1 ano', 60.00, 56.49, 365, ARRAY['ganha 10 sessions ao assinar pela primeira vez', '2 dispositivos', 'upload ilimitado de sessions'], true, NULL, '2025-12-16 01:32:39.441652+00', '2025-12-24 01:14:55.275834+00')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  promotional_price = EXCLUDED.promotional_price,
  period = EXCLUDED.period,
  features = EXCLUDED.features,
  is_active = EXCLUDED.is_active,
  max_subscriptions_per_user = EXCLUDED.max_subscriptions_per_user,
  updated_at = EXCLUDED.updated_at;

-- ============================================
-- 2. SESSION COMBOS (Combos de Sessões)
-- ============================================

INSERT INTO public.session_combos (id, type, quantity, price, is_active, is_popular, created_at) VALUES
('ca8a946d-68a7-4dee-8248-be450ab297c8', 'brasileiras', 3, 55.00, true, false, '2025-12-15 19:03:21.419302+00'),
('1ce3f0ab-f120-4a71-b80e-fb875090280b', 'estrangeiras', 9, 22.00, false, false, '2025-12-22 00:50:49.95315+00'),
('5cec6791-49fc-4359-8e29-dde1db1c4f9d', 'estrangeiras', 10, 49.90, false, false, '2025-12-15 19:03:21.419302+00'),
('6d52b5ad-3897-49df-8490-5bec0f993699', 'estrangeiras', 10, 49.90, true, false, '2025-12-22 12:07:46.1646+00'),
('4fa5719e-4623-4e8c-9a23-979ccc560563', 'estrangeiras', 10, 11.00, true, false, '2025-12-22 12:07:49.510499+00'),
('3e669c77-950e-48dc-b2ef-c26b7891ea55', 'estrangeiras', 11, 33.00, false, false, '2025-12-22 11:20:31.814932+00'),
('6d176e84-f4af-45c8-b11a-b3c8f98eb82c', 'estrangeiras', 10, 49.90, false, false, '2025-12-20 20:47:49.008486+00'),
('36583127-e064-43b2-bd5c-b42afd577211', 'estrangeiras', 5, 49.90, false, false, '2025-12-22 00:50:47.641398+00'),
('4e637dda-8bd0-442f-9dd9-666df3d9db08', 'brasileiras', 10, 77.00, true, false, '2025-12-16 00:30:39.187032+00')
ON CONFLICT (id) DO UPDATE SET
  type = EXCLUDED.type,
  quantity = EXCLUDED.quantity,
  price = EXCLUDED.price,
  is_active = EXCLUDED.is_active,
  is_popular = EXCLUDED.is_popular;

-- ============================================
-- 3. SESSIONS INVENTORY (Inventário de Sessões)
-- ============================================

INSERT INTO public.sessions_inventory (id, type, quantity, cost_per_session, sale_price_per_session, custom_quantity_enabled, custom_quantity_min, custom_price_per_unit, updated_at) VALUES
('cb01f062-0a5a-4b02-ad7c-94d9f514092e', 'estrangeiras', 1, 6.00, 5.98, true, 1, 6, '2025-12-24 23:24:09.650607+00'),
('d9483892-a65c-4a27-85c8-7efe0c551874', 'brasileiras', 5, 8.00, 9.98, true, 1, 1, '2025-12-25 18:30:07.001371+00')
ON CONFLICT (id) DO UPDATE SET
  type = EXCLUDED.type,
  quantity = EXCLUDED.quantity,
  cost_per_session = EXCLUDED.cost_per_session,
  sale_price_per_session = EXCLUDED.sale_price_per_session,
  custom_quantity_enabled = EXCLUDED.custom_quantity_enabled,
  custom_quantity_min = EXCLUDED.custom_quantity_min,
  custom_price_per_unit = EXCLUDED.custom_price_per_unit,
  updated_at = EXCLUDED.updated_at;

-- ============================================
-- 4. GATEWAY SETTINGS (Configurações de Pagamento)
-- ============================================

INSERT INTO public.gateway_settings (
  id, provider, is_active, client_id, client_secret, webhook_url,
  mercadopago_enabled, mercadopago_access_token, mercadopago_public_key,
  evopay_enabled, evopay_api_key, evopay_webhook_url, evopay_weight, pixup_weight,
  email_enabled, email_verification_enabled, password_recovery_enabled,
  recaptcha_enabled, recaptcha_site_key, recaptcha_secret_key,
  resend_api_key, resend_from_email, resend_from_name,
  email_template_title, email_template_greeting, email_template_message,
  email_template_expiry_text, email_template_footer,
  email_template_bg_color, email_template_accent_color, email_template_logo_url, email_template_show_logo,
  created_at, updated_at
) VALUES (
  'fbfc78e5-af35-46c0-8253-20eb880f94ae',
  'pixup',
  true,
  'Fernanda2025_1077316989543833',
  'Hp2008.06!',
  'https://dlgconnect.com/api/webhook-pixup.php',
  false, NULL, NULL,
  true, 'c18f3bd5-97ec-4f17-a796-1e75bc581f64', 'https://dlgconnect.com/api/webhook-evopay.php', 0, 100,
  true, true, true,
  true, '6Ldzoy8sAAAAAFQ7LqX2wIX-SGueIlr4GgC__zkP', '6Ldzoy8sAAAAAKwBbAxiD_D9WXR3WxUZFDZTu5l-',
  're_7b4SqgoY_Kmusawxo6tgcUW2pUcBJeAe6', 'suporte@dlgconnect.com', 'DLG CONNECT',
  'Verificação de Email', 'Olá {name}!', 'Seu código de verificação é:',
  'Este código expira em 15 minutos.', 'DLG CONNECT - Sistema de Gestão',
  '#212121', '#ffffff', NULL, false,
  '2025-12-16 18:21:49.972839+00', '2025-12-25 18:10:13.401018+00'
)
ON CONFLICT (id) DO UPDATE SET
  provider = EXCLUDED.provider,
  is_active = EXCLUDED.is_active,
  client_id = EXCLUDED.client_id,
  client_secret = EXCLUDED.client_secret,
  webhook_url = EXCLUDED.webhook_url,
  mercadopago_enabled = EXCLUDED.mercadopago_enabled,
  evopay_enabled = EXCLUDED.evopay_enabled,
  evopay_api_key = EXCLUDED.evopay_api_key,
  evopay_webhook_url = EXCLUDED.evopay_webhook_url,
  evopay_weight = EXCLUDED.evopay_weight,
  pixup_weight = EXCLUDED.pixup_weight,
  email_enabled = EXCLUDED.email_enabled,
  email_verification_enabled = EXCLUDED.email_verification_enabled,
  password_recovery_enabled = EXCLUDED.password_recovery_enabled,
  recaptcha_enabled = EXCLUDED.recaptcha_enabled,
  recaptcha_site_key = EXCLUDED.recaptcha_site_key,
  recaptcha_secret_key = EXCLUDED.recaptcha_secret_key,
  resend_api_key = EXCLUDED.resend_api_key,
  resend_from_email = EXCLUDED.resend_from_email,
  resend_from_name = EXCLUDED.resend_from_name,
  email_template_title = EXCLUDED.email_template_title,
  email_template_greeting = EXCLUDED.email_template_greeting,
  email_template_message = EXCLUDED.email_template_message,
  email_template_expiry_text = EXCLUDED.email_template_expiry_text,
  email_template_footer = EXCLUDED.email_template_footer,
  email_template_bg_color = EXCLUDED.email_template_bg_color,
  email_template_accent_color = EXCLUDED.email_template_accent_color,
  email_template_show_logo = EXCLUDED.email_template_show_logo,
  updated_at = EXCLUDED.updated_at;

-- ============================================
-- 5. SYSTEM SETTINGS (Configurações do Sistema)
-- ============================================

INSERT INTO public.system_settings (id, key, value, updated_at) VALUES
('db1a6682-89f3-448d-ae7c-e0d11034c248', 'require_email_confirmation', 'false', '2025-12-18 11:05:04.357897+00'),
('081d40c1-680c-457e-9de0-830e2a75a31d', 'allow_registrations', 'true', '2025-12-18 23:39:58.962145+00'),
('94775cc2-f509-46cf-b213-706177cfb822', 'maintenance_mode', 'false', '2025-12-19 00:10:27.126122+00'),
('93de5a57-51fe-469c-9325-52a974520cec', 'allow_bot_download', 'true', '2025-12-23 03:10:54.123475+00')
ON CONFLICT (id) DO UPDATE SET
  key = EXCLUDED.key,
  value = EXCLUDED.value,
  updated_at = EXCLUDED.updated_at;

-- ============================================
-- FIM DOS DADOS
-- ============================================

-- IMPORTANTE: Este arquivo contém dados sensíveis como:
-- - Chaves de API (Evopay, Resend, reCAPTCHA)
-- - Credenciais do gateway de pagamento
-- 
-- NÃO compartilhe este arquivo publicamente!
-- Após importar, considere atualizar as credenciais no painel admin.
