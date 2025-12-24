-- Create trigger to auto-sync inventory when session_files status changes
CREATE OR REPLACE FUNCTION public.sync_inventory_on_session_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update inventory count for the affected type
  UPDATE sessions_inventory
  SET quantity = (
    SELECT COUNT(*) 
    FROM session_files 
    WHERE type = COALESCE(NEW.type, OLD.type) 
      AND status = 'available'
  ),
  updated_at = NOW()
  WHERE type = COALESCE(NEW.type, OLD.type);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger on session_files
DROP TRIGGER IF EXISTS sync_inventory_trigger ON session_files;
CREATE TRIGGER sync_inventory_trigger
  AFTER INSERT OR UPDATE OR DELETE ON session_files
  FOR EACH ROW
  EXECUTE FUNCTION sync_inventory_on_session_change();