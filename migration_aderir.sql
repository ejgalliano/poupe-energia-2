-- Adiciona campos de dados da fatura em cashback_cadastros
ALTER TABLE cashback_cadastros
  ADD COLUMN IF NOT EXISTS consumo_kwh     NUMERIC,
  ADD COLUMN IF NOT EXISTS valor_conta     NUMERIC,
  ADD COLUMN IF NOT EXISTS classe_consumo  TEXT,
  ADD COLUMN IF NOT EXISTS nome_titular    TEXT,
  ADD COLUMN IF NOT EXISTS endereco_instalacao TEXT;
