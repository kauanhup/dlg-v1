-- ============================================================
-- MIGRATION: SELF-HEALING PRODUCTION SYSTEM
-- Author: Staff Engineer
-- Purpose: State machine, admin-safe blocking, versioning, health views
-- ============================================================

-- ============================================================
-- 1. ORDER VERSIONING (eliminate legacy debt)
-- ============================================================

-- Add order_version column to track snapshot completeness
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS order_version INTEGER DEFAULT 1;

-- Add index for querying by version
CREATE INDEX IF NOT EXISTS idx_orders_version ON public.orders(order_version);

-- Backfill: orders with plan_period_days are v2, others are v1
UPDATE public.orders
SET order_version = CASE 
  WHEN plan_period_days IS NOT NULL AND plan_id_snapshot IS NOT NULL THEN 2
  ELSE 1
END
WHERE order_version = 1;

-- Comment explaining versions
COMMENT ON COLUMN public.orders.order_version IS 'v1=legacy (may lack snapshot), v2=full snapshot (2024-12+)';

-- ============================================================
-- 2. ORDER STATE MACHINE (formal state transitions)
-- ============================================================

-- Create ENUM for order status if not exists (safer than CHECK)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    CREATE TYPE public.order_status AS ENUM (
      'pending',
      'completed',
      'cancelled',
      'expired',
      'refunded'
    );
  END IF;
END $$;

-- Create function to validate order status transitions
CREATE OR REPLACE FUNCTION public.validate_order_status_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  valid_transitions JSONB := '{
    "pending": ["completed", "cancelled", "expired"],
    "completed": ["refunded"],
    "cancelled": [],
    "expired": [],
    "refunded": []
  }'::JSONB;
  allowed_statuses JSONB;
BEGIN
  -- Skip if status not changed
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;
  
  -- Get allowed transitions from current status
  allowed_statuses := valid_transitions -> OLD.status;
  
  -- Check if new status is allowed
  IF allowed_statuses IS NULL OR NOT allowed_statuses ? NEW.status THEN
    RAISE EXCEPTION 'Invalid order status transition: % -> % is not allowed. Allowed: %', 
      OLD.status, NEW.status, allowed_statuses
      USING ERRCODE = 'check_violation';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for order status validation
DROP TRIGGER IF EXISTS enforce_order_status_transition ON public.orders;
CREATE TRIGGER enforce_order_status_transition
  BEFORE UPDATE OF status ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_order_status_transition();

-- ============================================================
-- 3. PAYMENT STATE MACHINE
-- ============================================================

CREATE OR REPLACE FUNCTION public.validate_payment_status_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  valid_transitions JSONB := '{
    "pending": ["paid", "cancelled", "expired", "failed"],
    "paid": ["refunded"],
    "cancelled": [],
    "expired": [],
    "failed": ["pending"],
    "refunded": []
  }'::JSONB;
  allowed_statuses JSONB;
BEGIN
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;
  
  allowed_statuses := valid_transitions -> OLD.status;
  
  IF allowed_statuses IS NULL OR NOT allowed_statuses ? NEW.status THEN
    RAISE EXCEPTION 'Invalid payment status transition: % -> % is not allowed. Allowed: %', 
      OLD.status, NEW.status, allowed_statuses
      USING ERRCODE = 'check_violation';
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_payment_status_transition ON public.payments;
CREATE TRIGGER enforce_payment_status_transition
  BEFORE UPDATE OF status ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_payment_status_transition();

-- ============================================================
-- 4. LICENSE STATE MACHINE
-- ============================================================

CREATE OR REPLACE FUNCTION public.validate_license_status_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  valid_transitions JSONB := '{
    "active": ["expired", "cancelled", "suspended"],
    "expired": [],
    "cancelled": [],
    "suspended": ["active", "cancelled"]
  }'::JSONB;
  allowed_statuses JSONB;
BEGIN
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;
  
  allowed_statuses := valid_transitions -> OLD.status;
  
  IF allowed_statuses IS NULL OR NOT allowed_statuses ? NEW.status THEN
    RAISE EXCEPTION 'Invalid license status transition: % -> % is not allowed. Allowed: %', 
      OLD.status, NEW.status, allowed_statuses
      USING ERRCODE = 'check_violation';
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_license_status_transition ON public.licenses;
CREATE TRIGGER enforce_license_status_transition
  BEFORE UPDATE OF status ON public.licenses
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_license_status_transition();

-- ============================================================
-- 5. SUBSCRIPTION STATE MACHINE
-- ============================================================

CREATE OR REPLACE FUNCTION public.validate_subscription_status_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  valid_transitions JSONB := '{
    "active": ["expired", "cancelled", "suspended"],
    "expired": [],
    "cancelled": [],
    "suspended": ["active", "cancelled"]
  }'::JSONB;
  allowed_statuses JSONB;
BEGIN
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;
  
  allowed_statuses := valid_transitions -> OLD.status;
  
  IF allowed_statuses IS NULL OR NOT allowed_statuses ? NEW.status THEN
    RAISE EXCEPTION 'Invalid subscription status transition: % -> % is not allowed. Allowed: %', 
      OLD.status, NEW.status, allowed_statuses
      USING ERRCODE = 'check_violation';
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_subscription_status_transition ON public.user_subscriptions;
CREATE TRIGGER enforce_subscription_status_transition
  BEFORE UPDATE OF status ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_subscription_status_transition();

-- ============================================================
-- 6. ADMIN-SAFE: AUDIT ALL CRITICAL WRITES
-- ============================================================

-- Function to auto-audit critical table changes
CREATE OR REPLACE FUNCTION public.audit_critical_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    resource,
    details,
    ip_address,
    user_agent
  ) VALUES (
    COALESCE(auth.uid(), '00000000-0000-0000-0000-000000000000'),
    TG_OP || '_' || TG_TABLE_NAME,
    TG_TABLE_NAME || ':' || COALESCE(
      CASE WHEN TG_OP = 'DELETE' THEN OLD.id::text ELSE NEW.id::text END,
      'unknown'
    ),
    jsonb_build_object(
      'operation', TG_OP,
      'old_data', CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
      'new_data', CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
      'triggered_at', NOW(),
      'trigger_name', TG_NAME
    ),
    NULL,
    'database_trigger'
  );
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Audit triggers for critical tables (INSERT, UPDATE, DELETE)
DROP TRIGGER IF EXISTS audit_orders_changes ON public.orders;
CREATE TRIGGER audit_orders_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_critical_change();

DROP TRIGGER IF EXISTS audit_payments_changes ON public.payments;
CREATE TRIGGER audit_payments_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_critical_change();

DROP TRIGGER IF EXISTS audit_licenses_changes ON public.licenses;
CREATE TRIGGER audit_licenses_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.licenses
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_critical_change();

DROP TRIGGER IF EXISTS audit_subscriptions_changes ON public.user_subscriptions;
CREATE TRIGGER audit_subscriptions_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_critical_change();

-- ============================================================
-- 7. HEALTH CHECK VIEWS (Operational Monitoring)
-- ============================================================

-- View: Orders pending too long (>15 min warning, >60 min critical)
CREATE OR REPLACE VIEW public.health_pending_orders AS
SELECT 
  id,
  user_id,
  product_name,
  product_type,
  amount,
  created_at,
  EXTRACT(EPOCH FROM (NOW() - created_at))/60 AS minutes_pending,
  CASE 
    WHEN EXTRACT(EPOCH FROM (NOW() - created_at))/60 > 60 THEN 'CRITICAL'
    WHEN EXTRACT(EPOCH FROM (NOW() - created_at))/60 > 15 THEN 'WARNING'
    ELSE 'OK'
  END AS severity
FROM public.orders
WHERE status = 'pending'
ORDER BY created_at ASC;

-- View: Payments paid without completed orders
CREATE OR REPLACE VIEW public.health_payments_without_completion AS
SELECT 
  p.id AS payment_id,
  p.order_id,
  p.user_id,
  p.amount,
  p.paid_at,
  o.status AS order_status,
  EXTRACT(EPOCH FROM (NOW() - p.paid_at))/60 AS minutes_since_payment
FROM public.payments p
LEFT JOIN public.orders o ON p.order_id = o.id
WHERE p.status = 'paid'
  AND (o.status IS NULL OR o.status != 'completed')
ORDER BY p.paid_at ASC;

-- View: Active licenses that should be expired
CREATE OR REPLACE VIEW public.health_licenses_should_expire AS
SELECT 
  id,
  user_id,
  plan_name,
  end_date,
  EXTRACT(EPOCH FROM (NOW() - end_date))/3600 AS hours_overdue
FROM public.licenses
WHERE status = 'active'
  AND end_date < NOW()
ORDER BY end_date ASC;

-- View: License/Subscription divergence
CREATE OR REPLACE VIEW public.health_license_subscription_divergence AS
WITH active_licenses AS (
  SELECT user_id, COUNT(*) as license_count 
  FROM public.licenses 
  WHERE status = 'active' 
  GROUP BY user_id
),
active_subscriptions AS (
  SELECT user_id, COUNT(*) as subscription_count 
  FROM public.user_subscriptions 
  WHERE status = 'active' 
  GROUP BY user_id
)
SELECT 
  COALESCE(l.user_id, s.user_id) AS user_id,
  COALESCE(l.license_count, 0) AS active_licenses,
  COALESCE(s.subscription_count, 0) AS active_subscriptions,
  CASE 
    WHEN COALESCE(l.license_count, 0) != COALESCE(s.subscription_count, 0) THEN 'DIVERGENT'
    ELSE 'SYNCED'
  END AS status
FROM active_licenses l
FULL OUTER JOIN active_subscriptions s ON l.user_id = s.user_id
WHERE COALESCE(l.license_count, 0) != COALESCE(s.subscription_count, 0);

-- View: Orphaned session reservations
CREATE OR REPLACE VIEW public.health_orphaned_reservations AS
SELECT 
  sf.id AS session_id,
  sf.file_name,
  sf.type,
  sf.reserved_for_order,
  sf.reserved_at,
  o.status AS order_status,
  EXTRACT(EPOCH FROM (NOW() - sf.reserved_at))/60 AS minutes_reserved,
  CASE 
    WHEN o.id IS NULL THEN 'NO_ORDER'
    WHEN o.status NOT IN ('pending') THEN 'INVALID_ORDER_STATUS'
    WHEN EXTRACT(EPOCH FROM (NOW() - sf.reserved_at))/60 > 30 THEN 'TIMEOUT'
    ELSE 'VALID'
  END AS issue
FROM public.session_files sf
LEFT JOIN public.orders o ON sf.reserved_for_order = o.id
WHERE sf.status = 'reserved'
  AND (
    o.id IS NULL 
    OR o.status NOT IN ('pending')
    OR EXTRACT(EPOCH FROM (NOW() - sf.reserved_at))/60 > 30
  )
ORDER BY sf.reserved_at ASC;

-- View: Recent reconciliations (last 24h)
CREATE OR REPLACE VIEW public.health_recent_reconciliations AS
SELECT 
  action,
  resource,
  details,
  created_at
FROM public.audit_logs
WHERE action LIKE 'reconciliation_%'
  AND created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- View: System health dashboard summary
CREATE OR REPLACE VIEW public.health_dashboard_summary AS
SELECT 
  (SELECT COUNT(*) FROM public.health_pending_orders WHERE severity IN ('WARNING', 'CRITICAL')) AS pending_orders_alert,
  (SELECT COUNT(*) FROM public.health_payments_without_completion) AS payments_without_completion,
  (SELECT COUNT(*) FROM public.health_licenses_should_expire) AS licenses_should_expire,
  (SELECT COUNT(*) FROM public.health_license_subscription_divergence) AS divergent_users,
  (SELECT COUNT(*) FROM public.health_orphaned_reservations) AS orphaned_reservations,
  (SELECT COUNT(*) FROM public.health_recent_reconciliations) AS reconciliations_24h,
  NOW() AS checked_at;

-- Grant SELECT on health views to authenticated users (admins can query)
GRANT SELECT ON public.health_pending_orders TO authenticated;
GRANT SELECT ON public.health_payments_without_completion TO authenticated;
GRANT SELECT ON public.health_licenses_should_expire TO authenticated;
GRANT SELECT ON public.health_license_subscription_divergence TO authenticated;
GRANT SELECT ON public.health_orphaned_reservations TO authenticated;
GRANT SELECT ON public.health_recent_reconciliations TO authenticated;
GRANT SELECT ON public.health_dashboard_summary TO authenticated;

-- ============================================================
-- 8. CREATE TABLE FOR RECONCILIATION RUN HISTORY
-- ============================================================

CREATE TABLE IF NOT EXISTS public.reconciliation_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  total_detected INTEGER DEFAULT 0,
  total_corrected INTEGER DEFAULT 0,
  total_uncorrectable INTEGER DEFAULT 0,
  categories JSONB,
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  error TEXT
);

-- RLS for reconciliation_runs
ALTER TABLE public.reconciliation_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view reconciliation runs" ON public.reconciliation_runs
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can manage reconciliation runs" ON public.reconciliation_runs
  FOR ALL USING (true) WITH CHECK (true);

-- Index for recent runs
CREATE INDEX IF NOT EXISTS idx_reconciliation_runs_started_at 
  ON public.reconciliation_runs(started_at DESC);

COMMENT ON TABLE public.reconciliation_runs IS 'History of global reconciliation job executions';
