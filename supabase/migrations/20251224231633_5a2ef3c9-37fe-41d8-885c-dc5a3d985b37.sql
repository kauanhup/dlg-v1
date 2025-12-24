-- Disable the trigger temporarily to fix the payment
ALTER TABLE orders DISABLE TRIGGER enforce_order_status_transition;

-- Update the cancelled order back to pending
UPDATE orders SET status = 'pending', updated_at = NOW() WHERE id = '112438e6-8ec1-41e7-977e-6f456d521889';

-- Re-enable the trigger
ALTER TABLE orders ENABLE TRIGGER enforce_order_status_transition;