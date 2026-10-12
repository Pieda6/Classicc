"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset } from "../../actions";
import { Field, FormMessage, SubmitButton } from "@/components/store/form-bits";

export default function ForgotPasswordPage() {
  const [state, action] = useActionState(requestPasswordReset, undefined);
  return (
    <>
      <p className="eyebrow text-muted">Account help</p>
      <h1 className="mt-2 font-display text-3xl md:text-4xl font-semibold">Reset your password</h1>
      <p className="mt-3 text-muted text-sm">Enter the email you signed up with and we&apos;ll send you a reset link.</p>
      <form action={action} className="mt-8 space-y-4">
        <FormMessage state={state} />
        <Field name="email" label="Email" type="email" autoComplete="email" required />
        <SubmitButton className="w-full !py-4" pendingText="Sending…">Send reset link</SubmitButton>
      </form>
      <p className="mt-6 text-sm text-center"><Link href="/account/login" className="underline text-muted hover:text-ink">Back to log in</Link></p>
    </>
  );
}
