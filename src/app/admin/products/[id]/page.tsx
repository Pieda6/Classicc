import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { toMajor } from "@/lib/money";
import { sortSizes } from "@/lib/constants";
import { PageHeader } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/product-form";
import { deleteProduct } from "../../actions";
import { ConfirmButton } from "@/components/admin/confirm-button";

export const metadata = { title: "Edit product" };

export default async function EditProduct({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { id } = await params;
  const { saved } = await searchParams;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { images: { orderBy: { sortOrder: "asc" } }, variants: true } }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  if (!product) notFound();
  const sizeOrder = sortSizes([...new Set(product.variants.map((v) => v.size))]);
  const variants = [...product.variants].sort((a, b) => a.color.localeCompare(b.color) || sizeOrder.indexOf(a.size) - sizeOrder.indexOf(b.size));

  return (
    <>
      <PageHeader
        title={product.name}
        subtitle={`/${product.slug}`}
        action={
          <div className="flex gap-2">
            <Link href={`/product/${product.slug}`} target="_blank" className="btn btn-light">View in store</Link>
            <form action={deleteProduct}>
              <input type="hidden" name="id" value={product.id} />
              <ConfirmButton message={`Delete "${product.name}"? Past orders keep their records. This can't be undone.`} className="btn btn-light !text-danger">
                Delete
              </ConfirmButton>
            </form>
          </div>
        }
      />
      {saved && <p className="mb-4 rounded-xl bg-success/10 text-success px-4 py-3 text-sm">Product saved.</p>}
      <ProductForm
        categories={categories.map((c) => ({ id: c.id, name: c.name }))}
        product={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          details: product.details ?? "",
          price: toMajor(product.price),
          compareAtPrice: product.compareAtPrice ? toMajor(product.compareAtPrice) : "",
          categoryId: product.categoryId ?? "",
          gender: (["MEN", "WOMEN"].includes(product.gender) ? product.gender : "UNISEX") as "MEN" | "WOMEN" | "UNISEX",
          featured: product.featured,
          active: product.active,
          images: product.images.map((i) => ({ url: i.url, alt: i.alt ?? "", color: i.color ?? "" })),
          variants: variants.map((v) => ({ id: v.id, size: v.size, color: v.color, colorHex: v.colorHex, stock: v.stock, sku: v.sku ?? "" })),
        }}
      />
    </>
  );
}
