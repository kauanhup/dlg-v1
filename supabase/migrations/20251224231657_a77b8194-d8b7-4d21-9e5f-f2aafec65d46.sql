-- Disable the payment trigger temporarily
ALTER TABLE payments DISABLE TRIGGER enforce_payment_status_transition;

-- Reset payment to pending
UPDATE payments SET status = 'pending', paid_at = NULL WHERE order_id = '112438e6-8ec1-41e7-977e-6f456d521889';

-- Re-enable trigger
ALTER TABLE payments ENABLE TRIGGER enforce_payment_status_transition;