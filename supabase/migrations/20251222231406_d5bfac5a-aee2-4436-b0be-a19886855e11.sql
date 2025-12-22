-- Enable realtime for orders table so Checkout can receive status updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;