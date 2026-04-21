
-- Tabela de leads
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  distribuidora_id UUID REFERENCES public.distribuidoras(id) ON DELETE SET NULL,
  estado_sigla TEXT,
  evento TEXT NOT NULL CHECK (evento IN ('clique_aderir', 'clique_saiba_mais')),
  ip_hash TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_leads_empresa ON public.leads(empresa_id);
CREATE INDEX idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX idx_leads_evento ON public.leads(evento);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert leads"
  ON public.leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins read leads"
  ON public.leads FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete leads"
  ON public.leads FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Tabela de configuração de parceiros
CREATE TABLE public.parceiros_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID NOT NULL UNIQUE REFERENCES public.empresas(id) ON DELETE CASCADE,
  url_afiliado TEXT,
  comissao_percentual NUMERIC DEFAULT 0,
  modelo_comissao TEXT CHECK (modelo_comissao IN ('por_clique', 'por_adesao', 'por_fatura')),
  observacoes TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.parceiros_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read parceiros_config"
  ON public.parceiros_config FOR SELECT
  TO anon, authenticated
  USING (ativo = true);

CREATE POLICY "Admins manage parceiros_config"
  ON public.parceiros_config FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_parceiros_config_updated_at
  BEFORE UPDATE ON public.parceiros_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
