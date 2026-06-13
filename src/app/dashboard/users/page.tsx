import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getUsers } from "@/actions/users";
import { getLocale } from "@/lib/auth";
import { getDictionary } from "@/i18n";
import { UsersTable } from "@/components/users/users-table";
import { Button } from "@/components/ui/button";

export default async function UsersPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/dashboard/forbidden");
  }

  const users = await getUsers();
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <div className="w-full max-w-full space-y-4 sm:space-y-6">
      <div className="flex justify-end">
        <Link href="/dashboard/users/new">
          <Button>
            <Plus className="h-4 w-4" />
            {dict.users.new}
          </Button>
        </Link>
      </div>
      <UsersTable users={users} />
    </div>
  );
}
