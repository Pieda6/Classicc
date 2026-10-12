import "server-only";
import { prisma } from "./db";
import { sendOrderConfirmation } from "./email";

/**
 * Mark an order as paid exactly once (safe to call from both the callback
 * page and the webhook), decrement stock and send the confirmation email.
 * Returns true when this call performed the transition.
 */
export async function markOrderPaid(reference: string, amountPaid: number, channel?: string) {
  const order = await prisma.order.findUnique({ where: { reference }, include: { items: true } });
  if (!order) return false;
  if (order.paymentStatus === "PAID") return false;
  if (amountPaid < order.total) {
    await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: "FAILED" } });
    console.warn(`[orders] amount mismatch for ${reference}: paid ${amountPaid}, expected ${order.total}`);
    return false;
  }

  const transitioned = await prisma.$transaction(async (tx) => {
    const res = await tx.order.updateMany({
      where: { id: order.id, paymentStatus: { not: "PAID" } },
      data: {
        paymentStatus: "PAID",
        status: order.status === "PENDING" ? "PROCESSING" : order.status,
        paidAt: new Date(),
        paymentChannel: channel ?? null,
      },
    });
    if (res.count !== 1) return false;
    for (const item of order.items) {
      if (!item.variantId) continue;
      const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } });
      if (!variant) continue;
      await tx.productVariant.update({
        where: { id: variant.id },
        data: { stock: Math.max(0, variant.stock - item.quantity) },
      });
    }
    return true;
  });

  if (transitioned) await sendOrderConfirmation(order);
  return transitioned;
}

export function generateOrderNumber() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `CLS-${s}`;
}
