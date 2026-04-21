
-- 1. Roles enum + table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 2. Auto-promote first admin by email
CREATE OR REPLACE FUNCTION public.handle_new_user_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email = 'mcc.egalliano@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_admin();

-- 3. Expand empresas table
ALTER TABLE public.empresas
  ADD COLUMN razao_social TEXT,
  ADD COLUMN cnpj TEXT,
  ADD COLUMN fundacao INTEGER,
  ADD COLUMN sede TEXT,
  ADD COLUMN grupo_economico TEXT,
  ADD COLUMN fontes_geracao TEXT[] DEFAULT '{}',
  ADD COLUMN possui_usina_propria BOOLEAN DEFAULT false,
  ADD COLUMN modelo_infraestrutura TEXT,
  ADD COLUMN meses_fidelidade INTEGER DEFAULT 0,
  ADD COLUMN multa_cancelamento NUMERIC DEFAULT 0,
  ADD COLUMN aviso_previo_dias INTEGER DEFAULT 90,
  ADD COLUMN taxa_adesao NUMERIC DEFAULT 0,
  ADD COLUMN desconto_divulgado TEXT,
  ADD COLUMN tipo_desconto TEXT,
  ADD COLUMN incide_sobre TEXT,
  ADD COLUMN economia_minima_garantida BOOLEAN DEFAULT false,
  ADD COLUMN consumo_minimo NUMERIC,
  ADD COLUMN prazo_ativacao TEXT,
  ADD COLUMN modelo_billing TEXT,
  ADD COLUMN canais_atendimento TEXT[] DEFAULT '{}',
  ADD COLUMN reputacao_reclame_aqui NUMERIC,
  ADD COLUMN avaliacao_google NUMERIC,
  ADD COLUMN processos_judiciais BOOLEAN DEFAULT false,
  ADD COLUMN vantagens TEXT,
  ADD COLUMN pontos_atencao TEXT,
  ADD COLUMN parecer_tecnico TEXT,
  ADD COLUMN arquetipo TEXT,
  ADD COLUMN estados_atuacao TEXT,
  ADD COLUMN cancel_email TEXT,
  ADD COLUMN cancel_telefone TEXT,
  ADD COLUMN cancel_site TEXT,
  ADD COLUMN cancel_processo TEXT,
  ADD COLUMN cancel_aviso_previo INTEGER,
  ADD COLUMN cancel_dicas TEXT,
  ADD COLUMN cancel_recorrer TEXT;

ALTER TABLE public.notas_empresas
  ADD COLUMN nivel_risco TEXT;

-- 4. Admin write policies
CREATE POLICY "Admins manage empresas"
  ON public.empresas FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins read all empresas"
  ON public.empresas FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage distribuidoras"
  ON public.distribuidoras FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage estados"
  ON public.estados FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage notas"
  ON public.notas_empresas FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage scorecard"
  ON public.scorecard_sj FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage banners"
  ON public.banners FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins read all banners"
  ON public.banners FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
