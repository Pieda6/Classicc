"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, ExternalLink, LayoutDashboard, LogOut, Package, ShoppingCart, Tags, Truck } from "lucide-react";
import { logout } from "@/app/(store)/account/actions";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/delivery", label: "Delivery", icon: Truck },
];

export function AdminNav({ name, email }: { name: string; email: string }) {
  const pathname = usePathname();
  const isActive = (href: string, exact?: boolean) => (exact ? pathname === href : pathname.startsWith(href));
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col bg-ink text-paper sticky top-0 h-screen p-5">
        <Link href="/admin" className="font-display text-2xl font-semibold tracking-[0.12em] px-3 pt-2">CLASSICC</Link>
        <p className="px-3 mt-1 text-[0.65rem] tracking-[0.3em] uppercase text-paper/45">Admin</p>
        <nav className="mt-8 flex flex-col gap-1">
          {items.map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                isActive(href, exact) ? "bg-paper text-ink font-medium" : "text-paper/70 hover:text-paper hover:bg-paper/10",
              )}
            >
              <Icon size={18} strokeWidth={1.7} /> {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto space-y-1">
          <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-paper/70 hover:text-paper hover:bg-paper/10">
            <ExternalLink size={18} strokeWidth={1.7} /> View store
          </Link>
          <form action={logout}>
            <button className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-paper/70 hover:text-paper hover:bg-paper/10">
              <LogOut size={18} strokeWidth={1.7} /> Log out
            </button>
          </form>
          <div className="px-3 pt-4 border-t border-paper/10 mt-3">
            <p className="text-sm font-medium truncate">{name}</p>
            <p className="text-xs text-paper/50 truncate">{email}</p>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden bg-ink text-paper sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/admin" className="font-display text-lg font-semibold tracking-[0.12em]">CLASSICC <span className="text-paper/50 text-xs tracking-[0.2em]">ADMIN</span></Link>
          <Link href="/" className="text-xs text-paper/70">View store</Link>
        </div>
        <nav className="flex gap-1 overflow-x-auto no-scrollbar px-3 pb-3">
          {items.map(({ href, label, exact }) => (
            <Link key={href} href={href} className={cn("rounded-full px-3.5 py-1.5 text-xs whitespace-nowrap", isActive(href, exact) ? "bg-paper text-ink" : "text-paper/70 bg-paper/10")}>
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
