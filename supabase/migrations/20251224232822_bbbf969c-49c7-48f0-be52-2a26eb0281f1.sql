CREATE OR REPLACE FUNCTION public.complete_order_atomic(_order_id uuid, _user_id uuid, _product_type text, _quantity integer)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  -- Serialize by user_id
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

  -- SUBSCRIPTION
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
    
    -- Cancel previous
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

  -- SESSION orders - fix FOR UPDATE with ARRAY_AGG
  _session_file_type := CASE 
    WHEN _product_type = 'session_brasileiras' THEN 'brasileiras'
    WHEN _product_type = 'session_estrangeiras' THEN 'estrangeiras'
    ELSE _product_type
  END;

  -- Loop to assign sessions one by one (avoiding FOR UPDATE with aggregate)
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
    -- Rollback partial assignments
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
$function$;