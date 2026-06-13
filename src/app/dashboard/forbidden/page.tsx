import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLocale } from "@/lib/auth";
import { getDictionary } from "@/i18n";

export default async function ForbiddenPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 rounded-full bg-amber-50 p-4">
        <ShieldAlert className="h-8 w-8 text-amber-600" />
      </div>
      <h2 className="text-lg font-semibold text-slate-900">
        {dict.security.forbiddenTitle}
      </h2>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        {dict.security.forbiddenMessage}
      </p>
      <Link href="/dashboard" className="mt-6">
        <Button>{dict.security.backToDashboard}</Button>
      </Link>
    </div>
  );
}
