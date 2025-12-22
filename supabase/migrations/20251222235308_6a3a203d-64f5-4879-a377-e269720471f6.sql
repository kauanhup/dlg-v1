-- Add gateway percentage/weight columns for random selection
ALTER TABLE public.gateway_settings 
ADD COLUMN IF NOT EXISTS pixup_weight integer DEFAULT 50,
ADD COLUMN IF NOT EXISTS evopay_weight integer DEFAULT 50;

-- Add comment explaining the weights
COMMENT ON COLUMN public.gateway_settings.pixup_weight IS 'Weight/percentage for PixUp gateway selection (0-100)';
COMMENT ON COLUMN public.gateway_settings.evopay_weight IS 'Weight/percentage for EvoPay gateway selection (0-100)';