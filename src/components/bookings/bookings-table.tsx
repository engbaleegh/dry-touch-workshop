"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, Pencil, ArrowUpDown, Clock, User } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { EmptyState } from "../ui/empty-state";
import { useLocale } from "../providers/locale-provider";
import { getStatusLabel, getCategoryLabel } from "@/i18n";
import { STATUS_COLORS, CATEGORY_COLORS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { Booking } from "@prisma/client";

interface BookingsTableProps {
  bookings: Booking[];
  total: number;
  page: number;
  pageSize: number;
}

function Pagination({
  page,
  total,
  pageSize,
  totalPages,
  onPage,
}: {
  page: number;
  total: number;
  pageSize: number;
  totalPages: number;
  onPage: (p: number) => void;
}) {
  const { dict } = useLocale();

  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-center sm:text-start">
        {dict.common.showing} {(page - 1) * pageSize + 1}-
        {Math.min(page * pageSize, total)} {dict.common.of} {total}{" "}
        {dict.common.results}
      </span>
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
        >
          {dict.common.previous}
        </Button>
        <span className="px-2 text-xs sm:text-sm">
          {dict.common.page} {page} {dict.common.of} {totalPages || 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPage(page + 1)}
        >
          {dict.common.next}
        </Button>
      </div>
    </div>
  );
}

function BookingCard({ booking }: { booking: Booking }) {
  const { dict, locale } = useLocale();
  const dateLocale = locale === "ar" ? "ar-SA" : "en-US";

  return (
    <div className="surface-card p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <span className="font-mono text-xs font-bold text-amber-700">
          {booking.bookingNumber}
        </span>
        <Badge className={STATUS_COLORS[booking.status]}>
          {getStatusLabel(dict, booking.status)}
        </Badge>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-slate-900">
          <User className="h-4 w-4 shrink-0 text-slate-400" />
          <span className="font-medium">{booking.customerName}</span>
        </div>
        <p className="text-slate-600">{booking.plateNumber}</p>
        <Badge className={CATEGORY_COLORS[booking.serviceCategory]}>
          {getCategoryLabel(dict, booking.serviceCategory)}
        </Badge>
        <div className="flex items-center gap-2 text-slate-500">
          <Clock className="h-4 w-4 shrink-0" />
          <span>
            {formatDate(booking.bookingDate, dateLocale)} · {booking.bookingTime}
          </span>
        </div>
      </div>

      <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
        <Link href={`/dashboard/bookings/${booking.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full">
            <Eye className="h-4 w-4" />
            {dict.bookings.view}
          </Button>
        </Link>
        <Link href={`/dashboard/bookings/${booking.id}/edit`} className="flex-1">
          <Button variant="secondary" size="sm" className="w-full">
            <Pencil className="h-4 w-4" />
            {dict.bookings.editAction}
          </Button>
        </Link>
      </div>
    </div>
  );
}

export function BookingsTable({
  bookings,
  total,
  page,
  pageSize,
}: BookingsTableProps) {
  const { dict, locale } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateLocale = locale === "ar" ? "ar-SA" : "en-US";
  const totalPages = Math.ceil(total / pageSize);

  const toggleSort = (field: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const currentSort = params.get("sortBy");
    const currentOrder = params.get("sortOrder") ?? "desc";

    if (currentSort === field) {
      params.set("sortOrder", currentOrder === "asc" ? "desc" : "asc");
    } else {
      params.set("sortBy", field);
      params.set("sortOrder", "asc");
    }

    router.push(`/dashboard/bookings?${params.toString()}`);
  };

  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`/dashboard/bookings?${params.toString()}`);
  };

  if (bookings.length === 0) {
    return <EmptyState title={dict.bookings.noResults} />;
  }

  return (
    <div className="w-full max-w-full overflow-hidden rounded-xl border border-slate-200 bg-white">
      {/* Mobile cards */}
      <div className="space-y-3 p-3 md:hidden">
        {bookings.map((b) => (
          <BookingCard key={b.id} booking={b} />
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-start font-medium">
                <button
                  type="button"
                  onClick={() => toggleSort("bookingNumber")}
                  className="inline-flex items-center gap-1 hover:text-slate-900"
                >
                  {dict.bookings.bookingNumber}
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-4 py-3 text-start font-medium">
                {dict.bookings.customerName}
              </th>
              <th className="px-4 py-3 text-start font-medium">
                {dict.bookings.plateNumber}
              </th>
              <th className="px-4 py-3 text-start font-medium">
                {dict.bookings.serviceCategory}
              </th>
              <th className="px-4 py-3 text-start font-medium">
                <button
                  type="button"
                  onClick={() => toggleSort("bookingDate")}
                  className="inline-flex items-center gap-1 hover:text-slate-900"
                >
                  {dict.bookings.bookingDate}
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-4 py-3 text-start font-medium">
                {dict.bookings.status}
              </th>
              <th className="px-4 py-3 text-start font-medium">
                {dict.bookings.actions}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bookings.map((b) => (
              <tr key={b.id} className="hover:bg-slate-50/50">
                <td className="px-4 py-3 font-mono text-xs font-medium text-amber-700">
                  {b.bookingNumber}
                </td>
                <td className="px-4 py-3">{b.customerName}</td>
                <td className="px-4 py-3">{b.plateNumber}</td>
                <td className="px-4 py-3">
                  <Badge className={CATEGORY_COLORS[b.serviceCategory]}>
                    {getCategoryLabel(dict, b.serviceCategory)}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  {formatDate(b.bookingDate, dateLocale)}
                  <span className="text-slate-400"> · {b.bookingTime}</span>
                </td>
                <td className="px-4 py-3">
                  <Badge className={STATUS_COLORS[b.status]}>
                    {getStatusLabel(dict, b.status)}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <Link href={`/dashboard/bookings/${b.id}`}>
                      <Button variant="ghost" className="!px-2 !py-1">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/dashboard/bookings/${b.id}/edit`}>
                      <Button variant="ghost" className="!px-2 !py-1">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        total={total}
        pageSize={pageSize}
        totalPages={totalPages}
        onPage={goToPage}
      />
    </div>
  );
}
