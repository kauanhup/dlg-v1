-- Add unique constraint on provider to prevent duplicates
-- First, delete any potential duplicates keeping only the most recent
DELETE FROM gateway_settings 
WHERE id NOT IN (
  SELECT DISTINCT ON (provider) id 
  FROM gateway_settings 
  ORDER BY provider, created_at DESC
);

-- Add unique constraint
ALTER TABLE gateway_settings 
ADD CONSTRAINT gateway_settings_provider_unique UNIQUE (provider);