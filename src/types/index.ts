import type { Booking, BookingStatus, ServiceCategory } from "@prisma/client";

export type { Booking, BookingStatus, ServiceCategory };

export type DashboardStats = {
  total: number;
  today: number;
  upcoming: number;
  completed: number;
  cancelled: number;
};

export type CalendarDayCount = {
  date: string;
  count: number;
};

export type ReportCategoryStat = {
  category: ServiceCategory;
  count: number;
};

export type ReportStatusStat = {
  status: BookingStatus;
  count: number;
};

export type TopServiceStat = {
  description: string;
  count: number;
};
