-- AlterTable: users - add is_active (backward compatible default)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable: services
CREATE TABLE IF NOT EXISTS "services" (
    "id" TEXT NOT NULL,
    "name_ar" VARCHAR(120) NOT NULL,
    "name_en" VARCHAR(120) NOT NULL,
    "description" VARCHAR(500),
    "estimated_duration" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- AlterTable: bookings - add service_id (nullable for existing rows)
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "service_id" TEXT;

-- AddForeignKey (only if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'bookings_service_id_fkey'
    ) THEN
        ALTER TABLE "bookings" ADD CONSTRAINT "bookings_service_id_fkey"
            FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "bookings_service_id_idx" ON "bookings"("service_id");
