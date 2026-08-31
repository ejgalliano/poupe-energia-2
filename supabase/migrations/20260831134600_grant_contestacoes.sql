-- Corrige "permission denied for table contestacoes" pra usuarios admin autenticados.
--
-- Mesmo bug ja visto em politicas_desconto (migration 20260720223350): RLS sozinha nao
-- basta, precisa do GRANT explicito na tabela tambem. Sem isso, TODA query autenticada em
-- contestacoes falhava (42501), inclusive o polling do contador de pendentes no menu do
-- admin (AdminLayout.tsx, a cada 60s) e a propria tela /admin/contestacoes - confirmado ao
-- vivo em 31/08/2026 com um usuario super_admin logado, reproduzindo select simples,
-- select com count e update.

grant select, update on public.contestacoes to authenticated;
