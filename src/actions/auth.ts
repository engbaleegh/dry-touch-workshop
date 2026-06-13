"use server";

import { redirect } from "next/navigation";
import { loginSchema } from "@/lib/validations/auth";
import {
  createSession,
  deleteSession,
  verifyCredentials,
  setLocaleCookie,
} from "@/lib/auth";
import type { Locale } from "@/i18n";

export type ActionState = {
  error?: string;
  success?: boolean;
};

export async function loginAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "invalid" };
  }

  const user = await verifyCredentials(
    parsed.data.username,
    parsed.data.password
  );

  if (!user) {
    return { error: "invalid" };
  }

  await createSession({
    userId: user.id,
    username: user.username,
    role: user.role,
    tokenVersion: user.tokenVersion,
  });
  redirect("/dashboard");
}

export async function logoutAction() {
  await deleteSession();
  redirect("/login");
}

export async function setLocaleAction(locale: Locale) {
  await setLocaleCookie(locale);
}
