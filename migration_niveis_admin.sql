-- ============================================================
-- PASSO 1: Adiciona colunas (seguro rodar mesmo se já rodou)
-- ============================================================
ALTER TABLE user_roles
  ADD COLUMN IF NOT EXISTS nivel TEXT DEFAULT 'operacional';

ALTER TABLE admin_requests
  ADD COLUMN IF NOT EXISTS cargo TEXT,
  ADD COLUMN IF NOT EXISTS nivel TEXT DEFAULT 'operacional';

-- Admins já existentes viram super_admin
UPDATE user_roles SET nivel = 'super_admin' WHERE role = 'admin';

-- ============================================================
-- PASSO 2: Unique constraint em user_roles para upsert funcionar
-- ============================================================
ALTER TABLE user_roles
  DROP CONSTRAINT IF EXISTS user_roles_user_id_role_key;

ALTER TABLE user_roles
  ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);

-- ============================================================
-- PASSO 3: GRANT de permissões a nível de tabela
-- (corrige "permission denied for table ...")
-- ============================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE user_roles    TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE admin_requests TO authenticated;

-- ============================================================
-- PASSO 4: RLS — user_roles
-- ============================================================
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_roles_all_authenticated" ON user_roles;
DROP POLICY IF EXISTS "user_roles_admin"             ON user_roles;
DROP POLICY IF EXISTS "user_roles_select_own"        ON user_roles;

CREATE POLICY "user_roles_all_authenticated" ON user_roles
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- PASSO 5: RLS — admin_requests
-- ============================================================
ALTER TABLE admin_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_requests_all_authenticated" ON admin_requests;
DROP POLICY IF EXISTS "admin_requests_admin"             ON admin_requests;

CREATE POLICY "admin_requests_all_authenticated" ON admin_requests
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);
