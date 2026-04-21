ALTER TABLE public.parceiros_config 
ADD COLUMN IF NOT EXISTS contato_nome text,
ADD COLUMN IF NOT EXISTS contato_email text;