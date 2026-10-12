import { prisma } from "@/lib/db";
import { formatMoney, toMajor } from "@/lib/money";
import { getFreeDeliveryThreshold } from "@/lib/settings";
import { PageHeader, Panel } from "@/components/admin/ui";
import { FreeDeliveryForm, ZoneForm } from "@/components/admin/forms";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { deleteZone } from "../actions";

export const metadata = { title: "Delivery" };
export const dynamic = "force-dynamic";

export default async function Delivery() {
  const [zones, threshold] = await Promise.all([prisma.deliveryZone.findMany({ orderBy: { sortOrder: "asc" } }), getFreeDeliveryThreshold()]);
  return (
    <>
      <PageHeader title="Delivery" subtitle="Locations customers can choose at checkout, with their fees and delivery times." />
      <div className="grid xl:grid-cols-[1fr_360px] gap-4 items-start">
        <Panel title="Delivery locations & charges">
          <div className="space-y-3">
            {zones.map((z) => (
              <div key={z.id} className={`rounded-2xl border border-line p-4 ${z.active ? "" : "opacity-60"}`}>
                <ZoneForm zone={{ id: z.id, name: z.name, fee: toMajor(z.fee), eta: z.eta, active: z.active, sortOrder: z.sortOrder }} />
                <div className="mt-2 flex justify-between items-center text-xs text-muted">
                  <span>Currently {z.fee === 0 ? "free" : formatMoney(z.fee)} · {z.active ? "shown at checkout" : "hidden"}</span>
                  <form action={deleteZone}>
                    <input type="hidden" name="id" value={z.id} />
                    <ConfirmButton message={`Delete "${z.name}"?`} className="text-danger underline">Delete</ConfirmButton>
                  </form>
                </div>
              </div>
            ))}
            <div className="rounded-2xl bg-bg p-4">
              <p className="text-sm font-medium mb-3">Add a location</p>
              <ZoneForm />
            </div>
          </div>
        </Panel>
        <Panel title="Free delivery">
          <FreeDeliveryForm threshold={threshold ? toMajor(threshold) : "0"} />
        </Panel>
      </div>
    </>
  );
}
