"use server";

import { prisma } from "@/lib/db";

export type FreshVariant = {
  variantId: string;
  available: boolean;
  stock: number;
  unitPrice: number;
  name: string;
};

/** Returns current price/stock for the variants in a client-side cart. */
export async function refreshCart(variantIds: string[]): Promise<FreshVariant[]> {
  const ids = [...new Set(variantIds)].slice(0, 100);
  if (!ids.length) return [];
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: ids } },
    include: { product: { select: { name: true, price: true, active: true } } },
  });
  return ids.map((id) => {
    const v = variants.find((x) => x.id === id);
    if (!v) return { variantId: id, available: false, stock: 0, unitPrice: 0, name: "" };
    return {
      variantId: id,
      available: v.product.active && v.stock > 0,
      stock: v.stock,
      unitPrice: v.product.price,
      name: v.product.name,
    };
  });
}
