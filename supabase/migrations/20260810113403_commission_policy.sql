-- Modulo de Comissoes - Fase 1 (fundacao).
-- Ver docs/comissoes/2026-08-01-modulo-de-comissoes-discussao.md para o contexto completo.
--
-- Tabela de politica de comissao, parametrizavel e versionada: editar NUNCA sobrescreve
-- uma linha existente, sempre cria uma nova e desativa a anterior (feito na aplicacao,
-- dentro de uma transacao) - assim comissoes ja calculadas com uma regra antiga nao mudam
-- retroativamente quando o percentual for ajustado no futuro.

create table if not exists public.commission_policy (
  id uuid primary key default gen_random_uuid(),
  service_type text not null check (service_type in ('GD_A', 'GD_B')),
  fcp_percent numeric(5,4),
  representative_percent numeric(5,4) not null,
  recurring boolean not null,
  trigger_event text not null check (trigger_event in ('FIRST_PAYMENT', 'MONTHLY_RECEIPT')),
  vigente_desde timestamptz not null default now(),
  ativo boolean not null default true,
  created_at timestamptz not null default now()
);

-- So pode existir uma politica ativa por service_type ao mesmo tempo.
create unique index if not exists commission_policy_active_unique
  on public.commission_policy (service_type)
  where (ativo);

comment on column public.commission_policy.fcp_percent is
  'Fator Compensavel Poupe. Nulo para GD_A (o FCP do Grupo A vem da comissao recebida da fornecedora, nao de um percentual fixo).';
comment on column public.commission_policy.trigger_event is
  'FIRST_PAYMENT: comissao unica no primeiro pagamento (GD_B). MONTHLY_RECEIPT: comissao recorrente a cada recebimento mensal da fornecedora (GD_A).';

insert into public.commission_policy (service_type, fcp_percent, representative_percent, recurring, trigger_event, ativo)
values
  ('GD_B', 0.48, 0.50, false, 'FIRST_PAYMENT', true),
  ('GD_A', null, 0.50, true, 'MONTHLY_RECEIPT', true)
on conflict do nothing;

alter table public.commission_policy enable row level security;

-- So a equipe (nivel gestor ou acima) enxerga e mexe em politica de comissao - nao tem
-- nenhum uso publico/anon dessa tabela.
create policy "nivel_select_commission_policy"
  on public.commission_policy for select
  to authenticated
  using (is_nivel_minimo('gestor'::text));

create policy "nivel_insert_commission_policy"
  on public.commission_policy for insert
  to authenticated
  with check (is_nivel_minimo('gestor'::text));

create policy "nivel_update_commission_policy"
  on public.commission_policy for update
  to authenticated
  using (is_nivel_minimo('gestor'::text))
  with check (is_nivel_minimo('gestor'::text));

grant select, insert, update on public.commission_policy to authenticated;

-- Estende leads_embaixadores para aceitar indicacoes vindas do fluxo de adesao
-- (cashback_cadastros), nao so do fluxo "Solicitar Parceria" (leads). lead_id deixa de
-- ser obrigatorio; toda linha precisa ter pelo menos uma das duas origens.
alter table public.leads_embaixadores
  alter column lead_id drop not null;

alter table public.leads_embaixadores
  add column if not exists cashback_cadastro_id uuid references public.cashback_cadastros(id) on delete restrict,
  add column if not exists commission_policy_id uuid references public.commission_policy(id),
  add column if not exists mes_referencia date,
  add column if not exists grupo_tarifario text check (grupo_tarifario in ('A', 'B'));

alter table public.leads_embaixadores
  drop constraint if exists leads_embaixadores_origem_check;

alter table public.leads_embaixadores
  add constraint leads_embaixadores_origem_check
  check (lead_id is not null or cashback_cadastro_id is not null);

comment on column public.leads_embaixadores.mes_referencia is
  'Mes a que essa parcela de comissao se refere. Usado para comissao recorrente do Grupo A - cada mes gera uma linha propria. Nulo para comissao unica (Grupo B).';
