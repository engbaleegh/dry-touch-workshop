import { z } from "zod";
import { BOOKING_STATUSES, SERVICE_CATEGORIES } from "../constants";

export const bookingSchema = z.object({
  customerName: z.string().min(2, "required"),
  phone: z.string().min(8, "required"),
  plateNumber: z.string().min(2, "required"),
  vehicleMake: z.string().min(1, "required"),
  vehicleModel: z.string().min(1, "required"),
  vehicleYear: z.coerce.number().min(1990).max(new Date().getFullYear() + 1),
  serviceId: z.string().min(1, "required"),
  serviceCategory: z.enum(SERVICE_CATEGORIES as [string, ...string[]]).optional(),
  serviceDescription: z.string().min(1, "required"),
  bookingDate: z.string().min(1, "required"),
  bookingTime: z.string().regex(/^\d{2}:\d{2}$/, "required"),
  estimatedDuration: z.coerce.number().min(15).max(480),
  status: z.enum(BOOKING_STATUSES as [string, ...string[]]),
  notes: z.string().optional(),
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
