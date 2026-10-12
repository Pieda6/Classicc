import { Check } from "lucide-react";
import { formatMoney } from "@/lib/money";
import { STATUS_LABEL } from "@/lib/constants";
import { cn, formatDateTime } from "@/lib/utils";

type Order = {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  createdAt: Date;
  paidAt: Date | null;
  fullName: string;
  email: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  deliveryZone: string;
  deliveryFee: number;
  subtotal: number;
  total: number;
  notes?: string | null;
  items: { id: string; name: string; size: string; color: string; image: string | null; unitPrice: number; quantity: number }[];
};

const STEPS = ["PROCESSING", "SHIPPED", "DELIVERED"] as const;

export function StatusBadge({ status }: { status: string }) {
  const tone: Record<string, string> = {
    PAID: "bg-success/12 text-success",
    DELIVERED: "bg-success/12 text-success",
    SHIPPED: "bg-[#2b5c8a]/12 text-[#2b5c8a]",
    PROCESSING: "bg-clay/25 text-[#8a4f2a]",
    PENDING: "bg-ink/8 text-muted",
    UNPAID: "bg-ink/8 text-muted",
    FAILED: "bg-danger/12 text-danger",
    CANCELLED: "bg-danger/12 text-danger",
    REFUNDED: "bg-ink/8 text-ink",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wide", tone[status] ?? "bg-ink/8")}>
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

export function OrderTimeline({ status, paymentStatus }: { status: string; paymentStatus: string }) {
  if (status === "CANCELLED") return <p className="text-sm text-danger font-medium">This order was cancelled.</p>;
  const current = paymentStatus === "PAID" ? STEPS.indexOf(status as (typeof STEPS)[number]) : -1;
  const steps = ["Order placed", "Processing", "Shipped", "Delivered"];
  return (
    <ol className="grid grid-cols-4 gap-2">
      {steps.map((label, i) => {
        const done = i === 0 || i - 1 <= current;
        return (
          <li key={label} className="flex flex-col items-center text-center gap-2">
            <span className={cn("size-8 rounded-full grid place-items-center border", done ? "bg-ink text-paper border-ink" : "border-line text-muted")}>
              {done ? <Check size={15} /> : i + 1}
            </span>
            <span className={cn("text-xs", done ? "font-medium" : "text-muted")}>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}

export function OrderDetails({ order }: { order: Order }) {
  return (
    <div className="grid md:grid-cols-[1fr_300px] gap-4">
      <div className="card p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow text-muted">Order</p>
            <p className="font-display text-2xl font-semibold">{order.orderNumber}</p>
            <p className="text-xs text-muted mt-1">Placed {formatDateTime(order.createdAt)}</p>
          </div>
          <div className="flex gap-2">
            <StatusBadge status={order.paymentStatus} />
            <StatusBadge status={order.status} />
          </div>
        </div>
        <div className="mt-8"><OrderTimeline status={order.status} paymentStatus={order.paymentStatus} /></div>
        <ul className="mt-8 divide-y divide-line">
          {order.items.map((i) => (
            <li key={i.id} className="py-4 flex gap-4">
              <div className="w-16 shrink-0 aspect-[4/5] rounded-xl overflow-hidden bg-stone">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {i.image && <img src={i.image} alt="" className="size-full object-cover" />}
              </div>
              <div className="flex-1 text-sm">
                <p className="font-medium">{i.name}</p>
                <p className="text-muted text-xs mt-0.5">{i.color} · {i.size} · Qty {i.quantity}</p>
                <p className="text-xs text-muted mt-0.5">{formatMoney(i.unitPrice)} each</p>
              </div>
              <p className="text-sm font-medium">{formatMoney(i.unitPrice * i.quantity)}</p>
            </li>
          ))}
        </ul>
        <dl className="mt-4 pt-4 border-t border-line space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatMoney(order.subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Delivery ({order.deliveryZone})</dt><dd>{order.deliveryFee ? formatMoney(order.deliveryFee) : "Free"}</dd></div>
          <div className="flex justify-between text-base font-semibold pt-2"><dt>Total</dt><dd>{formatMoney(order.total)}</dd></div>
        </dl>
      </div>
      <div className="card p-6 md:p-8 text-sm space-y-6 self-start">
        <div>
          <p className="label">Delivery address</p>
          <p className="text-muted leading-relaxed">
            {order.fullName}<br />{order.line1}{order.line2 && <><br />{order.line2}</>}<br />{order.city}, {order.state}
          </p>
        </div>
        <div>
          <p className="label">Contact</p>
          <p className="text-muted break-all">{order.email}<br />{order.phone}</p>
        </div>
        {order.notes && (
          <div>
            <p className="label">Notes</p>
            <p className="text-muted">{order.notes}</p>
          </div>
        )}
        {order.paidAt && (
          <div>
            <p className="label">Paid</p>
            <p className="text-muted">{formatDateTime(order.paidAt)}</p>
          </div>
        )}
      </div>
    </div>
  );
}
