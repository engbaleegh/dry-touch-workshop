-- Role-based access control and session invalidation (backward compatible)

DO $$ BEGIN
  CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'STAFF');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" "UserRole" NOT NULL DEFAULT 'STAFF';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "token_version" INTEGER NOT NULL DEFAULT 1;

UPDATE "users" SET "role" = 'ADMIN' WHERE "username" = 'admin';

-- Invalidate all existing JWT sessions (force re-login)
UPDATE "users" SET "token_version" = "token_version" + 1;
