-- ============================================================
-- Migração: Tabela de candidatos a Embaixador
-- Executar no Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS embaixadores_candidatos (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at  timestamptz DEFAULT now(),
  nome        text NOT NULL,
  email       text NOT NULL,
  telefone    text NOT NULL,
  cidade      text NOT NULL,
  uf          text NOT NULL,
  is_mei      boolean DEFAULT false,
  tem_equipe  boolean DEFAULT false,
  status      text DEFAULT 'pendente',   -- pendente | aprovado | rejeitado
  observacoes text,
  aprovado_em timestamptz,
  embaixador_id uuid REFERENCES embaixadores(id) ON DELETE SET NULL
);

ALTER TABLE embaixadores_candidatos ENABLE ROW LEVEL SECURITY;

-- Anônimo pode inserir (formulário público)
CREATE POLICY "anon_insert_candidatos"
  ON embaixadores_candidatos FOR INSERT
  TO anon WITH CHECK (true);

-- Admin (authenticated) pode ler e atualizar
CREATE POLICY "admin_read_candidatos"
  ON embaixadores_candidatos FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "admin_update_candidatos"
  ON embaixadores_candidatos FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "admin_delete_candidatos"
  ON embaixadores_candidatos FOR DELETE
  TO authenticated USING (true);
