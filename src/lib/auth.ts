import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import type { UserRole } from "@prisma/client";
import { ForbiddenError, UnauthorizedError } from "./errors";
import { prisma } from "./prisma";
import {
  createSessionToken,
  getSessionFromCookies,
  clearSessionCookie,
  setSessionCookie,
  LOCALE_COOKIE,
  type SessionPayload,
} from "./session";

export type { SessionPayload };

export type AuthSession = SessionPayload & { role: UserRole };

export async function createSession(payload: SessionPayload) {
  const token = await createSessionToken(payload);
  await setSessionCookie(token);
}

export async function getSession(): Promise<SessionPayload | null> {
  return getSessionFromCookies();
}

export async function deleteSession() {
  await clearSessionCookie();
}

export async function verifyCredentials(username: string, password: string) {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !user.isActive) return null;

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return null;

  return {
    id: user.id,
    username: user.username,
    role: user.role,
    tokenVersion: user.tokenVersion,
  };
}

async function validateSessionAgainstDb(
  session: SessionPayload
): Promise<AuthSession | null> {
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      username: true,
      role: true,
      isActive: true,
      tokenVersion: true,
    },
  });

  if (!user || !user.isActive) return null;
  if (user.tokenVersion !== session.tokenVersion) return null;
  if (user.role !== session.role) return null;
  if (user.username !== session.username) return null;

  return {
    userId: user.id,
    username: user.username,
    role: user.role,
    tokenVersion: user.tokenVersion,
  };
}

export async function requireAuth(): Promise<AuthSession> {
  const session = await getSession();
  if (!session) {
    throw new UnauthorizedError();
  }

  const validated = await validateSessionAgainstDb(session);
  if (!validated) {
    throw new UnauthorizedError();
  }

  return validated;
}

export async function requireAdmin(): Promise<AuthSession> {
  const session = await requireAuth();
  if (session.role !== "ADMIN") {
    throw new ForbiddenError();
  }
  return session;
}

export async function getLocale(): Promise<"ar" | "en"> {
  const cookieStore = await cookies();
  const locale = cookieStore.get(LOCALE_COOKIE)?.value;
  return locale === "en" ? "en" : "ar";
}

export async function setLocaleCookie(locale: "ar" | "en") {
  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}
