import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { cardInclude, toCard } from "@/lib/catalog";
import { sortSizes } from "@/lib/constants";
import { getFreeDeliveryThreshold } from "@/lib/settings";
import { ProductCard } from "@/components/store/product-card";
import { ProductView } from "./product-view";

export const dynamic = "force-dynamic";

async function load(slug: string) {
  return prisma.product.findFirst({
    where: { slug, active: true },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: true,
      category: true,
    },
  });
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const product = await load((await params).slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: { images: product.images[0] ? [product.images[0].url] : [] },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const product = await load((await params).slug);
  if (!product) notFound();

  const [related, freeThreshold] = await Promise.all([
    prisma.product.findMany({
      where: { active: true, id: { not: product.id }, OR: [{ categoryId: product.categoryId }, { gender: product.gender }] },
      include: cardInclude,
      take: 4,
    }),
    getFreeDeliveryThreshold(),
  ]);

  const colors = [...new Map(product.variants.map((v) => [v.color, v.colorHex])).entries()].map(([name, hex]) => ({ name, hex }));
  const sizes = sortSizes([...new Set(product.variants.map((v) => v.size))]);

  return (
    <div className="container-x pt-4 md:pt-8">
      <nav className="flex items-center gap-2 text-sm text-muted mb-4 md:mb-6">
        <Link href="/shop" className="inline-flex items-center gap-1 hover:text-ink"><ChevronLeft size={16} /> Shop</Link>
        {product.category && (
          <>
            <span>/</span>
            <Link href={`/shop?category=${product.category.slug}`} className="hover:text-ink">{product.category.name}</Link>
          </>
        )}
      </nav>

      <ProductView
        freeThreshold={freeThreshold}
        product={{
          id: product.id,
          slug: product.slug,
          name: product.name,
          description: product.description,
          details: product.details?.split("\n").filter(Boolean) ?? [],
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          images: product.images.map((i) => ({ url: i.url, alt: i.alt ?? product.name, color: i.color })),
          variants: product.variants.map((v) => ({ id: v.id, size: v.size, color: v.color, stock: v.stock })),
          colors,
          sizes,
        }}
      />

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-2xl md:text-3xl font-semibold">You may also like</h2>
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-8 md:gap-x-5">
            {related.map((p) => (
              <ProductCard key={p.id} product={toCard(p)} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
