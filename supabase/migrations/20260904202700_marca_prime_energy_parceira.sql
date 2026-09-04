-- Sócio confirmou que a Prime Energy também é Fornecedora Parceira e estava faltando na
-- lista (04/09/2026). Mesma continuação da correção do campo parceira/exibe_cashback.

update public.empresas
set parceira = true
where id = '930fe61c-3aee-410b-a168-441deef85141'; -- Prime Energy
