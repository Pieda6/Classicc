import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/product-form";

export const metadata = { title: "New product" };

export default async function NewProduct() {
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <>
      <PageHeader title="Add product" />
      <ProductForm categories={categories.map((c) => ({ id: c.id, name: c.name }))} />
    </>
  );
}
