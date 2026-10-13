"use client";

import Link from "next/link";
import { useActionState } from "react";
import { register } from "../../actions";
import { Field, FormMessage, SubmitButton } from "@/components/store/form-bits";

export function RegisterForm({ next }: { next: string }) {
  const [state, action] = useActionState(register, undefined);
  const fe = state?.fieldErrors ?? {};
  return (
    <>
      <p className="eyebrow text-muted">Join CLASSICCC</p>
      <h1 className="mt-2 font-display text-3xl md:text-4xl font-semibold">Create an account</h1>
      <form action={action} className="mt-8 space-y-4">
        <input type="hidden" name="next" value={next} />
        <FormMessage state={state} />
        <Field name="name" label="Full name" autoComplete="name" required error={fe.name} />
        <Field name="email" label="Email" type="email" autoComplete="email" required error={fe.email} />
        <Field name="phone" label="Phone (optional)" type="tel" autoComplete="tel" error={fe.phone} />
        <Field name="password" label="Password" type="password" autoComplete="new-password" required minLength={8} error={fe.password} />
        <p className="text-xs text-muted -mt-2">At least 8 characters, including a letter and a number.</p>
        <SubmitButton className="w-full !py-4" pendingText="Creating account…">Create account</SubmitButton>
      </form>
      <p className="mt-6 text-sm text-muted text-center">
        Already have an account? <Link href="/account/login" className="text-ink underline">Log in</Link>
      </p>
    </>
  );
}
