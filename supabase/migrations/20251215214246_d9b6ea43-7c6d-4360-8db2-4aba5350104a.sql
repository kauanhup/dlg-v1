-- Add 'day' to the period check constraint
ALTER TABLE subscription_plans DROP CONSTRAINT subscription_plans_period_check;
ALTER TABLE subscription_plans ADD CONSTRAINT subscription_plans_period_check 
  CHECK (period = ANY (ARRAY['day'::text, 'week'::text, 'biweek'::text, 'month'::text, 'quarter'::text, 'semester'::text, 'year'::text, 'lifetime'::text]));