import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getFreeDeliveryThreshold } from "@/lib/settings";
import { mockPaymentsEnabled, paystackConfigured } from "@/lib/paystack";
import { CheckoutForm } from "./checkout-form";

export const metadata: Metadata = { title: "Checkout" };
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  const [zones, addresses, freeThreshold] = await Promise.all([
    prisma.deliveryZone.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    user ? prisma.address.findMany({ where: { userId: user.id }, orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] }) : [],
    getFreeDeliveryThreshold(),
  ]);

  return (
    <CheckoutForm
      user={user ? { email: user.email, name: user.name, phone: user.phone } : null}
      zones={zones.map((z) => ({ id: z.id, name: z.name, fee: z.fee, eta: z.eta }))}
      addresses={addresses.map((a) => ({
        id: a.id,
        label: a.label,
        fullName: a.fullName,
        phone: a.phone,
        line1: a.line1,
        line2: a.line2 ?? "",
        city: a.city,
        state: a.state,
        zoneId: a.zoneId ?? "",
      }))}
      freeThreshold={freeThreshold}
      paymentMode={paystackConfigured() ? "live" : mockPaymentsEnabled() ? "test" : "off"}
    />
  );
}
