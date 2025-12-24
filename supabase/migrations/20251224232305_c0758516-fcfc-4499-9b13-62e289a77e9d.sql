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
  _current_sub_count INTEGER;
  _max_subs_per_user INTEGER;
  _current_plan_price NUMERIC;
  _expected_credit NUMERIC;
  _actual_credit_on_order NUMERIC;
  _days_remaining INTEGER;
  _daily_value NUMERIC;
BEGIN
  -- ==========================================
  -- CRITICAL: SERIALIZE BY USER_ID (fixed syntax)
  -- ==========================================
  _lock_key := ('x' || substr(md5(_user_id::text), 1, 15))::bit(64)::bigint;
  PERFORM pg_advisory_xact_lock(_lock_key);
  
  -- ==========================================
  -- AUTHORIZATION CHECKS
  -- ==========================================
  _is_service_role := (auth.uid() IS NULL);
  
  SELECT * INTO _order_record FROM orders WHERE id = _order_id;
  
  IF _order_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Pedido não encontrado');
  END IF;
  
  IF _order_record.status = 'completed' THEN
    RETURN json_build_object('success', true, 'message', 'Pedido já foi completado', 'already_completed', true);
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
  _actual_credit_on_order := COALESCE(_order_record.upgrade_credit_amount, 0);

  IF _product_type = 'subscription' THEN
    _plan_period := _order_record.plan_period_days;
    _plan_name := _order_record.product_name;
    _plan_id := _order_record.plan_id_snapshot;
    
    IF _plan_period IS NULL THEN
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
    
    -- Validate max subscriptions
    SELECT max_subscriptions_per_user INTO _max_subs_per_user
    FROM subscription_plans
    WHERE id = _plan_id;
    
    IF _max_subs_per_user IS NOT NULL THEN
      SELECT COUNT(*) INTO _current_sub_count
      FROM user_subscriptions
      WHERE user_id = _user_id
        AND plan_id = _plan_id;
      
      IF _current_sub_count >= _max_subs_per_user THEN
        RETURN json_build_object(
          'success', false, 
          'error', 'Limite de assinaturas atingido para este plano'
        );
      END IF;
    END IF;
    
    -- Validate upgrade credit
    IF _upgrade_from_subscription_id IS NOT NULL AND _actual_credit_on_order > 0 THEN
      SELECT 
        COALESCE(sp.promotional_price, sp.price),
        sp.period,
        GREATEST(0, EXTRACT(DAY FROM (us.next_billing_date - NOW())))::INTEGER
      INTO _current_plan_price, _plan_period, _days_remaining
      FROM user_subscriptions us
      JOIN subscription_plans sp ON sp.id = us.plan_id
      WHERE us.id = _upgrade_from_subscription_id
        AND us.user_id = _user_id;
      
      IF _current_plan_price IS NOT NULL AND _plan_period > 0 AND _days_remaining > 0 THEN
        _daily_value := _current_plan_price / _plan_period;
        _expected_credit := ROUND(_daily_value * _days_remaining * 100) / 100;
        
        IF ABS(_actual_credit_on_order - _expected_credit) > 0.50 THEN
          RETURN json_build_object(
            'success', false, 
            'error', 'Crédito de upgrade inválido'
          );
        END IF;
      END IF;
    END IF;
    
    -- Cancel previous subscriptions and licenses
    UPDATE user_subscriptions
    SET status = 'cancelled', updated_at = NOW()
    WHERE user_id = _user_id AND status = 'active';
    GET DIAGNOSTICS _cancelled_subs_count = ROW_COUNT;
    
    UPDATE licenses
    SET status = 'cancelled', updated_at = NOW()
    WHERE user_id = _user_id AND status = 'active';
    GET DIAGNOSTICS _cancelled_licenses_count = ROW_COUNT;
    
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
    UPDATE payments SET status = 'paid', paid_at = NOW() WHERE order_id = _order_id AND status != 'paid';

    RETURN json_build_object(
      'success', true, 
      'type', 'subscription', 
      'plan_name', _plan_name,
      'plan_period_days', _plan_period
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
  UPDATE payments SET status = 'paid', paid_at = NOW() WHERE order_id = _order_id AND status != 'paid';

  RETURN json_build_object('success', true, 'type', 'sessions', 'assigned_sessions', _quantity);
EXCEPTION
  WHEN unique_violation THEN
    RETURN json_build_object('success', false, 'error', 'Race condition - tente novamente');
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$function$;