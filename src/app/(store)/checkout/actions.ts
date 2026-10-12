"use server";

import crypto from "node:crypto";
import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { CURRENCY } from "@/lib/money";
import { deliveryFeeFor, subtotalOf } from "@/lib/pricing";
import { getFreeDeliveryThreshold } from "@/lib/settings";
import { initializeTransaction, mockPaymentsEnabled, paystackConfigured } from "@/lib/paystack";
import { generateOrderNumber } from "@/lib/orders";
import { rateLimit } from "@/lib/rate-limit";
import { site } from "@/lib/site";

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  fullName: z.string().trim().min(2, "Enter your full name").max(120),
  phone: z.string().trim().min(7, "Enter a valid phone number").max(30),
  line1: z.string().trim().min(3, "Enter your street address").max(200),
  line2: z.string().trim().max(200).optional().or(z.literal("")),
  city: z.string().trim().min(2, "Enter your city").max(80),
  state: z.string().trim().min(2, "Enter your state").max(80),
  zoneId: z.string().min(1, "Choose a delivery location"),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  saveAddress: z.boolean().optional(),
  items: z
    .array(z.object({ variantId: z.string().min(1), quantity: z.number().int().min(1).max(20) }))
    .min(1, "Your cart is empty")
    .max(50),
});

export type CheckoutInput = z.infer<typeof schema>;
export type CheckoutResult = { ok: true; redirectUrl: string } | { ok: false; error: string; fieldErrors?: Record<string, string> };

function newReference() {
  return `CLS_${Date.now().toString(36)}_${crypto.randomBytes(8).toString("hex")}`;
}

async function startPayment(order: { id: string; reference: string; email: string; total: number; orderNumber: string }) {
  if (paystackConfigured()) {
    const tx = await initializeTransaction({
      email: order.email,
      amount: order.total,
      reference: order.reference,
      currency: CURRENCY,
      callbackUrl: `${site.url}/checkout/verify?reference=${encodeURIComponent(order.reference)}`,
      metadata: { orderId: order.id, orderNumber: order.orderNumber },
    });
    return tx.authorization_url;
  }
  if (mockPaymentsEnabled()) {
    return `/checkout/verify?reference=${encodeURIComponent(order.reference)}&mock=1`;
  }
  throw new Error("Online payments are not configured yet. Please contact us to complete your order.");
}

export async function placeOrder(input: CheckoutInput): Promise<CheckoutResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return { ok: false, error: "Please check the highlighted fields.", fieldErrors };
  }
  const data = parsed.data;

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`checkout:${ip}`, 20, 10 * 60 * 1000)) {
    return { ok: false, error: "Too many attempts. Please wait a few minutes and try again." };
  }

  // Merge duplicate lines and load authoritative prices/stock from the database.
  const qtyByVariant = new Map<string, number>();
  for (const i of data.items) qtyByVariant.set(i.variantId, (qtyByVariant.get(i.variantId) ?? 0) + i.quantity);

  const variants = await prisma.productVariant.findMany({
    where: { id: { in: [...qtyByVariant.keys()] } },
    include: { product: { include: { images: { orderBy: { sortOrder: "asc" } } } } },
  });

  const lines = [];
  for (const [variantId, quantity] of qtyByVariant) {
    const v = variants.find((x) => x.id === variantId);
    if (!v || !v.product.active) return { ok: false, error: "An item in your cart is no longer available. Please review your cart." };
    if (v.stock < quantity) {
      return { ok: false, error: `Only ${v.stock} left of ${v.product.name} (${v.color}, ${v.size}). Please update your cart.` };
    }
    const image = v.product.images.find((i) => i.color === v.color) ?? v.product.images[0];
    lines.push({
      productId: v.productId,
      variantId: v.id,
      name: v.product.name,
      size: v.size,
      color: v.color,
      image: image?.url ?? null,
      unitPrice: v.product.price,
      quantity,
    });
  }

  const zone = await prisma.deliveryZone.findFirst({ where: { id: data.zoneId, active: true } });
  if (!zone) return { ok: false, error: "Please choose a delivery location.", fieldErrors: { zoneId: "Choose a delivery location" } };

  const subtotal = subtotalOf(lines);
  const deliveryFee = deliveryFeeFor(subtotal, zone.fee, await getFreeDeliveryThreshold());
  const user = await getCurrentUser();

  let order;
  for (let attempt = 0; attempt < 5 && !order; attempt++) {
    try {
      order = await prisma.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          reference: newReference(),
          userId: user?.id ?? null,
          email: data.email,
          fullName: data.fullName,
          phone: data.phone,
          line1: data.line1,
          line2: data.line2 || null,
          city: data.city,
          state: data.state,
          deliveryZone: zone.name,
          deliveryFee,
          subtotal,
          total: subtotal + deliveryFee,
          notes: data.notes || null,
          items: { create: lines },
        },
      });
    } catch (e) {
      if (attempt === 4) throw e; // order number collision is the only expected failure
    }
  }
  if (!order) return { ok: false, error: "Could not create your order. Please try again." };

  if (user && data.saveAddress) {
    const hasDefault = await prisma.address.count({ where: { userId: user.id, isDefault: true } });
    await prisma.address.create({
      data: {
        userId: user.id,
        fullName: data.fullName,
        phone: data.phone,
        line1: data.line1,
        line2: data.line2 || null,
        city: data.city,
        state: data.state,
        zoneId: zone.id,
        isDefault: hasDefault === 0,
      },
    });
  }

  try {
    return { ok: true, redirectUrl: await startPayment(order) };
  } catch (e) {
    console.error("[checkout] payment init failed", e);
    return { ok: false, error: e instanceof Error ? e.message : "Could not start payment. Please try again." };
  }
}

/** Start a fresh Paystack transaction for an unpaid order (references are single-use). */
export async function retryPayment(reference: string): Promise<CheckoutResult> {
  const order = await prisma.order.findUnique({ where: { reference } });
  if (!order || order.paymentStatus === "PAID" || order.status === "CANCELLED") {
    return { ok: false, error: "This order cannot be paid." };
  }
  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { reference: newReference(), paymentStatus: "UNPAID" },
  });
  try {
    return { ok: true, redirectUrl: await startPayment(updated) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not start payment." };
  }
}
