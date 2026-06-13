-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ServiceCategory" AS ENUM ('MECHANICAL', 'ELECTRICAL', 'PAINT', 'BODY_REPAIR', 'DRY_ICE_CLEANING', 'OIL_CHANGE', 'INSPECTION', 'OTHER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "booking_number" VARCHAR(20) NOT NULL,
    "customer_name" VARCHAR(120) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "plate_number" VARCHAR(30) NOT NULL,
    "vehicle_make" VARCHAR(60) NOT NULL,
    "vehicle_model" VARCHAR(60) NOT NULL,
    "vehicle_year" INTEGER NOT NULL,
    "service_category" "ServiceCategory" NOT NULL,
    "service_description" VARCHAR(500) NOT NULL,
    "booking_date" DATE NOT NULL,
    "booking_time" VARCHAR(5) NOT NULL,
    "estimated_duration" INTEGER NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "notes" VARCHAR(1000),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_booking_number_key" ON "bookings"("booking_number");

-- CreateIndex
CREATE INDEX "bookings_booking_date_idx" ON "bookings"("booking_date");

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

-- CreateIndex
CREATE INDEX "bookings_customer_name_idx" ON "bookings"("customer_name");

-- CreateIndex
CREATE INDEX "bookings_plate_number_idx" ON "bookings"("plate_number");

-- CreateIndex
CREATE INDEX "bookings_service_category_idx" ON "bookings"("service_category");

-- CreateIndex
CREATE INDEX "bookings_booking_date_booking_time_idx" ON "bookings"("booking_date", "booking_time");
