"use server";

import pdfMake from "pdfmake";
import type { TDocumentDefinitions } from "pdfmake/interfaces";
import { requireAuth } from "@/lib/auth";
import { getAllBookingsForExport } from "./bookings";
import { getDictionary, getStatusLabel, type Locale } from "@/i18n";
import { formatDate } from "@/lib/utils";
import { loadPdfFontDescriptors } from "@/lib/pdf/load-fonts";
import { logPdfError, logPdfInfo } from "@/lib/pdf/logger";
import type { Booking, Service } from "@prisma/client";

type BookingWithService = Booking & { service: Service | null };

export type PdfExportResult =
  | { success: true; data: string; filename: string }
  | { success: false; error: string };

let fontsInitialized = false;

function initFonts() {
  if (fontsInitialized) return;

  const fonts = loadPdfFontDescriptors();
  pdfMake.setFonts(fonts);
  pdfMake.setLocalAccessPolicy(() => true);
  pdfMake.setUrlAccessPolicy(() => false);
  fontsInitialized = true;

  logPdfInfo("PDF fonts initialized (embedded VFS)", {
    fonts: Object.keys(fonts),
  });
}

function serviceLabel(booking: BookingWithService, locale: Locale): string {
  if (booking.service) {
    return locale === "ar" ? booking.service.nameAr : booking.service.nameEn;
  }
  return booking.serviceDescription;
}

export async function generateBookingsPdfAction(
  filters: Record<string, string | undefined>,
  locale: Locale
): Promise<PdfExportResult> {
  try {
    await requireAuth();
    initFonts();

    const bookings = (await getAllBookingsForExport(
      filters
    )) as BookingWithService[];

    logPdfInfo("Generating bookings PDF", {
      locale,
      bookingCount: bookings.length,
    });

    const dict = getDictionary(locale);
    const dateLocale = locale === "ar" ? "ar-SA" : "en-US";
    const isRtl = locale === "ar";
    const font = isRtl ? "NotoSansArabic" : "Roboto";

    const headers = [
      dict.bookings.bookingNumber,
      dict.bookings.customerName,
      dict.bookings.plateNumber,
      dict.bookings.service,
      dict.bookings.bookingDate,
      dict.bookings.bookingTime,
      dict.bookings.status,
    ];

    const rows = bookings.map((b) => [
      b.bookingNumber,
      b.customerName,
      b.plateNumber,
      serviceLabel(b, locale),
      formatDate(b.bookingDate, dateLocale),
      b.bookingTime,
      getStatusLabel(dict, b.status),
    ]);

    const cellAlign = isRtl ? ("right" as const) : ("left" as const);

    const tableBody =
      rows.length > 0
        ? [
            headers.map((h) => ({
              text: h,
              style: "tableHeader",
              alignment: cellAlign,
            })),
            ...rows.map((row) =>
              row.map((cell) => ({
                text: cell ?? "",
                alignment: cellAlign,
              }))
            ),
          ]
        : [
            headers.map((h) => ({
              text: h,
              style: "tableHeader",
              alignment: cellAlign,
            })),
            [
              {
                text: dict.bookings.noResults,
                colSpan: headers.length,
                alignment: cellAlign,
              },
              ...headers.slice(1).map(() => ""),
            ],
          ];

    const docDefinition: TDocumentDefinitions = {
      pageOrientation: "landscape",
      pageMargins: [40, 50, 40, 40],
      defaultStyle: {
        font,
        fontSize: 9,
        alignment: isRtl ? "right" : "left",
      },
      ...(isRtl ? { rtl: true } : {}),
      content: [
        {
          text: "DRY TOUCH",
          style: "title",
          alignment: isRtl ? "right" : "left",
        },
        {
          text: `${dict.bookings.title} — ${new Date().toLocaleDateString(dateLocale)}`,
          margin: [0, 4, 0, 14],
          alignment: isRtl ? "right" : "left",
        },
        {
          table: {
            headerRows: 1,
            widths: ["auto", "*", "auto", "*", "auto", "auto", "auto"],
            body: tableBody,
          },
          layout: {
            fillColor: (rowIndex: number) =>
              rowIndex === 0 ? "#0f172a" : null,
            hLineColor: () => "#e2e8f0",
            vLineColor: () => "#e2e8f0",
            paddingLeft: () => 6,
            paddingRight: () => 6,
            paddingTop: () => 4,
            paddingBottom: () => 4,
          },
        },
      ],
      styles: {
        title: { fontSize: 16, bold: true, color: "#f59e0b" },
        tableHeader: { fontSize: 9, bold: true, color: "#ffffff" },
      },
    };

    const pdf = pdfMake.createPdf(docDefinition);
    const base64 = await pdf.getBase64();

    if (!base64 || base64.length < 100) {
      throw new Error("PDF generation returned empty or invalid data");
    }

    logPdfInfo("PDF generated successfully", {
      locale,
      bookingCount: bookings.length,
      base64Length: base64.length,
    });

    return {
      success: true,
      data: base64,
      filename: `dry-touch-bookings-${Date.now()}.pdf`,
    };
  } catch (error) {
    logPdfError("PDF generation failed", error, { locale, filters });
    return {
      success: false,
      error: error instanceof Error ? error.message : "PDF generation failed",
    };
  }
}
