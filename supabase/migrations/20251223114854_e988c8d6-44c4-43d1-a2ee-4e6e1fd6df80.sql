-- Função RPC para reservar sessions atomicamente com SKIP LOCKED
-- Previne race conditions onde dois usuários compram as mesmas sessions

CREATE OR REPLACE FUNCTION public.reserve_sessions_atomic(
  p_session_type TEXT,
  p_quantity INTEGER,
  p_order_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reserved_count INTEGER;
  v_available_count INTEGER;
BEGIN
  -- Verificar quantas sessions estão disponíveis (sem lock)
  SELECT COUNT(*) INTO v_available_count
  FROM session_files
  WHERE type = p_session_type
    AND status = 'available'
    AND (reserved_at IS NULL OR reserved_at < NOW() - INTERVAL '30 minutes');
  
  -- Se não há sessions suficientes, retornar erro imediatamente
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

  -- Reservar atomicamente usando FOR UPDATE SKIP LOCKED
  -- Isso previne deadlocks e race conditions
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

  -- Verificar se conseguimos reservar a quantidade solicitada
  IF v_reserved_count < p_quantity THEN
    -- Rollback das reservas parciais (desfazer o que foi reservado)
    UPDATE session_files
    SET 
      status = 'available',
      reserved_for_order = NULL,
      reserved_at = NULL
    WHERE reserved_for_order = p_order_id
      AND status = 'reserved';
    
    RETURN json_build_object(
      'success', false,
      'error', 'Não foi possível reservar todas as sessions. Outras pessoas podem estar comprando agora.',
      'reserved_count', 0,
      'requested_count', p_quantity,
      'available_count', v_available_count,
      'session_ids', ARRAY[]::UUID[]
    );
  END IF;

  -- Sucesso - retornar IDs reservados
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
    -- Em caso de erro, limpar reservas parciais
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

-- Função para liberar reservas expiradas ou canceladas
CREATE OR REPLACE FUNCTION public.release_session_reservation(
  p_order_id UUID
)
RETURNS JSON
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