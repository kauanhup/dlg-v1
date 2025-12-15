-- =====================================================
-- SWEXTRACTOR - COMPLETE DATABASE SCHEMA
-- =====================================================

-- 1. LICENSES TABLE (Licenças do usuário)
CREATE TABLE public.licenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL DEFAULT 'Plano Básico',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'suspended')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  auto_renew BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. SESSIONS INVENTORY (Estoque do admin - sessions disponíveis para venda)
CREATE TABLE public.sessions_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('brasileiras', 'estrangeiras')),
  quantity INTEGER NOT NULL DEFAULT 0,
  cost_per_session DECIMAL(10,2) NOT NULL DEFAULT 0,
  sale_price_per_session DECIMAL(10,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. SESSION COMBOS (Pacotes de sessions para venda na loja)
CREATE TABLE public.session_combos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('brasileiras', 'estrangeiras')),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  is_popular BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. USER SESSIONS (Sessions compradas por usuários)
CREATE TABLE public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID,
  type TEXT NOT NULL CHECK (type IN ('brasileiras', 'estrangeiras')),
  session_data TEXT NOT NULL,
  is_downloaded BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. ORDERS (Pedidos/compras)
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_type TEXT NOT NULL CHECK (product_type IN ('session_brasileiras', 'session_estrangeiras', 'subscription')),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')),
  payment_method TEXT DEFAULT 'pix',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 6. SUBSCRIPTION PLANS (Planos de assinatura - gerenciados pelo admin)
CREATE TABLE public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  period TEXT NOT NULL CHECK (period IN ('week', 'biweek', 'month', 'quarter', 'semester', 'year', 'lifetime')),
  features TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. USER SUBSCRIPTIONS (Assinaturas dos usuários)
CREATE TABLE public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'overdue')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  next_billing_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 8. PAYMENTS (Histórico de pagamentos)
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id),
  subscription_id UUID REFERENCES public.user_subscriptions(id),
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method TEXT NOT NULL DEFAULT 'pix',
  pix_code TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 9. SYSTEM SETTINGS (Configurações do sistema)
CREATE TABLE public.system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- FOREIGN KEYS
-- =====================================================

ALTER TABLE public.user_sessions 
  ADD CONSTRAINT fk_user_sessions_order 
  FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_licenses_user_id ON public.licenses(user_id);
CREATE INDEX idx_licenses_status ON public.licenses(status);
CREATE INDEX idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_status ON public.payments(status);

-- =====================================================
-- ENABLE RLS
-- =====================================================

ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_combos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES - LICENSES
-- =====================================================

CREATE POLICY "Users can view their own licenses"
  ON public.licenses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all licenses"
  ON public.licenses FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage licenses"
  ON public.licenses FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- RLS POLICIES - SESSIONS INVENTORY (Admin only)
-- =====================================================

CREATE POLICY "Admins can manage inventory"
  ON public.sessions_inventory FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view inventory quantities"
  ON public.sessions_inventory FOR SELECT
  USING (true);

-- =====================================================
-- RLS POLICIES - SESSION COMBOS
-- =====================================================

CREATE POLICY "Anyone can view active combos"
  ON public.session_combos FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage combos"
  ON public.session_combos FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- RLS POLICIES - USER SESSIONS
-- =====================================================

CREATE POLICY "Users can view their own sessions"
  ON public.user_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sessions"
  ON public.user_sessions FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage sessions"
  ON public.user_sessions FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- RLS POLICIES - ORDERS
-- =====================================================

CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage orders"
  ON public.orders FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- RLS POLICIES - SUBSCRIPTION PLANS
-- =====================================================

CREATE POLICY "Anyone can view active plans"
  ON public.subscription_plans FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage plans"
  ON public.subscription_plans FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- RLS POLICIES - USER SUBSCRIPTIONS
-- =====================================================

CREATE POLICY "Users can view their own subscriptions"
  ON public.user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions"
  ON public.user_subscriptions FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage subscriptions"
  ON public.user_subscriptions FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- RLS POLICIES - PAYMENTS
-- =====================================================

CREATE POLICY "Users can view their own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payments"
  ON public.payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all payments"
  ON public.payments FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage payments"
  ON public.payments FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- RLS POLICIES - SYSTEM SETTINGS
-- =====================================================

CREATE POLICY "Anyone can read system settings"
  ON public.system_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage system settings"
  ON public.system_settings FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- =====================================================
-- TRIGGERS FOR updated_at
-- =====================================================

CREATE TRIGGER update_licenses_updated_at
  BEFORE UPDATE ON public.licenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sessions_inventory_updated_at
  BEFORE UPDATE ON public.sessions_inventory
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- INSERT DEFAULT DATA
-- =====================================================

-- Insert default inventory
INSERT INTO public.sessions_inventory (type, quantity, cost_per_session, sale_price_per_session)
VALUES 
  ('brasileiras', 0, 8.00, 9.98),
  ('estrangeiras', 0, 5.00, 5.98);

-- Insert default combos
INSERT INTO public.session_combos (type, quantity, price, is_popular)
VALUES 
  ('brasileiras', 5, 49.90, false),
  ('brasileiras', 10, 89.90, false),
  ('brasileiras', 25, 199.90, true),
  ('estrangeiras', 5, 29.90, false),
  ('estrangeiras', 10, 49.90, false),
  ('estrangeiras', 25, 99.90, true);

-- Insert default system settings
INSERT INTO public.system_settings (key, value)
VALUES 
  ('maintenance_mode', 'false'),
  ('allow_registrations', 'true');

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, price, period, features, is_active)
VALUES 
  ('Grátis', 0, 'lifetime', ARRAY['Acesso básico', 'Suporte por email'], true),
  ('Pro Mensal', 49.90, 'month', ARRAY['50 sessions/mês', 'Suporte prioritário', 'API access'], true),
  ('Pro Anual', 399.90, 'year', ARRAY['600 sessions/ano', 'Suporte 24/7', 'API access', '2 meses grátis'], true),
  ('Enterprise', 999.90, 'year', ARRAY['Sessions ilimitadas', 'Suporte dedicado', 'SLA 99.9%', 'Whitelabel'], true);