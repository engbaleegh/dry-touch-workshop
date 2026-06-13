import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { getBookingById } from "@/actions/bookings";
import { getLocale } from "@/lib/auth";
import { getDictionary, getStatusLabel, getCategoryLabel } from "@/i18n";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteBookingButton } from "@/components/bookings/delete-booking-button";
import { STATUS_COLORS, CATEGORY_COLORS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BookingDetailPage({ params }: PageProps) {
  const { id } = await params;
  const booking = await getBookingById(id);
  if (!booking) notFound();

  const locale = await getLocale();
  const dict = getDictionary(locale);
  const dateLocale = locale === "ar" ? "ar-SA" : "en-US";

  const fields = [
    { label: dict.bookings.bookingNumber, value: booking.bookingNumber },
    { label: dict.bookings.customerName, value: booking.customerName },
    { label: dict.bookings.phone, value: booking.phone },
    { label: dict.bookings.plateNumber, value: booking.plateNumber },
    {
      label: dict.bookings.vehicleMake,
      value: `${booking.vehicleMake} ${booking.vehicleModel} (${booking.vehicleYear})`,
    },
    {
      label: dict.bookings.serviceCategory,
      value: getCategoryLabel(dict, booking.serviceCategory),
    },
    { label: dict.bookings.serviceDescription, value: booking.serviceDescription },
    {
      label: dict.bookings.bookingDate,
      value: `${formatDate(booking.bookingDate, dateLocale)} ${booking.bookingTime}`,
    },
    {
      label: dict.bookings.estimatedDuration,
      value: `${booking.estimatedDuration} ${dict.common.minutes}`,
    },
    { label: dict.bookings.notes, value: booking.notes || "—" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link href={`/dashboard/bookings/${id}/edit`}>
          <Button variant="secondary">
            <Pencil className="h-4 w-4" />
            {dict.bookings.editAction}
          </Button>
        </Link>
        <DeleteBookingButton id={id} />
      </div>

      <Card>
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <h2 className="font-mono text-lg font-bold text-amber-700">
            {booking.bookingNumber}
          </h2>
          <Badge className={STATUS_COLORS[booking.status]}>
            {getStatusLabel(dict, booking.status)}
          </Badge>
          <Badge className={CATEGORY_COLORS[booking.serviceCategory]}>
            {getCategoryLabel(dict, booking.serviceCategory)}
          </Badge>
        </div>

        <dl className="grid gap-4 sm:grid-cols-2">
          {fields.map((f) => (
            <div key={f.label} className="rounded-lg bg-slate-50 p-4">
              <dt className="text-xs font-medium text-slate-500">{f.label}</dt>
              <dd className="mt-1 text-sm font-medium text-slate-900">{f.value}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  );
}
