import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getServices } from "@/actions/services";
import { getLocale } from "@/lib/auth";
import { getDictionary } from "@/i18n";
import { ServicesTable } from "@/components/services/services-table";
import { Button } from "@/components/ui/button";

export default async function ServicesPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/dashboard/forbidden");
  }

  const services = await getServices();
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <div className="w-full max-w-full space-y-4 sm:space-y-6">
      <div className="flex justify-end">
        <Link href="/dashboard/services/new">
          <Button>
            <Plus className="h-4 w-4" />
            {dict.services.new}
          </Button>
        </Link>
      </div>
      <ServicesTable services={services} />
    </div>
  );
}
