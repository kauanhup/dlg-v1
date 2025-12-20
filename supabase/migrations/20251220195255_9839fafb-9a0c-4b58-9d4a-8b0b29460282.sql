-- Add qr_code_base64 column to payments table to store QR code image for restoration
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS qr_code_base64 text;