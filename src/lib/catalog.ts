import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "./db";
import type { CardProduct } from "@/components/store/product-card";

export const cardInclude = {
  images: { orderBy: { sortOrder: "asc" }, take: 3 },
  variants: { select: { stock: true, color: true } },
} satisfies Prisma.ProductInclude;

type CardSource = Prisma.ProductGetPayload<{ include: typeof cardInclude }>;

export function toCard(p: CardSource): CardProduct {
  // Use the first and third image (front + alternate background) for the hover swap.
  const urls = p.images.map((i) => i.url);
  return {
    slug: p.slug,
    name: p.name,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    images: urls.length >= 3 ? [urls[0], urls[2]] : urls,
    inStock: p.variants.some((v) => v.stock > 0),
    colors: [...new Set(p.variants.map((v) => v.color))],
  };
}

export async function getFeatured(take = 8) {
  const rows = await prisma.product.findMany({
    where: { active: true, featured: true },
    include: cardInclude,
    orderBy: { createdAt: "desc" },
    take,
  });
  return rows.map(toCard);
}

export async function getNewest(take = 4) {
  const rows = await prisma.product.findMany({
    where: { active: true },
    include: cardInclude,
    orderBy: { createdAt: "desc" },
    take,
  });
  return rows.map(toCard);
}

const isPostgres = (process.env.DATABASE_URL || "").startsWith("postgres");

/** Case-insensitive "contains" that works on both SQLite and Postgres. */
export function icontains(q: string): Prisma.StringFilter {
  // `mode` only exists on the Postgres client types, hence the cast.
  return isPostgres ? ({ contains: q, mode: "insensitive" } as Prisma.StringFilter) : { contains: q };
}
