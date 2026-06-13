import Link from "next/link";
import { Plus } from "lucide-react";
import { Suspense } from "react";
import { getBookings } from "@/actions/bookings";
import { getLocale } from "@/lib/auth";
import { getDictionary } from "@/i18n";
import { BookingsTable } from "@/components/bookings/bookings-table";
import { BookingFilters } from "@/components/bookings/booking-filters";
import { BookingsToast } from "@/components/bookings/bookings-toast";
import { ExportButtons } from "@/components/bookings/export-buttons";
import { Button } from "@/components/ui/button";
import { PageLoading } from "@/components/ui/loading";

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

async function BookingsContent({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const { bookings, total, page, pageSize } = await getBookings(searchParams);

  return (
    <BookingsTable
      bookings={bookings}
      total={total}
      page={page}
      pageSize={pageSize}
    />
  );
}

export default async function BookingsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <div className="w-full max-w-full space-y-4 sm:space-y-6">
      <Suspense fallback={null}>
        <BookingsToast />
      </Suspense>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <ExportButtons filters={params} />
        <Link href="/dashboard/bookings/new" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            {dict.bookings.new}
          </Button>
        </Link>
      </div>

      <Suspense fallback={<PageLoading />}>
        <BookingFilters />
      </Suspense>

      <Suspense fallback={<PageLoading />}>
        <BookingsContent searchParams={params} />
      </Suspense>
    </div>
  );
}
