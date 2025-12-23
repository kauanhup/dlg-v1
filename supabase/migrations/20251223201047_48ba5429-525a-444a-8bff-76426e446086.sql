-- ================================================================
-- CRITICAL FIX #1: UNIQUE partial index for 1 active license per user
-- This will REJECT any INSERT/UPDATE that would create a second active license
-- ================================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_licenses_one_active_per_user 
ON public.licenses (user_id) 
WHERE status = 'active';

-- ================================================================
-- CRITICAL FIX #2: Race Condition - pg_advisory_xact_lock
-- Serialize complete_order_atomic execution per user_id
-- ================================================================
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
  _lock_key BIGINT;
BEGIN
  -- ==========================================
  -- CRITICAL: SERIALIZE BY USER_ID
  -- Advisory lock prevents race conditions
  -- Uses user_id UUID converted to bigint as lock key
  -- Lock is automatically released at end of transaction
  -- ==========================================
  _lock_key := ('x' || substr(md5(_user_id::text), 1, 16))::bit(64)::bigint;
  PERFORM pg_advisory_xact_lock(726583, _lock_key);
  
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
  
  _upgrade_from_subscription_id := _order_record.upgrade_from_subscription_id;

  IF _product_type = 'subscription' THEN
    _plan_period := _order_record.plan_period_days;
    _plan_name := _order_record.product_name;
    _plan_id := _order_record.plan_id_snapshot;
    
    IF _plan_period IS NULL THEN
      RAISE NOTICE 'WARNING: Order % has no plan_period_days snapshot, fetching from subscription_plans', _order_id;
      
      SELECT id, period INTO _plan_id, _plan_period 
      FROM subscription_plans 
      WHERE name = _order_record.product_name
      LIMIT 1;
      
      IF _plan_period IS NULL THEN
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
    
    -- Cancel ALL previous active subscriptions and licenses for this user
    UPDATE user_subscriptions
    SET status = 'cancelled', updated_at = NOW()
    WHERE user_id = _user_id AND status = 'active';
    GET DIAGNOSTICS _cancelled_subs_count = ROW_COUNT;
    
    UPDATE licenses
    SET status = 'cancelled', updated_at = NOW()
    WHERE user_id = _user_id AND status = 'active';
    GET DIAGNOSTICS _cancelled_licenses_count = ROW_COUNT;
    
    IF _cancelled_subs_count > 0 OR _cancelled_licenses_count > 0 THEN
      RAISE NOTICE 'Cancelled % subscriptions and % licenses for user %', 
        _cancelled_subs_count, _cancelled_licenses_count, _user_id;
    END IF;
    
    _start_date := NOW();
    IF _plan_period > 0 THEN
      _end_date := _start_date + (_plan_period || ' days')::interval;
    ELSE
      _end_date := _start_date + interval '100 years';
    END IF;
    
    IF _plan_id IS NOT NULL THEN
      INSERT INTO user_subscriptions (user_id, plan_id, status, start_date, next_billing_date)
      VALUES (_user_id, _plan_id, 'active', _start_date, _end_date);
    ELSE
      INSERT INTO user_subscriptions (user_id, plan_id, status, start_date, next_billing_date)
      SELECT _user_id, sp.id, 'active', _start_date, _end_date
      FROM subscription_plans sp
      WHERE sp.name = _plan_name
      LIMIT 1;
    END IF;
    
    INSERT INTO licenses (user_id, plan_name, status, start_date, end_date)
    VALUES (_user_id, _plan_name, 'active', _start_date, _end_date);
    
    UPDATE orders SET status = 'completed', updated_at = NOW() WHERE id = _order_id;
    UPDATE payments SET status = 'paid', paid_at = NOW() WHERE order_id = _order_id;

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

  -- Handle SESSION orders
  _session_file_type := CASE 
    WHEN _product_type = 'session_brasileiras' THEN 'brasileiras'
    WHEN _product_type = 'session_estrangeiras' THEN 'estrangeiras'
    ELSE _product_type
  END;

  SELECT ARRAY_AGG(id) INTO _available_files
  FROM session_files
  WHERE type = _session_file_type AND status = 'available'
  ORDER BY uploaded_at
  LIMIT _quantity
  FOR UPDATE SKIP LOCKED;

  IF _available_files IS NULL OR ARRAY_LENGTH(_available_files, 1) IS NULL OR ARRAY_LENGTH(_available_files, 1) < _quantity THEN
    RETURN json_build_object('success', false, 'error', 'Estoque insuficiente');
  END IF;

  UPDATE session_files
  SET status = 'sold', user_id = _user_id, order_id = _order_id, sold_at = NOW()
  WHERE id = ANY(_available_files);

  INSERT INTO user_sessions (user_id, order_id, type, session_data, is_downloaded)
  SELECT _user_id, _order_id, sf.type, sf.file_name, false
  FROM session_files sf WHERE sf.id = ANY(_available_files);

  UPDATE sessions_inventory
  SET quantity = GREATEST(0, quantity - _quantity), updated_at = NOW()
  WHERE type = _session_file_type;

  UPDATE orders SET status = 'completed', updated_at = NOW() WHERE id = _order_id;
  UPDATE payments SET status = 'paid', paid_at = NOW() WHERE order_id = _order_id;

  RETURN json_build_object('success', true, 'type', 'sessions', 'assigned_sessions', _quantity);
EXCEPTION
  WHEN unique_violation THEN
    RETURN json_build_object('success', false, 'error', 'Licença já existe para este usuário (race condition handled)');
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$function$;

COMMENT ON FUNCTION public.complete_order_atomic IS 'Atomically completes order with advisory lock (726583, user_hash) to prevent race conditions. UNIQUE index on licenses enforces 1 active per user.';