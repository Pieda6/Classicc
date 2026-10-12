"use client";

import { useActionState } from "react";
import { sendMessage } from "./actions";
import { Field, FormMessage, SubmitButton } from "@/components/store/form-bits";

export function ContactForm() {
  const [state, action] = useActionState(sendMessage, undefined);
  const fe = state?.fieldErrors ?? {};
  return (
    <form action={action} className="mt-6 grid sm:grid-cols-2 gap-4">
      <div className="sm:col-span-2"><FormMessage state={state} /></div>
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <Field name="name" label="Name" autoComplete="name" error={fe.name} />
      <Field name="email" label="Email" type="email" autoComplete="email" error={fe.email} />
      <Field name="subject" label="Subject" error={fe.subject} className="sm:col-span-2" placeholder="Order enquiry, sizing, wholesale…" />
      <div className="sm:col-span-2">
        <label htmlFor="message" className="label">Message</label>
        <textarea id="message" name="message" rows={5} className="field" />
        {fe.message && <p className="text-xs text-danger mt-1">{fe.message}</p>}
      </div>
      <SubmitButton className="sm:col-span-2 !py-4" pendingText="Sending…">Send message</SubmitButton>
    </form>
  );
}
