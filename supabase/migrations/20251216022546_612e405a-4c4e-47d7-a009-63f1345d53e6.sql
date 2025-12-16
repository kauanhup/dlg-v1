-- Create gateway_settings table to store PixUp/BSPAY credentials
CREATE TABLE public.gateway_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL DEFAULT 'pixup',
  client_id TEXT,
  client_secret TEXT,
  webhook_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gateway_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can manage gateway settings
CREATE POLICY "Admins can manage gateway settings"
ON public.gateway_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_gateway_settings_updated_at
BEFORE UPDATE ON public.gateway_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default row for pixup
INSERT INTO public.gateway_settings (provider) VALUES ('pixup');