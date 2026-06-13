import { jwtVerify } from "jose";
import type { UserRole } from "@prisma/client";

export const SESSION_COOKIE = "dtw_session";

export type SessionPayload = {
  userId: string;
  username: string;
  role: UserRole;
  tokenVersion: number;
};

function getEncodedKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET is required");
    }
    return new TextEncoder().encode(
      "dev-only-secret-do-not-use-in-production-32chars"
    );
  }
  return new TextEncoder().encode(secret);
}

export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getEncodedKey());
    const p = payload as Record<string, unknown>;
    if (
      typeof p.userId !== "string" ||
      typeof p.username !== "string" ||
      (p.role !== "ADMIN" && p.role !== "STAFF") ||
      typeof p.tokenVersion !== "number"
    ) {
      return null;
    }
    return {
      userId: p.userId,
      username: p.username,
      role: p.role,
      tokenVersion: p.tokenVersion,
    };
  } catch {
    return null;
  }
}
