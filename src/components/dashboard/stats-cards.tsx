"use client";

import Link from "next/link";
import {
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  XCircle,
} from "lucide-react";
import { useLocale } from "../providers/locale-provider";
import type { DashboardStats } from "@/types";

const config = [
  {
    key: "total",
    icon: ClipboardList,
    color: "from-blue-500 to-blue-600",
    href: "/dashboard/bookings",
  },
  {
    key: "today",
    icon: CalendarCheck,
    color: "from-amber-500 to-amber-600",
    href: "/dashboard/bookings?preset=today",
  },
  {
    key: "upcoming",
    icon: CalendarClock,
    color: "from-violet-500 to-violet-600",
    href: "/dashboard/bookings?preset=upcoming",
  },
  {
    key: "completed",
    icon: CheckCircle2,
    color: "from-emerald-500 to-emerald-600",
    href: "/dashboard/bookings?preset=completed",
  },
  {
    key: "cancelled",
    icon: XCircle,
    color: "from-red-500 to-red-600",
    href: "/dashboard/bookings?preset=cancelled",
  },
] as const;

export function StatsCards({ stats }: { stats: DashboardStats }) {
  const { dict } = useLocale();

  const labels: Record<string, string> = {
    total: dict.dashboard.totalBookings,
    today: dict.dashboard.todayBookings,
    upcoming: dict.dashboard.upcoming,
    completed: dict.dashboard.completed,
    cancelled: dict.dashboard.cancelled,
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {config.map((item) => {
        const Icon = item.icon;
        const value = stats[item.key];

        return (
          <Link
            key={item.key}
            href={item.href}
            className="surface-card group relative block overflow-hidden p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          >
            <div
              className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${item.color}`}
            />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold tracking-tight text-slate-900">
                  {value}
                </p>
                <p className="mt-1 text-sm text-slate-500">{labels[item.key]}</p>
              </div>
              <div
                className={`rounded-xl bg-gradient-to-br p-3 text-white shadow-sm ${item.color}`}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
