import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { Booking, Service } from "@prisma/client";

type BookingExport = Booking & { service?: Service | null };
import type { Dictionary } from "@/i18n";
import { getStatusLabel, getCategoryLabel } from "@/i18n";
import { formatDate } from "./utils";

function serviceLabel(
  booking: BookingExport,
  dict: Dictionary,
  locale: string
): string {
  if (booking.service) {
    return locale.startsWith("ar")
      ? booking.service.nameAr
      : booking.service.nameEn;
  }
  return booking.serviceDescription;
}

export function exportBookingsToExcel(
  bookings: BookingExport[],
  dict: Dictionary,
  locale: string
) {
  const rows = bookings.map((b) => ({
    [dict.bookings.bookingNumber]: b.bookingNumber,
    [dict.bookings.customerName]: b.customerName,
    [dict.bookings.phone]: b.phone,
    [dict.bookings.plateNumber]: b.plateNumber,
    [dict.bookings.vehicleMake]: b.vehicleMake,
    [dict.bookings.vehicleModel]: b.vehicleModel,
    [dict.bookings.vehicleYear]: b.vehicleYear,
    [dict.bookings.service]: serviceLabel(b, dict, locale),
    [dict.bookings.serviceDescription]: b.serviceDescription,
    [dict.bookings.bookingDate]: formatDate(b.bookingDate, locale),
    [dict.bookings.bookingTime]: b.bookingTime,
    [dict.bookings.repairDuration]: b.repairDuration ?? "",
    [dict.bookings.estimatedDuration]: b.estimatedDuration,
    [dict.bookings.status]: getStatusLabel(dict, b.status),
    [dict.bookings.notes]: b.notes ?? "",
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");
  XLSX.writeFile(workbook, `dry-touch-bookings-${Date.now()}.xlsx`);
}

export function exportBookingsToPdf(
  bookings: Booking[],
  dict: Dictionary,
  locale: string
) {
  const doc = new jsPDF({ orientation: "landscape" });
  const isRtl = locale.startsWith("ar");

  doc.setFontSize(16);
  doc.text(dict.app.name, 14, 15);
  doc.setFontSize(10);
  doc.text(
    `${dict.bookings.title} - ${new Date().toLocaleDateString(locale)}`,
    14,
    22
  );

  autoTable(doc, {
    startY: 28,
    head: [
      [
        dict.bookings.bookingNumber,
        dict.bookings.customerName,
        dict.bookings.plateNumber,
        dict.bookings.serviceCategory,
        dict.bookings.bookingDate,
        dict.bookings.bookingTime,
        dict.bookings.status,
      ],
    ],
    body: bookings.map((b) => [
      b.bookingNumber,
      b.customerName,
      b.plateNumber,
      getCategoryLabel(dict, b.serviceCategory),
      formatDate(b.bookingDate, locale),
      b.bookingTime,
      getStatusLabel(dict, b.status),
    ]),
    styles: { fontSize: 8, halign: isRtl ? "right" : "left" },
    headStyles: { fillColor: [15, 23, 42] },
  });

  doc.save(`dry-touch-bookings-${Date.now()}.pdf`);
}
