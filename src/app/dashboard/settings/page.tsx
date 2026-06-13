import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getLocale } from "@/lib/auth";
import { getDictionary } from "@/i18n";
import { Card } from "@/components/ui/card";

export default async function SettingsPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/dashboard/forbidden");
  }

  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <div className="space-y-6">
      <Card title={dict.settings.title}>
        <div className="space-y-4 text-sm text-slate-600">
          <p>{dict.settings.description}</p>
          <ul className="list-inside list-disc space-y-2">
            <li>{dict.settings.itemUsers}</li>
            <li>{dict.settings.itemServices}</li>
            <li>{dict.settings.itemSecurity}</li>
          </ul>
        </div>
      </Card>

      <Card title={dict.settings.securityTitle}>
        <p className="text-sm text-slate-600">{dict.settings.securityNote}</p>
      </Card>
    </div>
  );
}
