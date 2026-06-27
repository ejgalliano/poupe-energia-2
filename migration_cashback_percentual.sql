-- Adiciona coluna cashback_percentual na tabela cashback_cadastros
ALTER TABLE cashback_cadastros
  ADD COLUMN IF NOT EXISTS cashback_percentual numeric;
