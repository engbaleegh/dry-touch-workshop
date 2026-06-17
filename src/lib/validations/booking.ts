import { z } from "zod";
import { BOOKING_STATUSES } from "../constants";

const emptyToString = (v: unknown) =>
  v === undefined || v === null ? "" : String(v);

export const bookingSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(1, "customerNameRequired"),
  phone: z.preprocess(emptyToString, z.string().max(20)),
  plateNumber: z.preprocess(emptyToString, z.string().max(30)),
  vehicleMake: z.preprocess(emptyToString, z.string().max(60)),
  vehicleModel: z.preprocess(emptyToString, z.string().max(60)),
  vehicleYear: z.preprocess((v) => {
    if (v === "" || v === undefined || v === null) return 0;
    const n = Number(v);
    return Number.isNaN(n) ? 0 : Math.trunc(n);
  }, z.number().int().min(0).max(new Date().getFullYear() + 1)),
  serviceId: z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? undefined : String(v)),
    z.string().optional()
  ),
  serviceDescription: z.preprocess(emptyToString, z.string().max(500)),
  bookingDate: z.preprocess(emptyToString, z.string()),
  bookingTime: z.preprocess(emptyToString, z.string()),
  repairDuration: z.preprocess(emptyToString, z.string().max(500)),
  estimatedDuration: z.coerce.number().min(15).max(480).optional().default(60),
  status: z
    .enum(BOOKING_STATUSES as [string, ...string[]])
    .optional()
    .default("PENDING"),
  notes: z.preprocess(
    (v) => (v === "" || v === undefined || v === null ? undefined : String(v)),
    z.string().max(1000).optional()
  ),
});

export type BookingFormData = z.infer<typeof bookingSchema>;

export const bookingFilterSchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  serviceCategory: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  customerName: z.string().optional(),
  plateNumber: z.string().optional(),
  preset: z.enum(["today", "upcoming", "completed", "cancelled"]).optional(),
  page: z.coerce.number().min(1).default(1),
  sortBy: z.string().default("bookingDate"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
