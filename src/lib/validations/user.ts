import { z } from "zod";

export const userSchema = z.object({
  username: z.string().min(3, "required").max(50),
  password: z
    .string()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined))
    .pipe(z.string().min(6, "required").optional()),
  isActive: z.enum(["true", "false"]).transform((v) => v === "true"),
  role: z.enum(["ADMIN", "STAFF"]),
});

export const userCreateSchema = userSchema.extend({
  password: z.string().min(6, "required"),
});

export type UserFormData = z.infer<typeof userSchema>;
