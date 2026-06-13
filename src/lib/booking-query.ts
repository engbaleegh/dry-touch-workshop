import type { BookingStatus, Prisma, ServiceCategory } from "@prisma/client";
import { bookingFilterSchema } from "@/lib/validations/booking";
import { applyBookingPreset } from "@/lib/booking-filters";
import { startOfDay, endOfDay } from "@/lib/utils";

export function buildBookingWhere(
  filters: Record<string, string | undefined>
): Prisma.BookingWhereInput {
  const parsed = bookingFilterSchema.parse({
    ...filters,
    page: filters.page ?? "1",
  });

  const where: Prisma.BookingWhereInput = {};

  if (parsed.search) {
    where.OR = [
      { customerName: { contains: parsed.search, mode: "insensitive" } },
      { plateNumber: { contains: parsed.search, mode: "insensitive" } },
      { bookingNumber: { contains: parsed.search, mode: "insensitive" } },
      { phone: { contains: parsed.search, mode: "insensitive" } },
    ];
  }

  if (parsed.serviceCategory)
    where.serviceCategory = parsed.serviceCategory as ServiceCategory;
  if (parsed.customerName)
    where.customerName = {
      contains: parsed.customerName,
      mode: "insensitive",
    };
  if (parsed.plateNumber)
    where.plateNumber = { contains: parsed.plateNumber, mode: "insensitive" };

  if (parsed.preset) {
    Object.assign(where, applyBookingPreset(parsed.preset, where));
  } else {
    if (parsed.status) where.status = parsed.status as BookingStatus;
    if (parsed.dateFrom || parsed.dateTo) {
      where.bookingDate = {};
      if (parsed.dateFrom)
        where.bookingDate.gte = startOfDay(new Date(parsed.dateFrom));
      if (parsed.dateTo)
        where.bookingDate.lte = endOfDay(new Date(parsed.dateTo));
    }
  }

  return where;
}
