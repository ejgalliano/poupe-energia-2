-- Rate limiting server-side para os formularios publicos.
-- O hook useRateLimit (localStorage) so evita duplo-clique acidental; qualquer
-- pessoa consegue contornar limpando o localStorage ou chamando a API direto.
-- Esta migration move a barreira real para o banco, via trigger BEFORE INSERT.

create table if not exists public.rate_limit_log (
  id bigint generated always as identity primary key,
  bucket text not null,
  identifier text not null,
  created_at timestamptz not null default now()
);

create index if not exists rate_limit_log_lookup_idx
  on public.rate_limit_log (bucket, identifier, created_at desc);

-- RLS habilitado sem nenhuma policy: bloqueia qualquer acesso direto via anon/authenticated.
-- A funcao abaixo roda como SECURITY DEFINER e consegue ler/escrever mesmo assim.
alter table public.rate_limit_log enable row level security;

create or replace function public.enforce_submission_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_bucket text := TG_ARGV[0];
  v_cooldown_seconds int := TG_ARGV[1]::int;
  v_email_col text := TG_ARGV[2];
  v_phone_col text := TG_ARGV[3];
  v_row jsonb := to_jsonb(NEW);
  v_email text := lower(coalesce(v_row ->> v_email_col, ''));
  v_phone text := regexp_replace(coalesce(v_row ->> v_phone_col, ''), '\D', '', 'g');
  v_identifier text := v_email || '|' || v_phone;
  v_last timestamptz;
begin
  if v_identifier = '|' then
    -- sem email nem telefone no payload: nao ha o que identificar, deixa passar
    return NEW;
  end if;

  select created_at into v_last
  from public.rate_limit_log
  where bucket = v_bucket and identifier = v_identifier
  order by created_at desc
  limit 1;

  if v_last is not null and v_last > now() - make_interval(secs => v_cooldown_seconds) then
    raise exception 'RATE_LIMIT: Aguarde um pouco antes de enviar novamente.' using errcode = 'P0001';
  end if;

  insert into public.rate_limit_log (bucket, identifier) values (v_bucket, v_identifier);

  return NEW;
end;
$$;

drop trigger if exists rate_limit_before_insert on public.cashback_cadastros;
create trigger rate_limit_before_insert
  before insert on public.cashback_cadastros
  for each row execute function public.enforce_submission_rate_limit('cashback_cadastros', '1800', 'email', 'telefone');

drop trigger if exists rate_limit_before_insert on public.leads_empresariais;
create trigger rate_limit_before_insert
  before insert on public.leads_empresariais
  for each row execute function public.enforce_submission_rate_limit('leads_empresariais', '600', 'email', 'telefone');

drop trigger if exists rate_limit_before_insert on public.solicitacoes_parceria;
create trigger rate_limit_before_insert
  before insert on public.solicitacoes_parceria
  for each row execute function public.enforce_submission_rate_limit('solicitacoes_parceria', '600', 'email', 'telefone');

drop trigger if exists rate_limit_before_insert on public.contestacoes;
create trigger rate_limit_before_insert
  before insert on public.contestacoes
  for each row execute function public.enforce_submission_rate_limit('contestacoes', '300', 'email_corporativo', 'telefone');

drop trigger if exists rate_limit_before_insert on public.embaixadores_candidatos;
create trigger rate_limit_before_insert
  before insert on public.embaixadores_candidatos
  for each row execute function public.enforce_submission_rate_limit('embaixadores_candidatos', '3600', 'email', 'telefone');
