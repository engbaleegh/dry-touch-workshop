"use client";

import { useTransition } from "react";
import { FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { useLocale } from "../providers/locale-provider";
import { getAllBookingsForExport } from "@/actions/bookings";
import { generateBookingsPdfAction } from "@/actions/export-pdf";

interface ExportButtonsProps {
  filters: Record<string, string | undefined>;
}

function downloadPdfBase64(base64: string, filename: string) {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function ExportButtons({ filters }: ExportButtonsProps) {
  const { dict, locale } = useLocale();
  const [pending, startTransition] = useTransition();

  const handleExport = (type: "excel" | "pdf") => {
    startTransition(async () => {
      try {
        if (type === "excel") {
          const bookings = await getAllBookingsForExport(filters);
          const dateLocale = locale === "ar" ? "ar-SA" : "en-US";
          const { exportBookingsToExcel } = await import("@/lib/export");
          exportBookingsToExcel(bookings, dict, dateLocale);
          toast.success(dict.common.success);
          return;
        }

        const result = await generateBookingsPdfAction(filters, locale);

        if (!result.success) {
          console.error("[pdf-export] client error:", result.error);
          toast.error(dict.bookings.exportPdfError);
          return;
        }

        downloadPdfBase64(result.data, result.filename);
        toast.success(dict.bookings.exportPdfSuccess);
      } catch (error) {
        console.error("[pdf-export] unexpected client error:", error);
        toast.error(dict.bookings.exportPdfError);
      }
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport("excel")}
        loading={pending}
      >
        <FileSpreadsheet className="h-4 w-4" />
        {dict.bookings.exportExcel}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleExport("pdf")}
        loading={pending}
      >
        <FileText className="h-4 w-4" />
        {dict.bookings.exportPdf}
      </Button>
    </div>
  );
}
