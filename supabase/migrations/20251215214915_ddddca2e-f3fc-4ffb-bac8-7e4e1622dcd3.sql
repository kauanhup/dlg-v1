-- Remove the period check constraint and change to integer days
ALTER TABLE subscription_plans DROP CONSTRAINT subscription_plans_period_check;
ALTER TABLE subscription_plans ALTER COLUMN period TYPE integer USING 
  CASE 
    WHEN period = 'day' THEN 1
    WHEN period = 'week' THEN 7
    WHEN period = 'biweek' THEN 14
    WHEN period = 'month' THEN 30
    WHEN period = 'quarter' THEN 90
    WHEN period = 'semester' THEN 180
    WHEN period = 'year' THEN 365
    WHEN period = 'lifetime' THEN 0
    ELSE 30
  END;
-- Add check for positive values (0 = lifetime/one-time)
ALTER TABLE subscription_plans ADD CONSTRAINT subscription_plans_period_check CHECK (period >= 0);