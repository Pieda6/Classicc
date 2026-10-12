import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { icontains } from "@/lib/catalog";
import { formatMoney } from "@/lib/money";
import { LOW_STOCK } from "@/lib/constants";
import { PageHeader, Pagination, Panel, Table } from "@/components/admin/ui";
import { toggleProductActive } from "../actions";

export const metadata = { title: "Products" };
export const dynamic = "force-dynamic";

export default async function AdminProducts({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const page = Math.max(1, Number(sp.page) || 1);
  const where: Prisma.ProductWhereInput = {
    ...(q && { OR: [{ name: icontains(q) }, { slug: icontains(q) }] }),
    ...(sp.category && { categoryId: sp.category }),
    ...(sp.status === "active" && { active: true }),
    ...(sp.status === "hidden" && { active: false }),
  };
  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 }, variants: { select: { stock: true } }, category: true },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * 20,
      take: 20,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  const qs = (p: number) => `/admin/products?${new URLSearchParams({ ...Object.fromEntries(Object.entries(sp).filter(([, v]) => v)) as Record<string, string>, page: String(p) })}`;

  return (
    <>
      <PageHeader
        title="Products"
        subtitle={`${total} products`}
        action={<Link href="/admin/products/new" className="btn btn-dark"><Plus size={16} /> Add product</Link>}
      />
      {sp.deleted && <p className="mb-4 rounded-xl bg-success/10 text-success px-4 py-3 text-sm">Product deleted.</p>}
      <Panel>
        <form className="flex flex-wrap gap-2 mb-4">
          <input name="q" defaultValue={q} placeholder="Search products…" className="field !py-2 max-w-xs" />
          <select name="category" defaultValue={sp.category ?? ""} className="field !py-2 !w-auto">
            <option value="">All categories</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select name="status" defaultValue={sp.status ?? ""} className="field !py-2 !w-auto">
            <option value="">Any status</option>
            <option value="active">Visible</option>
            <option value="hidden">Hidden</option>
          </select>
          <button className="btn btn-light !py-2">Filter</button>
        </form>
        <Table>
          <thead>
            <tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const stock = p.variants.reduce((n, v) => n + v.stock, 0);
              return (
                <tr key={p.id}>
                  <td>
                    <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 hover:underline">
                      <span className="w-10 aspect-[4/5] rounded-lg overflow-hidden bg-stone shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {p.images[0] && <img src={p.images[0].url} alt="" className="size-full object-cover" />}
                      </span>
                      <span className="font-medium">{p.name}{p.featured && <span className="ml-2 text-[0.65rem] rounded-full bg-butter px-2 py-0.5 align-middle">Featured</span>}</span>
                    </Link>
                  </td>
                  <td className="text-muted">{p.category?.name ?? "—"}</td>
                  <td>{formatMoney(p.price)}</td>
                  <td className={stock === 0 ? "text-danger font-medium" : stock <= LOW_STOCK * 2 ? "text-clay-dark font-medium" : ""}>
                    {stock === 0 ? "Out of stock" : `${stock} in ${p.variants.length} variants`}
                  </td>
                  <td>
                    <form action={toggleProductActive}>
                      <input type="hidden" name="id" value={p.id} />
                      <button className={`rounded-full px-2.5 py-1 text-xs font-medium ${p.active ? "bg-success/12 text-success" : "bg-ink/8 text-muted"}`} title="Toggle visibility">
                        {p.active ? "Visible" : "Hidden"}
                      </button>
                    </form>
                  </td>
                  <td className="text-right"><Link href={`/admin/products/${p.id}`} className="link-underline !text-[0.7rem]">Edit</Link></td>
                </tr>
              );
            })}
            {products.length === 0 && <tr><td colSpan={6} className="text-center text-muted !py-10">No products found.</td></tr>}
          </tbody>
        </Table>
        <Pagination page={page} pages={Math.ceil(total / 20)} href={qs} />
      </Panel>
    </>
  );
}
