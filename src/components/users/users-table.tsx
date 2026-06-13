"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Pencil, Power, Trash2, KeyRound } from "lucide-react";
import { toast } from "sonner";
import {
  deleteUserAction,
  resetPasswordAction,
  toggleUserAction,
} from "@/actions/users";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Modal } from "../ui/modal";
import { Input } from "../ui/input";
import { useLocale } from "../providers/locale-provider";
import { getRoleLabel } from "@/i18n";

interface UserRow {
  id: string;
  username: string;
  role: "ADMIN" | "STAFF";
  isActive: boolean;
  createdAt: Date;
}

export function UsersTable({ users }: { users: UserRow[] }) {
  const { dict } = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const handleToggle = (id: string, isActive: boolean) => {
    startTransition(async () => {
      const result = await toggleUserAction(id, !isActive);
      if (result.error === "self") {
        toast.error(dict.users.cannotDeactivateSelf);
        return;
      }
      toast.success(dict.common.success);
      router.refresh();
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm(dict.users.deleteConfirm)) return;
    startTransition(async () => {
      const result = await deleteUserAction(id);
      if (result.error === "self") {
        toast.error(dict.users.cannotDeleteSelf);
        return;
      }
      if (result.error === "last") {
        toast.error(dict.users.cannotDeleteLast);
        return;
      }
      toast.success(dict.users.deleteSuccess);
      router.refresh();
    });
  };

  const handleResetPassword = () => {
    if (!resetUserId || newPassword.length < 6) {
      toast.error(dict.common.error);
      return;
    }
    startTransition(async () => {
      const result = await resetPasswordAction(resetUserId, newPassword);
      if (result.error) {
        toast.error(dict.common.error);
        return;
      }
      toast.success(dict.users.passwordResetSuccess);
      setResetUserId(null);
      setNewPassword("");
      router.refresh();
    });
  };

  if (users.length === 0) {
    return (
      <p className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        {dict.users.noResults}
      </p>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="hidden md:block">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-start font-medium">
                  {dict.users.username}
                </th>
                <th className="px-4 py-3 text-start font-medium">
                  {dict.users.role}
                </th>
                <th className="px-4 py-3 text-start font-medium">
                  {dict.users.status}
                </th>
                <th className="px-4 py-3 text-end font-medium">
                  {dict.users.actions}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium">{user.username}</td>
                  <td className="px-4 py-3">
                    {getRoleLabel(dict, user.role)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      className={
                        user.isActive
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-slate-50 text-slate-600"
                      }
                    >
                      {user.isActive ? dict.users.active : dict.users.inactive}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link href={`/dashboard/users/${user.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setResetUserId(user.id)}
                      >
                        <KeyRound className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggle(user.id, user.isActive)}
                        loading={pending}
                      >
                        <Power className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(user.id)}
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
          {users.map((user) => (
            <div key={user.id} className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">{user.username}</p>
                <Badge
                  className={
                    user.isActive
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-slate-50 text-slate-600"
                  }
                >
                  {user.isActive ? dict.users.active : dict.users.inactive}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/dashboard/users/${user.id}/edit`}
                  className="flex-1"
                >
                  <Button variant="outline" size="sm" className="w-full">
                    <Pencil className="h-4 w-4" />
                    {dict.users.edit}
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setResetUserId(user.id)}
                >
                  <KeyRound className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggle(user.id, user.isActive)}
                  loading={pending}
                >
                  <Power className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(user.id)}
                  loading={pending}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal
        open={!!resetUserId}
        onClose={() => {
          setResetUserId(null);
          setNewPassword("");
        }}
        title={dict.users.resetPassword}
        confirmLabel={dict.users.resetPassword}
        onConfirm={handleResetPassword}
        loading={pending}
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-600">{dict.users.resetPasswordHint}</p>
          <Input
            type="password"
            label={dict.users.newPassword}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={6}
            required
          />
        </div>
      </Modal>
    </>
  );
}
