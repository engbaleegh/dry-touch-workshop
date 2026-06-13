"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { bookingSchema, bookingFilterSchema } from "@/lib/validations/booking";
import {
  checkSlotAvailability,
  generateBookingNumber,
  getAvailableSlots,
} from "@/lib/booking-utils";
import { startOfDay } from "@/lib/utils";
import { buildBookingWhere } from "@/lib/booking-query";
import { PAGE_SIZE } from "@/lib/constants";
import type { BookingStatus, Prisma, ServiceCategory } from "@prisma/client";
import type { ActionState } from "./auth";

async function resolveServiceData(serviceId: string, bookingId?: string) {
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) return null;
  if (service.isActive) return service;
  if (bookingId) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { serviceId: true },
    });
    if (booking?.serviceId === serviceId) return service;
  }
  return null;
}

export async function createBookingAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAuth();

  const raw = Object.fromEntries(formData.entries());
  const parsed = bookingSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: "validation" };
  }

  const bookingDate = startOfDay(new Date(parsed.data.bookingDate));

  const slotCheck = await checkSlotAvailability(
    bookingDate,
    parsed.data.bookingTime,
    parsed.data.estimatedDuration
  );

  if (!slotCheck.available) {
    return { error: "slotConflict" };
  }

  const service = await resolveServiceData(parsed.data.serviceId);
  if (!service) return { error: "validation" };

  const bookingNumber = await generateBookingNumber(bookingDate);

  await prisma.booking.create({
    data: {
      bookingNumber,
      customerName: parsed.data.customerName,
      phone: parsed.data.phone,
      plateNumber: parsed.data.plateNumber,
      vehicleMake: parsed.data.vehicleMake,
      vehicleModel: parsed.data.vehicleModel,
      vehicleYear: parsed.data.vehicleYear,
      serviceId: service.id,
      serviceCategory: "OTHER" as ServiceCategory,
      serviceDescription: parsed.data.serviceDescription,
      bookingDate,
      bookingTime: parsed.data.bookingTime,
      estimatedDuration: parsed.data.estimatedDuration,
      status: parsed.data.status as BookingStatus,
      notes: parsed.data.notes || null,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard/calendar");
  redirect("/dashboard/bookings");
}

export async function updateBookingAction(
  id: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAuth();

  const raw = Object.fromEntries(formData.entries());
  const parsed = bookingSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: "validation" };
  }

  const bookingDate = startOfDay(new Date(parsed.data.bookingDate));

  const slotCheck = await checkSlotAvailability(
    bookingDate,
    parsed.data.bookingTime,
    parsed.data.estimatedDuration,
    id
  );

  if (!slotCheck.available) {
    return { error: "slotConflict" };
  }

  const service = await resolveServiceData(parsed.data.serviceId, id);
  if (!service) return { error: "validation" };

  await prisma.booking.update({
    where: { id },
    data: {
      customerName: parsed.data.customerName,
      phone: parsed.data.phone,
      plateNumber: parsed.data.plateNumber,
      vehicleMake: parsed.data.vehicleMake,
      vehicleModel: parsed.data.vehicleModel,
      vehicleYear: parsed.data.vehicleYear,
      serviceId: service.id,
      serviceDescription: parsed.data.serviceDescription,
      bookingDate,
      bookingTime: parsed.data.bookingTime,
      estimatedDuration: parsed.data.estimatedDuration,
      status: parsed.data.status as BookingStatus,
      notes: parsed.data.notes || null,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard/calendar");
  redirect("/dashboard/bookings?updated=1");
}

export async function deleteBookingAction(id: string): Promise<ActionState> {
  await requireAuth();

  await prisma.booking.delete({ where: { id } });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard/calendar");

  return { success: true };
}

export async function getBookings(filters: Record<string, string | undefined>) {
  await requireAuth();

  const parsed = bookingFilterSchema.parse({
    ...filters,
    page: filters.page ?? "1",
  });

  const where = buildBookingWhere(filters);

  const orderBy: Prisma.BookingOrderByWithRelationInput = {
    [parsed.sortBy]: parsed.sortOrder,
  };

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      orderBy,
      skip: (parsed.page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.booking.count({ where }),
  ]);

  return { bookings, total, page: parsed.page, pageSize: PAGE_SIZE };
}

export async function getBookingById(id: string) {
  await requireAuth();
  return prisma.booking.findUnique({ where: { id } });
}

export async function fetchAvailableSlots(
  dateStr: string,
  duration: number,
  excludeId?: string
) {
  await requireAuth();
  const date = startOfDay(new Date(dateStr));
  return getAvailableSlots(date, duration, excludeId);
}

export async function getAllBookingsForExport(
  filters: Record<string, string | undefined>
) {
  await requireAuth();

  const where = buildBookingWhere(filters);

  return prisma.booking.findMany({
    where,
    include: { service: true },
    orderBy: { bookingDate: "desc" },
  });
}
