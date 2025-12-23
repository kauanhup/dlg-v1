-- Tabela para prevenir processamento duplicado de webhooks
CREATE TABLE IF NOT EXISTS processed_webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id TEXT NOT NULL,
  gateway TEXT NOT NULL,
  order_id UUID REFERENCES orders(id),
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  webhook_payload JSONB,
  CONSTRAINT unique_transaction_gateway UNIQUE (transaction_id, gateway)
);

CREATE INDEX IF NOT EXISTS idx_processed_webhooks_transaction ON processed_webhooks(transaction_id);
CREATE INDEX IF NOT EXISTS idx_processed_webhooks_gateway ON processed_webhooks(gateway);

-- Tabela para logs de gateway (fallback e métricas)
CREATE TABLE IF NOT EXISTS gateway_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gateway TEXT NOT NULL,
  order_id UUID REFERENCES orders(id),
  status TEXT NOT NULL,
  error TEXT,
  attempt INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gateway_logs_order ON gateway_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_gateway_logs_gateway_status ON gateway_logs(gateway, status);

-- Adicionar coluna ban_reason na tabela profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ban_reason TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ;

-- RLS para processed_webhooks (apenas service role)
ALTER TABLE processed_webhooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role only for processed_webhooks" ON processed_webhooks 
  FOR ALL USING (false) WITH CHECK (false);

-- RLS para gateway_logs (admins podem ver)
ALTER TABLE gateway_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view gateway logs" ON gateway_logs 
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Service role can insert gateway logs" ON gateway_logs 
  FOR INSERT WITH CHECK (true);