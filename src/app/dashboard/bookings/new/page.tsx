import { getActiveServices } from "@/actions/services";
import { Card } from "@/components/ui/card";
import { BookingForm } from "@/components/bookings/booking-form";

export default async function NewBookingPage() {
  const services = await getActiveServices();

  return (
    <Card>
      <BookingForm services={services} />
    </Card>
  );
}
