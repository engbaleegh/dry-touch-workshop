"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { EmptyState } from "../ui/empty-state";
import { useLocale } from "../providers/locale-provider";
import { getStatusLabel } from "@/i18n";
import { STATUS_COLORS } from "@/lib/constants";
import { formatDate, formatTime } from "@/lib/utils";
import type { Booking } from "@prisma/client";

export function UpcomingAlerts({ bookings }: { bookings: Booking[] }) {
  const { dict, locale } = useLocale();
  const dateLocale = locale === "ar" ? "ar-SA" : "en-US";

  return (
    <Card title={dict.dashboard.upcomingAlerts}>
      {bookings.length === 0 ? (
        <EmptyState title={dict.dashboard.noUpcoming} />
      ) : (
        <ul className="space-y-3">
          {bookings.map((b) => (
            <li key={b.id}>
              <Link
                href={`/dashboard/bookings/${b.id}`}
                className="flex items-start gap-3 rounded-lg border border-amber-100 bg-amber-50/30 p-3 transition hover:bg-amber-50"
              >
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{b.customerName}</p>
                  <p className="text-sm text-slate-500">
                    {formatDate(b.bookingDate, dateLocale)} ·{" "}
                    {formatTime(b.bookingTime)}
                  </p>
                </div>
                <Badge className={STATUS_COLORS[b.status]}>
                  {getStatusLabel(dict, b.status)}
                </Badge>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
