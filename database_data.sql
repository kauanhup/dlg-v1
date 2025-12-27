-- ============================================
-- SWEXTRACTOR - DATABASE DATA COMPLETO
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
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, promotional_price = EXCLUDED.promotional_price, period = EXCLUDED.period, features = EXCLUDED.features, is_active = EXCLUDED.is_active, max_subscriptions_per_user = EXCLUDED.max_subscriptions_per_user, updated_at = EXCLUDED.updated_at;

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
ON CONFLICT (id) DO UPDATE SET type = EXCLUDED.type, quantity = EXCLUDED.quantity, price = EXCLUDED.price, is_active = EXCLUDED.is_active, is_popular = EXCLUDED.is_popular;

-- ============================================
-- 3. SESSIONS INVENTORY (Inventário de Sessões)
-- ============================================

INSERT INTO public.sessions_inventory (id, type, quantity, cost_per_session, sale_price_per_session, custom_quantity_enabled, custom_quantity_min, custom_price_per_unit, updated_at) VALUES
('cb01f062-0a5a-4b02-ad7c-94d9f514092e', 'estrangeiras', 1, 6.00, 5.98, true, 1, 6, '2025-12-24 23:24:09.650607+00'),
('d9483892-a65c-4a27-85c8-7efe0c551874', 'brasileiras', 5, 8.00, 9.98, true, 1, 1, '2025-12-25 18:30:07.001371+00')
ON CONFLICT (id) DO UPDATE SET type = EXCLUDED.type, quantity = EXCLUDED.quantity, cost_per_session = EXCLUDED.cost_per_session, sale_price_per_session = EXCLUDED.sale_price_per_session, custom_quantity_enabled = EXCLUDED.custom_quantity_enabled, custom_quantity_min = EXCLUDED.custom_quantity_min, custom_price_per_unit = EXCLUDED.custom_price_per_unit, updated_at = EXCLUDED.updated_at;

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
  'fbfc78e5-af35-46c0-8253-20eb880f94ae', 'pixup', true,
  'Fernanda2025_1077316989543833', 'Hp2008.06!', 'https://dlgconnect.com/api/webhook-pixup.php',
  false, NULL, NULL,
  true, 'c18f3bd5-97ec-4f17-a796-1e75bc581f64', 'https://dlgconnect.com/api/webhook-evopay.php', 0, 100,
  true, true, true,
  true, '6Ldzoy8sAAAAAFQ7LqX2wIX-SGueIlr4GgC__zkP', '6Ldzoy8sAAAAAKwBbAxiD_D9WXR3WxUZFDZTu5l-',
  're_7b4SqgoY_Kmusawxo6tgcUW2pUcBJeAe6', 'suporte@dlgconnect.com', 'DLG CONNECT',
  'Verificação de Email', 'Olá {name}!', 'Seu código de verificação é:',
  'Este código expira em 15 minutos.', 'DLG CONNECT - Sistema de Gestão',
  '#212121', '#ffffff', NULL, false,
  '2025-12-16 18:21:49.972839+00', '2025-12-25 18:10:13.401018+00'
) ON CONFLICT (id) DO UPDATE SET
  provider = EXCLUDED.provider, is_active = EXCLUDED.is_active, client_id = EXCLUDED.client_id, client_secret = EXCLUDED.client_secret,
  webhook_url = EXCLUDED.webhook_url, mercadopago_enabled = EXCLUDED.mercadopago_enabled, evopay_enabled = EXCLUDED.evopay_enabled,
  evopay_api_key = EXCLUDED.evopay_api_key, evopay_webhook_url = EXCLUDED.evopay_webhook_url, evopay_weight = EXCLUDED.evopay_weight,
  pixup_weight = EXCLUDED.pixup_weight, email_enabled = EXCLUDED.email_enabled, email_verification_enabled = EXCLUDED.email_verification_enabled,
  password_recovery_enabled = EXCLUDED.password_recovery_enabled, recaptcha_enabled = EXCLUDED.recaptcha_enabled,
  recaptcha_site_key = EXCLUDED.recaptcha_site_key, recaptcha_secret_key = EXCLUDED.recaptcha_secret_key,
  resend_api_key = EXCLUDED.resend_api_key, resend_from_email = EXCLUDED.resend_from_email, resend_from_name = EXCLUDED.resend_from_name,
  updated_at = EXCLUDED.updated_at;

-- ============================================
-- 5. SYSTEM SETTINGS (Configurações do Sistema)
-- ============================================

INSERT INTO public.system_settings (id, key, value, updated_at) VALUES
('db1a6682-89f3-448d-ae7c-e0d11034c248', 'require_email_confirmation', 'false', '2025-12-18 11:05:04.357897+00'),
('081d40c1-680c-457e-9de0-830e2a75a31d', 'allow_registrations', 'true', '2025-12-18 23:39:58.962145+00'),
('94775cc2-f509-46cf-b213-706177cfb822', 'maintenance_mode', 'false', '2025-12-19 00:10:27.126122+00'),
('93de5a57-51fe-469c-9325-52a974520cec', 'allow_bot_download', 'true', '2025-12-23 03:10:54.123475+00')
ON CONFLICT (id) DO UPDATE SET key = EXCLUDED.key, value = EXCLUDED.value, updated_at = EXCLUDED.updated_at;

-- ============================================
-- 6. PROFILES (Usuários)
-- ============================================

INSERT INTO public.profiles (id, user_id, name, email, whatsapp, avatar, banned, banned_at, ban_reason, created_at, updated_at) VALUES
('f773339a-0b0d-40e4-9a86-9e69ac7af271', '57c560f0-953f-4970-bdd0-bf9d0b9eda59', 'kauan hup', 'kauanzi@gmail.com', '65996498222', '😀', false, NULL, NULL, '2025-12-18 23:41:33.704977+00', '2025-12-18 23:41:33.704977+00'),
('a3d994c6-d136-4918-b56f-ddd8818a0be2', 'b656724c-1277-4723-b3a9-8b058450c9da', 'kauan hup', 'swextrator@gmail.com', '65996498222', 'Avatar 1', false, NULL, NULL, '2025-12-15 18:02:56.705403+00', '2025-12-20 20:23:04.618768+00'),
('5c776159-ed78-47b7-a31f-ab2853e38d1f', '83977247-0d04-4e7d-be63-da13e9598692', 'jaao hup', 'caixadeareia66@gmail.com', '65996498224', '😀', false, NULL, NULL, '2025-12-18 11:14:02.271844+00', '2025-12-22 15:50:08.227147+00'),
('67432484-00b9-474d-84f0-26a967da42f2', '5e39d027-d654-439d-8f19-d6d1c648150a', 'kauan hupp', 'kauanhup@gmail.com', '65996498222', 'Avatar 4', false, NULL, NULL, '2025-12-15 17:58:09.334775+00', '2025-12-25 02:34:03.703731+00'),
('8d521354-3ed7-4f9a-9c93-01acda30a373', '6693b6c1-f0a4-4bbf-bb4a-66565abcc394', 'Isadora Sayuri Mendonça', 'sayuriisadora39@gmail.com', '65998184857', 'Avatar 3', false, NULL, NULL, '2025-12-25 01:31:38.702+00', '2025-12-25 02:46:27.520141+00')
ON CONFLICT (id) DO UPDATE SET user_id = EXCLUDED.user_id, name = EXCLUDED.name, email = EXCLUDED.email, whatsapp = EXCLUDED.whatsapp, avatar = EXCLUDED.avatar, banned = EXCLUDED.banned, updated_at = EXCLUDED.updated_at;

-- ============================================
-- 7. USER ROLES (Roles dos Usuários)
-- ============================================

INSERT INTO public.user_roles (id, user_id, role, created_at) VALUES
('99cb24f7-04ce-415b-a9db-28e57ebc9085', '5e39d027-d654-439d-8f19-d6d1c648150a', 'user', '2025-12-15 17:58:09.334775+00'),
('1f40df74-a7e3-467c-8bb0-1af90659872b', 'b656724c-1277-4723-b3a9-8b058450c9da', 'admin', '2025-12-15 18:02:56.705403+00'),
('4ad955b3-6a84-487e-a030-b4b52d76fd35', '83977247-0d04-4e7d-be63-da13e9598692', 'user', '2025-12-18 11:14:02.271844+00'),
('04a269a6-e38f-47bf-a0f4-27f36987c0a0', '57c560f0-953f-4970-bdd0-bf9d0b9eda59', 'user', '2025-12-18 23:41:33.704977+00'),
('4818a11b-9877-485b-9231-7b5a61171e92', '6693b6c1-f0a4-4bbf-bb4a-66565abcc394', 'user', '2025-12-25 01:31:38.702+00')
ON CONFLICT (id) DO UPDATE SET user_id = EXCLUDED.user_id, role = EXCLUDED.role;

-- ============================================
-- 8. BOT FILES (Arquivos do Bot)
-- ============================================

INSERT INTO public.bot_files (id, file_name, file_path, file_size, version, is_active, uploaded_at, updated_at) VALUES
('92319250-2697-4c47-88c2-d5c91136fc3f', 'SWEXTRACTOR_5.exe', '1765897944189_SWEXTRACTOR_5.exe', 1646, '5', true, '2025-12-16 15:12:24.973974+00', '2025-12-20 00:19:49.277542+00')
ON CONFLICT (id) DO UPDATE SET file_name = EXCLUDED.file_name, file_path = EXCLUDED.file_path, file_size = EXCLUDED.file_size, version = EXCLUDED.version, is_active = EXCLUDED.is_active, updated_at = EXCLUDED.updated_at;

-- ============================================
-- 9. SESSION FILES (Arquivos de Sessão)
-- ============================================

INSERT INTO public.session_files (id, file_name, file_path, type, status, user_id, order_id, reserved_for_order, reserved_at, sold_at, uploaded_at) VALUES
('08230990-bd23-4118-9637-a7b035fa5814', '5547978825002.session', 'brasileiras/1766019734403_5547978825002.session', 'brasileiras', 'available', NULL, NULL, NULL, NULL, NULL, '2025-12-18 01:02:14.992934+00'),
('a852cba8-4594-46a5-b371-384e6c7a69d6', '5547979662754.session', 'brasileiras/1766019735217_5547979662754.session', 'brasileiras', 'available', NULL, NULL, NULL, NULL, NULL, '2025-12-18 01:02:15.704715+00'),
('43c2f1c3-3023-4464-9fd0-d87728bfe45d', '5547913980266.session', 'estrangeiras/1766235369125_5547913980266.session', 'estrangeiras', 'available', NULL, NULL, NULL, NULL, NULL, '2025-12-20 12:56:10.220437+00'),
('655f6ba6-c0cc-443a-8fc6-d676da2a5e87', '5547927583096.session', 'brasileiras/1766019731633_5547927583096.session', 'brasileiras', 'sold', '5e39d027-d654-439d-8f19-d6d1c648150a', '1adfc6e9-3281-4468-8976-f5218bfbaf9c', NULL, NULL, '2025-12-25 00:15:17.201085+00', '2025-12-18 01:02:12.135603+00'),
('74ded856-e30c-4e7e-8878-e259be3dbfeb', '5547957242468.session', 'brasileiras/1766019732365_5547957242468.session', 'brasileiras', 'sold', '5e39d027-d654-439d-8f19-d6d1c648150a', 'bd2a9dc0-f70c-483e-b63d-56350aafe2ca', NULL, NULL, '2025-12-25 00:21:25.243041+00', '2025-12-18 01:02:13.519981+00'),
('c3d9501a-b33c-4026-94a8-91c2fc9d4005', '5547957242468.session', 'brasileiras/1766402536705_5547957242468.session', 'brasileiras', 'available', NULL, NULL, NULL, NULL, NULL, '2025-12-22 11:22:17.87187+00'),
('5fcd1eeb-5069-4f8c-9a61-d5e06002038c', '65996498222.session', 'brasileiras/1765846228605_65996498222.session', 'brasileiras', 'sold', '5e39d027-d654-439d-8f19-d6d1c648150a', '112438e6-8ec1-41e7-977e-6f456d521889', NULL, NULL, '2025-12-24 23:18:30.103255+00', '2025-12-16 00:50:29.403309+00'),
('80839cc5-367c-4b6c-b1ca-c6c072864821', '5511920257231.session', 'brasileiras/1766019720990_5511920257231.session', 'brasileiras', 'sold', '5e39d027-d654-439d-8f19-d6d1c648150a', '382e49d6-2df1-4a16-8dfb-94128b7789c4', NULL, NULL, '2025-12-24 23:22:01.019973+00', '2025-12-18 01:02:01.584629+00'),
('6955fe95-200c-4830-b72b-40e7642c48c6', '5547913980266.session', 'brasileiras/1766019730146_5547913980266.session', 'brasileiras', 'sold', '5e39d027-d654-439d-8f19-d6d1c648150a', '8a060581-ea20-40e4-a958-b6e5433cbeed', NULL, NULL, '2025-12-24 23:27:38.003572+00', '2025-12-18 01:02:10.691024+00'),
('2079b7d8-8286-471b-b008-56bdfe7e8e2c', '5511918876762.session', 'brasileiras/1766019719019_5511918876762.session', 'brasileiras', 'sold', '5e39d027-d654-439d-8f19-d6d1c648150a', 'e38cef70-ee69-41be-813c-8dce673ed4c0', NULL, NULL, '2025-12-24 23:39:41.343776+00', '2025-12-18 01:02:00.785912+00'),
('9e9fbed3-0eb8-4775-a376-78c032f1540c', '5547918016823.session', 'brasileiras/1766019730917_5547918016823.session', 'brasileiras', 'sold', '5e39d027-d654-439d-8f19-d6d1c648150a', 'b5d452bb-0a1f-408b-97bd-c396ebc396ec', NULL, NULL, '2025-12-24 23:40:53.516706+00', '2025-12-18 01:02:11.461497+00'),
('a001916a-09cf-4f59-856b-3c8f31de4c44', '5547907438092.session', 'brasileiras/1766019729175_5547907438092.session', 'brasileiras', 'available', NULL, NULL, NULL, NULL, NULL, '2025-12-18 01:02:10.0065+00'),
('031f93c2-a2f4-4db0-9556-e1ec5dafbb5a', '5547975744254.session', 'brasileiras/1766019733645_5547975744254.session', 'brasileiras', 'available', NULL, NULL, NULL, NULL, NULL, '2025-12-18 01:02:14.169209+00')
ON CONFLICT (id) DO UPDATE SET file_name = EXCLUDED.file_name, file_path = EXCLUDED.file_path, type = EXCLUDED.type, status = EXCLUDED.status, user_id = EXCLUDED.user_id, order_id = EXCLUDED.order_id, sold_at = EXCLUDED.sold_at;

-- ============================================
-- 10. USER SESSIONS (Sessões dos Usuários)
-- ============================================

INSERT INTO public.user_sessions (id, user_id, order_id, type, session_data, is_downloaded, created_at) VALUES
('8127365a-bd47-4a83-98c3-1e2515dd0f10', '5e39d027-d654-439d-8f19-d6d1c648150a', '112438e6-8ec1-41e7-977e-6f456d521889', 'brasileiras', '65996498222.session', false, '2025-12-24 23:18:30.103255+00'),
('67f78d7d-a6b3-4b88-b7d0-74fbae88a46b', '5e39d027-d654-439d-8f19-d6d1c648150a', '382e49d6-2df1-4a16-8dfb-94128b7789c4', 'brasileiras', '5511920257231.session', false, '2025-12-24 23:22:01.019973+00'),
('5fb300d2-3e32-4e75-9924-c21943ef228b', '5e39d027-d654-439d-8f19-d6d1c648150a', '8a060581-ea20-40e4-a958-b6e5433cbeed', 'brasileiras', '5547913980266.session', false, '2025-12-24 23:27:38.003572+00'),
('ce4f24e1-8015-44f0-91a1-2d6b270b95c1', '5e39d027-d654-439d-8f19-d6d1c648150a', 'e38cef70-ee69-41be-813c-8dce673ed4c0', 'brasileiras', '5511918876762.session', false, '2025-12-24 23:39:41.343776+00'),
('70eb65a9-0645-4a33-a5ff-3a072bba0f0c', '5e39d027-d654-439d-8f19-d6d1c648150a', 'b5d452bb-0a1f-408b-97bd-c396ebc396ec', 'brasileiras', '5547918016823.session', false, '2025-12-24 23:40:53.516706+00'),
('63cbbaa5-527a-4a33-b074-9d122e5d226c', '5e39d027-d654-439d-8f19-d6d1c648150a', '1adfc6e9-3281-4468-8976-f5218bfbaf9c', 'brasileiras', '5547927583096.session', false, '2025-12-25 00:15:17.201085+00'),
('f5f660dd-1721-4fd8-bc86-d51e11f7397f', '5e39d027-d654-439d-8f19-d6d1c648150a', 'bd2a9dc0-f70c-483e-b63d-56350aafe2ca', 'brasileiras', '5547957242468.session', false, '2025-12-25 00:21:25.243041+00')
ON CONFLICT (id) DO UPDATE SET user_id = EXCLUDED.user_id, order_id = EXCLUDED.order_id, type = EXCLUDED.type, session_data = EXCLUDED.session_data, is_downloaded = EXCLUDED.is_downloaded;

-- ============================================
-- 11. LICENSES (Licenças) - Apenas ativas
-- ============================================

INSERT INTO public.licenses (id, user_id, plan_name, status, start_date, end_date, auto_renew, created_at, updated_at) VALUES
('0ca76e3a-91ff-489e-9905-867eeecf708e', '83977247-0d04-4e7d-be63-da13e9598692', '7d', 'active', '2025-12-23 13:35:03.778737+00', '2025-12-28 13:35:03.778737+00', false, '2025-12-23 13:35:03.778737+00', '2025-12-23 13:35:03.778737+00'),
('8ee864a3-62ef-4fc9-a22b-2b4479a89b07', '57c560f0-953f-4970-bdd0-bf9d0b9eda59', '7d', 'active', '2025-12-23 14:34:26.737317+00', '2025-12-28 14:34:26.737317+00', false, '2025-12-23 14:34:26.737317+00', '2025-12-23 14:34:26.737317+00'),
('70e24a67-b228-424f-adff-798d6db0364c', '5e39d027-d654-439d-8f19-d6d1c648150a', 'plano plus', 'active', '2025-12-23 16:17:49.746+00', '2026-01-22 16:17:49.746+00', false, '2025-12-23 16:25:06.575899+00', '2025-12-23 16:25:06.575899+00'),
('1fe7367c-e34c-4632-9366-ab043d027c47', '6693b6c1-f0a4-4bbf-bb4a-66565abcc394', '7d', 'active', '2025-12-25 02:44:35.806848+00', '2026-01-01 02:44:35.806848+00', false, '2025-12-25 02:44:35.806848+00', '2025-12-25 02:44:35.806848+00')
ON CONFLICT (id) DO UPDATE SET user_id = EXCLUDED.user_id, plan_name = EXCLUDED.plan_name, status = EXCLUDED.status, start_date = EXCLUDED.start_date, end_date = EXCLUDED.end_date, updated_at = EXCLUDED.updated_at;

-- ============================================
-- 12. USER SUBSCRIPTIONS (Assinaturas) - Apenas ativas
-- ============================================

INSERT INTO public.user_subscriptions (id, user_id, plan_id, status, start_date, next_billing_date, expiration_notified_at, created_at, updated_at) VALUES
('f914a480-ace5-4ae0-bde9-6b9874012102', '5e39d027-d654-439d-8f19-d6d1c648150a', '76222bf8-7a39-4cbb-99c5-b0a5507414de', 'active', '2025-12-23 16:17:49.746+00', '2026-01-22 16:17:49.746+00', NULL, '2025-12-23 20:09:38.427484+00', '2025-12-23 20:09:38.427484+00'),
('ac9c772c-34c7-447f-9339-6a905be045b4', '6693b6c1-f0a4-4bbf-bb4a-66565abcc394', '083be3a4-da67-4e1c-bf34-86e8cc2176c1', 'active', '2025-12-25 02:44:35.806848+00', '2026-01-01 02:44:35.806848+00', '2025-12-25 09:00:20.304+00', '2025-12-25 02:44:35.806848+00', '2025-12-25 09:00:20.323809+00'),
('296a55bc-4c2f-472c-91d7-e23aad403d12', '57c560f0-953f-4970-bdd0-bf9d0b9eda59', '083be3a4-da67-4e1c-bf34-86e8cc2176c1', 'active', '2025-12-23 14:34:26.737317+00', '2025-12-28 14:34:26.737317+00', '2025-12-25 09:00:21.395+00', '2025-12-23 14:34:26.737317+00', '2025-12-25 09:00:21.416676+00'),
('b73306b0-95bc-4974-b71b-77ef691ab8cb', '83977247-0d04-4e7d-be63-da13e9598692', '083be3a4-da67-4e1c-bf34-86e8cc2176c1', 'active', '2025-12-23 13:35:03.778737+00', '2025-12-28 13:35:03.778737+00', '2025-12-25 09:00:35.768+00', '2025-12-23 13:35:03.778737+00', '2025-12-25 09:00:35.788417+00')
ON CONFLICT (id) DO UPDATE SET user_id = EXCLUDED.user_id, plan_id = EXCLUDED.plan_id, status = EXCLUDED.status, start_date = EXCLUDED.start_date, next_billing_date = EXCLUDED.next_billing_date, updated_at = EXCLUDED.updated_at;

-- ============================================
-- 13. ORDERS (Pedidos) - Últimos importantes
-- ============================================

INSERT INTO public.orders (id, user_id, product_type, product_name, quantity, amount, status, payment_method, plan_period_days, plan_id_snapshot, order_version, created_at, updated_at) VALUES
('112438e6-8ec1-41e7-977e-6f456d521889', '5e39d027-d654-439d-8f19-d6d1c648150a', 'session_brasileiras', '1x Session Brasileira', 1, 1.00, 'completed', 'evopay', NULL, NULL, 1, '2025-12-24 23:12:23.247857+00', '2025-12-24 23:18:30.103255+00'),
('382e49d6-2df1-4a16-8dfb-94128b7789c4', '5e39d027-d654-439d-8f19-d6d1c648150a', 'session_brasileiras', '1x Session Brasileira', 1, 1.00, 'completed', 'evopay', NULL, NULL, 1, '2025-12-24 23:19:17.975927+00', '2025-12-24 23:22:01.019973+00'),
('8a060581-ea20-40e4-a958-b6e5433cbeed', '5e39d027-d654-439d-8f19-d6d1c648150a', 'session_brasileiras', '1x Session Brasileira', 1, 1.00, 'completed', 'evopay', NULL, NULL, 1, '2025-12-24 23:25:52.357115+00', '2025-12-24 23:27:38.003572+00'),
('e38cef70-ee69-41be-813c-8dce673ed4c0', '5e39d027-d654-439d-8f19-d6d1c648150a', 'session_brasileiras', '1x Session Brasileira', 1, 1.00, 'completed', 'evopay', NULL, NULL, 1, '2025-12-24 23:28:53.136976+00', '2025-12-24 23:39:41.343776+00'),
('b5d452bb-0a1f-408b-97bd-c396ebc396ec', '5e39d027-d654-439d-8f19-d6d1c648150a', 'session_brasileiras', '1x Session Brasileira', 1, 1.00, 'completed', 'evopay', NULL, NULL, 1, '2025-12-24 23:40:35.639687+00', '2025-12-24 23:40:53.516706+00'),
('1adfc6e9-3281-4468-8976-f5218bfbaf9c', '5e39d027-d654-439d-8f19-d6d1c648150a', 'session_brasileiras', '1x Session Brasileira', 1, 1.00, 'completed', 'evopay', NULL, NULL, 1, '2025-12-25 00:14:08.54212+00', '2025-12-25 00:15:17.201085+00'),
('bd2a9dc0-f70c-483e-b63d-56350aafe2ca', '5e39d027-d654-439d-8f19-d6d1c648150a', 'session_brasileiras', '1x Session Brasileira', 1, 1.00, 'completed', 'pix', NULL, NULL, 1, '2025-12-25 00:21:10.972889+00', '2025-12-25 00:21:25.243041+00'),
('560272a6-8aa0-49f9-b4fc-ae0257c0b404', '6693b6c1-f0a4-4bbf-bb4a-66565abcc394', 'subscription', '7d', 1, 1.00, 'completed', 'pix', 7, '083be3a4-da67-4e1c-bf34-86e8cc2176c1', 1, '2025-12-25 02:43:50.854879+00', '2025-12-25 02:44:35.806848+00')
ON CONFLICT (id) DO UPDATE SET user_id = EXCLUDED.user_id, product_type = EXCLUDED.product_type, product_name = EXCLUDED.product_name, quantity = EXCLUDED.quantity, amount = EXCLUDED.amount, status = EXCLUDED.status, payment_method = EXCLUDED.payment_method, updated_at = EXCLUDED.updated_at;

-- ============================================
-- 14. PAYMENTS (Pagamentos) - Últimos importantes
-- ============================================

INSERT INTO public.payments (id, user_id, order_id, amount, status, payment_method, pix_code, evopay_transaction_id, paid_at, created_at) VALUES
('a5f601fe-666b-4a3b-8b84-44ff894975f7', '5e39d027-d654-439d-8f19-d6d1c648150a', '112438e6-8ec1-41e7-977e-6f456d521889', 1.00, 'paid', 'evopay_pix', NULL, 'cmjkmq2xn00517ctx6n0y4c7s', '2025-12-24 23:18:30.103255+00', '2025-12-24 23:12:25.890655+00'),
('7299e8d1-1147-4613-981a-0b6f3689757f', '5e39d027-d654-439d-8f19-d6d1c648150a', '382e49d6-2df1-4a16-8dfb-94128b7789c4', 1.00, 'paid', 'evopay_pix', NULL, 'cmjkmyi06005p7ctx6f4cv255', '2025-12-24 23:22:01.019973+00', '2025-12-24 23:19:19.85291+00'),
('5cdcfb5c-e6b4-4147-8383-19ffb2c414fd', '5e39d027-d654-439d-8f19-d6d1c648150a', '8a060581-ea20-40e4-a958-b6e5433cbeed', 1.00, 'paid', 'evopay_pix', NULL, 'cmjkn6yc4005t7ctx5toigir6', '2025-12-24 23:27:38.003572+00', '2025-12-24 23:25:54.257667+00'),
('63b4df6d-0e6e-49ac-919c-7760f16d1abc', '5e39d027-d654-439d-8f19-d6d1c648150a', 'e38cef70-ee69-41be-813c-8dce673ed4c0', 1.00, 'paid', 'evopay_pix', NULL, 'cmjknb2a200617ctxfwtv2m97', '2025-12-24 23:39:41.343776+00', '2025-12-24 23:28:54.94012+00'),
('f000fec9-d279-4336-84fb-2418c2abecd9', '5e39d027-d654-439d-8f19-d6d1c648150a', 'b5d452bb-0a1f-408b-97bd-c396ebc396ec', 1.00, 'paid', 'evopay_pix', NULL, 'cmjknpvwa00637ctx2cp6k2xu', '2025-12-24 23:40:53.516706+00', '2025-12-24 23:40:37.91459+00'),
('30756c88-10dc-47eb-bac4-ff9d4f2e35ce', '5e39d027-d654-439d-8f19-d6d1c648150a', '1adfc6e9-3281-4468-8976-f5218bfbaf9c', 1.00, 'paid', 'evopay_pix', NULL, 'cmjkox140006p7ctxeprs5xl5', '2025-12-25 00:15:17.201085+00', '2025-12-25 00:14:10.831654+00'),
('a70678ea-0055-49a6-a73e-1f31b2212360', '5e39d027-d654-439d-8f19-d6d1c648150a', 'bd2a9dc0-f70c-483e-b63d-56350aafe2ca', 1.00, 'paid', 'pix', 'd68d3f27d29c610a1871mjkp625p1kxe', NULL, '2025-12-25 00:21:25.243041+00', '2025-12-25 00:21:11.795155+00'),
('beabe2cc-a8a6-4989-adac-6de9aaa84ead', '6693b6c1-f0a4-4bbf-bb4a-66565abcc394', '560272a6-8aa0-49f9-b4fc-ae0257c0b404', 1.00, 'paid', 'pix', 'de173751f4acc780c23dmjku9iwb47p1', NULL, '2025-12-25 02:44:35.806848+00', '2025-12-25 02:43:51.500867+00')
ON CONFLICT (id) DO UPDATE SET user_id = EXCLUDED.user_id, order_id = EXCLUDED.order_id, amount = EXCLUDED.amount, status = EXCLUDED.status, payment_method = EXCLUDED.payment_method, paid_at = EXCLUDED.paid_at;

-- ============================================
-- 15. GATEWAY LOGS (Logs do Gateway)
-- ============================================

INSERT INTO public.gateway_logs (id, order_id, gateway, status, error, attempt, created_at) VALUES
('588e6e72-994d-40bb-b84f-0543cb77cba0', '112438e6-8ec1-41e7-977e-6f456d521889', 'pixup', 'failed', 'Falha na autenticação: Credenciais inválidas', 1, '2025-12-24 23:12:23.654832+00'),
('a5f601fe-666b-4a3b-8b84-44ff894975f7', '112438e6-8ec1-41e7-977e-6f456d521889', 'evopay', 'success', NULL, 2, '2025-12-24 23:12:25.726818+00'),
('3b8e379d-2bc0-45be-9ed0-498c2bcabf5b', '382e49d6-2df1-4a16-8dfb-94128b7789c4', 'pixup', 'failed', 'Falha na autenticação: Credenciais inválidas', 1, '2025-12-24 23:19:18.467196+00'),
('7299e8d1-1147-4613-981a-0b6f3689757f', '382e49d6-2df1-4a16-8dfb-94128b7789c4', 'evopay', 'success', NULL, 2, '2025-12-24 23:19:19.655267+00'),
('e8e66485-9adb-47ef-b5e3-4c092e80695d', 'c0a71490-108f-424f-860e-f33f2c0808f5', 'pixup', 'success', NULL, 1, '2025-12-25 00:15:48.903347+00'),
('a70678ea-0055-49a6-a73e-1f31b2212360', 'bd2a9dc0-f70c-483e-b63d-56350aafe2ca', 'pixup', 'success', NULL, 1, '2025-12-25 00:21:11.611514+00'),
('beabe2cc-a8a6-4989-adac-6de9aaa84ead', '560272a6-8aa0-49f9-b4fc-ae0257c0b404', 'pixup', 'success', NULL, 1, '2025-12-25 02:43:51.31343+00')
ON CONFLICT (id) DO UPDATE SET order_id = EXCLUDED.order_id, gateway = EXCLUDED.gateway, status = EXCLUDED.status, error = EXCLUDED.error, attempt = EXCLUDED.attempt;

-- ============================================
-- FIM DOS DADOS COMPLETOS
-- ============================================

-- AVISO DE SEGURANÇA:
-- Este arquivo contém dados sensíveis:
-- - Chaves de API (EvoPay, Resend, reCAPTCHA, PixUp)
-- - Credenciais do gateway
-- - Dados de usuários (emails, whatsapp)
-- 
-- NÃO compartilhe publicamente!
-- Após importar, atualize as credenciais se necessário.
