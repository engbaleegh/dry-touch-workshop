"use server";

import { startOfMonth, endOfMonth, format, addDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { startOfDay } from "@/lib/utils";
import type { CalendarDayCount } from "@/types";

export async function getMonthlyBookingCounts(
  year: number,
  month: number
): Promise<CalendarDayCount[]> {
  await requireAuth();

  const monthStart = startOfMonth(new Date(year, month - 1, 1));
  const monthEnd = endOfMonth(monthStart);
  const nextMonth = addDays(monthEnd, 1);

  const bookings = await prisma.booking.groupBy({
    by: ["bookingDate"],
    where: {
      bookingDate: { gte: monthStart, lt: nextMonth },
      status: { not: "CANCELLED" },
    },
    _count: { id: true },
  });

  return bookings.map((b) => ({
    date: format(b.bookingDate, "yyyy-MM-dd"),
    count: b._count.id,
  }));
}

export async function getBookingsForDate(dateStr: string) {
  await requireAuth();

  const day = startOfDay(new Date(dateStr));
  const nextDay = addDays(day, 1);

  return prisma.booking.findMany({
    where: {
      bookingDate: { gte: day, lt: nextDay },
    },
    orderBy: { bookingTime: "asc" },
  });
}
