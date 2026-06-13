"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter } from "lucide-react";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { Button } from "../ui/button";
import { useLocale } from "../providers/locale-provider";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { getStatusLabel, getCategoryLabel } from "@/i18n";
import { BOOKING_STATUSES, SERVICE_CATEGORIES } from "@/lib/constants";

export function BookingFilters() {
  const { dict } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [customerName, setCustomerName] = useState(
    searchParams.get("customerName") ?? ""
  );
  const [plateNumber, setPlateNumber] = useState(
    searchParams.get("plateNumber") ?? ""
  );

  const debouncedSearch = useDebouncedValue(search, 400);
  const debouncedCustomer = useDebouncedValue(customerName, 400);
  const debouncedPlate = useDebouncedValue(plateNumber, 400);

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    if (!updates.preset) params.delete("preset");
    params.delete("page");
    const qs = params.toString();
    router.replace(qs ? `/dashboard/bookings?${qs}` : "/dashboard/bookings");
  };

  useEffect(() => {
    const current = searchParams.get("search") ?? "";
    if (debouncedSearch !== current) {
      updateParams({ search: debouncedSearch });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  useEffect(() => {
    const current = searchParams.get("customerName") ?? "";
    if (debouncedCustomer !== current) {
      updateParams({ customerName: debouncedCustomer });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedCustomer]);

  useEffect(() => {
    const current = searchParams.get("plateNumber") ?? "";
    if (debouncedPlate !== current) {
      updateParams({ plateNumber: debouncedPlate });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedPlate]);

  const updateParam = (key: string, value: string) => {
    updateParams({ [key]: value });
  };

  const clearFilters = () => {
    setSearch("");
    setCustomerName("");
    setPlateNumber("");
    router.replace("/dashboard/bookings");
  };

  const statusOptions = [
    { value: "", label: dict.common.all },
    ...BOOKING_STATUSES.map((s) => ({
      value: s,
      label: getStatusLabel(dict, s),
    })),
  ];

  const categoryOptions = [
    { value: "", label: dict.common.all },
    ...SERVICE_CATEGORIES.map((c) => ({
      value: c,
      label: getCategoryLabel(dict, c),
    })),
  ];

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <Filter className="h-4 w-4 shrink-0" />
        {dict.bookings.filter}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative sm:col-span-2">
          <Search className="pointer-events-none absolute top-9 h-4 w-4 text-slate-400 ltr:left-3 rtl:right-3" />
          <Input
            placeholder={dict.bookings.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ltr:pl-9 rtl:pr-9"
          />
        </div>

        <Select
          label={dict.bookings.status}
          options={statusOptions}
          value={searchParams.get("status") ?? ""}
          onChange={(e) => updateParam("status", e.target.value)}
        />

        <Select
          label={dict.bookings.serviceCategory}
          options={categoryOptions}
          value={searchParams.get("serviceCategory") ?? ""}
          onChange={(e) => updateParam("serviceCategory", e.target.value)}
        />

        <Input
          type="date"
          label={dict.common.from}
          value={searchParams.get("dateFrom") ?? ""}
          onChange={(e) => updateParam("dateFrom", e.target.value)}
        />

        <Input
          type="date"
          label={dict.common.to}
          value={searchParams.get("dateTo") ?? ""}
          onChange={(e) => updateParam("dateTo", e.target.value)}
        />

        <Input
          label={dict.bookings.customerName}
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
        />

        <Input
          label={dict.bookings.plateNumber}
          value={plateNumber}
          onChange={(e) => setPlateNumber(e.target.value)}
        />
      </div>

      <Button variant="ghost" onClick={clearFilters} className="text-sm">
        {dict.bookings.clearFilters}
      </Button>
    </div>
  );
}
