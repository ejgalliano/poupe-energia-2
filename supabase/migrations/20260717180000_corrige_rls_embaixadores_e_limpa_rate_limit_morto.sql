-- Auditoria de RLS (17/07/2026) encontrou dois problemas em politicas
-- criadas fora do controle de versao (direto no painel do Supabase):

-- 1) embaixadores_candidatos: tres politicas soltas com "using: true" e
--    nenhuma checagem de nivel rodavam em paralelo com
--    admin_all_embaixadores_candidatos (que exige nivel >= visualizador).
--    Como politicas permissivas do mesmo comando sao combinadas com OR no
--    Postgres, essas tres liberavam SELECT/UPDATE/DELETE de TODOS os
--    candidatos para qualquer usuario autenticado, independente de nivel.
drop policy if exists admin_read_candidatos on public.embaixadores_candidatos;
drop policy if exists admin_update_candidatos on public.embaixadores_candidatos;
drop policy if exists admin_delete_candidatos on public.embaixadores_candidatos;

-- 2) rate_limit_* (cashback_cadastros, contestacoes, leads_empresariais,
--    solicitacoes_parceria, embaixadores_candidatos): pelo mesmo motivo do
--    OR acima, essas politicas nunca bloquearam nada, pois a politica
--    anon_insert_* irmã (with_check: true) ja libera o INSERT incondicionalmente
--    para o mesmo role. A protecao real contra reenvio em massa agora e o
--    trigger BEFORE INSERT rate_limit_before_insert (ver migration
--    20260717171750_rate_limit_formularios_publicos.sql), que nao sofre
--    desse problema por nao ser uma RLS policy.
drop policy if exists rate_limit_cashback_insert on public.cashback_cadastros;
drop policy if exists rate_limit_contestacoes on public.contestacoes;
drop policy if exists rate_limit_leads_empresariais on public.leads_empresariais;
drop policy if exists rate_limit_solicitacoes_parceria on public.solicitacoes_parceria;
drop policy if exists rate_limit_embaixadores_candidatos on public.embaixadores_candidatos;
