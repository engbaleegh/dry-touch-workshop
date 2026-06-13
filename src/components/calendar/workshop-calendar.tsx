"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
} from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { EmptyState } from "../ui/empty-state";
import { useLocale } from "../providers/locale-provider";
import { getStatusLabel } from "@/i18n";
import { STATUS_COLORS } from "@/lib/constants";
import { getMonthlyBookingCounts, getBookingsForDate } from "@/actions/calendar";
import type { Booking } from "@prisma/client";
import type { CalendarDayCount } from "@/types";

export function WorkshopCalendar() {
  const { dict, locale, dir } = useLocale();
  const dateLocale = locale === "ar" ? ar : enUS;

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dayCounts, setDayCounts] = useState<CalendarDayCount[]>([]);
  const [dayBookings, setDayBookings] = useState<Booking[]>([]);
  const [pending, startTransition] = useTransition();

  const loadMonth = useCallback((date: Date) => {
    startTransition(async () => {
      const counts = await getMonthlyBookingCounts(
        date.getFullYear(),
        date.getMonth() + 1
      );
      setDayCounts(counts);
    });
  }, []);

  const loadDay = useCallback((date: Date) => {
    setSelectedDate(date);
    startTransition(async () => {
      const bookings = await getBookingsForDate(format(date, "yyyy-MM-dd"));
      setDayBookings(bookings);
    });
  }, []);

  useEffect(() => {
    loadMonth(currentMonth);
  }, [currentMonth, loadMonth]);

  useEffect(() => {
    loadDay(selectedDate);
  }, [selectedDate, loadDay]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startPadding = getDay(monthStart);
  const countMap = Object.fromEntries(dayCounts.map((d) => [d.date, d.count]));

  const weekDays =
    locale === "ar"
      ? ["أحد", "إثن", "ثلا", "أرب", "خمي", "جمع", "سبت"]
      : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card title={dict.calendar.monthly}>
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="rounded-lg p-2 hover:bg-slate-100"
          >
            {dir === "rtl" ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
          <h3 className="font-semibold">
            {format(currentMonth, "MMMM yyyy", { locale: dateLocale })}
          </h3>
          <button
            type="button"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="rounded-lg p-2 hover:bg-slate-100"
          >
            {dir === "rtl" ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500">
          {weekDays.map((d) => (
            <div key={d} className="py-2">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startPadding }).map((_, i) => (
            <div key={`pad-${i}`} />
          ))}
          {days.map((day) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const count = countMap[dateKey] ?? 0;
            const isSelected = isSameDay(day, selectedDate);

            return (
              <button
                key={dateKey}
                type="button"
                onClick={() => loadDay(day)}
                className={`relative min-h-[60px] rounded-lg border p-1 text-sm transition ${
                  isSelected
                    ? "border-amber-500 bg-amber-50"
                    : "border-slate-100 hover:border-amber-200 hover:bg-slate-50"
                }`}
              >
                <span className="font-medium">{format(day, "d")}</span>
                {count > 0 && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-slate-900">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      <Card title={format(selectedDate, "PPP", { locale: dateLocale })}>
        {pending && dayBookings.length === 0 ? (
          <p className="text-sm text-slate-500">{dict.common.loading}</p>
        ) : dayBookings.length === 0 ? (
          <EmptyState title={dict.calendar.noBookings} />
        ) : (
          <ul className="space-y-3">
            {dayBookings.map((b) => (
              <li key={b.id}>
                <Link
                  href={`/dashboard/bookings/${b.id}`}
                  className="flex items-center justify-between rounded-lg border border-slate-100 p-3 hover:bg-slate-50"
                >
                  <div>
                    <p className="font-medium">{b.customerName}</p>
                    <p className="text-sm text-slate-500">
                      {b.bookingTime} · {b.estimatedDuration}{" "}
                      {dict.common.minutes}
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
    </div>
  );
}
