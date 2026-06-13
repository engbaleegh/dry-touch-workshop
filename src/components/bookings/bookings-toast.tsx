"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useLocale } from "../providers/locale-provider";

export function BookingsToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { dict } = useLocale();

  useEffect(() => {
    if (searchParams.get("updated") === "1") {
      toast.success(dict.bookings.updateSuccess);
      const params = new URLSearchParams(searchParams.toString());
      params.delete("updated");
      const qs = params.toString();
      router.replace(qs ? `/dashboard/bookings?${qs}` : "/dashboard/bookings");
      router.refresh();
    }
  }, [searchParams, router, dict.bookings.updateSuccess]);

  return null;
}
