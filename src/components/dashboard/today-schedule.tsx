"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { EmptyState } from "../ui/empty-state";
import { useLocale } from "../providers/locale-provider";
import { getStatusLabel } from "@/i18n";
import { STATUS_COLORS } from "@/lib/constants";
import { formatTime } from "@/lib/utils";
import type { Booking } from "@prisma/client";

export function TodaySchedule({ bookings }: { bookings: Booking[] }) {
  const { dict } = useLocale();

  return (
    <Card title={dict.dashboard.todaySchedule}>
      {bookings.length === 0 ? (
        <EmptyState title={dict.dashboard.noBookingsToday} />
      ) : (
        <ul className="space-y-3">
          {bookings.map((b) => (
            <li key={b.id}>
              <Link
                href={`/dashboard/bookings/${b.id}`}
                className="flex items-center justify-between rounded-lg border border-slate-100 p-3 transition hover:border-amber-200 hover:bg-amber-50/50"
              >
                <div>
                  <p className="font-medium text-slate-900">{b.customerName}</p>
                  <p className="text-sm text-slate-500">
                    {b.plateNumber} · {b.vehicleMake} {b.vehicleModel}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-sm text-slate-600">
                    <Clock className="h-4 w-4" />
                    {formatTime(b.bookingTime)}
                  </span>
                  <Badge className={STATUS_COLORS[b.status]}>
                    {getStatusLabel(dict, b.status)}
                  </Badge>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
