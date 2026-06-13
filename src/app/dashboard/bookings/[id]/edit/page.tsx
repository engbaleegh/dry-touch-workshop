import { notFound } from "next/navigation";
import { getBookingById } from "@/actions/bookings";
import { getServicesForBooking } from "@/actions/services";
import { Card } from "@/components/ui/card";
import { BookingForm } from "@/components/bookings/booking-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBookingPage({ params }: PageProps) {
  const { id } = await params;
  const booking = await getBookingById(id);
  if (!booking) notFound();

  const services = await getServicesForBooking(booking.serviceId);

  return (
    <Card>
      <BookingForm booking={booking} services={services} />
    </Card>
  );
}
