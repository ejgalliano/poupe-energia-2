-- Tabela para registrar consumidores que querem contratar via Poupe
-- empresas que ainda não são parceiras
CREATE TABLE IF NOT EXISTS public.solicitacoes_parceria (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id      UUID REFERENCES public.empresas(id) ON DELETE SET NULL,
  empresa_nome    TEXT NOT NULL,
  estado_sigla    TEXT,
  distribuidora_id UUID REFERENCES public.distribuidoras(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.solicitacoes_parceria ENABLE ROW LEVEL SECURITY;

-- Qualquer visitante pode registrar um interesse
CREATE POLICY "Public insert solicitacoes_parceria"
  ON public.solicitacoes_parceria FOR INSERT
  WITH CHECK (true);

-- Apenas admins leem
CREATE POLICY "Admins read solicitacoes_parceria"
  ON public.solicitacoes_parceria FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete solicitacoes_parceria"
  ON public.solicitacoes_parceria FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
