import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { LOW_STOCK } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import { PageHeader, Panel, Table } from "@/components/admin/ui";
import { StatusBadge } from "@/components/store/order-details";
import { RevenueChart } from "@/components/admin/revenue-chart";

export const metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

const DAY = 86_400_000;

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export default async function AdminDashboard() {
  const today = startOfDay(new Date());
  const since30 = new Date(today.getTime() - 29 * DAY);
  const prev30 = new Date(since30.getTime() - 30 * DAY);
  const since14 = new Date(today.getTime() - 13 * DAY);

  const [allPaid, last30, prior30, toFulfil, awaitingPayment, lowStock, outOfStock, recent, paid14, topItems, customers] = await Promise.all([
    prisma.order.aggregate({ where: { paymentStatus: "PAID" }, _sum: { total: true }, _count: true }),
    prisma.order.aggregate({ where: { paymentStatus: "PAID", paidAt: { gte: since30 } }, _sum: { total: true }, _count: true }),
    prisma.order.aggregate({ where: { paymentStatus: "PAID", paidAt: { gte: prev30, lt: since30 } }, _sum: { total: true } }),
    prisma.order.count({ where: { paymentStatus: "PAID", status: "PROCESSING" } }),
    prisma.order.count({ where: { paymentStatus: "UNPAID", status: "PENDING" } }),
    prisma.productVariant.findMany({ where: { stock: { gt: 0, lte: LOW_STOCK } }, include: { product: { select: { id: true, name: true } } }, take: 8, orderBy: { stock: "asc" } }),
    prisma.productVariant.count({ where: { stock: 0, product: { active: true } } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.order.findMany({ where: { paymentStatus: "PAID", paidAt: { gte: since14 } }, select: { total: true, paidAt: true } }),
    prisma.orderItem.groupBy({
      by: ["name"],
      where: { order: { paymentStatus: "PAID" } },
      _sum: { quantity: true, unitPrice: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
  ]);

  const days = Array.from({ length: 14 }, (_, i) => {
    const start = new Date(since14.getTime() + i * DAY);
    const end = new Date(start.getTime() + DAY);
    const rows = paid14.filter((o) => o.paidAt && o.paidAt >= start && o.paidAt < end);
    return { date: start.toISOString(), revenue: rows.reduce((n, o) => n + o.total, 0), orders: rows.length };
  });

  const rev30 = last30._sum.total ?? 0;
  const revPrev = prior30._sum.total ?? 0;
  const change = revPrev > 0 ? ((rev30 - revPrev) / revPrev) * 100 : null;
  const aov = last30._count ? Math.round(rev30 / last30._count) : 0;

  const tiles = [
    { label: "Revenue · last 30 days", value: formatMoney(rev30), note: change === null ? "No prior period" : `${change >= 0 ? "▲" : "▼"} ${Math.abs(change).toFixed(0)}% vs previous 30 days` },
    { label: "Paid orders · last 30 days", value: String(last30._count), note: `${allPaid._count} all time` },
    { label: "Average order value", value: formatMoney(aov), note: "Last 30 days" },
    { label: "Total revenue", value: formatMoney(allPaid._sum.total ?? 0), note: `${customers} registered customers` },
  ];

  return (
    <>
      <PageHeader title="Dashboard" subtitle="A quick look at how CLASSICC is doing." />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
        {tiles.map((t) => (
          <div key={t.label} className="card p-5 md:p-6">
            <p className="text-xs text-muted">{t.label}</p>
            <p className="mt-2 font-display text-2xl md:text-3xl font-semibold tabular-nums">{t.value}</p>
            <p className="mt-1 text-xs text-muted">{t.note}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid sm:grid-cols-3 gap-3 md:gap-4">
        <Link href="/admin/orders?status=PROCESSING&payment=PAID" className="card p-5 hover:ring-1 hover:ring-ink transition">
          <p className="text-3xl font-display font-semibold">{toFulfil}</p>
          <p className="text-sm text-muted">Paid orders to fulfil →</p>
        </Link>
        <Link href="/admin/orders?payment=UNPAID" className="card p-5 hover:ring-1 hover:ring-ink transition">
          <p className="text-3xl font-display font-semibold">{awaitingPayment}</p>
          <p className="text-sm text-muted">Awaiting payment →</p>
        </Link>
        <Link href="/admin/inventory?filter=out" className="card p-5 hover:ring-1 hover:ring-ink transition">
          <p className="text-3xl font-display font-semibold">{outOfStock}</p>
          <p className="text-sm text-muted">Variants out of stock →</p>
        </Link>
      </div>

      <div className="mt-4 grid xl:grid-cols-[1.6fr_1fr] gap-4 items-start">
        <Panel title="Daily revenue · last 14 days">
          <RevenueChart days={days} />
        </Panel>
        <Panel title="Best sellers" action={<span className="text-xs text-muted">Units sold</span>}>
          {topItems.length === 0 ? (
            <p className="text-sm text-muted py-6 text-center">No sales yet.</p>
          ) : (
            <ol className="space-y-3">
              {topItems.map((t, i) => {
                const max = topItems[0]._sum.quantity ?? 1;
                return (
                  <li key={t.name} className="text-sm">
                    <div className="flex justify-between gap-3"><span className="truncate">{i + 1}. {t.name}</span><span className="tabular-nums font-medium">{t._sum.quantity}</span></div>
                    <div className="mt-1.5 h-1.5 rounded-full bg-bg overflow-hidden">
                      <div className="h-full rounded-full bg-ink" style={{ width: `${((t._sum.quantity ?? 0) / max) * 100}%` }} />
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </Panel>
      </div>

      <div className="mt-4 grid xl:grid-cols-[1.6fr_1fr] gap-4 items-start">
        <Panel title="Recent orders" action={<Link href="/admin/orders" className="link-underline !text-[0.7rem]">View all</Link>}>
          <Table>
            <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Payment</th><th>Status</th></tr></thead>
            <tbody>
              {recent.map((o) => (
                <tr key={o.id}>
                  <td><Link href={`/admin/orders/${o.id}`} className="font-medium hover:underline">{o.orderNumber}</Link><p className="text-xs text-muted">{formatDateTime(o.createdAt)}</p></td>
                  <td>{o.fullName}</td>
                  <td className="tabular-nums">{formatMoney(o.total)}</td>
                  <td><StatusBadge status={o.paymentStatus} /></td>
                  <td><StatusBadge status={o.status} /></td>
                </tr>
              ))}
              {recent.length === 0 && <tr><td colSpan={5} className="text-center text-muted !py-8">No orders yet.</td></tr>}
            </tbody>
          </Table>
        </Panel>
        <Panel title="Low stock" action={<Link href="/admin/inventory?filter=low" className="link-underline !text-[0.7rem]">Manage</Link>}>
          {lowStock.length === 0 ? (
            <p className="text-sm text-muted py-6 text-center">Everything is well stocked.</p>
          ) : (
            <ul className="divide-y divide-line text-sm">
              {lowStock.map((v) => (
                <li key={v.id} className="py-2.5 flex justify-between gap-3">
                  <Link href={`/admin/products/${v.product.id}`} className="truncate hover:underline">{v.product.name} <span className="text-muted">· {v.color} / {v.size}</span></Link>
                  <span className="font-medium tabular-nums">{v.stock} left</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
