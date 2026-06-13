"use client";

import { useActionState } from "react";
import { loginAction, type ActionState } from "@/actions/auth";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import type { Dictionary } from "@/i18n";

const initialState: ActionState = {};

export function LoginForm({ dict }: { dict: Dictionary }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {dict.auth.invalidCredentials}
        </div>
      )}

      <Input
        id="username"
        name="username"
        label={dict.auth.username}
        required
        autoComplete="username"
      />

      <Input
        id="password"
        name="password"
        type="password"
        label={dict.auth.password}
        required
        autoComplete="current-password"
      />

      <Button type="submit" className="w-full" loading={pending}>
        {dict.auth.loginButton}
      </Button>
    </form>
  );
}
