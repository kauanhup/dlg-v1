-- Add custom quantity fields to sessions_inventory table
ALTER TABLE public.sessions_inventory
ADD COLUMN IF NOT EXISTS custom_quantity_enabled boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS custom_quantity_min integer NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS custom_price_per_unit numeric NOT NULL DEFAULT 0;