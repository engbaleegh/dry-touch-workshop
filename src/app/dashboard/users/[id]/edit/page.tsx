import { notFound, redirect } from "next/navigation";
import { getUserById } from "@/actions/users";
import { requireAdmin } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { UserForm } from "@/components/users/user-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditUserPage({ params }: PageProps) {
  try {
    await requireAdmin();
  } catch {
    redirect("/dashboard/forbidden");
  }

  const { id } = await params;
  const user = await getUserById(id);
  if (!user) notFound();

  return (
    <Card>
      <UserForm user={user} />
    </Card>
  );
}
