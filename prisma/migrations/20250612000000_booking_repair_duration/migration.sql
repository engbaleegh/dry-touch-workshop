-- Add optional free-text repair duration (existing rows unchanged)
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "repair_duration" VARCHAR(500);
