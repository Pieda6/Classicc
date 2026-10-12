"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Lock, ShieldCheck } from "lucide-react";
import { useCart } from "@/components/store/cart-context";
import { formatMoney } from "@/lib/money";
import { deliveryFeeFor } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { placeOrder } from "./actions";

type Zone = { id: string; name: string; fee: number; eta: string };
type Address = { id: string; label: string; fullName: string; phone: string; line1: string; line2: string; city: string; state: string; zoneId: string };

export function CheckoutForm({
  user,
  zones,
  addresses,
  freeThreshold,
  paymentMode,
}: {
  user: { email: string; name: string; phone: string | null } | null;
  zones: Zone[];
  addresses: Address[];
  freeThreshold: number;
  paymentMode: "live" | "test" | "off";
}) {
  const { lines, ready, subtotal } = useCart();
  const initial = addresses[0];
  const [form, setForm] = useState({
    email: user?.email ?? "",
    fullName: initial?.fullName ?? user?.name ?? "",
    phone: initial?.phone ?? user?.phone ?? "",
    line1: initial?.line1 ?? "",
    line2: initial?.line2 ?? "",
    city: initial?.city ?? "",
    state: initial?.state ?? "",
    zoneId: initial?.zoneId && zones.some((z) => z.id === initial.zoneId) ? initial.zoneId : "",
    notes: "",
  });
  const [saveAddress, setSaveAddress] = useState(addresses.length === 0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const zone = zones.find((z) => z.id === form.zoneId);
  const deliveryFee = zone ? deliveryFeeFor(subtotal, zone.fee, freeThreshold) : 0;
  const total = subtotal + deliveryFee;

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  function applyAddress(a: Address) {
    setForm((f) => ({ ...f, fullName: a.fullName, phone: a.phone, line1: a.line1, line2: a.line2, city: a.city, state: a.state, zoneId: a.zoneId || f.zoneId }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setErrors({});
    startTransition(async () => {
      const res = await placeOrder({
        ...form,
        saveAddress: Boolean(user) && saveAddress,
        items: lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity })),
      });
      if (res.ok) {
        window.location.href = res.redirectUrl;
      } else {
        setError(res.error);
        setErrors(res.fieldErrors ?? {});
      }
    });
  }

  if (ready && lines.length === 0) {
    return (
      <div className="container-x pt-10">
        <div className="card p-12 text-center max-w-xl mx-auto">
          <p className="font-display text-2xl font-semibold">Your cart is empty</p>
          <p className="text-muted mt-2">Add something you love before checking out.</p>
          <Link href="/shop" className="btn btn-dark mt-6">Go to shop</Link>
        </div>
      </div>
    );
  }

  const field = (k: keyof typeof form, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div className={props.className}>
      <label htmlFor={k} className="label">{label}</label>
      <input id={k} name={k} value={form[k]} onChange={set(k)} {...props} className={cn("field", errors[k] && "!border-danger")} aria-invalid={Boolean(errors[k])} />
      {errors[k] && <p className="text-xs text-danger mt-1">{errors[k]}</p>}
    </div>
  );

  return (
    <div className="container-x pt-6 md:pt-10">
      <h1 className="font-display text-4xl md:text-5xl font-semibold">Checkout</h1>
      {!user && (
        <p className="mt-3 text-sm text-muted">
          Have an account? <Link href="/account/login?next=/checkout" className="text-ink underline">Log in</Link> for faster checkout and order tracking.
        </p>
      )}

      <form onSubmit={submit} className="mt-8 grid lg:grid-cols-[1fr_400px] gap-6 items-start" noValidate>
        <div className="space-y-4">
          <section className="card p-6 md:p-8">
            <h2 className="font-display text-xl font-semibold">1. Contact</h2>
            <div className="mt-5 grid sm:grid-cols-2 gap-4">
              {field("email", "Email address", { type: "email", autoComplete: "email", required: true, className: "sm:col-span-2" })}
              {field("fullName", "Full name", { autoComplete: "name", required: true })}
              {field("phone", "Phone number", { type: "tel", autoComplete: "tel", required: true })}
            </div>
          </section>

          <section className="card p-6 md:p-8">
            <h2 className="font-display text-xl font-semibold">2. Delivery</h2>
            {addresses.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {addresses.map((a) => (
                  <button type="button" key={a.id} onClick={() => applyAddress(a)} className="chip text-left">
                    {a.label}: {a.line1}, {a.city}
                  </button>
                ))}
              </div>
            )}
            <div className="mt-5 grid sm:grid-cols-2 gap-4">
              {field("line1", "Street address", { autoComplete: "address-line1", required: true, className: "sm:col-span-2" })}
              {field("line2", "Apartment, landmark (optional)", { autoComplete: "address-line2", className: "sm:col-span-2" })}
              {field("city", "City / Town", { autoComplete: "address-level2", required: true })}
              {field("state", "State", { autoComplete: "address-level1", required: true })}
            </div>

            <fieldset className="mt-6">
              <legend className="label mb-3">Delivery location</legend>
              <div className="grid sm:grid-cols-2 gap-2">
                {zones.map((z) => {
                  const fee = deliveryFeeFor(subtotal, z.fee, freeThreshold);
                  return (
                    <label
                      key={z.id}
                      className={cn(
                        "flex items-start gap-3 rounded-2xl border p-4 cursor-pointer transition-colors",
                        form.zoneId === z.id ? "border-ink bg-bg" : "border-line hover:border-ink/40",
                      )}
                    >
                      <input type="radio" name="zoneId" value={z.id} checked={form.zoneId === z.id} onChange={set("zoneId")} className="mt-1 accent-ink" />
                      <span className="flex-1">
                        <span className="flex justify-between gap-2 text-sm font-medium">
                          {z.name}
                          <span>{fee === 0 ? "Free" : formatMoney(fee)}</span>
                        </span>
                        <span className="block text-xs text-muted mt-0.5">{z.eta}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
              {errors.zoneId && <p className="text-xs text-danger mt-2">{errors.zoneId}</p>}
            </fieldset>

            <div className="mt-6">
              <label htmlFor="notes" className="label">Delivery notes (optional)</label>
              <textarea id="notes" value={form.notes} onChange={set("notes")} rows={3} className="field" placeholder="Gate code, best time to call…" />
            </div>
            {user && (
              <label className="mt-4 flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} className="accent-ink" />
                Save this address to my account
              </label>
            )}
          </section>

          <section className="card p-6 md:p-8">
            <h2 className="font-display text-xl font-semibold">3. Payment</h2>
            <div className="mt-5 rounded-2xl border border-line p-5 flex items-start gap-4">
              <ShieldCheck size={26} strokeWidth={1.5} className="shrink-0" />
              <div className="text-sm">
                <p className="font-medium">Pay securely with Paystack</p>
                <p className="text-muted mt-1">Card, bank transfer, USSD or mobile money. You&apos;ll be redirected to Paystack to complete payment.</p>
                {paymentMode === "test" && (
                  <p className="mt-3 rounded-xl bg-butter px-3 py-2 text-xs">
                    <strong>Test mode:</strong> Paystack keys aren&apos;t configured, so payment will be simulated (development only).
                  </p>
                )}
                {paymentMode === "off" && <p className="mt-3 text-danger text-xs">Online payment is temporarily unavailable.</p>}
              </div>
            </div>
          </section>
        </div>

        <aside className="card p-6 md:p-8 lg:sticky lg:top-28">
          <h2 className="font-display text-xl font-semibold">Order summary</h2>
          <ul className="mt-5 space-y-4 max-h-80 overflow-y-auto pr-1">
            {lines.map((l) => (
              <li key={l.variantId} className="flex gap-3">
                <div className="relative w-16 shrink-0 aspect-[4/5] rounded-xl overflow-hidden bg-stone">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {l.image && <img src={l.image} alt="" className="size-full object-cover" />}
                  <span className="absolute -top-0 -right-0 size-5 rounded-full bg-ink text-paper text-[0.65rem] grid place-items-center">{l.quantity}</span>
                </div>
                <div className="flex-1 min-w-0 text-sm">
                  <p className="font-medium line-clamp-1">{l.name}</p>
                  <p className="text-muted text-xs">{l.color} · {l.size}</p>
                </div>
                <p className="text-sm font-medium">{formatMoney(l.unitPrice * l.quantity)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-6 pt-6 border-t border-line space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatMoney(subtotal)}</dd></div>
            <div className="flex justify-between">
              <dt className="text-muted">Delivery</dt>
              <dd>{zone ? (deliveryFee === 0 ? "Free" : formatMoney(deliveryFee)) : "Select location"}</dd>
            </div>
          </dl>
          <div className="mt-5 pt-5 border-t border-line flex justify-between text-lg font-semibold">
            <span>Total</span><span>{formatMoney(total)}</span>
          </div>
          {error && <p className="mt-4 rounded-xl bg-danger/10 text-danger text-sm px-4 py-3" role="alert">{error}</p>}
          <button disabled={pending || !ready || paymentMode === "off"} className="btn btn-dark w-full mt-6 !py-4">
            <Lock size={15} /> {pending ? "Redirecting to Paystack…" : `Pay ${formatMoney(total)}`}
          </button>
          <p className="mt-4 text-xs text-muted text-center">
            By placing your order you agree to our <Link href="/policies/terms" className="underline">terms</Link> and{" "}
            <Link href="/policies/returns" className="underline">returns policy</Link>.
          </p>
        </aside>
      </form>
    </div>
  );
}
