import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { icontains } from "@/lib/catalog";
import { formatMoney } from "@/lib/money";
import { ORDER_STATUSES, PAYMENT_STATUSES, STATUS_LABEL } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import { PageHeader, Pagination, Panel, Table } from "@/components/admin/ui";
import { StatusBadge } from "@/components/store/order-details";

export const metadata = { title: "Orders" };
export const dynamic = "force-dynamic";

export default async function AdminOrders({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const page = Math.max(1, Number(sp.page) || 1);
  const where: Prisma.OrderWhereInput = {
    ...(sp.status && { status: sp.status }),
    ...(sp.payment && { paymentStatus: sp.payment }),
    ...(q && { OR: [{ orderNumber: icontains(q.toUpperCase()) }, { email: icontains(q.toLowerCase()) }, { fullName: icontains(q) }, { phone: icontains(q) }] }),
  };
  const [orders, total] = await Promise.all([
    prisma.order.findMany({ where, include: { _count: { select: { items: true } } }, orderBy: { createdAt: "desc" }, skip: (page - 1) * 25, take: 25 }),
    prisma.order.count({ where }),
  ]);
  const href = (p: number) => `/admin/orders?${new URLSearchParams({ ...(Object.fromEntries(Object.entries(sp).filter(([, v]) => v)) as Record<string, string>), page: String(p) })}`;

  return (
    <>
      <PageHeader title="Orders" subtitle={`${total} orders`} />
      <Panel>
        <form className="flex flex-wrap gap-2 mb-4">
          <input name="q" defaultValue={q} placeholder="Order #, name, email, phone…" className="field !py-2 max-w-xs" />
          <select name="status" defaultValue={sp.status ?? ""} className="field !py-2 !w-auto">
            <option value="">Any status</option>
            {ORDER_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
          <select name="payment" defaultValue={sp.payment ?? ""} className="field !py-2 !w-auto">
            <option value="">Any payment</option>
            {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
          <button className="btn btn-light !py-2">Filter</button>
        </form>
        <Table>
          <thead><tr><th>Order</th><th>Date</th><th>Customer</th><th>Delivery</th><th>Total</th><th>Payment</th><th>Status</th></tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-bg/60">
                <td><Link href={`/admin/orders/${o.id}`} className="font-medium hover:underline">{o.orderNumber}</Link><p className="text-xs text-muted">{o._count.items} items</p></td>
                <td className="text-muted whitespace-nowrap">{formatDateTime(o.createdAt)}</td>
                <td><p>{o.fullName}</p><p className="text-xs text-muted">{o.email}</p></td>
                <td className="text-muted">{o.city}, {o.state}<p className="text-xs">{o.deliveryZone}</p></td>
                <td className="font-medium">{formatMoney(o.total)}</td>
                <td><StatusBadge status={o.paymentStatus} /></td>
                <td><StatusBadge status={o.status} /></td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan={7} className="text-center text-muted !py-10">No orders found.</td></tr>}
          </tbody>
        </Table>
        <Pagination page={page} pages={Math.ceil(total / 25)} href={href} />
      </Panel>
    </>
  );
}
