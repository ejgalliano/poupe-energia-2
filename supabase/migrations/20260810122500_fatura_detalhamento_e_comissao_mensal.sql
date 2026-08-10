-- Modulo de Comissoes - Fase 2 (captura de dados manuais).
-- Ver docs/comissoes/2026-08-01-modulo-de-comissoes-discussao.md para o contexto completo.
--
-- Nao gera comissao para o parceiro automaticamente - so captura os dados-base que a
-- equipe lanca manualmente olhando a fatura (item 1) e o portal da fornecedora (item 2).
-- A geracao de comissao rastreavel em leads_embaixadores fica pra Fase 3.

-- 1) Detalhamento da fatura por adesao - 1 linha por cashback_cadastro_id.
create table if not exists public.fatura_detalhamento (
  id uuid primary key default gen_random_uuid(),
  cashback_cadastro_id uuid not null unique references public.cashback_cadastros(id) on delete cascade,
  grupo_tarifario text not null check (grupo_tarifario in ('A', 'B')),
  valor_fatura numeric(12,2) not null default 0,
  item_cip numeric(12,2) not null default 0,
  item_juros numeric(12,2) not null default 0,
  item_multa numeric(12,2) not null default 0,
  item_bandeira_tarifaria numeric(12,2) not null default 0,
  item_uso_rede numeric(12,2) not null default 0,
  item_tributos numeric(12,2) not null default 0,
  item_parcelamentos numeric(12,2) not null default 0,
  item_terceiros numeric(12,2) not null default 0,
  item_extraordinarios numeric(12,2) not null default 0,
  item_outros numeric(12,2) not null default 0,
  valor_elegivel numeric(12,2) not null default 0,
  commission_policy_id uuid references public.commission_policy(id),
  fcp_value numeric(12,2),
  comissao_sugerida numeric(12,2),
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.fatura_detalhamento is
  'Lancamento manual da equipe (olhando a foto da fatura) dos itens nao comissionaveis e
   classificacao Grupo A/B de uma adesao. valor_elegivel/fcp_value/comissao_sugerida sao
   calculados no app no momento do salvamento, usando a politica ativa - guardados aqui
   para auditoria, mas so viram comissao de verdade do parceiro na Fase 3.';

alter table public.fatura_detalhamento enable row level security;

create policy "nivel_select_fatura_detalhamento"
  on public.fatura_detalhamento for select
  to authenticated
  using (is_nivel_minimo('gestor'::text));

create policy "nivel_insert_fatura_detalhamento"
  on public.fatura_detalhamento for insert
  to authenticated
  with check (is_nivel_minimo('gestor'::text));

create policy "nivel_update_fatura_detalhamento"
  on public.fatura_detalhamento for update
  to authenticated
  using (is_nivel_minimo('gestor'::text))
  with check (is_nivel_minimo('gestor'::text));

grant select, insert, update on public.fatura_detalhamento to authenticated;

-- 2) Ledger mensal de comissao recebida da fornecedora - 1 linha por empresa+mes.
create table if not exists public.fornecedora_comissao_mensal (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete restrict,
  mes_referencia date not null,
  valor_recebido numeric(12,2) not null default 0,
  tributos numeric(12,2) not null default 0,
  valor_liquido numeric(12,2) not null default 0,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (empresa_id, mes_referencia)
);

comment on table public.fornecedora_comissao_mensal is
  'Lancamento manual mensal (a equipe olha o portal da fornecedora) de quanto ela pagou de
   comissao pra Poupe. Alimenta o calculo recorrente do Grupo A na Fase 3.';

alter table public.fornecedora_comissao_mensal enable row level security;

create policy "nivel_select_fornecedora_comissao_mensal"
  on public.fornecedora_comissao_mensal for select
  to authenticated
  using (is_nivel_minimo('gestor'::text));

create policy "nivel_insert_fornecedora_comissao_mensal"
  on public.fornecedora_comissao_mensal for insert
  to authenticated
  with check (is_nivel_minimo('gestor'::text));

create policy "nivel_update_fornecedora_comissao_mensal"
  on public.fornecedora_comissao_mensal for update
  to authenticated
  using (is_nivel_minimo('gestor'::text))
  with check (is_nivel_minimo('gestor'::text));

grant select, insert, update on public.fornecedora_comissao_mensal to authenticated;
