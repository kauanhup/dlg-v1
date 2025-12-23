-- =====================================================
-- SNAPSHOT DE PLANO - Imutabilidade de compras
-- =====================================================

-- 1. Adicionar colunas de snapshot na tabela orders
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS plan_period_days INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS plan_id_snapshot UUID DEFAULT NULL,
ADD COLUMN IF NOT EXISTS plan_features_snapshot JSONB DEFAULT NULL;

-- 2. Criar índice para queries de snapshot (orders de subscription)
CREATE INDEX IF NOT EXISTS idx_orders_plan_snapshot 
ON public.orders(plan_id_snapshot) 
WHERE product_type = 'subscription' AND plan_id_snapshot IS NOT NULL;

-- 3. Comentários para documentação
COMMENT ON COLUMN public.orders.plan_period_days IS 'Snapshot do período do plano em dias no momento da compra. Imutável após criação.';
COMMENT ON COLUMN public.orders.plan_id_snapshot IS 'Snapshot do UUID do plano no momento da compra. Imutável após criação.';
COMMENT ON COLUMN public.orders.plan_features_snapshot IS 'Snapshot das features do plano no momento da compra. Imutável após criação.';

-- =====================================================
-- COMPLETE_ORDER_ATOMIC - Versão 2.0
-- Usa snapshot ao invés de buscar plano em tempo real
-- =====================================================

CREATE OR REPLACE FUNCTION public.complete_order_atomic(_order_id uuid, _user_id uuid, _product_type text, _quantity integer)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _available_files UUID[];
  _order_record RECORD;
  _start_date TIMESTAMP WITH TIME ZONE;
  _end_date TIMESTAMP WITH TIME ZONE;
  _caller_is_admin BOOLEAN;
  _is_service_role BOOLEAN;
  _session_file_type TEXT;
  _upgrade_from_subscription_id UUID;
  _cancelled_licenses_count INTEGER;
  _cancelled_subs_count INTEGER;
  _plan_period INTEGER;
  _plan_name TEXT;
  _plan_id UUID;
BEGIN
  -- ==========================================
  -- AUTHORIZATION CHECKS (CRITICAL SECURITY)
  -- ==========================================
  
  _is_service_role := (auth.uid() IS NULL);
  
  SELECT * INTO _order_record FROM orders WHERE id = _order_id;
  
  IF _order_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Pedido não encontrado');
  END IF;
  
  IF _order_record.status = 'completed' THEN
    RETURN json_build_object('success', false, 'error', 'Pedido já foi completado');
  END IF;
  
  IF NOT _is_service_role THEN
    SELECT has_role(auth.uid(), 'admin'::app_role) INTO _caller_is_admin;
    
    IF NOT _caller_is_admin THEN
      RETURN json_build_object('success', false, 'error', 'Não autorizado');
    END IF;
  ELSE
    -- Service role (webhook): accept 'pending' status (payment confirmed externally)
    IF _order_record.status NOT IN ('pending', 'paid') THEN
      RETURN json_build_object('success', false, 'error', 'Status inválido para completar pedido');
    END IF;
  END IF;
  
  IF _order_record.user_id != _user_id THEN
    RETURN json_build_object('success', false, 'error', 'ID de usuário não corresponde ao pedido');
  END IF;
  
  IF _order_record.product_type != _product_type THEN
    RETURN json_build_object('success', false, 'error', 'Tipo de produto não corresponde ao pedido');
  END IF;
  
  IF _order_record.quantity != _quantity THEN
    RETURN json_build_object('success', false, 'error', 'Quantidade não corresponde ao pedido');
  END IF;
  
  -- Get upgrade_from_subscription_id if this is an upgrade
  _upgrade_from_subscription_id := _order_record.upgrade_from_subscription_id;
  
  -- ==========================================
  -- ORDER PROCESSING
  -- ==========================================

  IF _product_type = 'subscription' THEN
    -- ==========================================
    -- CRITICAL: Use SNAPSHOT data, not live plan data
    -- This ensures admin changes don't affect pending orders
    -- ==========================================
    
    _plan_period := _order_record.plan_period_days;
    _plan_name := _order_record.product_name;
    _plan_id := _order_record.plan_id_snapshot;
    
    -- Fallback for legacy orders without snapshot (migration safety)
    IF _plan_period IS NULL THEN
      RAISE NOTICE 'WARNING: Order % has no plan_period_days snapshot, fetching from subscription_plans', _order_id;
      
      SELECT id, period INTO _plan_id, _plan_period 
      FROM subscription_plans 
      WHERE name = _order_record.product_name
      LIMIT 1;
      
      IF _plan_period IS NULL THEN
        -- Second fallback: try to match by price
        SELECT id, period INTO _plan_id, _plan_period 
        FROM subscription_plans 
        WHERE (promotional_price = _order_record.amount OR price = _order_record.amount)
          AND is_active = true
        LIMIT 1;
      END IF;
      
      IF _plan_period IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'Plano não encontrado e order sem snapshot');
      END IF;
    END IF;
    
    -- ==========================================
    -- Cancel ALL previous active subscriptions for this user
    -- This ensures only 1 active subscription/license per user
    -- ==========================================
    
    UPDATE user_subscriptions
    SET status = 'cancelled',
        updated_at = NOW()
    WHERE user_id = _user_id
      AND status = 'active';
    GET DIAGNOSTICS _cancelled_subs_count = ROW_COUNT;
    
    UPDATE licenses
    SET status = 'cancelled',
        updated_at = NOW()
    WHERE user_id = _user_id
      AND status = 'active';
    GET DIAGNOSTICS _cancelled_licenses_count = ROW_COUNT;
    
    IF _cancelled_subs_count > 0 OR _cancelled_licenses_count > 0 THEN
      RAISE NOTICE 'Cancelled % subscriptions and % licenses for user %', 
        _cancelled_subs_count, _cancelled_licenses_count, _user_id;
    END IF;
    
    -- Calculate dates from SNAPSHOT
    _start_date := NOW();
    IF _plan_period > 0 THEN
      _end_date := _start_date + (_plan_period || ' days')::interval;
    ELSE
      _end_date := _start_date + interval '100 years';
    END IF;
    
    -- Create user subscription (with plan_id if available)
    IF _plan_id IS NOT NULL THEN
      INSERT INTO user_subscriptions (user_id, plan_id, status, start_date, next_billing_date)
      VALUES (_user_id, _plan_id, 'active', _start_date, _end_date);
    ELSE
      -- Fallback: need to find plan_id by name
      INSERT INTO user_subscriptions (user_id, plan_id, status, start_date, next_billing_date)
      SELECT _user_id, sp.id, 'active', _start_date, _end_date
      FROM subscription_plans sp
      WHERE sp.name = _plan_name
      LIMIT 1;
    END IF;
    
    -- Create license using snapshot data
    INSERT INTO licenses (user_id, plan_name, status, start_date, end_date)
    VALUES (_user_id, _plan_name, 'active', _start_date, _end_date);
    
    -- Update order status
    UPDATE orders
    SET status = 'completed',
        updated_at = NOW()
    WHERE id = _order_id;

    -- Update payment status
    UPDATE payments
    SET status = 'paid',
        paid_at = NOW()
    WHERE order_id = _order_id;

    RETURN json_build_object(
      'success', true, 
      'type', 'subscription', 
      'plan_name', _plan_name,
      'plan_period_days', _plan_period,
      'used_snapshot', _order_record.plan_period_days IS NOT NULL,
      'was_upgrade', _upgrade_from_subscription_id IS NOT NULL,
      'cancelled_previous_subscriptions', _cancelled_subs_count,
      'cancelled_previous_licenses', _cancelled_licenses_count
    );
  END IF;

  -- ==========================================
  -- Handle SESSION orders (unchanged logic)
  -- ==========================================
  _session_file_type := CASE 
    WHEN _product_type = 'session_brasileiras' THEN 'brasileiras'
    WHEN _product_type = 'session_estrangeiras' THEN 'estrangeiras'
    ELSE _product_type
  END;

  SELECT ARRAY_AGG(id) INTO _available_files
  FROM session_files
  WHERE type = _session_file_type
    AND status = 'available'
  ORDER BY uploaded_at
  LIMIT _quantity
  FOR UPDATE SKIP LOCKED;

  IF _available_files IS NULL OR ARRAY_LENGTH(_available_files, 1) IS NULL OR ARRAY_LENGTH(_available_files, 1) < _quantity THEN
    RETURN json_build_object('success', false, 'error', 'Estoque insuficiente');
  END IF;

  UPDATE session_files
  SET status = 'sold',
      user_id = _user_id,
      order_id = _order_id,
      sold_at = NOW()
  WHERE id = ANY(_available_files);

  INSERT INTO user_sessions (user_id, order_id, type, session_data, is_downloaded)
  SELECT _user_id, _order_id, sf.type, sf.file_name, false
  FROM session_files sf
  WHERE sf.id = ANY(_available_files);

  UPDATE sessions_inventory
  SET quantity = GREATEST(0, quantity - _quantity),
      updated_at = NOW()
  WHERE type = _session_file_type;

  UPDATE orders
  SET status = 'completed',
      updated_at = NOW()
  WHERE id = _order_id;

  UPDATE payments
  SET status = 'paid',
      paid_at = NOW()
  WHERE order_id = _order_id;

  RETURN json_build_object('success', true, 'type', 'sessions', 'assigned_sessions', _quantity);
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$function$;