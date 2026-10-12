import { prisma } from "@/lib/db";
import { PageHeader, Panel, Table } from "@/components/admin/ui";
import { CategoryForm } from "@/components/admin/forms";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { deleteCategory } from "../actions";

export const metadata = { title: "Categories" };
export const dynamic = "force-dynamic";

export default async function Categories({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const { edit } = await searchParams;
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { products: true } } } });
  const editing = categories.find((c) => c.id === edit);

  return (
    <>
      <PageHeader title="Categories" subtitle="Organise products for the shop filters and navigation." />
      <div className="grid xl:grid-cols-[1fr_380px] gap-4 items-start">
        <Panel>
          <Table>
            <thead><tr><th>Category</th><th>Slug</th><th>Products</th><th>Order</th><th></th></tr></thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td className="font-medium">
                    <div className="flex items-center gap-3">
                      <span className="size-9 rounded-lg bg-stone overflow-hidden shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {c.image && <img src={c.image} alt="" className="size-full object-cover" />}
                      </span>
                      {c.name}
                    </div>
                  </td>
                  <td className="text-muted">{c.slug}</td>
                  <td>{c._count.products}</td>
                  <td>{c.sortOrder}</td>
                  <td className="text-right whitespace-nowrap">
                    <a href={`/admin/categories?edit=${c.id}`} className="link-underline !text-[0.7rem] mr-4">Edit</a>
                    <form action={deleteCategory} className="inline">
                      <input type="hidden" name="id" value={c.id} />
                      <ConfirmButton message={`Delete "${c.name}"? Its ${c._count.products} products will become uncategorised.`} className="link-underline !text-[0.7rem] text-danger">Delete</ConfirmButton>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Panel>
        <Panel title={editing ? `Edit ${editing.name}` : "New category"}>
          <CategoryForm
            key={editing?.id ?? "new"}
            onDoneHref="/admin/categories"
            category={editing ? { id: editing.id, name: editing.name, slug: editing.slug, description: editing.description ?? "", image: editing.image ?? "", sortOrder: editing.sortOrder } : undefined}
          />
        </Panel>
      </div>
    </>
  );
}
