"use client";

import { useActionState } from "react";
import { saveCategory, saveFreeDelivery, saveZone, updateOrderStatus, type AdminState } from "@/app/admin/actions";
import { ORDER_STATUSES, PAYMENT_STATUSES, STATUS_LABEL } from "@/lib/constants";
import { FormMessage, SubmitButton } from "@/components/store/form-bits";

type Category = { id: string; name: string; slug: string; description: string; image: string; sortOrder: number };

export function CategoryForm({ category, onDoneHref }: { category?: Category; onDoneHref?: string }) {
  const [state, action] = useActionState<AdminState, FormData>(saveCategory, undefined);
  return (
    <form action={action} className="space-y-3" key={category?.id ?? "new"}>
      <FormMessage state={state} />
      {category && <input type="hidden" name="id" value={category.id} />}
      <div><label className="label">Name</label><input name="name" defaultValue={category?.name} className="field" required /></div>
      <div><label className="label">Slug <span className="font-normal text-muted">(auto from name if empty)</span></label><input name="slug" defaultValue={category?.slug} className="field" /></div>
      <div><label className="label">Description</label><textarea name="description" defaultValue={category?.description} rows={2} className="field" /></div>
      <div className="grid grid-cols-[1fr_90px] gap-3">
        <div><label className="label">Image URL</label><input name="image" defaultValue={category?.image} className="field" placeholder="/uploads/… or https://…" /></div>
        <div><label className="label">Order</label><input name="sortOrder" type="number" min={0} defaultValue={category?.sortOrder ?? 0} className="field" /></div>
      </div>
      <div><label className="label">…or upload image</label><input name="file" type="file" accept="image/*" className="text-sm" /></div>
      <div className="flex gap-2">
        <SubmitButton pendingText="Saving…">{category ? "Save category" : "Add category"}</SubmitButton>
        {category && onDoneHref && <a href={onDoneHref} className="btn btn-light">Cancel</a>}
      </div>
    </form>
  );
}

export function OrderStatusForm({ id, status, paymentStatus }: { id: string; status: string; paymentStatus: string }) {
  const [state, action] = useActionState<AdminState, FormData>(updateOrderStatus, undefined);
  return (
    <form action={action} className="space-y-4">
      <FormMessage state={state} />
      <input type="hidden" name="id" value={id} />
      <div>
        <label className="label" htmlFor="status">Fulfilment status</label>
        <select id="status" name="status" defaultValue={status} className="field">
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="paymentStatus">Payment status</label>
        <select id="paymentStatus" name="paymentStatus" defaultValue={paymentStatus} className="field">
          {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
        <p className="text-xs text-muted mt-1">Payments are confirmed automatically by Paystack. Change manually only for refunds or offline payments.</p>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="notify" defaultChecked className="accent-ink" /> Email the customer about status changes
      </label>
      <SubmitButton className="w-full" pendingText="Updating…">Update order</SubmitButton>
    </form>
  );
}

type Zone = { id: string; name: string; fee: string; eta: string; active: boolean; sortOrder: number };

export function ZoneForm({ zone }: { zone?: Zone }) {
  const [state, action] = useActionState<AdminState, FormData>(saveZone, undefined);
  return (
    <form action={action} className="grid sm:grid-cols-[1.5fr_0.8fr_1.2fr_70px_auto_auto] gap-2 items-end">
      {zone && <input type="hidden" name="id" value={zone.id} />}
      <div><label className="label !text-xs">Location</label><input name="name" defaultValue={zone?.name} className="field !py-2" placeholder="e.g. Ibadan" required /></div>
      <div><label className="label !text-xs">Fee (₦)</label><input name="fee" defaultValue={zone?.fee} inputMode="decimal" className="field !py-2" placeholder="0" required /></div>
      <div><label className="label !text-xs">Delivery time</label><input name="eta" defaultValue={zone?.eta ?? "2–4 business days"} className="field !py-2" required /></div>
      <div><label className="label !text-xs">Order</label><input name="sortOrder" type="number" min={0} defaultValue={zone?.sortOrder ?? 0} className="field !py-2" /></div>
      <label className="flex items-center gap-2 text-sm h-10"><input type="checkbox" name="active" defaultChecked={zone?.active ?? true} className="accent-ink" /> Active</label>
      <SubmitButton className="!py-2.5" pendingText="…">{zone ? "Save" : "Add"}</SubmitButton>
      {state && <div className="sm:col-span-6"><FormMessage state={state} /></div>}
    </form>
  );
}

export function FreeDeliveryForm({ threshold }: { threshold: string }) {
  const [state, action] = useActionState<AdminState, FormData>(saveFreeDelivery, undefined);
  return (
    <form action={action} className="space-y-3">
      <FormMessage state={state} />
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="label" htmlFor="threshold">Free delivery on orders above (₦)</label>
          <input id="threshold" name="threshold" defaultValue={threshold} inputMode="decimal" className="field" placeholder="0 = disabled" />
        </div>
        <SubmitButton pendingText="Saving…">Save</SubmitButton>
      </div>
      <p className="text-xs text-muted">Set to 0 to always charge the zone fee.</p>
    </form>
  );
}
