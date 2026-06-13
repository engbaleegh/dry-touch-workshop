import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { UserForm } from "@/components/users/user-form";

export default async function NewUserPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/dashboard/forbidden");
  }

  return (
    <Card>
      <UserForm />
    </Card>
  );
}
