-- Update complete_order_atomic to handle both sessions AND subscriptions
CREATE OR REPLACE FUNCTION public.complete_order_atomic(
  _order_id uuid, 
  _user_id uuid, 
  _product_type text, 
  _quantity integer
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _available_files UUID[];
  _order_record RECORD;
  _plan_record RECORD;
  _start_date TIMESTAMP WITH TIME ZONE;
  _end_date TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get order details
  SELECT * INTO _order_record FROM orders WHERE id = _order_id;
  
  IF _order_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Pedido não encontrado');
  END IF;

  -- Handle SUBSCRIPTION orders
  IF _product_type = 'subscription' THEN
    -- Get plan details from the order's product_name
    SELECT * INTO _plan_record 
    FROM subscription_plans 
    WHERE name = _order_record.product_name
    LIMIT 1;
    
    IF _plan_record IS NULL THEN
      -- Try to find plan by matching price
      SELECT * INTO _plan_record 
      FROM subscription_plans 
      WHERE (promotional_price = _order_record.amount OR price = _order_record.amount)
        AND is_active = true
      LIMIT 1;
    END IF;
    
    IF _plan_record IS NULL THEN
      RETURN json_build_object('success', false, 'error', 'Plano não encontrado');
    END IF;
    
    -- Calculate dates
    _start_date := NOW();
    IF _plan_record.period > 0 THEN
      _end_date := _start_date + (_plan_record.period || ' days')::interval;
    ELSE
      -- Lifetime access - 100 years
      _end_date := _start_date + interval '100 years';
    END IF;
    
    -- Create user subscription
    INSERT INTO user_subscriptions (user_id, plan_id, status, start_date, next_billing_date)
    VALUES (_user_id, _plan_record.id, 'active', _start_date, _end_date);
    
    -- Create license
    INSERT INTO licenses (user_id, plan_name, status, start_date, end_date)
    VALUES (_user_id, _plan_record.name, 'active', _start_date, _end_date);
    
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

    RETURN json_build_object('success', true, 'type', 'subscription', 'plan_name', _plan_record.name);
  END IF;

  -- Handle SESSION orders (existing logic)
  -- Lock and select available files atomically
  SELECT ARRAY_AGG(id) INTO _available_files
  FROM session_files
  WHERE type = _product_type
    AND status = 'available'
  ORDER BY uploaded_at
  LIMIT _quantity
  FOR UPDATE SKIP LOCKED;

  -- Check if we got enough
  IF _available_files IS NULL OR ARRAY_LENGTH(_available_files, 1) IS NULL OR ARRAY_LENGTH(_available_files, 1) < _quantity THEN
    RETURN json_build_object('success', false, 'error', 'Estoque insuficiente');
  END IF;

  -- Mark files as sold
  UPDATE session_files
  SET status = 'sold',
      user_id = _user_id,
      order_id = _order_id,
      sold_at = NOW()
  WHERE id = ANY(_available_files);

  -- Create user sessions from the files
  INSERT INTO user_sessions (user_id, order_id, type, session_data, is_downloaded)
  SELECT _user_id, _order_id, sf.type, sf.file_name, false
  FROM session_files sf
  WHERE sf.id = ANY(_available_files);

  -- Update inventory count
  UPDATE sessions_inventory
  SET quantity = GREATEST(0, quantity - _quantity),
      updated_at = NOW()
  WHERE type = _product_type;

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

  RETURN json_build_object('success', true, 'type', 'sessions', 'assigned_sessions', _quantity);
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$function$;