-- Separa "Fornecedora Parceira" (parceria comercial - drive a lista em /admin/parceiros e
-- o botao "Contratar pela Poupe" no site publico) de "exibe cashback" (badge de cashback
-- pro consumidor). Antes eram o MESMO campo (empresas.parceira), com um checkbox so
-- chamado "Parceira (exibe cashback)" - alguem editou a SolarGrid e a Fit Energia em
-- /admin/empresas so pra tirar o cashback publico delas, e sem querer tirou elas da lista
-- comercial de parceiras tambem. Reportado pelo usuario em 04/09/2026.

alter table public.empresas
  add column if not exists exibe_cashback boolean not null default false;

comment on column public.empresas.exibe_cashback is
  'Controla so o badge de cashback no site publico (Ranking/RankingNacional/ficha da
   empresa). Independente de "parceira" (parceria comercial - lista em /admin/parceiros e
   botao "Contratar pela Poupe").';

-- Restaura SolarGrid e Fit Energia como parceiras - foram desmarcadas sem querer usando o
-- checkbox antigo que controlava as duas coisas ao mesmo tempo.
update public.empresas
set parceira = true
where id in ('0774aab6-aa1a-471e-85c9-e6b9062b72d6', 'ba155430-be6b-4011-b1ea-d172bd2b685a');

-- Backfill: ate agora toda empresa parceira=true tambem mostrava cashback (mesmo campo) -
-- preserva esse comportamento visivel pro consumidor. Dai pra frente e escolha independente
-- em /admin/empresas.
update public.empresas set exibe_cashback = true where parceira = true;
