"use client";

import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

export function SubmitButton({ children, pendingText, className }: { children: React.ReactNode; pendingText?: string; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className={cn("btn btn-dark", className)}>
      {pending ? pendingText ?? "Please wait…" : children}
    </button>
  );
}

export function Field({
  name,
  label,
  error,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { name: string; label: string; error?: string }) {
  return (
    <div className={className}>
      <label htmlFor={name} className="label">{label}</label>
      <input id={name} name={name} {...props} className={cn("field", error && "!border-danger")} aria-invalid={Boolean(error)} />
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
}

export function FormMessage({ state }: { state?: { error?: string; success?: string } }) {
  if (!state?.error && !state?.success) return null;
  return (
    <p
      role={state.error ? "alert" : "status"}
      className={cn("rounded-xl px-4 py-3 text-sm", state.error ? "bg-danger/10 text-danger" : "bg-success/10 text-success")}
    >
      {state.error ?? state.success}
    </p>
  );
}
