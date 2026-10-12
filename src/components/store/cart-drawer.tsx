"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useCart } from "./cart-context";
import { formatMoney } from "@/lib/money";

export function CartDrawer({ freeThreshold }: { freeThreshold: number }) {
  const { lines, drawerOpen, setDrawerOpen, setQuantity, remove, subtotal, count } = useCart();

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen, setDrawerOpen]);

  if (!drawerOpen) return null;
  const remaining = freeThreshold > 0 ? Math.max(0, freeThreshold - subtotal) : 0;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <div className="absolute inset-0 bg-ink/40" onClick={() => setDrawerOpen(false)} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-md p-3 flex">
        <div className="card flex-1 flex flex-col overflow-hidden animate-fade-up">
          <div className="flex items-center justify-between p-6 pb-4">
            <h2 className="font-display text-xl font-semibold">Your cart ({count})</h2>
            <button aria-label="Close cart" onClick={() => setDrawerOpen(false)} className="size-10 rounded-full bg-bg grid place-items-center">
              <X size={18} />
            </button>
          </div>
          {freeThreshold > 0 && lines.length > 0 && (
            <div className="mx-6 mb-2 rounded-2xl bg-butter px-4 py-3 text-sm">
              {remaining > 0 ? (
                <>You&apos;re <strong>{formatMoney(remaining)}</strong> away from free delivery.</>
              ) : (
                <>You&apos;ve unlocked <strong>free delivery</strong>.</>
              )}
              <div className="mt-2 h-1.5 rounded-full bg-ink/10 overflow-hidden">
                <div className="h-full bg-ink rounded-full transition-all" style={{ width: `${Math.min(100, (subtotal / freeThreshold) * 100)}%` }} />
              </div>
            </div>
          )}
          <div className="flex-1 overflow-y-auto px-6">
            {lines.length === 0 ? (
              <div className="h-full grid place-items-center text-center py-16">
                <div>
                  <div className="mx-auto size-16 rounded-full bg-bg grid place-items-center"><ShoppingBag size={24} strokeWidth={1.5} /></div>
                  <p className="mt-4 font-medium">Your cart is empty</p>
                  <p className="text-sm text-muted mt-1">Discover pieces made to last.</p>
                  <Link href="/shop" onClick={() => setDrawerOpen(false)} className="btn btn-dark mt-6">Shop now</Link>
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {lines.map((l) => (
                  <li key={l.variantId} className="py-4 flex gap-4">
                    <Link href={`/product/${l.slug}`} onClick={() => setDrawerOpen(false)} className="w-20 shrink-0 aspect-[4/5] rounded-2xl overflow-hidden bg-stone">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {l.image && <img src={l.image} alt={l.name} className="size-full object-cover" />}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between gap-2">
                        <p className="text-sm font-medium leading-snug">{l.name}</p>
                        <button aria-label={`Remove ${l.name}`} onClick={() => remove(l.variantId)} className="text-muted hover:text-ink"><X size={16} /></button>
                      </div>
                      <p className="text-xs text-muted mt-0.5">{l.color} · {l.size}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <QtyStepper value={l.quantity} max={l.maxStock} onChange={(q) => setQuantity(l.variantId, q)} />
                        <p className="text-sm font-semibold">{formatMoney(l.unitPrice * l.quantity)}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {lines.length > 0 && (
            <div className="p-6 border-t border-line space-y-3">
              <div className="flex justify-between text-sm"><span className="text-muted">Subtotal</span><span className="font-semibold">{formatMoney(subtotal)}</span></div>
              <p className="text-xs text-muted">Delivery calculated at checkout.</p>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/cart" onClick={() => setDrawerOpen(false)} className="btn btn-light">View cart</Link>
                <Link href="/checkout" onClick={() => setDrawerOpen(false)} className="btn btn-dark">Checkout</Link>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

export function QtyStepper({ value, max, onChange }: { value: number; max: number; onChange: (q: number) => void }) {
  return (
    <div className="inline-flex items-center rounded-full border border-line bg-paper h-9">
      <button aria-label="Decrease quantity" onClick={() => onChange(value - 1)} className="w-9 h-full grid place-items-center hover:opacity-60">
        <Minus size={14} />
      </button>
      <span className="w-6 text-center text-sm tabular-nums" aria-live="polite">{value}</span>
      <button aria-label="Increase quantity" disabled={value >= max} onClick={() => onChange(value + 1)} className="w-9 h-full grid place-items-center hover:opacity-60 disabled:opacity-30">
        <Plus size={14} />
      </button>
    </div>
  );
}
