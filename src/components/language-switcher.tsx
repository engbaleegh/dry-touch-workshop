"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLocaleAction } from "@/actions/auth";
import { useLocale } from "./providers/locale-provider";
import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n";

export function LanguageSwitcher() {
  const { locale, dict } = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const switchLocale = (next: Locale) => {
    startTransition(async () => {
      await setLocaleAction(next);
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs">
      <button
        type="button"
        disabled={pending}
        onClick={() => switchLocale("ar")}
        className={cn(
          "rounded-md px-2.5 py-1 font-medium transition",
          locale === "ar"
            ? "bg-amber-500 text-slate-900"
            : "text-slate-600 hover:text-slate-900"
        )}
      >
        {dict.common.arabic}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => switchLocale("en")}
        className={cn(
          "rounded-md px-2.5 py-1 font-medium transition",
          locale === "en"
            ? "bg-amber-500 text-slate-900"
            : "text-slate-600 hover:text-slate-900"
        )}
      >
        {dict.common.english}
      </button>
    </div>
  );
}
