
ALTER TABLE public.empresas
  ADD COLUMN IF NOT EXISTS indice_reajuste text,
  ADD COLUMN IF NOT EXISTS numero_reclamacoes_ra integer,
  ADD COLUMN IF NOT EXISTS cancel_ouvidoria text;
