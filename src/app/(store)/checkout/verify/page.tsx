import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { prisma } from "@/lib/db";
import { markOrderPaid } from "@/lib/orders";
import { mockPaymentsEnabled, paystackConfigured, verifyTransaction } from "@/lib/paystack";
import { OrderDetails } from "@/components/store/order-details";
import { ClearCart } from "./clear-cart";
import { RetryPayment } from "./retry-payment";

export const metadata: Metadata = { title: "Order status", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ reference?: string; mock?: string }> }) {
  const { reference, mock } = await searchParams;
  const load = () => prisma.order.findUnique({ where: { reference: reference ?? "" }, include: { items: true } });
  let order = reference ? await load() : null;

  if (!order) {
    return (
      <div className="container-x pt-16">
        <div className="card p-12 text-center max-w-xl mx-auto">
          <p className="font-display text-2xl font-semibold">Order not found</p>
          <p className="text-muted mt-2">We couldn&apos;t find an order for this link.</p>
          <Link href="/shop" className="btn btn-dark mt-6">Back to shop</Link>
        </div>
      </div>
    );
  }

  let verifyError: string | null = null;
  if (order.paymentStatus !== "PAID" && order.status !== "CANCELLED") {
    if (mock === "1" && mockPaymentsEnabled()) {
      await markOrderPaid(order.reference, order.total, "test");
    } else if (paystackConfigured()) {
      try {
        const tx = await verifyTransaction(order.reference);
        if (tx.status === "success") await markOrderPaid(order.reference, tx.amount, tx.channel);
        else if (tx.status === "failed") await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: "FAILED" } });
      } catch (e) {
        verifyError = e instanceof Error ? e.message : "Could not verify payment";
      }
    }
    order = (await load())!;
  }

  const paid = order.paymentStatus === "PAID";

  return (
    <div className="container-x pt-8 md:pt-12 max-w-5xl">
      {paid && <ClearCart />}
      <div className="text-center mb-8">
        {paid ? (
          <>
            <CheckCircle2 size={52} strokeWidth={1.3} className="mx-auto text-success" />
            <h1 className="mt-4 font-display text-3xl md:text-5xl font-semibold">Thank you, {order.fullName.split(" ")[0]}!</h1>
            <p className="mt-3 text-muted">Your payment was successful. A confirmation has been sent to <strong className="text-ink">{order.email}</strong>.</p>
          </>
        ) : order.paymentStatus === "FAILED" ? (
          <>
            <XCircle size={52} strokeWidth={1.3} className="mx-auto text-danger" />
            <h1 className="mt-4 font-display text-3xl md:text-5xl font-semibold">Payment unsuccessful</h1>
            <p className="mt-3 text-muted">Your payment didn&apos;t go through and you have not been charged. You can try again below.</p>
          </>
        ) : (
          <>
            <Clock size={52} strokeWidth={1.3} className="mx-auto text-muted" />
            <h1 className="mt-4 font-display text-3xl md:text-5xl font-semibold">Awaiting payment</h1>
            <p className="mt-3 text-muted">
              {verifyError ? "We couldn't confirm your payment yet. If you were charged, it will update shortly." : "We haven't received payment for this order yet."}
            </p>
          </>
        )}
        {!paid && order.status !== "CANCELLED" && <RetryPayment reference={order.reference} />}
      </div>
      <OrderDetails order={order} />
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/shop" className="btn btn-dark">Continue shopping</Link>
        <Link href="/account" className="btn btn-light">View my orders</Link>
      </div>
    </div>
  );
}
