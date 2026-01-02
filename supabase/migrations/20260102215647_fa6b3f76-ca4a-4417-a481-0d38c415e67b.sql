
-- Tabela para configuração de juros por parcela
CREATE TABLE public.installment_fees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  installment_number INTEGER NOT NULL UNIQUE CHECK (installment_number >= 2 AND installment_number <= 12),
  fee_percentage DECIMAL(5,2) NOT NULL DEFAULT 0 CHECK (fee_percentage >= 0 AND fee_percentage <= 100),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.installment_fees ENABLE ROW LEVEL SECURITY;

-- Política de leitura pública (para o checkout)
CREATE POLICY "Qualquer um pode ler taxas de juros"
ON public.installment_fees
FOR SELECT
USING (true);

-- Política de escrita apenas para admins (usando has_role)
CREATE POLICY "Apenas admins podem modificar taxas"
ON public.installment_fees
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Trigger para updated_at
CREATE TRIGGER update_installment_fees_updated_at
BEFORE UPDATE ON public.installment_fees
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir valores padrão (2 a 12 parcelas, sem juros inicialmente)
INSERT INTO public.installment_fees (installment_number, fee_percentage) VALUES
(2, 0),
(3, 0),
(4, 0),
(5, 0),
(6, 0),
(7, 0),
(8, 0),
(9, 0),
(10, 0),
(11, 0),
(12, 0);
