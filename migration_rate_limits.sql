-- ================================================================
-- RATE LIMITING — Formulários públicos
-- Rodar no SQL Editor do Supabase (sdmbkayjipowfkxaohxo)
--
-- O que faz:
--   1. Função auxiliar que conta submissões recentes por email
--   2. Para cada tabela pública:
--      a) Habilita RLS
--      b) Adiciona policy permissiva para anon inserir
--      c) Adiciona policy permissiva para admin ter acesso total
--      d) Adiciona policy RESTRICTIVA de rate limit para anon
--
-- Políticas RESTRICTIVAS usam AND com as permissivas,
-- então o rate limit é sempre aplicado mesmo havendo outras policies.
-- ================================================================


-- ────────────────────────────────────────────────────────────────
-- Função auxiliar (SECURITY DEFINER para ler além das policies de SELECT)
-- ────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.count_recent_submissions(
  p_table   text,
  p_col     text,
  p_value   text,
  p_minutes int DEFAULT 30
)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
  v_count bigint;
BEGIN
  EXECUTE format(
    'SELECT COUNT(*) FROM public.%I WHERE %I = $1 AND created_at > now() - ($2 * interval ''1 minute'')',
    p_table, p_col
  ) INTO v_count USING p_value, p_minutes;
  RETURN v_count;
END;
$$;


-- ────────────────────────────────────────────────────────────────
-- 1. cashback_cadastros
--    Formulários: Aderir, AtivarCashback, AdesaoModal
--    Limite: 2 submissões por email em 60 minutos
-- ────────────────────────────────────────────────────────────────

ALTER TABLE public.cashback_cadastros ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_cashback_cadastros"     ON public.cashback_cadastros;
DROP POLICY IF EXISTS "anon_insert_cashback_cadastros"   ON public.cashback_cadastros;
DROP POLICY IF EXISTS "rate_limit_cashback_insert"       ON public.cashback_cadastros;

-- Admin tem acesso total
CREATE POLICY "admin_all_cashback_cadastros" ON public.cashback_cadastros
  FOR ALL TO authenticated
  USING  (public.is_nivel_minimo('visualizador'))
  WITH CHECK (public.is_nivel_minimo('operacional'));

-- Anon pode inserir (policy permissiva base)
CREATE POLICY "anon_insert_cashback_cadastros" ON public.cashback_cadastros
  FOR INSERT TO anon
  WITH CHECK (true);

-- Rate limit restritivo: máx 2 por email em 60 min
CREATE POLICY "rate_limit_cashback_insert" ON public.cashback_cadastros
  AS RESTRICTIVE
  FOR INSERT TO anon
  WITH CHECK (
    public.count_recent_submissions('cashback_cadastros', 'email', email, 60) < 2
  );


-- ────────────────────────────────────────────────────────────────
-- 2. embaixadores_candidatos
--    Formulário: Programa de Parceiros (SejaUmEmbaixador)
--    Limite: 1 submissão por email em 24 horas
-- ────────────────────────────────────────────────────────────────

ALTER TABLE public.embaixadores_candidatos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_embaixadores_candidatos"   ON public.embaixadores_candidatos;
DROP POLICY IF EXISTS "anon_insert_embaixadores_candidatos" ON public.embaixadores_candidatos;
DROP POLICY IF EXISTS "rate_limit_embaixadores_candidatos"  ON public.embaixadores_candidatos;

CREATE POLICY "admin_all_embaixadores_candidatos" ON public.embaixadores_candidatos
  FOR ALL TO authenticated
  USING  (public.is_nivel_minimo('visualizador'))
  WITH CHECK (public.is_nivel_minimo('operacional'));

CREATE POLICY "anon_insert_embaixadores_candidatos" ON public.embaixadores_candidatos
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "rate_limit_embaixadores_candidatos" ON public.embaixadores_candidatos
  AS RESTRICTIVE
  FOR INSERT TO anon
  WITH CHECK (
    public.count_recent_submissions('embaixadores_candidatos', 'email', email, 1440) < 1
  );


-- ────────────────────────────────────────────────────────────────
-- 3. contestacoes
--    Formulário: Contestação
--    Atenção: coluna é email_corporativo, não email
--    Limite: 2 submissões por email em 60 minutos
-- ────────────────────────────────────────────────────────────────

ALTER TABLE public.contestacoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_contestacoes"   ON public.contestacoes;
DROP POLICY IF EXISTS "anon_insert_contestacoes" ON public.contestacoes;
DROP POLICY IF EXISTS "rate_limit_contestacoes"  ON public.contestacoes;

CREATE POLICY "admin_all_contestacoes" ON public.contestacoes
  FOR ALL TO authenticated
  USING  (public.is_nivel_minimo('visualizador'))
  WITH CHECK (public.is_nivel_minimo('operacional'));

CREATE POLICY "anon_insert_contestacoes" ON public.contestacoes
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "rate_limit_contestacoes" ON public.contestacoes
  AS RESTRICTIVE
  FOR INSERT TO anon
  WITH CHECK (
    public.count_recent_submissions('contestacoes', 'email_corporativo', email_corporativo, 60) < 2
  );


-- ────────────────────────────────────────────────────────────────
-- 4. leads_empresariais
--    Formulário: BusinessLeadDialog (análise de fatura empresarial)
--    Limite: 3 submissões por email em 60 minutos
-- ────────────────────────────────────────────────────────────────

ALTER TABLE public.leads_empresariais ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_leads_empresariais"   ON public.leads_empresariais;
DROP POLICY IF EXISTS "anon_insert_leads_empresariais" ON public.leads_empresariais;
DROP POLICY IF EXISTS "rate_limit_leads_empresariais"  ON public.leads_empresariais;

CREATE POLICY "admin_all_leads_empresariais" ON public.leads_empresariais
  FOR ALL TO authenticated
  USING  (public.is_nivel_minimo('visualizador'))
  WITH CHECK (public.is_nivel_minimo('operacional'));

CREATE POLICY "anon_insert_leads_empresariais" ON public.leads_empresariais
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "rate_limit_leads_empresariais" ON public.leads_empresariais
  AS RESTRICTIVE
  FOR INSERT TO anon
  WITH CHECK (
    public.count_recent_submissions('leads_empresariais', 'email', email, 60) < 3
  );


-- ────────────────────────────────────────────────────────────────
-- 5. solicitacoes_parceria
--    Formulário: ExternalSiteModal (empresas não parceiras)
--    Limite: 3 submissões por email em 60 minutos
-- ────────────────────────────────────────────────────────────────

ALTER TABLE public.solicitacoes_parceria ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_solicitacoes_parceria"   ON public.solicitacoes_parceria;
DROP POLICY IF EXISTS "anon_insert_solicitacoes_parceria" ON public.solicitacoes_parceria;
DROP POLICY IF EXISTS "rate_limit_solicitacoes_parceria"  ON public.solicitacoes_parceria;

CREATE POLICY "admin_all_solicitacoes_parceria" ON public.solicitacoes_parceria
  FOR ALL TO authenticated
  USING  (public.is_nivel_minimo('visualizador'))
  WITH CHECK (public.is_nivel_minimo('operacional'));

CREATE POLICY "anon_insert_solicitacoes_parceria" ON public.solicitacoes_parceria
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "rate_limit_solicitacoes_parceria" ON public.solicitacoes_parceria
  AS RESTRICTIVE
  FOR INSERT TO anon
  WITH CHECK (
    public.count_recent_submissions('solicitacoes_parceria', 'email', email, 60) < 3
  );


-- ────────────────────────────────────────────────────────────────
-- Verificação (rodar após aplicar)
-- ────────────────────────────────────────────────────────────────
/*
SELECT tablename, policyname, permissive, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
  AND (policyname LIKE 'rate_limit_%' OR policyname LIKE 'anon_insert_%' OR policyname LIKE 'admin_all_%')
ORDER BY tablename, policyname;
*/
