"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Pencil, Power, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteServiceAction, toggleServiceAction } from "@/actions/services";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useLocale } from "../providers/locale-provider";
import type { Service } from "@prisma/client";

export function ServicesTable({ services }: { services: Service[] }) {
  const { dict } = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleToggle = (id: string, isActive: boolean) => {
    startTransition(async () => {
      await toggleServiceAction(id, !isActive);
      toast.success(dict.common.success);
      router.refresh();
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm(dict.services.deleteConfirm)) return;
    startTransition(async () => {
      await deleteServiceAction(id);
      toast.success(dict.services.deleteSuccess);
      router.refresh();
    });
  };

  if (services.length === 0) {
    return (
      <p className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        {dict.services.noResults}
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="hidden md:block">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 text-start font-medium">
                {dict.services.nameAr}
              </th>
              <th className="px-4 py-3 text-start font-medium">
                {dict.services.nameEn}
              </th>
              <th className="px-4 py-3 text-start font-medium">
                {dict.services.estimatedDuration}
              </th>
              <th className="px-4 py-3 text-start font-medium">
                {dict.services.status}
              </th>
              <th className="px-4 py-3 text-end font-medium">
                {dict.services.actions}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {services.map((service) => (
              <tr key={service.id} className="hover:bg-slate-50/50">
                <td className="px-4 py-3" dir="rtl">
                  {service.nameAr}
                </td>
                <td className="px-4 py-3">{service.nameEn}</td>
                <td className="px-4 py-3">
                  {service.estimatedDuration} {dict.common.minutes}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    className={
                      service.isActive
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-slate-50 text-slate-600"
                    }
                  >
                    {service.isActive
                      ? dict.services.active
                      : dict.services.inactive}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link href={`/dashboard/services/${service.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleToggle(service.id, service.isActive)
                      }
                      loading={pending}
                    >
                      <Power className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(service.id)}
                      loading={pending}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-slate-100 md:hidden">
        {services.map((service) => (
          <div key={service.id} className="space-y-3 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium" dir="rtl">
                  {service.nameAr}
                </p>
                <p className="text-sm text-slate-500">{service.nameEn}</p>
              </div>
              <Badge
                className={
                  service.isActive
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-slate-50 text-slate-600"
                }
              >
                {service.isActive ? dict.services.active : dict.services.inactive}
              </Badge>
            </div>
            <p className="text-sm text-slate-600">
              {service.estimatedDuration} {dict.common.minutes}
            </p>
            <div className="flex gap-2">
              <Link
                href={`/dashboard/services/${service.id}/edit`}
                className="flex-1"
              >
                <Button variant="outline" size="sm" className="w-full">
                  <Pencil className="h-4 w-4" />
                  {dict.services.edit}
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggle(service.id, service.isActive)}
                loading={pending}
              >
                <Power className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(service.id)}
                loading={pending}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
