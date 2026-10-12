"use client";

import { Heart } from "lucide-react";
import { useWishlist, type WishItem } from "./wishlist-context";
import { cn } from "@/lib/utils";

export function HeartButton({ item, className }: { item: WishItem; className?: string }) {
  const { has, toggle } = useWishlist();
  const active = has(item.slug);
  return (
    <button
      type="button"
      aria-label={active ? `Remove ${item.name} from wishlist` : `Add ${item.name} to wishlist`}
      aria-pressed={active}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(item);
      }}
      className={cn(
        "size-9 rounded-full grid place-items-center transition-all backdrop-blur",
        active ? "bg-paper text-heart" : "bg-paper/80 text-ink hover:bg-paper",
        className,
      )}
    >
      <Heart size={17} strokeWidth={1.8} fill={active ? "currentColor" : "none"} />
    </button>
  );
}
