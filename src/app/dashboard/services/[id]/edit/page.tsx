import { notFound, redirect } from "next/navigation";
import { getServiceById } from "@/actions/services";
import { requireAdmin } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { ServiceForm } from "@/components/services/service-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditServicePage({ params }: PageProps) {
  try {
    await requireAdmin();
  } catch {
    redirect("/dashboard/forbidden");
  }

  const { id } = await params;
  const service = await getServiceById(id);
  if (!service) notFound();

  return (
    <Card>
      <ServiceForm service={service} />
    </Card>
  );
}
