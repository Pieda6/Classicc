import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { deleteAddress, setDefaultAddress } from "../../actions";
import { AddressForm } from "./address-form";

export const metadata: Metadata = { title: "Addresses" };

export default async function AddressesPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const user = await requireUser();
  const { edit } = await searchParams;
  const [addresses, zones] = await Promise.all([
    prisma.address.findMany({ where: { userId: user.id }, orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }] }),
    prisma.deliveryZone.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
  ]);
  const editing = addresses.find((a) => a.id === edit);

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        {addresses.map((a) => (
          <div key={a.id} className="card p-6 text-sm">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{a.label}</p>
              {a.isDefault && <span className="rounded-full bg-ink text-paper text-[0.65rem] px-2.5 py-1 uppercase tracking-wide font-semibold">Default</span>}
            </div>
            <p className="mt-3 text-muted leading-relaxed">
              {a.fullName}<br />{a.line1}{a.line2 && <>, {a.line2}</>}<br />{a.city}, {a.state}<br />{a.phone}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={`/account/addresses?edit=${a.id}#address-form`} className="chip !py-1.5 !text-xs">Edit</a>
              {!a.isDefault && (
                <form action={setDefaultAddress}>
                  <input type="hidden" name="id" value={a.id} />
                  <button className="chip !py-1.5 !text-xs">Make default</button>
                </form>
              )}
              <form action={deleteAddress}>
                <input type="hidden" name="id" value={a.id} />
                <button className="chip !py-1.5 !text-xs text-danger">Delete</button>
              </form>
            </div>
          </div>
        ))}
      </div>
      <div className="card p-6 md:p-8" id="address-form">
        <h2 className="font-display text-xl font-semibold">{editing ? "Edit address" : "Add a new address"}</h2>
        <AddressForm
          key={editing?.id ?? "new"}
          zones={zones.map((z) => ({ id: z.id, name: z.name }))}
          address={editing ? { ...editing, line2: editing.line2 ?? "", zoneId: editing.zoneId ?? "" } : undefined}
        />
      </div>
    </div>
  );
}
