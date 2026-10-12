"use client";

import Link from "next/link";
import { Heart, X } from "lucide-react";
import { useWishlist } from "@/components/store/wishlist-context";
import { formatMoney } from "@/lib/money";

export default function WishlistPage() {
  const { items, remove } = useWishlist();
  return (
    <div className="container-x pt-6 md:pt-10">
      <h1 className="font-display text-4xl md:text-5xl font-semibold">Wishlist</h1>
      <p className="text-muted mt-2">Saved on this device.</p>
      {items.length === 0 ? (
        <div className="card mt-8 p-12 text-center">
          <div className="mx-auto size-16 rounded-full bg-bg grid place-items-center"><Heart size={24} strokeWidth={1.5} /></div>
          <p className="mt-4 font-display text-2xl font-semibold">Nothing saved yet</p>
          <p className="text-muted mt-1">Tap the heart on any piece to save it for later.</p>
          <Link href="/shop" className="btn btn-dark mt-6">Browse the shop</Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-8 md:gap-x-5">
          {items.map((i) => (
            <div key={i.slug} className="group relative">
              <Link href={`/product/${i.slug}`} className="block">
                <div className="aspect-[4/5] rounded-[1.5rem] overflow-hidden bg-stone">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {i.image && <img src={i.image} alt={i.name} className="size-full object-cover" />}
                </div>
                <p className="mt-3 px-1 text-[0.92rem]">{i.name}</p>
                <p className="px-1 font-semibold">{formatMoney(i.price)}</p>
              </Link>
              <button onClick={() => remove(i.slug)} aria-label={`Remove ${i.name}`} className="absolute top-3 right-3 size-9 rounded-full bg-paper grid place-items-center">
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
