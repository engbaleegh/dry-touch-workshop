import type { BookingStatus, ServiceCategory } from "@prisma/client";

export const WORK_START_HOUR = 8;
export const WORK_END_HOUR = 18;
export const SLOT_INTERVAL_MINUTES = 30;

export const BOOKING_STATUSES: BookingStatus[] = [
  "PENDING",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  "MECHANICAL",
  "ELECTRICAL",
  "PAINT",
  "BODY_REPAIR",
  "DRY_ICE_CLEANING",
  "OIL_CHANGE",
  "INSPECTION",
  "OTHER",
];

export const STATUS_COLORS: Record<BookingStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-200",
  CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
  IN_PROGRESS: "bg-purple-100 text-purple-800 border-purple-200",
  COMPLETED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
};

export const CATEGORY_COLORS: Record<ServiceCategory, string> = {
  MECHANICAL: "bg-slate-100 text-slate-800",
  ELECTRICAL: "bg-yellow-100 text-yellow-800",
  PAINT: "bg-pink-100 text-pink-800",
  BODY_REPAIR: "bg-orange-100 text-orange-800",
  DRY_ICE_CLEANING: "bg-cyan-100 text-cyan-800",
  OIL_CHANGE: "bg-lime-100 text-lime-800",
  INSPECTION: "bg-indigo-100 text-indigo-800",
  OTHER: "bg-gray-100 text-gray-800",
};

export const PAGE_SIZE = 10;
