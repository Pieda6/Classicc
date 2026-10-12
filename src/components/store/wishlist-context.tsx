"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type WishItem = { slug: string; name: string; price: number; image: string | null };

type WishlistState = {
  items: WishItem[];
  has: (slug: string) => boolean;
  toggle: (item: WishItem) => void;
  remove: (slug: string) => void;
};

const WishlistContext = createContext<WishlistState | null>(null);
const KEY = "classicc_wishlist_v1";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items, ready]);

  const toggle = useCallback((item: WishItem) => {
    setItems((prev) => (prev.some((i) => i.slug === item.slug) ? prev.filter((i) => i.slug !== item.slug) : [item, ...prev]));
  }, []);

  const value = useMemo<WishlistState>(
    () => ({
      items,
      has: (slug) => items.some((i) => i.slug === slug),
      toggle,
      remove: (slug) => setItems((prev) => prev.filter((i) => i.slug !== slug)),
    }),
    [items, toggle],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
