"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useActionState } from "react";
import { resetPassword } from "../../actions";
import { Field, FormMessage, SubmitButton } from "@/components/store/form-bits";

function ResetForm() {
  const token = useSearchParams().get("token") ?? "";
  const [state, action] = useActionState(resetPassword, undefined);
  const fe = state?.fieldErrors ?? {};
  if (!token) {
    return (
      <>
        <h1 className="font-display text-3xl font-semibold">Invalid link</h1>
        <p className="mt-3 text-muted">This reset link is missing its token.</p>
        <Link href="/account/forgot-password" className="btn btn-dark mt-6 self-start">Request a new link</Link>
      </>
    );
  }
  return (
    <>
      <p className="eyebrow text-muted">Account help</p>
      <h1 className="mt-2 font-display text-3xl md:text-4xl font-semibold">Choose a new password</h1>
      <form action={action} className="mt-8 space-y-4">
        <input type="hidden" name="token" value={token} />
        <FormMessage state={state} />
        <Field name="password" label="New password" type="password" autoComplete="new-password" required error={fe.password} />
        <Field name="confirm" label="Confirm password" type="password" autoComplete="new-password" required error={fe.confirm} />
        <SubmitButton className="w-full !py-4" pendingText="Saving…">Save password</SubmitButton>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}
