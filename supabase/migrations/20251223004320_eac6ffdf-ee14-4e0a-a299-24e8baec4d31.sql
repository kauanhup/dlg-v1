-- Adicionar colunas para sistema de reserva de sessões
ALTER TABLE session_files 
ADD COLUMN IF NOT EXISTS reserved_for_order UUID REFERENCES orders(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS reserved_at TIMESTAMPTZ;

-- Criar índice para performance de reservas
CREATE INDEX IF NOT EXISTS idx_session_files_reserved 
ON session_files(reserved_for_order) 
WHERE reserved_for_order IS NOT NULL;

-- Criar índice para queries por status e tipo
CREATE INDEX IF NOT EXISTS idx_session_files_status_type 
ON session_files(status, type);

-- Habilitar realtime para tabelas críticas (ignorar se já existem)
DO $$ 
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.session_files;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.sessions_inventory;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.system_settings;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;