-- Modulo de Comissoes - Fase 3 (corrige o bug de vinculo).
-- Ver docs/comissoes/2026-08-01-modulo-de-comissoes-discussao.md para o contexto completo.
--
-- embaixadores.comissao_percentual vira override OPCIONAL por parceiro do
-- representative_percent padrao da politica ativa (commission_policy). Antes era NOT NULL
-- com default 0, e o admin preenchia com um valor fixo de 5% (provisorio) toda vez que
-- aprovava um candidato - isso teria sobrescrito silenciosamente a politica de verdade
-- (48%/50%) definida na Fase 1 pra TODO parceiro novo. Zera os valores existentes porque
-- esse 5% sempre foi provisorio (nunca representou uma decisao real de override por
-- parceiro) - a partir de agora, vazio = usa o padrao da politica; so preenche quem
-- realmente precisar de um percentual diferente.

alter table public.embaixadores
  alter column comissao_percentual drop not null,
  alter column comissao_percentual drop default;

update public.embaixadores set comissao_percentual = null;
