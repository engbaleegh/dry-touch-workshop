import { z } from "zod";

export const serviceSchema = z.object({
  nameAr: z.string().min(2, "required"),
  nameEn: z.string().min(2, "required"),
  description: z.string().optional(),
  estimatedDuration: z.coerce.number().min(15).max(480),
  isActive: z.enum(["true", "false"]).transform((v) => v === "true"),
});

export type ServiceFormData = z.infer<typeof serviceSchema>;
