import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters in production")
    .optional(),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

function createEnv() {
  const parsed = envSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  });

  if (!parsed.success) {
    const formatted = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment variables:\n${formatted}`);
  }

  const data = parsed.data;

  if (data.NODE_ENV === "production") {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      throw new Error(
        "JWT_SECRET must be set to a secure random string (32+ chars) in production"
      );
    }
    if (
      process.env.JWT_SECRET ===
      "change-this-to-a-secure-random-string-in-production"
    ) {
      throw new Error("JWT_SECRET must be changed from the default value in production");
    }
  }

  return {
    ...data,
    JWT_SECRET:
      data.JWT_SECRET ??
      "dev-only-secret-do-not-use-in-production-32chars",
  };
}

export const env = createEnv();

export function getJwtSecret(): string {
  return env.JWT_SECRET;
}
