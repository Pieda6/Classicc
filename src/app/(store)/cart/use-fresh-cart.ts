"use client";

import { useEffect, useRef, useState } from "react";
import { useCart, type CartLine } from "@/components/store/cart-context";
import { refreshCart } from "./actions";

/** Re-validates the stored cart against current prices and stock once loaded. */
export function useFreshCart() {
  const cart = useCart();
  const [notices, setNotices] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const done = useRef(false);

  useEffect(() => {
    if (!cart.ready || done.current) return;
    done.current = true;
    if (!cart.lines.length) {
      setChecked(true);
      return;
    }
    refreshCart(cart.lines.map((l) => l.variantId))
      .then((fresh) => {
        const msgs: string[] = [];
        const next: CartLine[] = [];
        for (const line of cart.lines) {
          const f = fresh.find((x) => x.variantId === line.variantId);
          if (!f || !f.available) {
            msgs.push(`${line.name} (${line.color}, ${line.size}) is no longer available and was removed.`);
            continue;
          }
          const quantity = Math.min(line.quantity, f.stock);
          if (quantity < line.quantity) msgs.push(`Only ${f.stock} of ${line.name} (${line.size}) left — quantity updated.`);
          if (f.unitPrice !== line.unitPrice) msgs.push(`The price of ${line.name} has changed.`);
          next.push({ ...line, quantity, maxStock: f.stock, unitPrice: f.unitPrice });
        }
        cart.replace(next);
        setNotices(msgs);
      })
      .catch(() => {})
      .finally(() => setChecked(true));
  }, [cart]);

  return { ...cart, notices, checked };
}
