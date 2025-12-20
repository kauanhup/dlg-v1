-- Atualizar constraint de status em payments para incluir 'cancelled'
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_status_check;

ALTER TABLE payments ADD CONSTRAINT payments_status_check 
CHECK (status = ANY (ARRAY['pending', 'paid', 'failed', 'refunded', 'cancelled']::text[]));