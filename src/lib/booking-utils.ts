import { prisma } from "./prisma";
import {
  WORK_START_HOUR,
  WORK_END_HOUR,
  SLOT_INTERVAL_MINUTES,
} from "./constants";
import { parseTimeToMinutes, minutesToTime, startOfDay } from "./utils";
import type { Booking } from "@prisma/client";

export function timeRangesOverlap(
  startA: number,
  durationA: number,
  startB: number,
  durationB: number
): boolean {
  const endA = startA + durationA;
  const endB = startB + durationB;
  return startA < endB && startB < endA;
}

export function generateTimeSlots(): string[] {
  const slots: string[] = [];
  const start = WORK_START_HOUR * 60;
  const end = WORK_END_HOUR * 60;

  for (let m = start; m < end; m += SLOT_INTERVAL_MINUTES) {
    slots.push(minutesToTime(m));
  }
  return slots;
}

export async function generateBookingNumber(date: Date): Promise<string> {
  const day = startOfDay(date);
  const nextDay = new Date(day);
  nextDay.setDate(nextDay.getDate() + 1);

  const count = await prisma.booking.count({
    where: {
      bookingDate: {
        gte: day,
        lt: nextDay,
      },
    },
  });

  const y = day.getFullYear();
  const mo = String(day.getMonth() + 1).padStart(2, "0");
  const d = String(day.getDate()).padStart(2, "0");
  const seq = String(count + 1).padStart(3, "0");

  return `DT-${y}${mo}${d}-${seq}`;
}

export async function checkSlotAvailability(
  bookingDate: Date,
  bookingTime: string,
  estimatedDuration: number,
  excludeBookingId?: string
): Promise<{ available: boolean; conflict?: Booking }> {
  const day = startOfDay(bookingDate);
  const nextDay = new Date(day);
  nextDay.setDate(nextDay.getDate() + 1);

  const startMinutes = parseTimeToMinutes(bookingTime);

  const bookings = await prisma.booking.findMany({
    where: {
      bookingDate: { gte: day, lt: nextDay },
      status: { not: "CANCELLED" },
      ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
    },
  });

  for (const booking of bookings) {
    const otherStart = parseTimeToMinutes(booking.bookingTime);
    if (
      timeRangesOverlap(
        startMinutes,
        estimatedDuration,
        otherStart,
        booking.estimatedDuration
      )
    ) {
      return { available: false, conflict: booking };
    }
  }

  return { available: true };
}

export async function getAvailableSlots(
  bookingDate: Date,
  estimatedDuration: number,
  excludeBookingId?: string
): Promise<string[]> {
  const allSlots = generateTimeSlots();
  const available: string[] = [];

  for (const slot of allSlots) {
    const slotStart = parseTimeToMinutes(slot);
    const slotEnd = slotStart + estimatedDuration;
    if (slotEnd > WORK_END_HOUR * 60) continue;

    const { available: isFree } = await checkSlotAvailability(
      bookingDate,
      slot,
      estimatedDuration,
      excludeBookingId
    );
    if (isFree) available.push(slot);
  }

  return available;
}
