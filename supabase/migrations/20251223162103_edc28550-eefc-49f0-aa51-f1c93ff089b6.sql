-- ============================================================
-- FIX SECURITY DEFINER VIEWS - Convert to SECURITY INVOKER
-- ============================================================

-- Drop and recreate views with explicit SECURITY INVOKER
DROP VIEW IF EXISTS public.health_dashboard_summary;
DROP VIEW IF EXISTS public.health_recent_reconciliations;
DROP VIEW IF EXISTS public.health_orphaned_reservations;
DROP VIEW IF EXISTS public.health_license_subscription_divergence;
DROP VIEW IF EXISTS public.health_licenses_should_expire;
DROP VIEW IF EXISTS public.health_payments_without_completion;
DROP VIEW IF EXISTS public.health_pending_orders;

-- View: Orders pending too long (>15 min warning, >60 min critical)
CREATE VIEW public.health_pending_orders
WITH (security_invoker = true)
AS
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
CREATE VIEW public.health_payments_without_completion
WITH (security_invoker = true)
AS
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
CREATE VIEW public.health_licenses_should_expire
WITH (security_invoker = true)
AS
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
CREATE VIEW public.health_license_subscription_divergence
WITH (security_invoker = true)
AS
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
CREATE VIEW public.health_orphaned_reservations
WITH (security_invoker = true)
AS
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
CREATE VIEW public.health_recent_reconciliations
WITH (security_invoker = true)
AS
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
CREATE VIEW public.health_dashboard_summary
WITH (security_invoker = true)
AS
SELECT 
  (SELECT COUNT(*) FROM public.health_pending_orders WHERE severity IN ('WARNING', 'CRITICAL')) AS pending_orders_alert,
  (SELECT COUNT(*) FROM public.health_payments_without_completion) AS payments_without_completion,
  (SELECT COUNT(*) FROM public.health_licenses_should_expire) AS licenses_should_expire,
  (SELECT COUNT(*) FROM public.health_license_subscription_divergence) AS divergent_users,
  (SELECT COUNT(*) FROM public.health_orphaned_reservations) AS orphaned_reservations,
  (SELECT COUNT(*) FROM public.health_recent_reconciliations) AS reconciliations_24h,
  NOW() AS checked_at;

-- Re-grant SELECT on health views to authenticated users (admins can query via RLS)
GRANT SELECT ON public.health_pending_orders TO authenticated;
GRANT SELECT ON public.health_payments_without_completion TO authenticated;
GRANT SELECT ON public.health_licenses_should_expire TO authenticated;
GRANT SELECT ON public.health_license_subscription_divergence TO authenticated;
GRANT SELECT ON public.health_orphaned_reservations TO authenticated;
GRANT SELECT ON public.health_recent_reconciliations TO authenticated;
GRANT SELECT ON public.health_dashboard_summary TO authenticated;