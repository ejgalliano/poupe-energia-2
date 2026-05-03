
-- Tabela embaixadores
CREATE TABLE public.embaixadores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL UNIQUE,
  nome text NOT NULL,
  email text,
  telefone text,
  tipo text NOT NULL DEFAULT 'pessoa_fisica' CHECK (tipo IN ('pessoa_fisica','pessoa_juridica')),
  cpf_cnpj text,
  comissao_percentual numeric NOT NULL DEFAULT 0,
  chave_pix text,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.embaixadores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage embaixadores" ON public.embaixadores
  FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role));

-- Public read embaixadores ATIVOS (necessário para validação do código no popup público)
CREATE POLICY "Public read active embaixadores" ON public.embaixadores
  FOR SELECT TO anon, authenticated
  USING (ativo = true);

CREATE TRIGGER trg_embaixadores_updated
  BEFORE UPDATE ON public.embaixadores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Tabela leads_embaixadores
CREATE TABLE public.leads_embaixadores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  embaixador_id uuid NOT NULL REFERENCES public.embaixadores(id) ON DELETE RESTRICT,
  empresa_id uuid NOT NULL REFERENCES public.empresas(id) ON DELETE RESTRICT,
  status_comissao text NOT NULL DEFAULT 'pendente' CHECK (status_comissao IN ('pendente','validado','pago','cancelado')),
  valor_comissao numeric NOT NULL DEFAULT 0,
  data_adesao date,
  data_pagamento date,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.leads_embaixadores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage leads_embaixadores" ON public.leads_embaixadores
  FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin'::app_role))
  WITH CHECK (has_role(auth.uid(),'admin'::app_role));

-- Public can insert (para o popup público registrar vínculo)
CREATE POLICY "Public insert leads_embaixadores" ON public.leads_embaixadores
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE TRIGGER trg_leads_embaixadores_updated
  BEFORE UPDATE ON public.leads_embaixadores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_leads_emb_embaixador ON public.leads_embaixadores(embaixador_id);
CREATE INDEX idx_leads_emb_status ON public.leads_embaixadores(status_comissao);
CREATE INDEX idx_leads_emb_lead ON public.leads_embaixadores(lead_id);
