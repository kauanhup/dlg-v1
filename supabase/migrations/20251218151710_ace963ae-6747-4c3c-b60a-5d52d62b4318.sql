-- Add failed_attempts column to verification_codes table for brute force protection
ALTER TABLE public.verification_codes 
ADD COLUMN IF NOT EXISTS failed_attempts INTEGER DEFAULT 0;