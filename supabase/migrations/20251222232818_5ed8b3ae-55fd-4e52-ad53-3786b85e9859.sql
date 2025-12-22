-- Add evopay_transaction_id column to payments table for webhook matching
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS evopay_transaction_id text;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payments_evopay_transaction_id ON public.payments(evopay_transaction_id) WHERE evopay_transaction_id IS NOT NULL;