-- Modulo de Comissoes - geracao da comissao recorrente do Grupo A.
-- Ver docs/comissoes/2026-08-01-modulo-de-comissoes-discussao.md para o contexto completo.
--
-- O socio esclareceu (10/08/2026) que o lancamento mensal por fornecedora
-- (fornecedora_comissao_mensal) e um valor total, mas a fornecedora tambem manda um
-- relatorio com o detalhamento por cliente/UC - e esse valor por cliente ja vem liquido
-- (sem tributos/CIP/uso de rede), ou seja, ja e o FCP daquele cliente diretamente. A
-- equipe lanca esse detalhamento aqui, vinculando pelo numero da UC (ja salvo em
-- cashback_cadastros), e o sistema calcula a comissao do parceiro automaticamente usando
-- o vinculo criado na Fase 3.

create table if not exists public.fornecedora_comissao_mensal_itens (
  id uuid primary key default gen_random_uuid(),
  fornecedora_comissao_mensal_id uuid not null references public.fornecedora_comissao_mensal(id) on delete cascade,
  cashback_cadastro_id uuid not null references public.cashback_cadastros(id) on delete restrict,
  numero_uc text,
  comissao_gerada numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

comment on column public.fornecedora_comissao_mensal_itens.comissao_gerada is
  'Valor que a fornecedora reportou pra esse cliente especifico naquele mes - ja liquido
   (sem tributos/CIP/uso de rede descontado, confirmado pelo socio em 10/08/2026), ou seja,
   ja e o FCP direto, sem calculo adicional.';

alter table public.fornecedora_comissao_mensal_itens enable row level security;

create policy "nivel_select_fornecedora_comissao_mensal_itens"
  on public.fornecedora_comissao_mensal_itens for select
  to authenticated
  using (is_nivel_minimo('gestor'::text));

create policy "nivel_insert_fornecedora_comissao_mensal_itens"
  on public.fornecedora_comissao_mensal_itens for insert
  to authenticated
  with check (is_nivel_minimo('gestor'::text));

create policy "nivel_delete_fornecedora_comissao_mensal_itens"
  on public.fornecedora_comissao_mensal_itens for delete
  to authenticated
  using (is_nivel_minimo('gestor'::text));

grant select, insert, delete on public.fornecedora_comissao_mensal_itens to authenticated;

-- Uma adesao pode gerar varias linhas de comissao ao longo do tempo no Grupo A (uma por
-- mes recorrente), mas nao duas linhas pro MESMO mes. NULLs (a linha "base" criada na
-- adesao, sem mes ainda) continuam livres - e o comportamento padrao do Postgres em
-- indices unicos, que nao considera NULL igual a NULL.
create unique index if not exists leads_embaixadores_cadastro_mes_unique
  on public.leads_embaixadores (cashback_cadastro_id, mes_referencia)
  where (cashback_cadastro_id is not null);
