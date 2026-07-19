-- Politicas de desconto dinamico por faixa de valor de fatura, por [Empresa + Distribuidora].
-- Ver docs/produto/2026-07-17-especificacao-faixas-desconto.md para o contexto completo.
-- Numero de faixas e livre (tabela filha), ao inves de colunas fixas faixa1..faixa5.

create table if not exists public.politicas_desconto (
  id uuid primary key default gen_random_uuid(),
  empresa_id uuid not null references public.empresas(id) on delete cascade,
  distribuidora_id uuid not null references public.distribuidoras(id) on delete cascade,
  bonificacao text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (empresa_id, distribuidora_id)
);

create table if not exists public.politicas_desconto_faixas (
  id uuid primary key default gen_random_uuid(),
  politica_id uuid not null references public.politicas_desconto(id) on delete cascade,
  ordem int not null,
  valor_min numeric(12,2) not null,
  valor_max numeric(12,2),
  desconto_percentual numeric(5,2) not null,
  created_at timestamptz not null default now()
);

create index if not exists politicas_desconto_faixas_politica_idx
  on public.politicas_desconto_faixas (politica_id, ordem);

create trigger update_politicas_desconto_updated_at
  before update on public.politicas_desconto
  for each row
  execute function public.update_updated_at_column();

alter table public.politicas_desconto enable row level security;
alter table public.politicas_desconto_faixas enable row level security;

-- Leitura publica: o simulador de economia roda no site para qualquer visitante, sem login.
create policy "Public read politicas_desconto"
  on public.politicas_desconto for select
  using (true);

create policy "Public read politicas_desconto_faixas"
  on public.politicas_desconto_faixas for select
  using (true);

-- Escrita: mesmo padrao de nivel usado em distribuidoras/empresas (gestor ou acima).
create policy "nivel_insert_politicas_desconto"
  on public.politicas_desconto for insert
  to authenticated
  with check (is_nivel_minimo('gestor'::text));

create policy "nivel_update_politicas_desconto"
  on public.politicas_desconto for update
  to authenticated
  using (is_nivel_minimo('gestor'::text))
  with check (is_nivel_minimo('gestor'::text));

create policy "nivel_delete_politicas_desconto"
  on public.politicas_desconto for delete
  to authenticated
  using (is_nivel_minimo('gestor'::text));

create policy "nivel_insert_politicas_desconto_faixas"
  on public.politicas_desconto_faixas for insert
  to authenticated
  with check (is_nivel_minimo('gestor'::text));

create policy "nivel_update_politicas_desconto_faixas"
  on public.politicas_desconto_faixas for update
  to authenticated
  using (is_nivel_minimo('gestor'::text))
  with check (is_nivel_minimo('gestor'::text));

create policy "nivel_delete_politicas_desconto_faixas"
  on public.politicas_desconto_faixas for delete
  to authenticated
  using (is_nivel_minimo('gestor'::text));
