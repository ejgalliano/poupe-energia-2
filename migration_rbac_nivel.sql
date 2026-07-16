-- ================================================================
-- SEGURANÇA: RBAC server-side por nível de admin
-- Rodar no SQL Editor do Supabase (sdmbkayjipowfkxaohxo)
--
-- O que faz:
--   1. Cria funções helper que lêem o nivel do usuário autenticado
--   2. Adiciona policies de ESCRITA por nivel nas tabelas críticas
--
-- Não altera: policies de SELECT existentes (público vê rankings)
-- ================================================================


-- ----------------------------------------------------------------
-- PARTE 1 — Funções helper (sempre seguro rodar, sem efeito colateral)
-- ----------------------------------------------------------------

-- Retorna o nivel do usuário autenticado ('super_admin', 'gestor', etc.)
-- SECURITY DEFINER para poder ler user_roles sem expor a tabela ao cliente
CREATE OR REPLACE FUNCTION public.get_my_nivel()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT nivel
  FROM public.user_roles
  WHERE user_id = auth.uid()
    AND role = 'admin'
  LIMIT 1;
$$;

-- Retorna true se o usuário tem nivel >= nivel_minimo
-- Hierarquia: super_admin > gestor > operacional > visualizador
CREATE OR REPLACE FUNCTION public.is_nivel_minimo(nivel_minimo text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT CASE public.get_my_nivel()
    WHEN 'super_admin' THEN true
    WHEN 'gestor'      THEN nivel_minimo IN ('gestor', 'operacional', 'visualizador')
    WHEN 'operacional' THEN nivel_minimo IN ('operacional', 'visualizador')
    WHEN 'visualizador'THEN nivel_minimo = 'visualizador'
    ELSE false
  END;
$$;


-- ----------------------------------------------------------------
-- PARTE 2 — user_roles (mais crítica: controla quem é admin)
-- Somente super_admin pode criar, alterar ou remover admins
-- ----------------------------------------------------------------

DROP POLICY IF EXISTS "admin_write_user_roles"    ON public.user_roles;
DROP POLICY IF EXISTS "admin_insert_user_roles"   ON public.user_roles;
DROP POLICY IF EXISTS "admin_update_user_roles"   ON public.user_roles;
DROP POLICY IF EXISTS "admin_delete_user_roles"   ON public.user_roles;
DROP POLICY IF EXISTS "authenticated_user_roles"  ON public.user_roles;

CREATE POLICY "nivel_insert_user_roles" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (public.is_nivel_minimo('super_admin'));

CREATE POLICY "nivel_update_user_roles" ON public.user_roles
  FOR UPDATE TO authenticated
  USING  (public.is_nivel_minimo('super_admin'))
  WITH CHECK (public.is_nivel_minimo('super_admin'));

CREATE POLICY "nivel_delete_user_roles" ON public.user_roles
  FOR DELETE TO authenticated
  USING (public.is_nivel_minimo('super_admin'));


-- ----------------------------------------------------------------
-- PARTE 3 — empresas (dados do ranking, impacto público)
-- INSERT/UPDATE: gestor+    |    DELETE: somente super_admin
-- ----------------------------------------------------------------

DROP POLICY IF EXISTS "admin_write_empresas"   ON public.empresas;
DROP POLICY IF EXISTS "admin_insert_empresas"  ON public.empresas;
DROP POLICY IF EXISTS "admin_update_empresas"  ON public.empresas;
DROP POLICY IF EXISTS "admin_delete_empresas"  ON public.empresas;
DROP POLICY IF EXISTS "authenticated_empresas" ON public.empresas;

CREATE POLICY "nivel_insert_empresas" ON public.empresas
  FOR INSERT TO authenticated
  WITH CHECK (public.is_nivel_minimo('gestor'));

CREATE POLICY "nivel_update_empresas" ON public.empresas
  FOR UPDATE TO authenticated
  USING  (public.is_nivel_minimo('gestor'))
  WITH CHECK (public.is_nivel_minimo('gestor'));

CREATE POLICY "nivel_delete_empresas" ON public.empresas
  FOR DELETE TO authenticated
  USING (public.is_nivel_minimo('super_admin'));


-- ----------------------------------------------------------------
-- PARTE 4 — notas_empresas (notas afetam ranking diretamente)
-- INSERT/UPDATE: operacional+    |    DELETE: gestor+
-- ----------------------------------------------------------------

DROP POLICY IF EXISTS "admin_write_notas_empresas"   ON public.notas_empresas;
DROP POLICY IF EXISTS "admin_insert_notas_empresas"  ON public.notas_empresas;
DROP POLICY IF EXISTS "admin_update_notas_empresas"  ON public.notas_empresas;
DROP POLICY IF EXISTS "admin_delete_notas_empresas"  ON public.notas_empresas;
DROP POLICY IF EXISTS "authenticated_notas_empresas" ON public.notas_empresas;

CREATE POLICY "nivel_insert_notas_empresas" ON public.notas_empresas
  FOR INSERT TO authenticated
  WITH CHECK (public.is_nivel_minimo('operacional'));

CREATE POLICY "nivel_update_notas_empresas" ON public.notas_empresas
  FOR UPDATE TO authenticated
  USING  (public.is_nivel_minimo('operacional'))
  WITH CHECK (public.is_nivel_minimo('operacional'));

CREATE POLICY "nivel_delete_notas_empresas" ON public.notas_empresas
  FOR DELETE TO authenticated
  USING (public.is_nivel_minimo('gestor'));


-- ----------------------------------------------------------------
-- PARTE 5 — distribuidoras (dados de referência)
-- INSERT/UPDATE/DELETE: gestor+
-- ----------------------------------------------------------------

DROP POLICY IF EXISTS "admin_write_distribuidoras"   ON public.distribuidoras;
DROP POLICY IF EXISTS "admin_insert_distribuidoras"  ON public.distribuidoras;
DROP POLICY IF EXISTS "admin_update_distribuidoras"  ON public.distribuidoras;
DROP POLICY IF EXISTS "admin_delete_distribuidoras"  ON public.distribuidoras;
DROP POLICY IF EXISTS "authenticated_distribuidoras" ON public.distribuidoras;

CREATE POLICY "nivel_insert_distribuidoras" ON public.distribuidoras
  FOR INSERT TO authenticated
  WITH CHECK (public.is_nivel_minimo('gestor'));

CREATE POLICY "nivel_update_distribuidoras" ON public.distribuidoras
  FOR UPDATE TO authenticated
  USING  (public.is_nivel_minimo('gestor'))
  WITH CHECK (public.is_nivel_minimo('gestor'));

CREATE POLICY "nivel_delete_distribuidoras" ON public.distribuidoras
  FOR DELETE TO authenticated
  USING (public.is_nivel_minimo('gestor'));


-- ----------------------------------------------------------------
-- PARTE 6 — embaixadores (dados financeiros: PIX, comissão)
-- INSERT/UPDATE: gestor+    |    DELETE: super_admin
-- ----------------------------------------------------------------

DROP POLICY IF EXISTS "admin_write_embaixadores"   ON public.embaixadores;
DROP POLICY IF EXISTS "admin_insert_embaixadores"  ON public.embaixadores;
DROP POLICY IF EXISTS "admin_update_embaixadores"  ON public.embaixadores;
DROP POLICY IF EXISTS "admin_delete_embaixadores"  ON public.embaixadores;
DROP POLICY IF EXISTS "authenticated_embaixadores" ON public.embaixadores;

CREATE POLICY "nivel_insert_embaixadores" ON public.embaixadores
  FOR INSERT TO authenticated
  WITH CHECK (public.is_nivel_minimo('gestor'));

CREATE POLICY "nivel_update_embaixadores" ON public.embaixadores
  FOR UPDATE TO authenticated
  USING  (public.is_nivel_minimo('gestor'))
  WITH CHECK (public.is_nivel_minimo('gestor'));

CREATE POLICY "nivel_delete_embaixadores" ON public.embaixadores
  FOR DELETE TO authenticated
  USING (public.is_nivel_minimo('super_admin'));


-- ----------------------------------------------------------------
-- VERIFICAÇÃO — rode após aplicar para confirmar que funcionou
-- ----------------------------------------------------------------
/*
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE schemaname = 'public'
  AND policyname LIKE 'nivel_%'
ORDER BY tablename, cmd;
*/
