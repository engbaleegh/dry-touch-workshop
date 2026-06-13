"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import type { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin, getSession } from "@/lib/auth";
import { userCreateSchema, userSchema } from "@/lib/validations/user";
import type { ActionState } from "./auth";

export async function getUsers() {
  await requireAdmin();
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      username: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function getUserById(id: string) {
  await requireAdmin();
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function createUserAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const parsed = userCreateSchema.safeParse(
    Object.fromEntries(formData.entries())
  );
  if (!parsed.success) return { error: "validation" };

  const exists = await prisma.user.findUnique({
    where: { username: parsed.data.username },
  });
  if (exists) return { error: "exists" };

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.user.create({
    data: {
      username: parsed.data.username,
      password: passwordHash,
      role: parsed.data.role as UserRole,
      isActive: parsed.data.isActive,
    },
  });

  revalidatePath("/dashboard/users");
  redirect("/dashboard/users");
}

export async function updateUserAction(
  id: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const parsed = userSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: "validation" };

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) return { error: "validation" };

  const data: {
    username: string;
    role: UserRole;
    isActive: boolean;
    password?: string;
    tokenVersion?: { increment: number };
  } = {
    username: parsed.data.username,
    role: parsed.data.role as UserRole,
    isActive: parsed.data.isActive,
  };

  let shouldInvalidate = false;

  if (parsed.data.password) {
    data.password = await bcrypt.hash(parsed.data.password, 12);
    shouldInvalidate = true;
  }

  if (
    existing.role !== parsed.data.role ||
    existing.isActive !== parsed.data.isActive
  ) {
    shouldInvalidate = true;
  }

  if (shouldInvalidate) {
    data.tokenVersion = { increment: 1 };
  }

  await prisma.user.update({ where: { id }, data });
  revalidatePath("/dashboard/users");
  redirect("/dashboard/users");
}

export async function deleteUserAction(id: string): Promise<ActionState> {
  await requireAdmin();
  const session = await getSession();
  if (session?.userId === id) return { error: "self" };

  const count = await prisma.user.count();
  if (count <= 1) return { error: "last" };

  await prisma.user.delete({ where: { id } });
  revalidatePath("/dashboard/users");
  return { success: true };
}

export async function resetPasswordAction(
  id: string,
  password: string
): Promise<ActionState> {
  await requireAdmin();
  if (password.length < 6) return { error: "validation" };

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.update({
    where: { id },
    data: {
      password: passwordHash,
      tokenVersion: { increment: 1 },
    },
  });
  revalidatePath("/dashboard/users");
  return { success: true };
}

export async function toggleUserAction(
  id: string,
  isActive: boolean
): Promise<ActionState> {
  await requireAdmin();
  const session = await getSession();
  if (session?.userId === id && !isActive) return { error: "self" };

  await prisma.user.update({
    where: { id },
    data: {
      isActive,
      tokenVersion: { increment: 1 },
    },
  });
  revalidatePath("/dashboard/users");
  return { success: true };
}
