
CREATE TABLE public.estados (
  id SERIAL PRIMARY KEY,
  sigla TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL
);

CREATE TABLE public.distribuidoras (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  estado_id INT NOT NULL REFERENCES public.estados(id) ON DELETE CASCADE
);
CREATE INDEX idx_distribuidoras_estado ON public.distribuidoras(estado_id);

CREATE TABLE public.empresas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  logo_url TEXT,
  site_url TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('GD','ML')),
  ativa BOOLEAN NOT NULL DEFAULT true,
  parceira BOOLEAN NOT NULL DEFAULT false,
  cashback_percentual NUMERIC NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.notas_empresas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  distribuidora_id UUID NOT NULL REFERENCES public.distribuidoras(id) ON DELETE CASCADE,
  desconto_percentual NUMERIC NOT NULL,
  seguranca_juridica NUMERIC NOT NULL,
  reputacao_reclame_aqui NUMERIC NOT NULL,
  valor_minimo_fatura NUMERIC NOT NULL,
  nota_final NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notas_distribuidora ON public.notas_empresas(distribuidora_id);
CREATE INDEX idx_notas_empresa ON public.notas_empresas(empresa_id);

CREATE TABLE public.scorecard_sj (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nota_empresa_id UUID NOT NULL REFERENCES public.notas_empresas(id) ON DELETE CASCADE,
  conformidade_lei_14300 BOOLEAN NOT NULL DEFAULT false,
  creditos_scee_rescisao BOOLEAN NOT NULL DEFAULT false,
  equilibrio_contratual_cdc BOOLEAN NOT NULL DEFAULT false,
  boa_fe_objetiva BOOLEAN NOT NULL DEFAULT false,
  limites_multa BOOLEAN NOT NULL DEFAULT false,
  aviso_previo_90_dias BOOLEAN NOT NULL DEFAULT false,
  protecao_dados_lgpd BOOLEAN NOT NULL DEFAULT false,
  transparencia_tarifaria BOOLEAN NOT NULL DEFAULT false,
  responsabilidade_injecao BOOLEAN NOT NULL DEFAULT false,
  foro_consumidor BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE public.banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE SET NULL,
  imagem_url TEXT NOT NULL,
  link_url TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  ordem INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.estados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distribuidoras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notas_empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scorecard_sj ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read estados" ON public.estados FOR SELECT USING (true);
CREATE POLICY "Public read distribuidoras" ON public.distribuidoras FOR SELECT USING (true);
CREATE POLICY "Public read empresas" ON public.empresas FOR SELECT USING (ativa = true);
CREATE POLICY "Public read notas" ON public.notas_empresas FOR SELECT USING (true);
CREATE POLICY "Public read scorecard" ON public.scorecard_sj FOR SELECT USING (true);
CREATE POLICY "Public read banners" ON public.banners FOR SELECT USING (ativo = true);

INSERT INTO public.estados (sigla, nome) VALUES
('AC','Acre'),('AL','Alagoas'),('AP','Amapá'),('AM','Amazonas'),('BA','Bahia'),
('CE','Ceará'),('DF','Distrito Federal'),('ES','Espírito Santo'),('GO','Goiás'),
('MA','Maranhão'),('MT','Mato Grosso'),('MS','Mato Grosso do Sul'),('MG','Minas Gerais'),
('PA','Pará'),('PB','Paraíba'),('PR','Paraná'),('PE','Pernambuco'),('PI','Piauí'),
('RJ','Rio de Janeiro'),('RN','Rio Grande do Norte'),('RS','Rio Grande do Sul'),
('RO','Rondônia'),('RR','Roraima'),('SC','Santa Catarina'),('SP','São Paulo'),
('SE','Sergipe'),('TO','Tocantins');

INSERT INTO public.distribuidoras (nome, estado_id)
SELECT d.nome, e.id FROM public.estados e JOIN (VALUES
('AC','Energisa Acre'),
('AL','Equatorial – CEAL'),
('AP','Equatorial Amapá'),
('AM','Amazonas Energia'),
('BA','Neoenergia – Coelba'),
('CE','Enel – Coelce'),
('DF','Neoenergia – CEB'),
('ES','EDP – Escelsa'),
('GO','Equatorial – CELG'),
('MA','Equatorial – CEMAR'),
('MT','Energisa MT'),('MT','Elektro MT'),
('MS','Energisa MS'),
('MG','CEMIG'),('MG','Energisa Minas/Rio'),('MG','Energisa Sul/Sudeste'),
('PA','Equatorial – CELPA'),
('PB','Energisa PB'),
('PR','COPEL'),('PR','Energisa Sul/Sudeste'),
('PE','Neoenergia – CELPE'),
('PI','Equatorial – CEPISA'),
('RJ','Enel Ampla'),('RJ','Energisa Minas/Rio'),('RJ','Light'),
('RN','Neoenergia – COSERN'),
('RS','RGE-RS'),('RS','CEEE-RS'),
('RO','Energisa RO'),
('RR','Roraima Energia'),
('SC','CELESC'),
('SP','CPFL Paulista'),('SP','CPFL Piratininga'),('SP','CPFL Santa Cruz'),
('SP','EDP SP'),('SP','Elektro SP'),('SP','Enel SP'),('SP','Energisa Sul/Sudeste'),
('SE','Energisa Sulgipe'),
('TO','Energisa TO')
) AS d(sigla,nome) ON e.sigla = d.sigla;

INSERT INTO public.empresas (nome, tipo, parceira, cashback_percentual) VALUES
('Pret Energy','GD',true,10),
('Ambar Energia','GD',false,10),
('Balt Energia','GD',true,10),
('Red Energia','GD',false,10);

WITH copel AS (
  SELECT d.id FROM public.distribuidoras d
  JOIN public.estados e ON e.id = d.estado_id
  WHERE e.sigla = 'PR' AND d.nome = 'COPEL' LIMIT 1
)
INSERT INTO public.notas_empresas
  (empresa_id, distribuidora_id, desconto_percentual, seguranca_juridica, reputacao_reclame_aqui, valor_minimo_fatura, nota_final)
SELECT emp.id, (SELECT id FROM copel), v.desconto, v.sj, v.ra, v.vm,
  ROUND(((v.desconto/15.0*10)*0.4 + v.sj*0.3 + v.ra*0.2 + GREATEST(0,LEAST(10,(1000-v.vm)/900.0*10))*0.1)::numeric, 2)
FROM (VALUES
  ('Pret Energy', 15.0, 9.0, 8.9, 100.0),
  ('Ambar Energia', 12.0, 8.0, 8.1, 250.0),
  ('Balt Energia', 10.0, 7.0, 7.9, 300.0),
  ('Red Energia', 12.0, 7.0, 7.6, 300.0)
) AS v(nome, desconto, sj, ra, vm)
JOIN public.empresas emp ON emp.nome = v.nome;
