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
import type { ZodError } from "zod";

export type BookingActionState = ActionState & {
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
};

function formDataToValues(
  raw: Record<string, FormDataEntryValue>
): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string") values[key] = value;
  }
  return values;
}

function zodToFieldErrors(error: ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && !fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    }
  }
  return fieldErrors;
}

function parseBookingDate(
  dateStr: string
): { date: Date } | { error: string } {
  if (!dateStr.trim()) {
    return { date: startOfDay(new Date()) };
  }
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) {
    return { error: "bookingDateInvalid" };
  }
  return { date: startOfDay(parsed) };
}

function parseBookingTime(
  timeStr: string
): { time: string; userProvided: boolean; error?: string } {
  if (!timeStr.trim()) {
    return { time: "09:00", userProvided: false };
  }
  if (!/^\d{2}:\d{2}$/.test(timeStr)) {
    return { time: timeStr, userProvided: true, error: "bookingTimeInvalid" };
  }
  return { time: timeStr, userProvided: true };
}

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

async function persistBooking(
  data: {
    customerName: string;
    phone: string;
    plateNumber: string;
    vehicleMake: string;
    vehicleModel: string;
    vehicleYear: number;
    serviceId: string | null;
    serviceDescription: string;
    bookingDate: Date;
    bookingTime: string;
    estimatedDuration: number;
    repairDuration: string | null;
    status: BookingStatus;
    notes: string | null;
  },
  bookingId?: string
): Promise<BookingActionState | void> {
  try {
    if (bookingId) {
      await prisma.booking.update({
        where: { id: bookingId },
        data,
      });
    } else {
      const bookingNumber = await generateBookingNumber(data.bookingDate);
      await prisma.booking.create({
        data: {
          bookingNumber,
          serviceCategory: "OTHER" as ServiceCategory,
          ...data,
        },
      });
    }
  } catch (err) {
    console.error("Booking save failed:", err);
    return { error: "saveFailed" };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/bookings");
  revalidatePath("/dashboard/calendar");
}

export async function createBookingAction(
  _prev: BookingActionState,
  formData: FormData
): Promise<BookingActionState> {
  await requireAuth();

  const raw = Object.fromEntries(formData.entries());
  const values = formDataToValues(raw);
  const parsed = bookingSchema.safeParse(raw);

  if (!parsed.success) {
    return { fieldErrors: zodToFieldErrors(parsed.error), values };
  }

  const dateResult = parseBookingDate(parsed.data.bookingDate);
  if ("error" in dateResult) {
    return {
      fieldErrors: { bookingDate: dateResult.error },
      values,
    };
  }

  const timeResult = parseBookingTime(parsed.data.bookingTime);
  if (timeResult.error) {
    return {
      fieldErrors: { bookingTime: timeResult.error },
      values,
    };
  }

  let serviceId: string | null = null;
  let estimatedDuration = parsed.data.estimatedDuration;

  if (parsed.data.serviceId) {
    const service = await resolveServiceData(parsed.data.serviceId);
    if (!service) {
      return {
        fieldErrors: { serviceId: "serviceInvalid" },
        values,
      };
    }
    serviceId = service.id;
    estimatedDuration = service.estimatedDuration;
  }

  const userProvidedSlot =
    parsed.data.bookingDate.trim() !== "" &&
    parsed.data.bookingTime.trim() !== "";

  if (userProvidedSlot) {
    const slotCheck = await checkSlotAvailability(
      dateResult.date,
      timeResult.time,
      estimatedDuration
    );
    if (!slotCheck.available) {
      return { error: "slotConflict", values };
    }
  }

  const saveResult = await persistBooking(
    {
      customerName: parsed.data.customerName,
      phone: parsed.data.phone,
      plateNumber: parsed.data.plateNumber,
      vehicleMake: parsed.data.vehicleMake,
      vehicleModel: parsed.data.vehicleModel,
      vehicleYear: parsed.data.vehicleYear,
      serviceId,
      serviceDescription: parsed.data.serviceDescription,
      bookingDate: dateResult.date,
      bookingTime: timeResult.time,
      estimatedDuration,
      repairDuration: parsed.data.repairDuration.trim() || null,
      status: parsed.data.status as BookingStatus,
      notes: parsed.data.notes ?? null,
    }
  );

  if (saveResult) {
    return { ...saveResult, values };
  }

  redirect("/dashboard/bookings");
}

export async function updateBookingAction(
  id: string,
  _prev: BookingActionState,
  formData: FormData
): Promise<BookingActionState> {
  await requireAuth();

  const raw = Object.fromEntries(formData.entries());
  const values = formDataToValues(raw);
  const parsed = bookingSchema.safeParse(raw);

  if (!parsed.success) {
    return { fieldErrors: zodToFieldErrors(parsed.error), values };
  }

  const dateResult = parseBookingDate(parsed.data.bookingDate);
  if ("error" in dateResult) {
    return {
      fieldErrors: { bookingDate: dateResult.error },
      values,
    };
  }

  const timeResult = parseBookingTime(parsed.data.bookingTime);
  if (timeResult.error) {
    return {
      fieldErrors: { bookingTime: timeResult.error },
      values,
    };
  }

  let serviceId: string | null = null;
  let estimatedDuration = parsed.data.estimatedDuration;

  if (parsed.data.serviceId) {
    const service = await resolveServiceData(parsed.data.serviceId, id);
    if (!service) {
      return {
        fieldErrors: { serviceId: "serviceInvalid" },
        values,
      };
    }
    serviceId = service.id;
    estimatedDuration = service.estimatedDuration;
  }

  const userProvidedSlot =
    parsed.data.bookingDate.trim() !== "" &&
    parsed.data.bookingTime.trim() !== "";

  if (userProvidedSlot) {
    const slotCheck = await checkSlotAvailability(
      dateResult.date,
      timeResult.time,
      estimatedDuration,
      id
    );
    if (!slotCheck.available) {
      return { error: "slotConflict", values };
    }
  }

  const saveResult = await persistBooking(
    {
      customerName: parsed.data.customerName,
      phone: parsed.data.phone,
      plateNumber: parsed.data.plateNumber,
      vehicleMake: parsed.data.vehicleMake,
      vehicleModel: parsed.data.vehicleModel,
      vehicleYear: parsed.data.vehicleYear,
      serviceId,
      serviceDescription: parsed.data.serviceDescription,
      bookingDate: dateResult.date,
      bookingTime: timeResult.time,
      estimatedDuration,
      repairDuration: parsed.data.repairDuration.trim() || null,
      status: parsed.data.status as BookingStatus,
      notes: parsed.data.notes ?? null,
    },
    id
  );

  if (saveResult) {
    return { ...saveResult, values };
  }

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
  if (!dateStr.trim()) return [];
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return [];
  const date = startOfDay(parsed);
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
