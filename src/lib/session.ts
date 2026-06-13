import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { getJwtSecret } from "./env";
import {
  SESSION_COOKIE,
  type SessionPayload,
  verifySessionToken as verifyEdgeSessionToken,
} from "./session-edge";

export { SESSION_COOKIE, type SessionPayload };
export const LOCALE_COOKIE = "dtw_locale";

function getEncodedKey() {
  return new TextEncoder().encode(getJwtSecret());
}

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(getEncodedKey());
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  return verifyEdgeSessionToken(token);
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionFromCookies(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
