"use client";

import { useActionState } from "react";
import { createUserAction, updateUserAction } from "@/actions/users";
import type { ActionState } from "@/actions/auth";
import { Input } from "../ui/input";
import { Select } from "../ui/select";
import { Button } from "../ui/button";
import { useLocale } from "../providers/locale-provider";

const initialState: ActionState = {};

interface UserFormProps {
  user?: {
    id: string;
    username: string;
    role: "ADMIN" | "STAFF";
    isActive: boolean;
  };
}

export function UserForm({ user }: UserFormProps) {
  const { dict } = useLocale();
  const isEdit = !!user;

  const action = isEdit
    ? updateUserAction.bind(null, user.id)
    : createUserAction;

  const [state, formAction, pending] = useActionState(action, initialState);

  const roleOptions = [
    { value: "ADMIN", label: dict.users.roleAdmin },
    { value: "STAFF", label: dict.users.roleStaff },
  ];

  const statusOptions = [
    { value: "true", label: dict.users.active },
    { value: "false", label: dict.users.inactive },
  ];

  const errorMessages: Record<string, string> = {
    validation: dict.common.error,
    exists: dict.users.usernameExists,
    self: dict.users.cannotDeactivateSelf,
    last: dict.users.cannotDeleteLast,
  };

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessages[state.error] ?? dict.common.error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          name="username"
          label={dict.users.username}
          defaultValue={user?.username}
          required
          autoComplete="off"
        />
        <Select
          name="role"
          label={dict.users.role}
          defaultValue={user?.role ?? "STAFF"}
          options={roleOptions}
          required
        />
        <Select
          name="isActive"
          label={dict.users.status}
          defaultValue={user?.isActive === false ? "false" : "true"}
          options={statusOptions}
          required
        />
        <Input
          name="password"
          type="password"
          label={
            isEdit ? dict.users.newPasswordOptional : dict.users.password
          }
          required={!isEdit}
          autoComplete="new-password"
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" loading={pending}>
          {dict.users.save}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
        >
          {dict.users.cancel}
        </Button>
      </div>
    </form>
  );
}
