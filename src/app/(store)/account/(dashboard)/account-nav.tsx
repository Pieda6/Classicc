"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AccountNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const items = [
    { href: "/account", label: "Orders", active: pathname === "/account" || pathname.startsWith("/account/orders") },
    { href: "/account/addresses", label: "Addresses", active: pathname.startsWith("/account/addresses") },
    { href: "/account/profile", label: "Profile & password", active: pathname.startsWith("/account/profile") },
    ...(isAdmin ? [{ href: "/admin", label: "Admin dashboard", active: false }] : []),
  ];
  return (
    <nav className="flex lg:flex-col gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0 lg:sticky lg:top-28">
      {items.map((i) => (
        <Link key={i.href} href={i.href} className="chip lg:!rounded-2xl lg:!py-3 lg:!px-5" data-active={i.active}>
          {i.label}
        </Link>
      ))}
    </nav>
  );
}
