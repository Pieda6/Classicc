import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, MessageCircle } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";
import { PageHeader, Panel } from "@/components/admin/ui";
import { OrderDetails } from "@/components/store/order-details";
import { OrderStatusForm } from "@/components/admin/forms";

export const metadata = { title: "Order" };
export const dynamic = "force-dynamic";

export default async function AdminOrder({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true, user: { select: { id: true, createdAt: true } } } });
  if (!order) notFound();
  const wa = `https://wa.me/${order.phone.replace(/\D/g, "").replace(/^0/, "234")}?text=${encodeURIComponent(`Hi ${order.fullName.split(" ")[0]}, this is CLASSICCC about your order ${order.orderNumber}.`)}`;

  return (
    <>
      <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink mb-3"><ChevronLeft size={16} /> All orders</Link>
      <PageHeader title={order.orderNumber} subtitle={`Placed ${formatDateTime(order.createdAt)}`} />
      <div className="grid xl:grid-cols-[1fr_340px] gap-4 items-start">
        <OrderDetails order={order} />
        <div className="space-y-4">
          <Panel title="Update order"><OrderStatusForm id={order.id} status={order.status} paymentStatus={order.paymentStatus} /></Panel>
          <Panel title="Payment">
            <dl className="text-sm space-y-2">
              <div className="flex justify-between gap-3"><dt className="text-muted">Paystack ref</dt><dd className="font-mono text-xs break-all text-right">{order.reference}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Channel</dt><dd>{order.paymentChannel ?? "—"}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Paid at</dt><dd>{order.paidAt ? formatDateTime(order.paidAt) : "—"}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Customer</dt><dd>{order.user ? "Registered" : "Guest"}</dd></div>
            </dl>
          </Panel>
          <a href={wa} target="_blank" rel="noreferrer" className="btn btn-light w-full"><MessageCircle size={16} /> Message customer on WhatsApp</a>
        </div>
      </div>
    </>
  );
}
