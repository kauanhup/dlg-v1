-- Fix 1: Add storage policy for users to download their purchased files
CREATE POLICY "Users can download their purchased files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'sessions' AND
  EXISTS (
    SELECT 1 FROM public.session_files sf
    WHERE sf.file_path = name
      AND sf.user_id = auth.uid()
      AND sf.status = 'sold'
  )
);

-- Fix 2: Create atomic order completion function to prevent race conditions
CREATE OR REPLACE FUNCTION public.complete_order_atomic(
  _order_id UUID,
  _user_id UUID,
  _product_type TEXT,
  _quantity INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _available_files UUID[];
  _file_record RECORD;
BEGIN
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

  RETURN json_build_object('success', true, 'assigned_sessions', _quantity);
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Grant execute permission to authenticated users (admins will use this via RLS)
GRANT EXECUTE ON FUNCTION public.complete_order_atomic TO authenticated;