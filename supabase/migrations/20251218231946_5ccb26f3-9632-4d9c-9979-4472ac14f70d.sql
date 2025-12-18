-- Add ip_attempts table for tracking login attempts by IP (for unknown emails)
CREATE TABLE IF NOT EXISTS public.ip_login_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient queries
CREATE INDEX idx_ip_login_attempts_ip ON public.ip_login_attempts(ip_address);
CREATE INDEX idx_ip_login_attempts_created ON public.ip_login_attempts(created_at);

-- Enable RLS
ALTER TABLE public.ip_login_attempts ENABLE ROW LEVEL SECURITY;

-- Only service role can access this table (edge functions)
CREATE POLICY "Service role only" ON public.ip_login_attempts
  FOR ALL USING (false) WITH CHECK (false);

-- Auto-cleanup old records (older than 24h)
CREATE OR REPLACE FUNCTION public.cleanup_old_ip_attempts()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM public.ip_login_attempts
  WHERE created_at < NOW() - INTERVAL '24 hours';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_cleanup_ip_attempts
  AFTER INSERT ON public.ip_login_attempts
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.cleanup_old_ip_attempts();