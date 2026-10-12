import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { icontains } from "@/lib/catalog";
import { LOW_STOCK, sortSizes } from "@/lib/constants";
import { PageHeader, Panel, Table } from "@/components/admin/ui";
import { updateStock } from "../actions";

export const metadata = { title: "Inventory" };
export const dynamic = "force-dynamic";

export default async function Inventory({ searchParams }: { searchParams: Promise<{ filter?: string; q?: string }> }) {
  const { filter = "all", q = "" } = await searchParams;
  const where: Prisma.ProductVariantWhereInput = {
    ...(filter === "low" && { stock: { gt: 0, lte: LOW_STOCK } }),
    ...(filter === "out" && { stock: 0 }),
    ...(q && { product: { name: icontains(q) } }),
  };
  const [variants, counts] = await Promise.all([
    prisma.productVariant.findMany({ where, include: { product: { select: { id: true, name: true, active: true } } }, orderBy: [{ product: { name: "asc" } }, { color: "asc" }] }),
    Promise.all([
      prisma.productVariant.count(),
      prisma.productVariant.count({ where: { stock: { gt: 0, lte: LOW_STOCK } } }),
      prisma.productVariant.count({ where: { stock: 0 } }),
    ]),
  ]);
  const order = sortSizes([...new Set(variants.map((v) => v.size))]);
  variants.sort((a, b) => a.product.name.localeCompare(b.product.name) || a.color.localeCompare(b.color) || order.indexOf(a.size) - order.indexOf(b.size));

  const tabs = [
    { key: "all", label: `All (${counts[0]})` },
    { key: "low", label: `Low stock (${counts[1]})` },
    { key: "out", label: `Out of stock (${counts[2]})` },
  ];

  return (
    <>
      <PageHeader title="Inventory" subtitle="Update stock per size and colour. Sold-out options can't be added to cart." />
      <Panel>
        <div className="flex flex-wrap gap-2 mb-4 items-center">
          {tabs.map((t) => (
            <Link key={t.key} href={`/admin/inventory?filter=${t.key}${q ? `&q=${encodeURIComponent(q)}` : ""}`} className="chip !py-1.5" data-active={filter === t.key}>{t.label}</Link>
          ))}
          <form className="ml-auto">
            <input type="hidden" name="filter" value={filter} />
            <input name="q" defaultValue={q} placeholder="Search product…" className="field !py-2 w-56" />
          </form>
        </div>
        <Table>
          <thead><tr><th>Product</th><th>Colour</th><th>Size</th><th>SKU</th><th>Stock</th></tr></thead>
          <tbody>
            {variants.map((v) => (
              <tr key={v.id}>
                <td>
                  <Link href={`/admin/products/${v.product.id}`} className="font-medium hover:underline">{v.product.name}</Link>
                  {!v.product.active && <span className="ml-2 text-xs text-muted">(hidden)</span>}
                </td>
                <td><span className="inline-flex items-center gap-2"><span className="size-3.5 rounded-full border border-line" style={{ background: v.colorHex }} />{v.color}</span></td>
                <td>{v.size}</td>
                <td className="text-muted text-xs">{v.sku ?? "—"}</td>
                <td>
                  <form action={updateStock} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={v.id} />
                    <input
                      name="stock"
                      type="number"
                      min={0}
                      defaultValue={v.stock}
                      aria-label={`Stock for ${v.product.name} ${v.color} ${v.size}`}
                      className={`field !py-1.5 !px-2 w-20 ${v.stock === 0 ? "!border-danger/60" : v.stock <= LOW_STOCK ? "!border-clay" : ""}`}
                    />
                    <button className="chip !py-1.5 !text-xs">Save</button>
                  </form>
                </td>
              </tr>
            ))}
            {variants.length === 0 && <tr><td colSpan={5} className="text-center text-muted !py-10">Nothing here — nice.</td></tr>}
          </tbody>
        </Table>
      </Panel>
    </>
  );
}
