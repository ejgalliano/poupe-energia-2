-- Ficha de credenciamento (/programa-de-parceiros) precisa coletar CPF do
-- responsavel e, opcionalmente, dados da empresa (razao social + CNPJ) quando
-- o candidato representa uma empresa, nao so uma pessoa fisica.

alter table public.embaixadores_candidatos
  add column if not exists cpf text,
  add column if not exists razao_social text,
  add column if not exists cnpj text;
