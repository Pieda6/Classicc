"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, LayoutGrid, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
  { href: "/shop", label: "Shop", icon: LayoutGrid, match: (p: string) => p.startsWith("/shop") || p.startsWith("/product") },
  { href: "/wishlist", label: "Wishlist", icon: Heart, match: (p: string) => p.startsWith("/wishlist") },
  { href: "/account", label: "Account", icon: User, match: (p: string) => p.startsWith("/account") },
];

export function MobileTabBar() {
  const pathname = usePathname();
  return (
    <nav className="md:hidden fixed bottom-3 inset-x-3 z-40 rounded-[1.75rem] bg-butter border border-[#ece6c2] shadow-[0_10px_30px_-12px_rgba(0,0,0,0.25)]">
      <ul className="grid grid-cols-4 h-16">
        {tabs.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <li key={href}>
              <Link href={href} className={cn("h-full flex flex-col items-center justify-center gap-1 text-[0.66rem]", active ? "text-ink font-semibold" : "text-muted")}>
                <Icon size={20} strokeWidth={active ? 2 : 1.6} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
