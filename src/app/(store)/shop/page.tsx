import Link from "next/link";
import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import { Search, SlidersHorizontal } from "lucide-react";
import { prisma } from "@/lib/db";
import { cardInclude, icontains, toCard } from "@/lib/catalog";
import { sortSizes } from "@/lib/constants";
import { toMinor } from "@/lib/money";
import { ProductCard } from "@/components/store/product-card";

export const metadata: Metadata = { title: "Shop" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;
const SORTS: Record<string, { label: string; orderBy: Prisma.ProductOrderByWithRelationInput }> = {
  new: { label: "Newest", orderBy: { createdAt: "desc" } },
  "price-asc": { label: "Price: low to high", orderBy: { price: "asc" } },
  "price-desc": { label: "Price: high to low", orderBy: { price: "desc" } },
  name: { label: "Name A–Z", orderBy: { name: "asc" } },
};
const GENDER_LABEL: Record<string, string> = { MEN: "Men", WOMEN: "Women", KIDS: "Kids" };

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";
const many = (v: string | string[] | undefined) => (Array.isArray(v) ? v : v ? [v] : []);

export default async function ShopPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const q = one(sp.q).trim();
  const category = one(sp.category);
  const gender = one(sp.gender);
  const sizes = many(sp.size);
  const colors = many(sp.color);
  const min = one(sp.min);
  const max = one(sp.max);
  const inStock = one(sp.instock) === "1";
  const featured = one(sp.featured) === "1";
  const sort = SORTS[one(sp.sort)] ? one(sp.sort) : "new";
  const page = Math.max(1, Number(one(sp.page)) || 1);

  const variantFilter: Prisma.ProductVariantWhereInput = {};
  if (sizes.length) variantFilter.size = { in: sizes };
  if (colors.length) variantFilter.color = { in: colors };
  if (inStock) variantFilter.stock = { gt: 0 };

  const price: Prisma.IntFilter = {};
  if (min && Number.isFinite(toMinor(min))) price.gte = toMinor(min);
  if (max && Number.isFinite(toMinor(max))) price.lte = toMinor(max);

  // Base filters (search / category / department) also scope the size & colour facets.
  const base: Prisma.ProductWhereInput = {
    active: true,
    ...(q && { OR: [{ name: icontains(q) }, { description: icontains(q) }, { category: { name: icontains(q) } }] }),
    ...(category && { category: { slug: category } }),
    ...(gender && { gender: gender === "KIDS" ? "KIDS" : { in: [gender, "UNISEX"] } }),
    ...(featured && { featured: true }),
  };
  const where: Prisma.ProductWhereInput = {
    ...base,
    ...(Object.keys(variantFilter).length && { variants: { some: variantFilter } }),
    ...(Object.keys(price).length && { price }),
  };

  const [products, total, categories, facets] = await Promise.all([
    prisma.product.findMany({
      where,
      include: cardInclude,
      orderBy: SORTS[sort].orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.productVariant.findMany({
      where: { product: base },
      select: { size: true, color: true, colorHex: true },
    }),
  ]);

  const allSizes = sortSizes([...new Set(facets.map((f) => f.size))]);
  const allColors = [...new Map(facets.map((f) => [f.color, f.colorHex])).entries()].sort((a, b) => a[0].localeCompare(b[0]));
  const pages = Math.ceil(total / PAGE_SIZE);
  const activeCategory = categories.find((c) => c.slug === category);
  const title = q ? `Results for “${q}”` : activeCategory?.name ?? (GENDER_LABEL[gender] ? `Shop ${GENDER_LABEL[gender]}` : featured ? "Trending" : "Shop all");

  const href = (patch: Record<string, string | null>) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) for (const val of many(v)) params.append(k, val);
    for (const [k, v] of Object.entries(patch)) {
      params.delete(k);
      if (v) params.set(k, v);
    }
    if (!("page" in patch)) params.delete("page");
    const s = params.toString();
    return `/shop${s ? `?${s}` : ""}`;
  };

  const filterForm = (
    <form action="/shop" className="space-y-7">
      {q && <input type="hidden" name="q" value={q} />}
      {category && <input type="hidden" name="category" value={category} />}
      {gender && <input type="hidden" name="gender" value={gender} />}
      <input type="hidden" name="sort" value={sort} />
      <fieldset>
        <legend className="label mb-3">Size</legend>
        <div className="flex flex-wrap gap-2">
          {allSizes.map((s) => (
            <label key={s} className="cursor-pointer">
              <input type="checkbox" name="size" value={s} defaultChecked={sizes.includes(s)} className="peer sr-only" />
              <span className="inline-grid place-items-center min-w-11 h-11 px-2 rounded-full border border-line bg-paper text-xs peer-checked:bg-ink peer-checked:text-paper peer-checked:border-ink peer-focus-visible:outline-2">
                {s}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="label mb-3">Colour</legend>
        <div className="grid grid-cols-2 gap-2">
          {allColors.map(([name, hex]) => (
            <label key={name} className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" name="color" value={name} defaultChecked={colors.includes(name)} className="accent-ink" />
              <span className="size-4 rounded-full border border-line" style={{ background: hex }} />
              {name}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="label mb-3">Price (₦)</legend>
        <div className="flex items-center gap-2">
          <input name="min" defaultValue={min} inputMode="numeric" placeholder="Min" className="field !py-2" aria-label="Minimum price" />
          <span className="text-muted">–</span>
          <input name="max" defaultValue={max} inputMode="numeric" placeholder="Max" className="field !py-2" aria-label="Maximum price" />
        </div>
      </fieldset>
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" name="instock" value="1" defaultChecked={inStock} className="accent-ink" /> In stock only
      </label>
      <div className="flex gap-2">
        <button className="btn btn-dark flex-1">Apply</button>
        <Link href={href({ size: null, color: null, min: null, max: null, instock: null })} className="btn btn-light">Clear</Link>
      </div>
    </form>
  );

  return (
    <div className="container-x pt-6 md:pt-10">
      {/* Search + title */}
      <div className="card p-3 md:p-4">
        <form action="/shop" className="flex items-center gap-3 bg-bg rounded-full px-5 h-14">
          {category && <input type="hidden" name="category" value={category} />}
          {gender && <input type="hidden" name="gender" value={gender} />}
          <Search size={19} strokeWidth={1.7} />
          <input name="q" defaultValue={q} placeholder="Search your needs" aria-label="Search products" className="flex-1 bg-transparent outline-none" />
          <button className="btn btn-dark !py-2.5 !px-5 -mr-3">Search</button>
        </form>
      </div>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-muted">{total} {total === 1 ? "piece" : "pieces"}</p>
          <h1 className="mt-2 font-display text-4xl md:text-5xl font-semibold">{title}</h1>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          {["", "MEN", "WOMEN", "KIDS"].map((g) => (
            <Link key={g} href={href({ gender: g || null })} className="chip" data-active={gender === g}>
              {g ? GENDER_LABEL[g] : "All"}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
        <Link href={href({ category: null, featured: null })} className="chip" data-active={!category && !featured}>All</Link>
        <Link href={href({ category: null, featured: "1" })} className="chip" data-active={featured}>Trending</Link>
        {categories.map((c) => (
          <Link key={c.id} href={href({ category: c.slug, featured: null })} className="chip" data-active={category === c.slug}>
            {c.name}
          </Link>
        ))}
      </div>

      <div className="mt-8 grid lg:grid-cols-[250px_1fr] gap-10">
        <aside className="hidden lg:block">
          <div className="sticky top-28">{filterForm}</div>
        </aside>

        <div className="min-w-0">
          <div className="flex items-center justify-between gap-3 mb-6">
            <details className="lg:hidden group relative">
              <summary className="chip cursor-pointer list-none gap-2"><SlidersHorizontal size={15} /> Filters</summary>
              <div className="absolute z-30 mt-2 w-[min(88vw,22rem)] card p-6 shadow-xl">{filterForm}</div>
            </details>
            <div className="ml-auto min-w-0 flex items-center gap-2 text-sm">
              <span className="text-muted hidden sm:inline">Sort by</span>
              <div className="flex gap-1 overflow-x-auto no-scrollbar min-w-0">
                {Object.entries(SORTS).map(([key, s]) => (
                  <Link key={key} href={href({ sort: key })} className="chip !py-1.5 !text-xs" data-active={sort === key}>
                    {s.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="font-display text-2xl font-semibold">Nothing matches — yet.</p>
              <p className="text-muted mt-2">Try removing a filter or searching for something else.</p>
              <Link href="/shop" className="btn btn-dark mt-6">Clear all filters</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-x-3 gap-y-8 md:gap-x-5">
              {products.map((p, i) => (
                <ProductCard key={p.id} product={toCard(p)} priority={i < 3} />
              ))}
            </div>
          )}

          {pages > 1 && (
            <nav className="mt-12 flex justify-center gap-2" aria-label="Pagination">
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <Link key={n} href={href({ page: String(n) })} className="chip size-11 justify-center !p-0" data-active={n === page} aria-current={n === page ? "page" : undefined}>
                  {n}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
