ALTER TABLE public.empresas
ADD COLUMN IF NOT EXISTS atende_residencial boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS atende_empresarial boolean NOT NULL DEFAULT true;