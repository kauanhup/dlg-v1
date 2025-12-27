-- ============================================
-- SWEXTRACTOR - DATABASE SCHEMA COMPLETO
-- Gerado em: 2025-12-27
-- Use este arquivo para recriar o banco em um novo projeto
-- ============================================

-- ============================================
-- 1. ENUMS
-- ============================================

CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.order_status AS ENUM ('pending', 'completed', 'cancelled', 'expired', 'refunded');

-- ============================================
-- 2. FUNÇÕES AUXILIARES (precisam existir antes das policies)
-- ============================================

-- Função para verificar role do usuário
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Função para obter role do usuário
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================
-- 3. TABELAS PRINCIPAIS
-- ============================================

-- Profiles (dados do usuário)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  name text NOT NULL,
  email text NOT NULL,
  whatsapp text NOT NULL,
  avatar text DEFAULT '😀',
  banned boolean NOT NULL DEFAULT false,
  banned_at timestamp with time zone,
  ban_reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- User Roles
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  role app_role NOT NULL DEFAULT 'user',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Subscription Plans
CREATE TABLE public.subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric NOT NULL,
  promotional_price numeric,
  period integer NOT NULL,
  features text[] DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  max_subscriptions_per_user integer,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- User Subscriptions
CREATE TABLE public.user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan_id uuid NOT NULL REFERENCES public.subscription_plans(id),
  status text NOT NULL DEFAULT 'active',
  start_date timestamp with time zone NOT NULL DEFAULT now(),
  next_billing_date timestamp with time zone,
  expiration_notified_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Licenses
CREATE TABLE public.licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan_name text NOT NULL DEFAULT 'Plano Básico',
  status text NOT NULL DEFAULT 'active',
  start_date timestamp with time zone NOT NULL DEFAULT now(),
  end_date timestamp with time zone NOT NULL,
  auto_renew boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Orders
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_type text NOT NULL,
  product_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  payment_method text DEFAULT 'pix',
  plan_period_days integer,
  plan_id_snapshot uuid,
  plan_features_snapshot jsonb,
  upgrade_from_subscription_id uuid REFERENCES public.user_subscriptions(id),
  upgrade_credit_amount numeric DEFAULT 0,
  order_version integer DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Payments
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  order_id uuid REFERENCES public.orders(id),
  subscription_id uuid REFERENCES public.user_subscriptions(id),
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  payment_method text NOT NULL DEFAULT 'pix',
  pix_code text,
  qr_code_base64 text,
  evopay_transaction_id text,
  paid_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Session Files (arquivos de sessão Telegram)
CREATE TABLE public.session_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  file_path text NOT NULL,
  type text NOT NULL,
  status text NOT NULL DEFAULT 'available',
  user_id uuid,
  order_id uuid REFERENCES public.orders(id),
  reserved_for_order uuid REFERENCES public.orders(id),
  reserved_at timestamp with time zone,
  sold_at timestamp with time zone,
  uploaded_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Session Combos (pacotes de sessões)
CREATE TABLE public.session_combos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  quantity integer NOT NULL,
  price numeric NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  is_popular boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Sessions Inventory
CREATE TABLE public.sessions_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL UNIQUE,
  quantity integer NOT NULL DEFAULT 0,
  cost_per_session numeric NOT NULL DEFAULT 0,
  sale_price_per_session numeric NOT NULL DEFAULT 0,
  custom_quantity_enabled boolean NOT NULL DEFAULT false,
  custom_quantity_min integer NOT NULL DEFAULT 1,
  custom_price_per_unit numeric NOT NULL DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- User Sessions (sessões compradas pelo usuário)
CREATE TABLE public.user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  order_id uuid REFERENCES public.orders(id),
  type text NOT NULL,
  session_data text NOT NULL,
  is_downloaded boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Bot Files
CREATE TABLE public.bot_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  version text NOT NULL DEFAULT '1.0.0',
  is_active boolean NOT NULL DEFAULT true,
  uploaded_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Gateway Settings
CREATE TABLE public.gateway_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL DEFAULT 'pixup',
  is_active boolean NOT NULL DEFAULT false,
  client_id text,
  client_secret text,
  webhook_url text,
  mercadopago_enabled boolean DEFAULT false,
  mercadopago_access_token text,
  mercadopago_public_key text,
  evopay_enabled boolean DEFAULT false,
  evopay_api_key text,
  evopay_webhook_url text,
  evopay_weight integer DEFAULT 50,
  pixup_weight integer DEFAULT 50,
  email_enabled boolean DEFAULT false,
  email_verification_enabled boolean DEFAULT false,
  password_recovery_enabled boolean DEFAULT false,
  recaptcha_enabled boolean DEFAULT false,
  recaptcha_site_key text,
  recaptcha_secret_key text,
  resend_api_key text,
  resend_from_email text,
  resend_from_name text DEFAULT 'SWEXTRACTOR',
  email_template_title text DEFAULT '✉️ Verificação de Email',
  email_template_greeting text DEFAULT 'Olá {name}!',
  email_template_message text DEFAULT 'Seu código de verificação é:',
  email_template_expiry_text text DEFAULT 'Este código expira em 15 minutos.',
  email_template_footer text DEFAULT 'SWEXTRACTOR - Sistema de Gestão',
  email_template_bg_color text DEFAULT '#0a0a0a',
  email_template_accent_color text DEFAULT '#4ade80',
  email_template_logo_url text,
  email_template_show_logo boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- System Settings
CREATE TABLE public.system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Audit Logs
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action text NOT NULL,
  resource text NOT NULL,
  details jsonb DEFAULT '{}',
  ip_address text,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Gateway Logs
CREATE TABLE public.gateway_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders(id),
  gateway text NOT NULL,
  status text NOT NULL,
  error text,
  attempt integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT now()
);

-- Login History
CREATE TABLE public.login_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  ip_address text,
  device text,
  location text,
  status text NOT NULL DEFAULT 'success',
  failure_reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- IP Login Attempts
CREATE TABLE public.ip_login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  email text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Rate Limits
CREATE TABLE public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address text NOT NULL,
  endpoint text NOT NULL,
  request_count integer NOT NULL DEFAULT 1,
  window_start timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Verification Codes
CREATE TABLE public.verification_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  code text NOT NULL,
  type text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  used boolean DEFAULT false,
  failed_attempts integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Processed Webhooks
CREATE TABLE public.processed_webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id text NOT NULL,
  gateway text NOT NULL,
  order_id uuid REFERENCES public.orders(id),
  webhook_payload jsonb,
  processed_at timestamp with time zone DEFAULT now()
);

-- Reconciliation Runs
CREATE TABLE public.reconciliation_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text DEFAULT 'running',
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  duration_ms integer,
  total_detected integer DEFAULT 0,
  total_corrected integer DEFAULT 0,
  total_uncorrectable integer DEFAULT 0,
  categories jsonb,
  error text
);

-- ============================================
-- 4. ENABLE RLS EM TODAS AS TABELAS
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_combos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gateway_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gateway_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ip_login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processed_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reconciliation_runs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. RLS POLICIES
-- ============================================

-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile if not banned" ON public.profiles FOR UPDATE USING (auth.uid() = user_id AND banned = false) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- User Roles
CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Subscription Plans
CREATE POLICY "Public can view active plans" ON public.subscription_plans FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage plans" ON public.subscription_plans FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- User Subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage subscriptions" ON public.user_subscriptions FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Licenses
CREATE POLICY "Users can view own licenses" ON public.licenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage licenses" ON public.licenses FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Orders
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can create own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can cancel own orders" ON public.orders FOR UPDATE USING (auth.uid() = user_id AND status = 'pending') WITH CHECK (auth.uid() = user_id AND status = 'cancelled');
CREATE POLICY "Admins can manage orders" ON public.orders FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Payments
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all payments" ON public.payments FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can create own payments" ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can cancel own payments" ON public.payments FOR UPDATE USING (auth.uid() = user_id AND status = 'pending') WITH CHECK (auth.uid() = user_id AND status = 'cancelled');
CREATE POLICY "Admins can manage payments" ON public.payments FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Session Files
CREATE POLICY "Users can view purchased sessions" ON public.session_files FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can manage session files" ON public.session_files FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Session Combos
CREATE POLICY "Anyone can view active combos" ON public.session_combos FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage combos" ON public.session_combos FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Sessions Inventory
CREATE POLICY "Users can view inventory quantities" ON public.sessions_inventory FOR SELECT USING (true);
CREATE POLICY "Admins can manage inventory" ON public.sessions_inventory FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- User Sessions
CREATE POLICY "Users can view own sessions" ON public.user_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage sessions" ON public.user_sessions FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Bot Files
CREATE POLICY "Authenticated users can view active bot files" ON public.bot_files FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage bot files" ON public.bot_files FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- Gateway Settings
CREATE POLICY "Only admins can access gateway settings" ON public.gateway_settings FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

-- System Settings
CREATE POLICY "Anyone can read system settings" ON public.system_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage system settings" ON public.system_settings FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Audit Logs
CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Service role can insert audit logs" ON public.audit_logs FOR INSERT WITH CHECK (true);

-- Gateway Logs
CREATE POLICY "Admins can view gateway logs" ON public.gateway_logs FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Service role can insert gateway logs" ON public.gateway_logs FOR INSERT WITH CHECK (true);

-- Login History
CREATE POLICY "Users can view own login history" ON public.login_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all login history" ON public.login_history FOR SELECT USING (has_role(auth.uid(), 'admin'));

-- IP Login Attempts
CREATE POLICY "Service role only" ON public.ip_login_attempts FOR ALL USING (false) WITH CHECK (false);

-- Rate Limits
CREATE POLICY "Service role only for rate_limits" ON public.rate_limits FOR ALL USING (false) WITH CHECK (false);

-- Verification Codes
CREATE POLICY "Service role can manage verification codes" ON public.verification_codes FOR ALL USING (true) WITH CHECK (true);

-- Processed Webhooks
CREATE POLICY "Service role only for processed_webhooks" ON public.processed_webhooks FOR ALL USING (false) WITH CHECK (false);

-- Reconciliation Runs
CREATE POLICY "Admins can view reconciliation runs" ON public.reconciliation_runs FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Service role can manage reconciliation runs" ON public.reconciliation_runs FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 6. FUNÇÕES DE NEGÓCIO
-- ============================================

-- Handle New User (trigger para criar profile e role)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL THEN
    INSERT INTO public.profiles (user_id, name, email, whatsapp)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data ->> 'name', ''),
      NEW.email,
      COALESCE(NEW.raw_user_meta_data ->> 'whatsapp', '')
    )
    ON CONFLICT (user_id) DO NOTHING;
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user')
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Sync Inventory on Session Change
CREATE OR REPLACE FUNCTION public.sync_inventory_on_session_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE sessions_inventory
  SET quantity = (
    SELECT COUNT(*) 
    FROM session_files 
    WHERE type = COALESCE(NEW.type, OLD.type) 
      AND status = 'available'
  ),
  updated_at = NOW()
  WHERE type = COALESCE(NEW.type, OLD.type);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Reserve Sessions Atomic
CREATE OR REPLACE FUNCTION public.reserve_sessions_atomic(p_session_type text, p_quantity integer, p_order_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reserved_count INTEGER;
  v_available_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_available_count
  FROM session_files
  WHERE type = p_session_type
    AND status = 'available'
    AND (reserved_at IS NULL OR reserved_at < NOW() - INTERVAL '30 minutes');
  
  IF v_available_count < p_quantity THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Estoque insuficiente',
      'reserved_count', 0,
      'requested_count', p_quantity,
      'available_count', v_available_count,
      'session_ids', ARRAY[]::UUID[]
    );
  END IF;

  WITH available AS (
    SELECT id
    FROM session_files
    WHERE type = p_session_type
      AND status = 'available'
      AND (reserved_at IS NULL OR reserved_at < NOW() - INTERVAL '30 minutes')
    ORDER BY uploaded_at ASC
    LIMIT p_quantity
    FOR UPDATE SKIP LOCKED
  ),
  updated AS (
    UPDATE session_files
    SET 
      status = 'reserved',
      reserved_for_order = p_order_id,
      reserved_at = NOW()
    WHERE id IN (SELECT id FROM available)
    RETURNING id
  )
  SELECT COUNT(*) INTO v_reserved_count FROM updated;

  IF v_reserved_count < p_quantity THEN
    UPDATE session_files
    SET 
      status = 'available',
      reserved_for_order = NULL,
      reserved_at = NULL
    WHERE reserved_for_order = p_order_id
      AND status = 'reserved';
    
    RETURN json_build_object(
      'success', false,
      'error', 'Não foi possível reservar todas as sessions.',
      'reserved_count', 0,
      'requested_count', p_quantity,
      'available_count', v_available_count,
      'session_ids', ARRAY[]::UUID[]
    );
  END IF;

  RETURN json_build_object(
    'success', true,
    'reserved_count', v_reserved_count,
    'requested_count', p_quantity,
    'session_ids', (
      SELECT ARRAY_AGG(id) 
      FROM session_files 
      WHERE reserved_for_order = p_order_id 
        AND status = 'reserved'
    )
  );
  
EXCEPTION
  WHEN OTHERS THEN
    UPDATE session_files
    SET 
      status = 'available',
      reserved_for_order = NULL,
      reserved_at = NULL
    WHERE reserved_for_order = p_order_id
      AND status = 'reserved';
    
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'reserved_count', 0,
      'requested_count', p_quantity,
      'session_ids', ARRAY[]::UUID[]
    );
END;
$$;

-- Release Session Reservation
CREATE OR REPLACE FUNCTION public.release_session_reservation(p_order_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_released_count INTEGER;
BEGIN
  UPDATE session_files
  SET 
    status = 'available',
    reserved_for_order = NULL,
    reserved_at = NULL
  WHERE reserved_for_order = p_order_id
    AND status = 'reserved'
  RETURNING id INTO v_released_count;
  
  GET DIAGNOSTICS v_released_count = ROW_COUNT;
  
  RETURN json_build_object(
    'success', true,
    'released_count', v_released_count
  );
END;
$$;

-- Complete Order Atomic
CREATE OR REPLACE FUNCTION public.complete_order_atomic(_order_id uuid, _user_id uuid, _product_type text, _quantity integer)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _available_file RECORD;
  _assigned_count INTEGER := 0;
  _order_record RECORD;
  _start_date TIMESTAMP WITH TIME ZONE;
  _end_date TIMESTAMP WITH TIME ZONE;
  _is_service_role BOOLEAN;
  _session_file_type TEXT;
  _plan_period INTEGER;
  _plan_name TEXT;
  _plan_id UUID;
  _lock_key BIGINT;
BEGIN
  _lock_key := ('x' || substr(md5(_user_id::text), 1, 15))::bit(64)::bigint;
  PERFORM pg_advisory_xact_lock(_lock_key);
  
  _is_service_role := (auth.uid() IS NULL);
  
  SELECT * INTO _order_record FROM orders WHERE id = _order_id;
  
  IF _order_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Pedido não encontrado');
  END IF;
  
  IF _order_record.status = 'completed' THEN
    RETURN json_build_object('success', true, 'message', 'Pedido já completado', 'already_completed', true);
  END IF;
  
  IF NOT _is_service_role THEN
    IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
      RETURN json_build_object('success', false, 'error', 'Não autorizado');
    END IF;
  ELSE
    IF _order_record.status NOT IN ('pending', 'paid') THEN
      RETURN json_build_object('success', false, 'error', 'Status inválido');
    END IF;
  END IF;
  
  IF _order_record.user_id != _user_id OR _order_record.product_type != _product_type OR _order_record.quantity != _quantity THEN
    RETURN json_build_object('success', false, 'error', 'Dados não correspondem ao pedido');
  END IF;

  IF _product_type = 'subscription' THEN
    _plan_period := _order_record.plan_period_days;
    _plan_name := _order_record.product_name;
    _plan_id := _order_record.plan_id_snapshot;
    
    IF _plan_period IS NULL THEN
      SELECT id, period INTO _plan_id, _plan_period 
      FROM subscription_plans WHERE name = _order_record.product_name LIMIT 1;
    END IF;
    
    IF _plan_period IS NULL THEN
      RETURN json_build_object('success', false, 'error', 'Plano não encontrado');
    END IF;
    
    UPDATE user_subscriptions SET status = 'cancelled', updated_at = NOW()
    WHERE user_id = _user_id AND status = 'active';
    
    UPDATE licenses SET status = 'cancelled', updated_at = NOW()
    WHERE user_id = _user_id AND status = 'active';
    
    _start_date := NOW();
    _end_date := _start_date + (_plan_period || ' days')::interval;
    
    INSERT INTO user_subscriptions (user_id, plan_id, status, start_date, next_billing_date)
    VALUES (_user_id, _plan_id, 'active', _start_date, _end_date);
    
    INSERT INTO licenses (user_id, plan_name, status, start_date, end_date)
    VALUES (_user_id, _plan_name, 'active', _start_date, _end_date);
    
    UPDATE orders SET status = 'completed', updated_at = NOW() WHERE id = _order_id;
    UPDATE payments SET status = 'paid', paid_at = NOW() WHERE order_id = _order_id AND status != 'paid';

    RETURN json_build_object('success', true, 'type', 'subscription', 'plan_name', _plan_name);
  END IF;

  _session_file_type := CASE 
    WHEN _product_type = 'session_brasileiras' THEN 'brasileiras'
    WHEN _product_type = 'session_estrangeiras' THEN 'estrangeiras'
    ELSE _product_type
  END;

  FOR _available_file IN 
    SELECT id, file_name 
    FROM session_files
    WHERE type = _session_file_type AND status = 'available'
    ORDER BY uploaded_at
    LIMIT _quantity
    FOR UPDATE SKIP LOCKED
  LOOP
    UPDATE session_files
    SET status = 'sold', user_id = _user_id, order_id = _order_id, sold_at = NOW()
    WHERE id = _available_file.id;
    
    INSERT INTO user_sessions (user_id, order_id, type, session_data, is_downloaded)
    VALUES (_user_id, _order_id, _session_file_type, _available_file.file_name, false);
    
    _assigned_count := _assigned_count + 1;
  END LOOP;

  IF _assigned_count < _quantity THEN
    UPDATE session_files SET status = 'available', user_id = NULL, order_id = NULL, sold_at = NULL
    WHERE order_id = _order_id AND status = 'sold';
    DELETE FROM user_sessions WHERE order_id = _order_id;
    
    RETURN json_build_object('success', false, 'error', 'Estoque insuficiente', 'available', _assigned_count, 'requested', _quantity);
  END IF;

  UPDATE orders SET status = 'completed', updated_at = NOW() WHERE id = _order_id;
  UPDATE payments SET status = 'paid', paid_at = NOW() WHERE order_id = _order_id AND status != 'paid';

  RETURN json_build_object('success', true, 'type', 'sessions', 'assigned_sessions', _assigned_count);
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Cleanup Old Rate Limits
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.rate_limits
  WHERE window_start < NOW() - INTERVAL '1 hour';
END;
$$;

-- Cleanup Old IP Attempts
CREATE OR REPLACE FUNCTION public.cleanup_old_ip_attempts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.ip_login_attempts
  WHERE created_at < NOW() - INTERVAL '24 hours';
  RETURN NEW;
END;
$$;

-- ============================================
-- 7. TRIGGERS
-- ============================================

-- Trigger para criar profile quando usuário confirma email
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger para sync inventory
CREATE OR REPLACE TRIGGER sync_inventory_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.session_files
  FOR EACH ROW EXECUTE FUNCTION public.sync_inventory_on_session_change();

-- ============================================
-- 8. STORAGE BUCKETS
-- ============================================

INSERT INTO storage.buckets (id, name, public) VALUES ('sessions', 'sessions', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('bot-files', 'bot-files', false);

-- ============================================
-- 9. DADOS INICIAIS (OPCIONAL)
-- ============================================

-- Inserir tipos de inventário
INSERT INTO public.sessions_inventory (type, quantity, cost_per_session, sale_price_per_session) 
VALUES 
  ('brasileiras', 0, 0, 0),
  ('estrangeiras', 0, 0, 0)
ON CONFLICT (type) DO NOTHING;

-- Inserir configuração padrão do gateway
INSERT INTO public.gateway_settings (provider, is_active) 
VALUES ('pixup', false)
ON CONFLICT DO NOTHING;

-- ============================================
-- FIM DO SCHEMA
-- ============================================
