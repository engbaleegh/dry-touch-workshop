"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { createBookingAction, updateBookingAction } from "@/actions/bookings";
import { fetchAvailableSlots } from "@/actions/bookings";
import type { ActionState } from "@/actions/auth";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { Button } from "../ui/button";
import { useLocale } from "../providers/locale-provider";
import { getStatusLabel } from "@/i18n";
import { BOOKING_STATUSES } from "@/lib/constants";
import type { Booking, Service } from "@prisma/client";
import { format } from "date-fns";

const initialState: ActionState = {};

interface BookingFormProps {
  booking?: Booking;
  services: Service[];
}

export function BookingForm({ booking, services }: BookingFormProps) {
  const { dict, locale } = useLocale();
  const isEdit = !!booking;

  const action = isEdit
    ? updateBookingAction.bind(null, booking.id)
    : createBookingAction;

  const [state, formAction, pending] = useActionState(action, initialState);

  const initialService =
    services.find((s) => s.id === booking?.serviceId) ?? services[0];

  const [serviceId, setServiceId] = useState(initialService?.id ?? "");
  const [bookingDate, setBookingDate] = useState(
    booking
      ? format(new Date(booking.bookingDate), "yyyy-MM-dd")
      : format(new Date(), "yyyy-MM-dd")
  );
  const [duration, setDuration] = useState(
    booking?.estimatedDuration ?? initialService?.estimatedDuration ?? 60
  );
  const [description, setDescription] = useState(
    booking?.serviceDescription ?? initialService?.description ?? ""
  );
  const [bookingTime, setBookingTime] = useState(booking?.bookingTime ?? "");
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, startSlotTransition] = useTransition();

  useEffect(() => {
    if (!bookingDate || duration < 15) return;

    startSlotTransition(async () => {
      const available = await fetchAvailableSlots(
        bookingDate,
        duration,
        booking?.id
      );
      setSlots(available);
      if (available.length && !available.includes(bookingTime)) {
        setBookingTime(available[0]);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- bookingTime is updated by this effect
  }, [bookingDate, duration, booking?.id]);

  const handleServiceChange = (id: string) => {
    setServiceId(id);
    const service = services.find((s) => s.id === id);
    if (service) {
      setDuration(service.estimatedDuration);
      if (service.description) setDescription(service.description);
    }
  };

  const statusOptions = BOOKING_STATUSES.map((s) => ({
    value: s,
    label: getStatusLabel(dict, s),
  }));

  const serviceOptions = services.map((s) => ({
    value: s.id,
    label: locale === "ar" ? s.nameAr : s.nameEn,
  }));

  return (
    <form action={formAction} className="space-y-6">
      {state.error === "slotConflict" && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {dict.bookings.slotConflict}
        </div>
      )}
      {state.error === "validation" && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {dict.common.error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          name="customerName"
          label={dict.bookings.customerName}
          defaultValue={booking?.customerName}
          required
        />
        <Input
          name="phone"
          label={dict.bookings.phone}
          defaultValue={booking?.phone}
          required
        />
        <Input
          name="plateNumber"
          label={dict.bookings.plateNumber}
          defaultValue={booking?.plateNumber}
          required
        />
        <Input
          name="vehicleMake"
          label={dict.bookings.vehicleMake}
          defaultValue={booking?.vehicleMake}
          required
        />
        <Input
          name="vehicleModel"
          label={dict.bookings.vehicleModel}
          defaultValue={booking?.vehicleModel}
          required
        />
        <Input
          name="vehicleYear"
          type="number"
          label={dict.bookings.vehicleYear}
          defaultValue={booking?.vehicleYear}
          required
        />
        <Select
          name="serviceId"
          label={dict.bookings.service}
          value={serviceId}
          onChange={(e) => handleServiceChange(e.target.value)}
          options={serviceOptions}
          required
        />
        <Select
          name="status"
          label={dict.bookings.status}
          defaultValue={booking?.status ?? "PENDING"}
          options={statusOptions}
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          {dict.bookings.serviceDescription}
        </label>
        <textarea
          name="serviceDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Input
          name="bookingDate"
          type="date"
          label={dict.bookings.bookingDate}
          value={bookingDate}
          onChange={(e) => setBookingDate(e.target.value)}
          required
        />
        <Input
          name="estimatedDuration"
          type="number"
          label={dict.bookings.estimatedDuration}
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          min={15}
          max={480}
          step={15}
          required
        />
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">
            {dict.bookings.bookingTime}
          </label>
          <select
            name="bookingTime"
            value={bookingTime}
            onChange={(e) => setBookingTime(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">{dict.bookings.selectSlot}</option>
            {slots.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
          {loadingSlots && (
            <p className="text-xs text-slate-500">{dict.common.loading}</p>
          )}
          {!loadingSlots && slots.length > 0 && (
            <p className="text-xs text-emerald-600">
              {dict.bookings.availableSlots}: {slots.length}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          {dict.bookings.notes}
        </label>
        <textarea
          name="notes"
          defaultValue={booking?.notes ?? ""}
          rows={2}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" loading={pending}>
          {dict.bookings.save}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
        >
          {dict.bookings.cancel}
        </Button>
      </div>
    </form>
  );
}
