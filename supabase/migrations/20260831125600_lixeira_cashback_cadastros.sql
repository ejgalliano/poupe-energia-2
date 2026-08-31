-- Lixeira (soft delete) para Gestao de Adesoes.
--
-- Mover para a lixeira nao apaga o registro - so marca deletado_em, escondendo da lista
-- padrao. Dai da pra restaurar ou excluir definitivamente. Registros ja tem dados reais de
-- clientes (CPF, documentos, fatura), entao apagar direto sem essa camada e arriscado
-- demais - pedido explicito do usuario em 11/08/2026 foi "deletar e/ou enviar pra lixeira".

alter table public.cashback_cadastros
  add column if not exists deletado_em timestamptz;

comment on column public.cashback_cadastros.deletado_em is
  'Soft delete: nao nulo = esta na lixeira, escondido da listagem padrao. Nulo = ativo.';

-- Indice parcial: acelera tanto "listar so os ativos" (deletado_em is null, o caso comum)
-- quanto "listar a lixeira" (deletado_em is not null).
create index if not exists cashback_cadastros_deletado_em_idx
  on public.cashback_cadastros (deletado_em);
