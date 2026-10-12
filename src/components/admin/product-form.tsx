"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ImagePlus, Plus, Trash2, Wand2 } from "lucide-react";
import { saveProduct, uploadImages, type ProductInput } from "@/app/admin/actions";
import { slugify } from "@/lib/utils";

type Img = { url: string; alt: string; color: string };
type Variant = { id?: string; size: string; color: string; colorHex: string; stock: number; sku: string };
type Product = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  details: string;
  price: string;
  compareAtPrice: string;
  categoryId: string;
  gender: "MEN" | "WOMEN" | "KIDS" | "UNISEX";
  featured: boolean;
  active: boolean;
  images: Img[];
  variants: Variant[];
};

const EMPTY: Product = {
  name: "",
  slug: "",
  description: "",
  details: "",
  price: "",
  compareAtPrice: "",
  categoryId: "",
  gender: "UNISEX",
  featured: false,
  active: true,
  images: [],
  variants: [],
};

export function ProductForm({ product, categories }: { product?: Product; categories: { id: string; name: string }[] }) {
  const router = useRouter();
  const [p, setP] = useState<Product>(product ?? EMPTY);
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [gen, setGen] = useState({ sizes: "XS, S, M, L, XL", color: "", hex: "#111111", stock: "10" });
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof Product>(k: K, v: Product[K]) => setP((prev) => ({ ...prev, [k]: v }));
  const colors = [...new Set(p.variants.map((v) => v.color).filter(Boolean))];

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("files", f));
    const res = await uploadImages(fd);
    setUploading(false);
    if (res.error) setError(res.error);
    if (res.urls.length) set("images", [...p.images, ...res.urls.map((url) => ({ url, alt: p.name, color: "" }))]);
    if (fileRef.current) fileRef.current.value = "";
  }

  function moveImage(i: number, dir: -1 | 1) {
    const next = [...p.images];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    set("images", next);
  }

  function updateVariant(i: number, patch: Partial<Variant>) {
    set("variants", p.variants.map((v, idx) => (idx === i ? { ...v, ...patch } : v)));
  }

  function generateVariants() {
    if (!gen.color.trim()) return setError("Enter a colour name to generate variants.");
    const sizes = gen.sizes.split(",").map((s) => s.trim()).filter(Boolean);
    const existing = new Set(p.variants.map((v) => `${v.size}|${v.color}`.toLowerCase()));
    const add = sizes
      .filter((s) => !existing.has(`${s}|${gen.color.trim()}`.toLowerCase()))
      .map((size) => ({ size, color: gen.color.trim(), colorHex: gen.hex, stock: Number(gen.stock) || 0, sku: "" }));
    set("variants", [...p.variants, ...add]);
    setError(null);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const payload: ProductInput = {
        ...p,
        id: p.id,
        images: p.images.map((i) => ({ url: i.url, alt: i.alt || null, color: i.color || null })),
        variants: p.variants.map((v) => ({ ...v, stock: Number(v.stock) || 0, sku: v.sku || null })),
      };
      const res = await saveProduct(payload);
      if (res.error) {
        setError(res.error);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      router.push(`/admin/products/${res.id}?saved=1`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} className="grid xl:grid-cols-[1fr_340px] gap-4 items-start">
      <div className="space-y-4 min-w-0">
        {error && <p className="rounded-xl bg-danger/10 text-danger px-4 py-3 text-sm" role="alert">{error}</p>}

        <section className="card p-5 md:p-6 space-y-4">
          <h2 className="font-semibold">Details</h2>
          <div>
            <label className="label" htmlFor="name">Name</label>
            <input
              id="name"
              className="field"
              value={p.name}
              onChange={(e) => {
                set("name", e.target.value);
                if (!slugTouched) set("slug", slugify(e.target.value));
              }}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="slug">URL slug</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted">/product/</span>
              <input id="slug" className="field" value={p.slug} onChange={(e) => { setSlugTouched(true); set("slug", e.target.value); }} />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="description">Description</label>
            <textarea id="description" className="field" rows={5} value={p.description} onChange={(e) => set("description", e.target.value)} required />
          </div>
          <div>
            <label className="label" htmlFor="details">Key details <span className="font-normal text-muted">(one per line)</span></label>
            <textarea id="details" className="field" rows={4} value={p.details} onChange={(e) => set("details", e.target.value)} placeholder={"100% cotton\nRelaxed fit"} />
          </div>
        </section>

        <section className="card p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Images</h2>
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="btn btn-light !py-2">
              <ImagePlus size={16} /> {uploading ? "Uploading…" : "Upload"}
            </button>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" multiple hidden onChange={(e) => onFiles(e.target.files)} />
          </div>
          {p.images.length === 0 ? (
            <button type="button" onClick={() => fileRef.current?.click()} className="w-full rounded-2xl border-2 border-dashed border-line py-12 text-center text-sm text-muted hover:border-ink/40">
              Click to upload product photos (JPG, PNG or WebP, up to 5MB each)
            </button>
          ) : (
            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {p.images.map((img, i) => (
                <li key={`${img.url}-${i}`} className="rounded-2xl border border-line overflow-hidden bg-bg">
                  <div className="relative aspect-[4/5] bg-stone">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt="" className="size-full object-cover" />
                    {i === 0 && <span className="absolute top-2 left-2 rounded-full bg-ink text-paper text-[0.6rem] px-2 py-0.5 uppercase tracking-wide">Main</span>}
                  </div>
                  <div className="p-2 space-y-1.5">
                    <select value={img.color} onChange={(e) => set("images", p.images.map((x, idx) => (idx === i ? { ...x, color: e.target.value } : x)))} className="field !py-1.5 !px-2 !text-xs !rounded-lg" aria-label="Linked colour">
                      <option value="">All colours</option>
                      {colors.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <div className="flex justify-between">
                      <div className="flex gap-1">
                        <button type="button" aria-label="Move left" onClick={() => moveImage(i, -1)} className="size-7 rounded-full bg-paper grid place-items-center disabled:opacity-30" disabled={i === 0}><ArrowLeft size={13} /></button>
                        <button type="button" aria-label="Move right" onClick={() => moveImage(i, 1)} className="size-7 rounded-full bg-paper grid place-items-center disabled:opacity-30" disabled={i === p.images.length - 1}><ArrowRight size={13} /></button>
                      </div>
                      <button type="button" aria-label="Remove image" onClick={() => set("images", p.images.filter((_, idx) => idx !== i))} className="size-7 rounded-full bg-paper grid place-items-center text-danger"><Trash2 size={13} /></button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex gap-2">
            <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="…or paste an image URL (https://…)" className="field !py-2 text-sm" />
            <button
              type="button"
              className="btn btn-light !py-2"
              onClick={() => {
                if (!imageUrl.trim()) return;
                set("images", [...p.images, { url: imageUrl.trim(), alt: p.name, color: "" }]);
                setImageUrl("");
              }}
            >
              Add
            </button>
          </div>
          <p className="text-xs text-muted mt-2">The first image is the main photo. Link images to a colour to switch the gallery when shoppers pick that colour.</p>
        </section>

        <section className="card p-5 md:p-6">
          <h2 className="font-semibold">Variants & stock</h2>
          <p className="text-sm text-muted mt-1">Each size and colour combination has its own stock level.</p>

          <div className="mt-4 rounded-2xl bg-bg p-4 grid sm:grid-cols-[1.4fr_1fr_auto_80px_auto] gap-2 items-end">
            <div><label className="label !text-xs">Sizes (comma separated)</label><input className="field !py-2" value={gen.sizes} onChange={(e) => setGen({ ...gen, sizes: e.target.value })} /></div>
            <div><label className="label !text-xs">Colour name</label><input className="field !py-2" value={gen.color} onChange={(e) => setGen({ ...gen, color: e.target.value })} placeholder="e.g. Black" /></div>
            <div><label className="label !text-xs">Swatch</label><input type="color" className="h-10 w-12 rounded-lg border border-line bg-paper p-1" value={gen.hex} onChange={(e) => setGen({ ...gen, hex: e.target.value })} /></div>
            <div><label className="label !text-xs">Stock each</label><input className="field !py-2" inputMode="numeric" value={gen.stock} onChange={(e) => setGen({ ...gen, stock: e.target.value })} /></div>
            <button type="button" onClick={generateVariants} className="btn btn-dark !py-2.5"><Wand2 size={15} /> Generate</button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted">
                  <th className="py-2 pr-2 font-medium">Size</th><th className="py-2 pr-2 font-medium">Colour</th><th className="py-2 pr-2 font-medium">Swatch</th>
                  <th className="py-2 pr-2 font-medium">Stock</th><th className="py-2 pr-2 font-medium">SKU</th><th />
                </tr>
              </thead>
              <tbody>
                {p.variants.map((v, i) => (
                  <tr key={v.id ?? `new-${i}`} className="border-t border-line">
                    <td className="py-2 pr-2"><input className="field !py-1.5 !px-2 w-20" value={v.size} onChange={(e) => updateVariant(i, { size: e.target.value })} aria-label="Size" /></td>
                    <td className="py-2 pr-2"><input className="field !py-1.5 !px-2" value={v.color} onChange={(e) => updateVariant(i, { color: e.target.value })} aria-label="Colour" /></td>
                    <td className="py-2 pr-2"><input type="color" className="h-9 w-11 rounded-lg border border-line bg-paper p-1" value={v.colorHex} onChange={(e) => updateVariant(i, { colorHex: e.target.value })} aria-label="Swatch" /></td>
                    <td className="py-2 pr-2"><input className={`field !py-1.5 !px-2 w-20 ${Number(v.stock) === 0 ? "!border-danger/50" : ""}`} inputMode="numeric" value={v.stock} onChange={(e) => updateVariant(i, { stock: Number(e.target.value.replace(/\D/g, "")) })} aria-label="Stock" /></td>
                    <td className="py-2 pr-2"><input className="field !py-1.5 !px-2" value={v.sku} onChange={(e) => updateVariant(i, { sku: e.target.value })} aria-label="SKU" /></td>
                    <td className="py-2 text-right"><button type="button" aria-label="Remove variant" onClick={() => set("variants", p.variants.filter((_, idx) => idx !== i))} className="size-8 rounded-full hover:bg-bg grid place-items-center text-danger"><Trash2 size={15} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" onClick={() => set("variants", [...p.variants, { size: "", color: colors[0] ?? "", colorHex: "#111111", stock: 0, sku: "" }])} className="mt-3 chip gap-1.5">
            <Plus size={14} /> Add variant
          </button>
        </section>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-8">
        <section className="card p-5 md:p-6 space-y-4">
          <h2 className="font-semibold">Pricing (₦)</h2>
          <div>
            <label className="label" htmlFor="price">Price</label>
            <input id="price" className="field" inputMode="decimal" value={p.price} onChange={(e) => set("price", e.target.value)} placeholder="25000" required />
          </div>
          <div>
            <label className="label" htmlFor="compare">Compare-at price <span className="font-normal text-muted">(optional, shows “Sale”)</span></label>
            <input id="compare" className="field" inputMode="decimal" value={p.compareAtPrice} onChange={(e) => set("compareAtPrice", e.target.value)} />
          </div>
        </section>
        <section className="card p-5 md:p-6 space-y-4">
          <h2 className="font-semibold">Organisation</h2>
          <div>
            <label className="label" htmlFor="category">Category</label>
            <select id="category" className="field" value={p.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
              <option value="">Uncategorised</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="gender">Department</label>
            <select id="gender" className="field" value={p.gender} onChange={(e) => set("gender", e.target.value as Product["gender"])}>
              <option value="UNISEX">Unisex</option>
              <option value="MEN">Men</option>
              <option value="WOMEN">Women</option>
              <option value="KIDS">Kids</option>
            </select>
          </div>
          <label className="flex items-center justify-between gap-3 text-sm">
            <span><span className="font-medium">Visible in store</span><br /><span className="text-muted text-xs">Hidden products can&apos;t be bought.</span></span>
            <input type="checkbox" className="size-5 accent-ink" checked={p.active} onChange={(e) => set("active", e.target.checked)} />
          </label>
          <label className="flex items-center justify-between gap-3 text-sm">
            <span><span className="font-medium">Featured / trending</span><br /><span className="text-muted text-xs">Shown on the home page.</span></span>
            <input type="checkbox" className="size-5 accent-ink" checked={p.featured} onChange={(e) => set("featured", e.target.checked)} />
          </label>
        </section>
        <button disabled={pending || uploading} className="btn btn-dark w-full !py-4">{pending ? "Saving…" : p.id ? "Save changes" : "Create product"}</button>
      </aside>
    </form>
  );
}
