"use server";

import { addDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { startOfDay } from "@/lib/utils";
import type { DashboardStats } from "@/types";

export async function getDashboardStats(): Promise<DashboardStats> {
  await requireAuth();

  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);
  const threeDaysLater = addDays(today, 3);

  const [total, todayCount, upcoming, completed, cancelled] =
    await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({
        where: {
          bookingDate: { gte: today, lt: tomorrow },
          status: { not: "CANCELLED" },
        },
      }),
      prisma.booking.count({
        where: {
          bookingDate: { gte: tomorrow, lte: threeDaysLater },
          status: { in: ["PENDING", "CONFIRMED"] },
        },
      }),
      prisma.booking.count({ where: { status: "COMPLETED" } }),
      prisma.booking.count({ where: { status: "CANCELLED" } }),
    ]);

  return {
    total,
    today: todayCount,
    upcoming,
    completed,
    cancelled,
  };
}

export async function getTodaySchedule() {
  await requireAuth();

  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);

  return prisma.booking.findMany({
    where: {
      bookingDate: { gte: today, lt: tomorrow },
      status: { not: "CANCELLED" },
    },
    orderBy: { bookingTime: "asc" },
  });
}

export async function getUpcomingAlerts() {
  await requireAuth();

  const tomorrow = addDays(startOfDay(new Date()), 1);
  const threeDaysLater = addDays(startOfDay(new Date()), 3);

  return prisma.booking.findMany({
    where: {
      bookingDate: { gte: tomorrow, lte: threeDaysLater },
      status: { in: ["PENDING", "CONFIRMED"] },
    },
    orderBy: [{ bookingDate: "asc" }, { bookingTime: "asc" }],
    take: 10,
  });
}
