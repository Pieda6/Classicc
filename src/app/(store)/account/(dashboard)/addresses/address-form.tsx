"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveAddress } from "../../actions";
import { Field, FormMessage, SubmitButton } from "@/components/store/form-bits";

type Address = { id: string; label: string; fullName: string; phone: string; line1: string; line2: string; city: string; state: string; zoneId: string; isDefault: boolean };

export function AddressForm({ zones, address }: { zones: { id: string; name: string }[]; address?: Address }) {
  const [state, action] = useActionState(saveAddress, undefined);
  const fe = state?.fieldErrors ?? {};
  return (
    <form action={action} className="mt-6 grid sm:grid-cols-2 gap-4">
      {address && <input type="hidden" name="id" value={address.id} />}
      <div className="sm:col-span-2"><FormMessage state={state} /></div>
      <Field name="label" label="Label (e.g. Home, Office)" defaultValue={address?.label ?? "Home"} error={fe.label} />
      <Field name="fullName" label="Full name" defaultValue={address?.fullName} error={fe.fullName} />
      <Field name="phone" label="Phone" type="tel" defaultValue={address?.phone} error={fe.phone} />
      <div>
        <label htmlFor="zoneId" className="label">Delivery location</label>
        <select id="zoneId" name="zoneId" defaultValue={address?.zoneId ?? ""} className="field">
          <option value="">Select…</option>
          {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
        </select>
      </div>
      <Field name="line1" label="Street address" defaultValue={address?.line1} error={fe.line1} className="sm:col-span-2" />
      <Field name="line2" label="Apartment, landmark (optional)" defaultValue={address?.line2} className="sm:col-span-2" />
      <Field name="city" label="City" defaultValue={address?.city} error={fe.city} />
      <Field name="state" label="State" defaultValue={address?.state} error={fe.state} />
      <label className="flex items-center gap-2 text-sm sm:col-span-2">
        <input type="checkbox" name="isDefault" defaultChecked={address?.isDefault} className="accent-ink" /> Set as default address
      </label>
      <div className="sm:col-span-2 flex gap-2">
        <SubmitButton pendingText="Saving…">{address ? "Save changes" : "Add address"}</SubmitButton>
        {address && <Link href="/account/addresses" className="btn btn-light">Cancel</Link>}
      </div>
    </form>
  );
}
