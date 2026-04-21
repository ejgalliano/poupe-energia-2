
-- Tabela de leads empresariais
CREATE TABLE public.leads_empresariais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  razao_social TEXT NOT NULL,
  cnpj TEXT NOT NULL,
  estado_sigla TEXT,
  distribuidora_id UUID REFERENCES public.distribuidoras(id) ON DELETE SET NULL,
  distribuidora_nome TEXT,
  valor_conta NUMERIC,
  responsavel_nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT NOT NULL,
  arquivos_paths TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'novo'
    CHECK (status IN ('novo','em_contato','proposta_enviada','convertido','perdido')),
  observacoes_admin TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_leads_emp_status ON public.leads_empresariais(status);
CREATE INDEX idx_leads_emp_created ON public.leads_empresariais(created_at DESC);

ALTER TABLE public.leads_empresariais ENABLE ROW LEVEL SECURITY;

-- Público pode inserir (formulário aberto)
CREATE POLICY "Public insert leads empresariais"
  ON public.leads_empresariais FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(razao_social) BETWEEN 1 AND 200
    AND length(cnpj) BETWEEN 14 AND 20
    AND length(email) BETWEEN 5 AND 255
    AND length(telefone) BETWEEN 8 AND 30
  );

CREATE POLICY "Admins read leads empresariais"
  ON public.leads_empresariais FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update leads empresariais"
  ON public.leads_empresariais FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete leads empresariais"
  ON public.leads_empresariais FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_leads_empresariais_updated_at
  BEFORE UPDATE ON public.leads_empresariais
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket privado para contas de luz
INSERT INTO storage.buckets (id, name, public)
VALUES ('contas-empresariais', 'contas-empresariais', false)
ON CONFLICT (id) DO NOTHING;

-- Qualquer um pode enviar arquivos para o bucket (formulário público)
CREATE POLICY "Public upload contas empresariais"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'contas-empresariais');

-- Apenas admins podem ler/baixar
CREATE POLICY "Admins read contas empresariais"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'contas-empresariais' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete contas empresariais"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'contas-empresariais' AND has_role(auth.uid(), 'admin'::app_role));
