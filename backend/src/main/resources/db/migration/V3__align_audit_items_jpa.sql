-- Align audit_items with JPA entity (created_by / updated_by instead of user_id).

ALTER TABLE audit_items ADD COLUMN IF NOT EXISTS created_by VARCHAR(64);
ALTER TABLE audit_items ADD COLUMN IF NOT EXISTS updated_by VARCHAR(64);

UPDATE audit_items ai
SET created_by = u.username
FROM users u
WHERE ai.created_by IS NULL
  AND EXISTS (
    SELECT 1
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.table_name = 'audit_items'
      AND c.column_name = 'user_id'
  )
  AND u.id = ai.user_id;

UPDATE audit_items SET created_by = 'admin' WHERE created_by IS NULL OR trim(created_by) = '';

ALTER TABLE audit_items ALTER COLUMN created_by SET NOT NULL;
ALTER TABLE audit_items ALTER COLUMN created_by SET DEFAULT 'system';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'audit_items' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE audit_items DROP CONSTRAINT IF EXISTS audit_items_user_id_fkey;
    ALTER TABLE audit_items DROP COLUMN user_id;
  END IF;
END $$;
