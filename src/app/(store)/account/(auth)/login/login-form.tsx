"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login } from "../../actions";
import { Field, FormMessage, SubmitButton } from "@/components/store/form-bits";

export function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState(login, undefined);
  return (
    <>
      <p className="eyebrow text-muted">Welcome back</p>
      <h1 className="mt-2 font-display text-3xl md:text-4xl font-semibold">Log in</h1>
      <form action={action} className="mt-8 space-y-4">
        <input type="hidden" name="next" value={next} />
        <FormMessage state={state} />
        <Field name="email" label="Email" type="email" autoComplete="email" required />
        <Field name="password" label="Password" type="password" autoComplete="current-password" required />
        <div className="text-right">
          <Link href="/account/forgot-password" className="text-sm underline text-muted hover:text-ink">Forgot password?</Link>
        </div>
        <SubmitButton className="w-full !py-4" pendingText="Logging in…">Log in</SubmitButton>
      </form>
      <p className="mt-6 text-sm text-muted text-center">
        New to CLASSICCC? <Link href={`/account/register${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="text-ink underline">Create an account</Link>
      </p>
    </>
  );
}
