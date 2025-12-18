-- Add email feature toggles to gateway_settings
ALTER TABLE public.gateway_settings 
ADD COLUMN IF NOT EXISTS password_recovery_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS email_verification_enabled boolean DEFAULT false;

-- Create table for verification codes
CREATE TABLE IF NOT EXISTS public.verification_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  code text NOT NULL,
  type text NOT NULL CHECK (type IN ('password_reset', 'email_verification')),
  expires_at timestamp with time zone NOT NULL,
  used boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can manage codes (edge functions)
CREATE POLICY "Service role can manage verification codes"
ON public.verification_codes
FOR ALL
USING (true)
WITH CHECK (true);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_verification_codes_email_type 
ON public.verification_codes(user_email, type, used);

-- Auto-delete expired codes (cleanup)
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires 
ON public.verification_codes(expires_at);