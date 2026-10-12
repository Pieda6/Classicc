import "server-only";

const API = "https://api.paystack.co";

export function paystackConfigured() {
  return Boolean(process.env.PAYSTACK_SECRET_KEY);
}

/** Simulated payments are only ever allowed outside production when no key is set. */
export function mockPaymentsEnabled() {
  return !paystackConfigured() && process.env.NODE_ENV !== "production";
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.status) {
    throw new Error(json?.message || `Paystack request failed (${res.status})`);
  }
  return json.data as T;
}

export async function initializeTransaction(input: {
  email: string;
  amount: number; // minor units
  reference: string;
  callbackUrl: string;
  currency: string;
  metadata?: Record<string, unknown>;
}) {
  return call<{ authorization_url: string; access_code: string; reference: string }>(
    "/transaction/initialize",
    {
      method: "POST",
      body: JSON.stringify({
        email: input.email,
        amount: input.amount,
        reference: input.reference,
        callback_url: input.callbackUrl,
        currency: input.currency,
        metadata: input.metadata,
      }),
    },
  );
}

export type PaystackTransaction = {
  status: string; // success | failed | abandoned | ...
  reference: string;
  amount: number;
  currency: string;
  channel?: string;
  paid_at?: string;
};

export async function verifyTransaction(reference: string) {
  return call<PaystackTransaction>(`/transaction/verify/${encodeURIComponent(reference)}`);
}

export { isValidWebhookSignature } from "./paystack-signature";
