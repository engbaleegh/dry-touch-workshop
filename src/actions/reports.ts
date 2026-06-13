"use server";

import { startOfMonth, endOfMonth, addDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { startOfDay } from "@/lib/utils";
import type {
  ReportCategoryStat,
  ReportStatusStat,
  TopServiceStat,
} from "@/types";

export async function getDailyReport(dateStr: string) {
  await requireAuth();

  const day = startOfDay(new Date(dateStr));
  const nextDay = addDays(day, 1);

  const bookings = await prisma.booking.findMany({
    where: { bookingDate: { gte: day, lt: nextDay } },
    orderBy: { bookingTime: "asc" },
  });

  return bookings;
}

export async function getMonthlyReport(year: number, month: number) {
  await requireAuth();

  const monthStart = startOfMonth(new Date(year, month - 1, 1));
  const monthEnd = endOfMonth(monthStart);
  const nextMonth = addDays(monthEnd, 1);

  const bookings = await prisma.booking.findMany({
    where: {
      bookingDate: { gte: monthStart, lt: nextMonth },
    },
    orderBy: { bookingDate: "asc" },
  });

  return bookings;
}

export async function getCategoryStats(
  year?: number,
  month?: number
): Promise<ReportCategoryStat[]> {
  await requireAuth();

  const where: { bookingDate?: { gte: Date; lt: Date } } = {};

  if (year && month) {
    const monthStart = startOfMonth(new Date(year, month - 1, 1));
    const monthEnd = endOfMonth(monthStart);
    where.bookingDate = { gte: monthStart, lt: addDays(monthEnd, 1) };
  }

  const stats = await prisma.booking.groupBy({
    by: ["serviceCategory"],
    where,
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  });

  return stats.map((s) => ({
    category: s.serviceCategory,
    count: s._count.id,
  }));
}

export async function getStatusStats(
  year?: number,
  month?: number
): Promise<ReportStatusStat[]> {
  await requireAuth();

  const where: { bookingDate?: { gte: Date; lt: Date } } = {};

  if (year && month) {
    const monthStart = startOfMonth(new Date(year, month - 1, 1));
    const monthEnd = endOfMonth(monthStart);
    where.bookingDate = { gte: monthStart, lt: addDays(monthEnd, 1) };
  }

  const stats = await prisma.booking.groupBy({
    by: ["status"],
    where,
    _count: { id: true },
  });

  return stats.map((s) => ({
    status: s.status,
    count: s._count.id,
  }));
}

export async function getTopServices(
  limit = 10
): Promise<TopServiceStat[]> {
  await requireAuth();

  const stats = await prisma.booking.groupBy({
    by: ["serviceDescription"],
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: limit,
  });

  return stats.map((s) => ({
    description: s.serviceDescription,
    count: s._count.id,
  }));
}
