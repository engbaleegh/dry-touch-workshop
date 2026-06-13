"use client";

import { useActionState } from "react";
import {
  createServiceAction,
  updateServiceAction,
} from "@/actions/services";
import type { ActionState } from "@/actions/auth";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { Button } from "../ui/button";
import { useLocale } from "../providers/locale-provider";
import type { Service } from "@prisma/client";

const initialState: ActionState = {};

interface ServiceFormProps {
  service?: Service;
}

export function ServiceForm({ service }: ServiceFormProps) {
  const { dict } = useLocale();
  const isEdit = !!service;

  const action = isEdit
    ? updateServiceAction.bind(null, service.id)
    : createServiceAction;

  const [state, formAction, pending] = useActionState(action, initialState);

  const statusOptions = [
    { value: "true", label: dict.services.active },
    { value: "false", label: dict.services.inactive },
  ];

  return (
    <form action={formAction} className="space-y-6">
      {state.error === "validation" && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {dict.common.error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          name="nameAr"
          label={dict.services.nameAr}
          defaultValue={service?.nameAr}
          required
          dir="rtl"
        />
        <Input
          name="nameEn"
          label={dict.services.nameEn}
          defaultValue={service?.nameEn}
          required
        />
        <Input
          name="estimatedDuration"
          type="number"
          label={dict.services.estimatedDuration}
          defaultValue={service?.estimatedDuration ?? 60}
          min={15}
          max={480}
          step={15}
          required
        />
        <Select
          name="isActive"
          label={dict.services.status}
          defaultValue={service?.isActive === false ? "false" : "true"}
          options={statusOptions}
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          {dict.services.description}
        </label>
        <textarea
          name="description"
          defaultValue={service?.description ?? ""}
          rows={3}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" loading={pending}>
          {dict.services.save}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
        >
          {dict.services.cancel}
        </Button>
      </div>
    </form>
  );
}
