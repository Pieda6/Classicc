"use client";

import Link from "next/link";
import { ArrowRight, Lock, ShoppingBag, X } from "lucide-react";
import { QtyStepper } from "@/components/store/cart-drawer";
import { formatMoney } from "@/lib/money";
import { useFreshCart } from "./use-fresh-cart";

export default function CartPage() {
  const { lines, ready, setQuantity, remove, subtotal, count, notices } = useFreshCart();

  if (!ready) return <div className="container-x py-24" />;

  return (
    <div className="container-x pt-6 md:pt-10">
      <h1 className="font-display text-4xl md:text-5xl font-semibold">Your cart</h1>
      <p className="text-muted mt-2">{count} {count === 1 ? "item" : "items"}</p>

      {notices.length > 0 && (
        <div className="mt-6 rounded-2xl bg-butter border border-[#ece6c2] p-4 text-sm space-y-1" role="status">
          {notices.map((n) => <p key={n}>{n}</p>)}
        </div>
      )}

      {lines.length === 0 ? (
        <div className="card mt-8 p-12 text-center">
          <div className="mx-auto size-16 rounded-full bg-bg grid place-items-center"><ShoppingBag size={24} strokeWidth={1.5} /></div>
          <p className="mt-4 font-display text-2xl font-semibold">Your cart is empty</p>
          <p className="text-muted mt-1">Pieces you add will appear here.</p>
          <Link href="/shop" className="btn btn-dark mt-6">Continue shopping</Link>
        </div>
      ) : (
        <div className="mt-8 grid lg:grid-cols-[1fr_380px] gap-6 items-start">
          <ul className="card divide-y divide-line px-4 md:px-6">
            {lines.map((l) => (
              <li key={l.variantId} className="py-5 flex gap-4 md:gap-6">
                <Link href={`/product/${l.slug}`} className="w-24 md:w-28 shrink-0 aspect-[4/5] rounded-2xl overflow-hidden bg-stone">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {l.image && <img src={l.image} alt={l.name} className="size-full object-cover" />}
                </Link>
                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex justify-between gap-3">
                    <div>
                      <Link href={`/product/${l.slug}`} className="font-medium hover:underline">{l.name}</Link>
                      <p className="text-sm text-muted mt-1">{l.color} · Size {l.size}</p>
                      <p className="text-sm mt-1">{formatMoney(l.unitPrice)}</p>
                    </div>
                    <button onClick={() => remove(l.variantId)} aria-label={`Remove ${l.name}`} className="size-9 rounded-full bg-bg grid place-items-center shrink-0 hover:bg-line">
                      <X size={16} />
                    </button>
                  </div>
                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <QtyStepper value={l.quantity} max={l.maxStock} onChange={(q) => setQuantity(l.variantId, q)} />
                    <p className="font-semibold">{formatMoney(l.unitPrice * l.quantity)}</p>
                  </div>
                  {l.quantity >= l.maxStock && <p className="text-xs text-muted mt-2">Maximum available quantity reached.</p>}
                </div>
              </li>
            ))}
          </ul>

          <aside className="card p-6 md:p-8 lg:sticky lg:top-28">
            <h2 className="font-display text-xl font-semibold">Order summary</h2>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd className="font-medium">{formatMoney(subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Delivery</dt><dd className="text-muted">Calculated at checkout</dd></div>
            </dl>
            <div className="mt-6 pt-6 border-t border-line flex justify-between text-lg font-semibold">
              <span>Total</span><span>{formatMoney(subtotal)}</span>
            </div>
            <Link href="/checkout" className="btn btn-dark w-full mt-6 !py-4">
              Checkout <ArrowRight size={16} />
            </Link>
            <Link href="/shop" className="btn btn-light w-full mt-3">Continue shopping</Link>
            <p className="mt-5 flex items-center justify-center gap-2 text-xs text-muted"><Lock size={13} /> Secure payment with Paystack</p>
          </aside>
        </div>
      )}
    </div>
  );
}
