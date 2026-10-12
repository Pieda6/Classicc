import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { OrderDetails } from "@/components/store/order-details";
import { RetryPayment } from "../../../../checkout/verify/retry-payment";

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const order = await prisma.order.findFirst({
    where: { id, OR: [{ userId: user.id }, { email: user.email, userId: null }] },
    include: { items: true },
  });
  if (!order) notFound();
  return (
    <div className="space-y-4">
      <Link href="/account" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink"><ChevronLeft size={16} /> All orders</Link>
      {order.paymentStatus !== "PAID" && order.status !== "CANCELLED" && (
        <div className="card p-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm">This order hasn&apos;t been paid yet.</p>
          <RetryPayment reference={order.reference} />
        </div>
      )}
      <OrderDetails order={order} />
    </div>
  );
}
