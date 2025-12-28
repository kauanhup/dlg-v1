-- Tabela para controlar dispositivos/computadores conectados ao bot
CREATE TABLE public.bot_device_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  device_id TEXT NOT NULL,
  device_name TEXT,
  device_os TEXT,
  ip_address TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índice para busca rápida por user_id
CREATE INDEX idx_bot_device_sessions_user_id ON public.bot_device_sessions(user_id);
CREATE UNIQUE INDEX idx_bot_device_sessions_unique ON public.bot_device_sessions(user_id, device_id);

-- Enable RLS
ALTER TABLE public.bot_device_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view own device sessions"
  ON public.bot_device_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage device sessions"
  ON public.bot_device_sessions FOR ALL
  USING (true)
  WITH CHECK (true);

-- Tabela para logs de atividades do bot
CREATE TABLE public.bot_activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  device_id TEXT,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índice para busca por user_id e data
CREATE INDEX idx_bot_activity_logs_user_id ON public.bot_activity_logs(user_id);
CREATE INDEX idx_bot_activity_logs_created_at ON public.bot_activity_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.bot_activity_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view own activity logs"
  ON public.bot_activity_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert activity logs"
  ON public.bot_activity_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all logs"
  ON public.bot_activity_logs FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Adicionar coluna max_devices nos planos (limite de dispositivos por plano)
ALTER TABLE public.subscription_plans 
ADD COLUMN IF NOT EXISTS max_devices INTEGER DEFAULT 1;

-- Atualizar planos existentes com limites padrão
UPDATE public.subscription_plans SET max_devices = 1 WHERE max_devices IS NULL;