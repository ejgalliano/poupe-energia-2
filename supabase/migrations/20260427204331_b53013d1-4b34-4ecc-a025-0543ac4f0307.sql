ALTER TABLE public.empresas
ADD COLUMN IF NOT EXISTS tipo_fornecedor text NOT NULL DEFAULT 'intermediador'
CHECK (tipo_fornecedor IN ('fornecedor_direto', 'operador', 'intermediador'));