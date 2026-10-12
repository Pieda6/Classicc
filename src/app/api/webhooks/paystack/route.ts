import { NextResponse } from "next/server";
import { isValidWebhookSignature } from "@/lib/paystack";
import { markOrderPaid } from "@/lib/orders";

// Configure in Paystack dashboard → Settings → API Keys & Webhooks:
//   https://YOUR-DOMAIN/api/webhooks/paystack
export async function POST(req: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const raw = await req.text();
  if (!isValidWebhookSignature(raw, req.headers.get("x-paystack-signature"), secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { event?: string; data?: { reference?: string; amount?: number; status?: string; channel?: string } };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  }

  if (event.event === "charge.success" && event.data?.reference && event.data.status === "success") {
    await markOrderPaid(event.data.reference, Number(event.data.amount ?? 0), event.data.channel);
  }
  // Always acknowledge quickly so Paystack doesn't retry.
  return NextResponse.json({ received: true });
}
