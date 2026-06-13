"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useLocale } from "../providers/locale-provider";
import { getCategoryLabel, getStatusLabel } from "@/i18n";
import {
  getDailyReport,
  getMonthlyReport,
  getCategoryStats,
  getStatusStats,
  getTopServices,
} from "@/actions/reports";
import type { Booking } from "@prisma/client";
import type {
  ReportCategoryStat,
  ReportStatusStat,
  TopServiceStat,
} from "@/types";
import { CATEGORY_COLORS } from "@/lib/constants";

export function ReportsPanel() {
  const { dict } = useLocale();
  const [pending, startTransition] = useTransition();

  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [selectedMonth, setSelectedMonth] = useState(
    format(new Date(), "yyyy-MM")
  );

  const [dailyBookings, setDailyBookings] = useState<Booking[]>([]);
  const [monthlyBookings, setMonthlyBookings] = useState<Booking[]>([]);
  const [categoryStats, setCategoryStats] = useState<ReportCategoryStat[]>([]);
  const [statusStats, setStatusStats] = useState<ReportStatusStat[]>([]);
  const [topServices, setTopServices] = useState<TopServiceStat[]>([]);

  const loadReports = () => {
    const [year, month] = selectedMonth.split("-").map(Number);

    startTransition(async () => {
      const [daily, monthly, categories, statuses, top] = await Promise.all([
        getDailyReport(selectedDate),
        getMonthlyReport(year, month),
        getCategoryStats(year, month),
        getStatusStats(year, month),
        getTopServices(8),
      ]);

      setDailyBookings(daily);
      setMonthlyBookings(monthly);
      setCategoryStats(categories);
      setStatusStats(statuses);
      setTopServices(top);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:flex-wrap sm:items-end">
        <Input
          type="date"
          label={dict.reports.selectDate}
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
        <Input
          type="month"
          label={dict.reports.selectMonth}
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        />
        <Button onClick={loadReports} loading={pending}>
          {dict.reports.title}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title={`${dict.reports.daily} (${dailyBookings.length})`}>
          {dailyBookings.length === 0 ? (
            <p className="text-sm text-slate-500">—</p>
          ) : (
            <ul className="max-h-64 space-y-2 overflow-y-auto text-sm">
              {dailyBookings.map((b) => (
                <li
                  key={b.id}
                  className="flex justify-between border-b border-slate-50 py-2"
                >
                  <span>{b.customerName}</span>
                  <span className="text-slate-500">{b.bookingTime}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title={`${dict.reports.monthly} (${monthlyBookings.length})`}>
          <p className="text-3xl font-bold text-amber-600">
            {monthlyBookings.length}
          </p>
          <p className="text-sm text-slate-500">{dict.reports.total}</p>
        </Card>

        <Card title={dict.reports.byCategory}>
          <div className="space-y-3">
            {categoryStats.map((s) => (
              <div key={s.category} className="flex items-center justify-between">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${CATEGORY_COLORS[s.category]}`}
                >
                  {getCategoryLabel(dict, s.category)}
                </span>
                <span className="font-semibold">{s.count}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title={dict.reports.byStatus}>
          <div className="space-y-3">
            {statusStats.map((s) => (
              <div key={s.status} className="flex items-center justify-between">
                <span className="text-sm">{getStatusLabel(dict, s.status)}</span>
                <span className="font-semibold">{s.count}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title={dict.reports.topServices} className="lg:col-span-2">
          <div className="space-y-3">
            {topServices.map((s, i) => (
              <div
                key={s.description}
                className="flex items-center justify-between gap-4"
              >
                <span className="text-sm">
                  {i + 1}. {s.description}
                </span>
                <span className="shrink-0 font-semibold text-amber-600">
                  {s.count}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
