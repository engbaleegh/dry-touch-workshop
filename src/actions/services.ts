"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { serviceSchema } from "@/lib/validations/service";
import type { ActionState } from "./auth";

export async function getServices(includeInactive = true) {
  await requireAuth();
  return prisma.service.findMany({
    where: includeInactive ? undefined : { isActive: true },
    orderBy: { nameEn: "asc" },
  });
}

export async function getActiveServices() {
  await requireAuth();
  return prisma.service.findMany({
    where: { isActive: true },
    orderBy: { nameEn: "asc" },
  });
}

export async function getServicesForBooking(bookingServiceId?: string | null) {
  await requireAuth();
  const active = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { nameEn: "asc" },
  });

  if (bookingServiceId && !active.some((s) => s.id === bookingServiceId)) {
    const current = await prisma.service.findUnique({
      where: { id: bookingServiceId },
    });
    if (current) active.push(current);
  }

  return active;
}

export async function getServiceById(id: string) {
  await requireAuth();
  return prisma.service.findUnique({ where: { id } });
}

export async function createServiceAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAuth();

  const parsed = serviceSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: "validation" };

  await prisma.service.create({ data: parsed.data });
  revalidatePath("/dashboard/services");
  revalidatePath("/dashboard/bookings");
  redirect("/dashboard/services");
}

export async function updateServiceAction(
  id: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAuth();

  const parsed = serviceSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: "validation" };

  await prisma.service.update({ where: { id }, data: parsed.data });
  revalidatePath("/dashboard/services");
  revalidatePath("/dashboard/bookings");
  redirect("/dashboard/services");
}

export async function deleteServiceAction(id: string): Promise<ActionState> {
  await requireAuth();

  const inUse = await prisma.booking.count({ where: { serviceId: id } });
  if (inUse > 0) {
    await prisma.service.update({
      where: { id },
      data: { isActive: false },
    });
  } else {
    await prisma.service.delete({ where: { id } });
  }

  revalidatePath("/dashboard/services");
  return { success: true };
}

export async function toggleServiceAction(
  id: string,
  isActive: boolean
): Promise<ActionState> {
  await requireAuth();
  await prisma.service.update({ where: { id }, data: { isActive } });
  revalidatePath("/dashboard/services");
  return { success: true };
}
