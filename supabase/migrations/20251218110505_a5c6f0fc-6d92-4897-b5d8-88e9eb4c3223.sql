-- Add require_email_confirmation setting if not exists
INSERT INTO system_settings (key, value)
VALUES ('require_email_confirmation', 'false')
ON CONFLICT (key) DO NOTHING;

-- Drop existing trigger and function to recreate with proper logic
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_email_confirmed ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved handle_new_user function that works for both scenarios:
-- 1. When auto_confirm is ON (email_confirmed_at is set immediately)
-- 2. When auto_confirm is OFF (email_confirmed_at is set later on confirmation)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only create profile and role if email is confirmed
  IF NEW.email_confirmed_at IS NOT NULL THEN
    -- Insert profile
    INSERT INTO public.profiles (user_id, name, email, whatsapp)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data ->> 'name', ''),
      NEW.email,
      COALESCE(NEW.raw_user_meta_data ->> 'whatsapp', '')
    )
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Insert default user role if not exists
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user')
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger for INSERT (handles auto-confirm ON case)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Trigger for UPDATE (handles email confirmation after signup)
CREATE TRIGGER on_auth_user_email_confirmed
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.handle_new_user();