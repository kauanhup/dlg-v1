-- Adicionar campos para assinatura recorrente do Asaas
ALTER TABLE public.user_subscriptions 
ADD COLUMN IF NOT EXISTS asaas_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS asaas_customer_id TEXT,
ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN NOT NULL DEFAULT true;

-- Adicionar índice para busca por asaas_subscription_id
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_asaas_subscription_id 
ON public.user_subscriptions(asaas_subscription_id) WHERE asaas_subscription_id IS NOT NULL;

-- Adicionar campo para armazenar customer_id do Asaas no profile para reutilização
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS asaas_customer_id TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_asaas_customer_id 
ON public.profiles(asaas_customer_id) WHERE asaas_customer_id IS NOT NULL;

-- Comentários explicativos
COMMENT ON COLUMN public.user_subscriptions.asaas_subscription_id IS 'ID da assinatura recorrente no Asaas';
COMMENT ON COLUMN public.user_subscriptions.asaas_customer_id IS 'ID do cliente no Asaas';
COMMENT ON COLUMN public.user_subscriptions.auto_renew IS 'Se a assinatura deve renovar automaticamente';
COMMENT ON COLUMN public.profiles.asaas_customer_id IS 'ID do cliente no Asaas para reuso';