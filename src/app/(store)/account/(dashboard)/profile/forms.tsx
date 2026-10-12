"use client";

import { useActionState } from "react";
import { changePassword, updateProfile } from "../../actions";
import { Field, FormMessage, SubmitButton } from "@/components/store/form-bits";

export function ProfileForm({ name, phone }: { name: string; phone: string }) {
  const [state, action] = useActionState(updateProfile, undefined);
  return (
    <form action={action} className="mt-6 space-y-4">
      <FormMessage state={state} />
      <Field name="name" label="Full name" defaultValue={name} error={state?.fieldErrors?.name} />
      <Field name="phone" label="Phone" type="tel" defaultValue={phone} error={state?.fieldErrors?.phone} />
      <SubmitButton pendingText="Saving…">Save profile</SubmitButton>
    </form>
  );
}

export function PasswordForm() {
  const [state, action] = useActionState(changePassword, undefined);
  return (
    <form action={action} className="mt-6 space-y-4">
      <FormMessage state={state} />
      <Field name="current" label="Current password" type="password" autoComplete="current-password" error={state?.fieldErrors?.current} />
      <Field name="password" label="New password" type="password" autoComplete="new-password" error={state?.fieldErrors?.password} />
      <SubmitButton pendingText="Updating…">Update password</SubmitButton>
    </form>
  );
}
