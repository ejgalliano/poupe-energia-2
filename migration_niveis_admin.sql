-- Adiciona nivel e cargo ao sistema de usuários admin
ALTER TABLE user_roles
  ADD COLUMN IF NOT EXISTS nivel TEXT DEFAULT 'operacional';

ALTER TABLE admin_requests
  ADD COLUMN IF NOT EXISTS cargo TEXT,
  ADD COLUMN IF NOT EXISTS nivel TEXT DEFAULT 'operacional';

-- Admins já existentes viram super_admin
UPDATE user_roles SET nivel = 'super_admin' WHERE role = 'admin';
