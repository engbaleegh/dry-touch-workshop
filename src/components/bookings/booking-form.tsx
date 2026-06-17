"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import {
  createBookingAction,
  updateBookingAction,
  fetchAvailableSlots,
  type BookingActionState,
} from "@/actions/bookings";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { Button } from "../ui/button";
import { useLocale } from "../providers/locale-provider";
import { getStatusLabel } from "@/i18n";
import { BOOKING_STATUSES } from "@/lib/constants";
import type { Booking, Service } from "@prisma/client";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const initialState: BookingActionState = {};

interface BookingFormProps {
  booking?: Booking;
  services: Service[];
}

function bookingToValues(
  booking: Booking | undefined,
  services: Service[]
): Record<string, string> {
  const initialService =
    services.find((s) => s.id === booking?.serviceId) ?? null;

  return {
    customerName: booking?.customerName ?? "",
    phone: booking?.phone ?? "",
    plateNumber: booking?.plateNumber ?? "",
    vehicleMake: booking?.vehicleMake ?? "",
    vehicleModel: booking?.vehicleModel ?? "",
    vehicleYear: booking?.vehicleYear ? String(booking.vehicleYear) : "",
    serviceId: booking?.serviceId ?? initialService?.id ?? "",
    status: booking?.status ?? "PENDING",
    serviceDescription:
      booking?.serviceDescription ?? initialService?.description ?? "",
    bookingDate: booking
      ? format(new Date(booking.bookingDate), "yyyy-MM-dd")
      : "",
    bookingTime: booking?.bookingTime ?? "",
    repairDuration: booking?.repairDuration ?? "",
    notes: booking?.notes ?? "",
    estimatedDuration: String(
      booking?.estimatedDuration ?? initialService?.estimatedDuration ?? 60
    ),
  };
}

export function BookingForm({ booking, services }: BookingFormProps) {
  const { dict, locale } = useLocale();
  const isEdit = !!booking;

  const action = isEdit
    ? updateBookingAction.bind(null, booking.id)
    : createBookingAction;

  const [state, formAction, pending] = useActionState(action, initialState);

  const defaults = bookingToValues(booking, services);

  const [customerName, setCustomerName] = useState(defaults.customerName);
  const [phone, setPhone] = useState(defaults.phone);
  const [plateNumber, setPlateNumber] = useState(defaults.plateNumber);
  const [vehicleMake, setVehicleMake] = useState(defaults.vehicleMake);
  const [vehicleModel, setVehicleModel] = useState(defaults.vehicleModel);
  const [vehicleYear, setVehicleYear] = useState(defaults.vehicleYear);
  const [serviceId, setServiceId] = useState(defaults.serviceId);
  const [status, setStatus] = useState(defaults.status);
  const [description, setDescription] = useState(defaults.serviceDescription);
  const [bookingDate, setBookingDate] = useState(defaults.bookingDate);
  const [bookingTime, setBookingTime] = useState(defaults.bookingTime);
  const [repairDuration, setRepairDuration] = useState(defaults.repairDuration);
  const [notes, setNotes] = useState(defaults.notes);
  const [slotDuration, setSlotDuration] = useState(
    Number(defaults.estimatedDuration)
  );
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, startSlotTransition] = useTransition();

  useEffect(() => {
    if (!state.values) return;

    const v = state.values;
    if (v.customerName !== undefined) setCustomerName(v.customerName);
    if (v.phone !== undefined) setPhone(v.phone);
    if (v.plateNumber !== undefined) setPlateNumber(v.plateNumber);
    if (v.vehicleMake !== undefined) setVehicleMake(v.vehicleMake);
    if (v.vehicleModel !== undefined) setVehicleModel(v.vehicleModel);
    if (v.vehicleYear !== undefined) setVehicleYear(v.vehicleYear);
    if (v.serviceId !== undefined) setServiceId(v.serviceId);
    if (v.status !== undefined) setStatus(v.status);
    if (v.serviceDescription !== undefined) setDescription(v.serviceDescription);
    if (v.bookingDate !== undefined) setBookingDate(v.bookingDate);
    if (v.bookingTime !== undefined) setBookingTime(v.bookingTime);
    if (v.repairDuration !== undefined) setRepairDuration(v.repairDuration);
    if (v.notes !== undefined) setNotes(v.notes);
    if (v.estimatedDuration !== undefined) {
      setSlotDuration(Number(v.estimatedDuration) || 60);
    }
  }, [state.values]);

  useEffect(() => {
    if (!bookingDate.trim() || slotDuration < 15) {
      setSlots([]);
      return;
    }

    startSlotTransition(async () => {
      const available = await fetchAvailableSlots(
        bookingDate,
        slotDuration,
        booking?.id
      );
      setSlots(available);
    });
  }, [bookingDate, slotDuration, booking?.id]);

  const validation = dict.bookings.validation;

  const fieldError = (field: string) => {
    const key = state.fieldErrors?.[field];
    if (!key) return undefined;
    return validation[key as keyof typeof validation] ?? key;
  };

  const handleServiceChange = (id: string) => {
    setServiceId(id);
    const service = services.find((s) => s.id === id);
    if (service) {
      setSlotDuration(service.estimatedDuration);
      if (service.description) setDescription(service.description);
    }
  };

  const statusOptions = BOOKING_STATUSES.map((s) => ({
    value: s,
    label: getStatusLabel(dict, s),
  }));

  const serviceOptions = [
    { value: "", label: dict.bookings.noService },
    ...services.map((s) => ({
      value: s.id,
      label: locale === "ar" ? s.nameAr : s.nameEn,
    })),
  ];

  const textareaClass = (field: string) =>
    cn(
      "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20",
      fieldError(field) && "border-red-400 focus:border-red-500 focus:ring-red-500/20"
    );

  return (
    <form action={formAction} className="space-y-6" noValidate>
      <input type="hidden" name="estimatedDuration" value={slotDuration} />

      {state.error === "slotConflict" && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {dict.bookings.slotConflict}
        </div>
      )}
      {state.error === "saveFailed" && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {dict.bookings.saveFailed}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          name="customerName"
          label={dict.bookings.customerName}
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          error={fieldError("customerName")}
        />
        <Input
          name="phone"
          label={dict.bookings.phone}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={fieldError("phone")}
        />
        <Input
          name="plateNumber"
          label={dict.bookings.plateNumber}
          value={plateNumber}
          onChange={(e) => setPlateNumber(e.target.value)}
          error={fieldError("plateNumber")}
        />
        <Input
          name="vehicleMake"
          label={dict.bookings.vehicleMake}
          value={vehicleMake}
          onChange={(e) => setVehicleMake(e.target.value)}
          error={fieldError("vehicleMake")}
        />
        <Input
          name="vehicleModel"
          label={dict.bookings.vehicleModel}
          value={vehicleModel}
          onChange={(e) => setVehicleModel(e.target.value)}
          error={fieldError("vehicleModel")}
        />
        <Input
          name="vehicleYear"
          type="number"
          label={dict.bookings.vehicleYear}
          value={vehicleYear}
          onChange={(e) => setVehicleYear(e.target.value)}
          error={fieldError("vehicleYear")}
        />
        <Select
          name="serviceId"
          label={dict.bookings.service}
          value={serviceId}
          onChange={(e) => handleServiceChange(e.target.value)}
          options={serviceOptions}
          error={fieldError("serviceId")}
        />
        <Select
          name="status"
          label={dict.bookings.status}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={statusOptions}
          error={fieldError("status")}
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
          rows={3}
          className={textareaClass("serviceDescription")}
        />
        {fieldError("serviceDescription") && (
          <p className="mt-1 text-xs font-medium text-red-600">
            {fieldError("serviceDescription")}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Input
          name="bookingDate"
          type="date"
          label={dict.bookings.bookingDate}
          value={bookingDate}
          onChange={(e) => setBookingDate(e.target.value)}
          error={fieldError("bookingDate")}
        />
        <Input
          name="repairDuration"
          label={dict.bookings.repairDuration}
          value={repairDuration}
          onChange={(e) => setRepairDuration(e.target.value)}
          error={fieldError("repairDuration")}
          placeholder={dict.bookings.repairDurationPlaceholder}
        />
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700">
            {dict.bookings.bookingTime}
          </label>
          <select
            name="bookingTime"
            value={bookingTime}
            onChange={(e) => setBookingTime(e.target.value)}
            className={cn(
              "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm",
              fieldError("bookingTime") &&
                "border-red-400 focus:border-red-500 focus:ring-red-500/20"
            )}
          >
            <option value="">{dict.bookings.selectSlot}</option>
            {slots.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
            {bookingTime &&
              !slots.includes(bookingTime) &&
              /^\d{2}:\d{2}$/.test(bookingTime) && (
                <option value={bookingTime}>{bookingTime}</option>
              )}
          </select>
          {fieldError("bookingTime") && (
            <p className="text-xs font-medium text-red-600">
              {fieldError("bookingTime")}
            </p>
          )}
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
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className={textareaClass("notes")}
        />
        {fieldError("notes") && (
          <p className="mt-1 text-xs font-medium text-red-600">
            {fieldError("notes")}
          </p>
        )}
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
