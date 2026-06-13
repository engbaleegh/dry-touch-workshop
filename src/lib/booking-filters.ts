import { addDays } from "date-fns";
import type { BookingStatus, Prisma } from "@prisma/client";
import { startOfDay } from "./utils";

export function applyBookingPreset(
  preset: string | undefined,
  where: Prisma.BookingWhereInput
): Prisma.BookingWhereInput {
  if (!preset) return where;

  const today = startOfDay(new Date());

  switch (preset) {
    case "today": {
      const tomorrow = addDays(today, 1);
      return {
        ...where,
        bookingDate: { gte: today, lt: tomorrow },
        status: { not: "CANCELLED" },
      };
    }
    case "upcoming": {
      const tomorrow = addDays(today, 1);
      const threeDaysLater = addDays(today, 3);
      return {
        ...where,
        bookingDate: { gte: tomorrow, lte: threeDaysLater },
        status: { in: ["PENDING", "CONFIRMED"] as BookingStatus[] },
      };
    }
    case "completed":
      return { ...where, status: "COMPLETED" };
    case "cancelled":
      return { ...where, status: "CANCELLED" };
    default:
      return where;
  }
}
