"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn, type SignInState } from "@/lib/domain/admin/actions";
import { ko } from "@/lib/i18n/ko";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<SignInState, FormData>(signIn, {});

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next ?? ""} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">{ko.admin.login.email}</Label>
        <Input id="email" name="email" type="email" autoComplete="username" required className="h-12 rounded-xl" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">{ko.admin.login.password}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-12 rounded-xl"
        />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 h-12 rounded-xl bg-primary text-[15px] font-semibold text-primary-foreground disabled:opacity-60"
      >
        {pending ? "로그인하는 중…" : ko.admin.login.submit}
      </button>
    </form>
  );
}
