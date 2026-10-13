"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useCart } from "./cart-context";
import { useWishlist } from "./wishlist-context";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/shop?gender=MEN", label: "Men" },
  { href: "/shop?gender=WOMEN", label: "Women" },
  { href: "/shop?gender=KIDS", label: "Kids" },
  { href: "/shop?category=accessories", label: "Accessories" },
  { href: "/about", label: "About" },
];

export function Header({ user }: { user: { name: string; role: string } | null }) {
  const { count, setDrawerOpen } = useCart();
  const wishlist = useWishlist();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-bg/90 backdrop-blur-md md:border-b md:border-line/70">
        <div className="container-x">
          {/* Desktop */}
          <div className="hidden md:grid grid-cols-[1fr_auto_1fr] items-center h-20">
            <nav className="flex items-center gap-7 text-[0.74rem] font-semibold tracking-[0.14em] uppercase">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} className="hover:opacity-60 transition-opacity">
                  {n.label}
                </Link>
              ))}
            </nav>
            <Link href="/" aria-label="CLASSICCC home" className="font-display text-[2.1rem] font-semibold tracking-[0.12em] leading-none">
              CLASSICCC
            </Link>
            <div className="flex items-center justify-end gap-6 text-[0.72rem] font-semibold tracking-[0.14em] uppercase">
              <button onClick={() => setSearchOpen(true)} className="flex items-center gap-2 hover:opacity-60">
                <Search size={17} strokeWidth={1.7} /> Search
              </button>
              <Link href={user ? (user.role === "ADMIN" ? "/admin" : "/account") : "/account/login"} className="flex items-center gap-2 hover:opacity-60">
                <User size={17} strokeWidth={1.7} /> {user ? (user.role === "ADMIN" ? "Admin" : "Account") : "Login"}
              </Link>
              <Link href="/wishlist" className="flex items-center gap-2 hover:opacity-60">
                <Heart size={17} strokeWidth={1.7} /> Wishlist{wishlist.items.length ? ` (${wishlist.items.length})` : ""}
              </Link>
              <button onClick={() => setDrawerOpen(true)} className="flex items-center gap-2 hover:opacity-60">
                <ShoppingBag size={17} strokeWidth={1.7} /> Cart ({count})
              </button>
            </div>
          </div>

          {/* Mobile — rounded app-style header */}
          <div className="md:hidden flex items-center justify-between h-[4.25rem]">
            <button
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
              className="size-11 rounded-full bg-paper grid place-items-center"
            >
              <Menu size={19} strokeWidth={1.7} />
            </button>
            <Link href="/" className="font-display text-xl font-semibold tracking-[0.14em]">
              CLASSICCC
            </Link>
            <div className="flex gap-2">
              <button aria-label="Search" onClick={() => setSearchOpen(true)} className="size-11 rounded-full bg-paper grid place-items-center">
                <Search size={18} strokeWidth={1.7} />
              </button>
              <button
                aria-label={`Cart, ${count} items`}
                onClick={() => setDrawerOpen(true)}
                className="relative size-11 rounded-full bg-paper grid place-items-center"
              >
                <ShoppingBag size={18} strokeWidth={1.7} />
                {count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 rounded-full bg-ink text-paper text-[0.65rem] grid place-items-center font-semibold">
                    {count}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} user={user} />}
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </header>
  );
}

function MobileMenu({ onClose, user }: { onClose: () => void; user: { name: string; role: string } | null }) {
  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="absolute inset-x-3 top-3 card p-6 animate-fade-up">
        <div className="flex items-center justify-between mb-6">
          <span className="font-display text-lg font-semibold tracking-[0.14em]">CLASSICCC</span>
          <button aria-label="Close menu" onClick={onClose} className="size-10 rounded-full bg-bg grid place-items-center">
            <X size={18} />
          </button>
        </div>
        <nav className="flex flex-col">
          {[{ href: "/shop", label: "Shop all" }, ...NAV, { href: "/contact", label: "Contact" }].map((n) => (
            <Link key={n.href} href={n.href} onClick={onClose} className="py-3 border-b border-line font-display text-2xl font-medium">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Link href={user ? "/account" : "/account/login"} onClick={onClose} className="btn btn-dark">
            {user ? "My account" : "Login"}
          </Link>
          <Link href="/wishlist" onClick={onClose} className="btn btn-light">
            Wishlist
          </Link>
          {user?.role === "ADMIN" && (
            <Link href="/admin" onClick={onClose} className="btn btn-clay col-span-2">
              Admin dashboard
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function SearchOverlay({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const ref = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  useEffect(() => {
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="relative container-x pt-4 md:pt-10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            router.push(`/shop${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`);
            onClose();
          }}
          className="card p-3 md:p-4 flex items-center gap-3 max-w-2xl mx-auto animate-fade-up"
        >
          <div className="flex-1 flex items-center gap-3 bg-bg rounded-full px-5 h-14">
            <Search size={19} strokeWidth={1.7} />
            <input
              ref={ref}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search your needs"
              className="flex-1 bg-transparent outline-none text-base"
            />
          </div>
          <button aria-label="Close search" type="button" onClick={onClose} className={cn("size-12 rounded-full bg-bg grid place-items-center")}>
            <X size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
