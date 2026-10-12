"use client";

import { useState, useTransition } from "react";
import { retryPayment } from "../actions";

export function RetryPayment({ reference }: { reference: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="mt-6">
      <button
        className="btn btn-dark"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await retryPayment(reference);
            if (res.ok) window.location.href = res.redirectUrl;
            else setError(res.error);
          })
        }
      >
        {pending ? "Redirecting…" : "Complete payment"}
      </button>
      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
    </div>
  );
}
