import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { ServiceForm } from "@/components/services/service-form";

export default async function NewServicePage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/dashboard/forbidden");
  }

  return (
    <Card>
      <ServiceForm />
    </Card>
  );
}
