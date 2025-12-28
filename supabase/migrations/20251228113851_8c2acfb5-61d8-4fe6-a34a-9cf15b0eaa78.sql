-- Tabela para rastrear dispositivos que já usaram trial (anti-burla)
CREATE TABLE IF NOT EXISTS public.trial_device_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_fingerprint TEXT NOT NULL UNIQUE,
  machine_id TEXT,
  device_name TEXT,
  device_os TEXT,
  ip_address TEXT,
  user_id UUID,
  trial_started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  trial_expired_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index para busca rápida por fingerprint
CREATE INDEX IF NOT EXISTS idx_trial_device_fingerprint ON trial_device_history(device_fingerprint);

-- RLS
ALTER TABLE public.trial_device_history ENABLE ROW LEVEL SECURITY;

-- Apenas service role pode gerenciar (edge functions)
CREATE POLICY "Service role can manage trial history" ON public.trial_device_history
  FOR ALL USING (true) WITH CHECK (true);

-- Admins podem visualizar
CREATE POLICY "Admins can view trial history" ON public.trial_device_history
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Adicionar configurações de trial ao system_settings (se não existirem)
INSERT INTO public.system_settings (key, value) VALUES 
  ('trial_enabled', 'true'),
  ('trial_duration_days', '3'),
  ('trial_max_devices', '1'),
  ('trial_max_actions_per_day', '50')
ON CONFLICT (key) DO NOTHING;