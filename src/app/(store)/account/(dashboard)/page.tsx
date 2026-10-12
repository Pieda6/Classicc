import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight, Package } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { formatMoney } from "@/lib/money";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/store/order-details";

export const metadata: Metadata = { title: "My orders" };

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ reset?: string }> }) {
  const user = await requireUser();
  const { reset } = await searchParams;
  const orders = await prisma.order.findMany({
    where: { OR: [{ userId: user.id }, { email: user.email, userId: null }] },
    include: { items: { take: 3 } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      {reset && <p className="rounded-xl bg-success/10 text-success px-4 py-3 text-sm">Your password has been updated.</p>}
      <div className="card p-6 md:p-8">
        <h2 className="font-display text-xl font-semibold">Order history</h2>
        {orders.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto size-14 rounded-full bg-bg grid place-items-center"><Package size={22} strokeWidth={1.5} /></div>
            <p className="mt-4 font-medium">No orders yet</p>
            <p className="text-sm text-muted mt-1">When you place an order it will appear here.</p>
            <Link href="/shop" className="btn btn-dark mt-6">Start shopping</Link>
          </div>
        ) : (
          <ul className="mt-6 divide-y divide-line">
            {orders.map((o) => (
              <li key={o.id}>
                <Link href={`/account/orders/${o.id}`} className="py-5 flex items-center gap-4 group">
                  <div className="flex -space-x-4">
                    {o.items.map((i) => (
                      <div key={i.id} className="w-12 aspect-[4/5] rounded-lg overflow-hidden bg-stone ring-2 ring-paper">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {i.image && <img src={i.image} alt="" className="size-full object-cover" />}
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{o.orderNumber}</p>
                    <p className="text-xs text-muted">{formatDate(o.createdAt)} · {formatMoney(o.total)}</p>
                  </div>
                  <div className="hidden sm:flex gap-2">
                    {o.paymentStatus !== "PAID" && <StatusBadge status={o.paymentStatus} />}
                    <StatusBadge status={o.status} />
                  </div>
                  <ChevronRight size={18} className="text-muted group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
