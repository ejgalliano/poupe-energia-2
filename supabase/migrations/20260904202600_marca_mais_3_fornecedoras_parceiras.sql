-- Sócio confirmou que (Re) Energisa, Matrix Energia e Enliv tambem sao Fornecedoras
-- Parceiras e estavam faltando na lista (04/09/2026). Nao mexe em exibe_cashback - fica
-- desmarcado por padrao, escolha separada a ser feita em /admin/empresas se quiserem.

update public.empresas
set parceira = true
where id in (
  '449069c0-8595-4a5d-a401-4b8c20acebc5', -- (Re) Energisa
  'd9bd8d10-3010-45a7-b5e3-04b8f17a16ef', -- Matrix Energia (nao confundir com "Matrix Conecta")
  '794f6971-719b-4556-a34e-365fa35e8cce'  -- Enliv
);
