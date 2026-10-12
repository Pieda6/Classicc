"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, MessageCircle, Minus, Plus } from "lucide-react";
import { useCart } from "@/components/store/cart-context";
import { HeartButton } from "@/components/store/heart-button";
import { formatMoney } from "@/lib/money";
import { whatsappLink } from "@/lib/site";
import { LOW_STOCK } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Props = {
  freeThreshold: number;
  product: {
    id: string;
    slug: string;
    name: string;
    description: string;
    details: string[];
    price: number;
    compareAtPrice: number | null;
    images: { url: string; alt: string; color: string | null }[];
    variants: { id: string; size: string; color: string; stock: number }[];
    colors: { name: string; hex: string }[];
    sizes: string[];
  };
};

export function ProductView({ product, freeThreshold }: Props) {
  const { add, setDrawerOpen } = useCart();
  const firstAvailable = product.variants.find((v) => v.stock > 0);
  const [color, setColor] = useState(firstAvailable?.color ?? product.colors[0]?.name ?? "");
  const [size, setSize] = useState<string | null>(product.sizes.length === 1 ? product.sizes[0] : null);
  const [qty, setQty] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const images = useMemo(() => {
    const forColor = product.images.filter((i) => !i.color || i.color === color);
    return forColor.length ? forColor : product.images;
  }, [product.images, color]);
  const image = images[Math.min(imageIndex, images.length - 1)];

  const variant = product.variants.find((v) => v.color === color && v.size === size);
  const stockFor = (s: string) => product.variants.find((v) => v.color === color && v.size === s)?.stock ?? 0;
  const totalStock = product.variants.reduce((n, v) => n + v.stock, 0);

  const availability = (() => {
    if (totalStock === 0) return { text: "Sold out", tone: "text-danger" };
    if (!variant) return { text: "In stock — select a size", tone: "text-success" };
    if (variant.stock === 0) return { text: "This size is sold out in this colour", tone: "text-danger" };
    if (variant.stock <= LOW_STOCK) return { text: `Only ${variant.stock} left`, tone: "text-clay-dark" };
    return { text: "In stock, ready to ship", tone: "text-success" };
  })();

  function addToCart() {
    setError(null);
    if (!size) return setError("Please select a size.");
    if (!variant || variant.stock === 0) return setError("This option is out of stock.");
    add(
      {
        variantId: variant.id,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: images[0]?.url ?? null,
        size: variant.size,
        color: variant.color,
        unitPrice: product.price,
        maxStock: variant.stock,
      },
      qty,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
    setDrawerOpen(true);
  }

  return (
    <div className="grid lg:grid-cols-[1.15fr_1fr] gap-4 lg:gap-8 items-start">
      {/* Gallery — rounded app-style card with thumbnail rail */}
      <div className="card p-2 md:p-3 grid grid-cols-[1fr_auto] gap-2 md:gap-3 lg:sticky lg:top-28">
        <div className="relative aspect-[4/5] rounded-[1.4rem] overflow-hidden bg-stone">
          {image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={image.url} src={image.url} alt={image.alt} className="size-full object-cover animate-fade-up [animation-duration:400ms]" />
          )}
          <HeartButton className="absolute top-4 right-4 size-11" item={{ slug: product.slug, name: product.name, price: product.price, image: images[0]?.url ?? null }} />
        </div>
        <div className="flex flex-col gap-2 w-16 md:w-20">
          {images.map((img, i) => (
            <button
              key={img.url}
              onClick={() => setImageIndex(i)}
              aria-label={`Show image ${i + 1}`}
              className={cn(
                "aspect-[4/5] rounded-xl overflow-hidden bg-stone border-2 transition-colors",
                i === imageIndex ? "border-ink" : "border-transparent opacity-80 hover:opacity-100",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3">
        <div className="card p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <h1 className="font-display text-2xl md:text-3xl font-semibold leading-tight max-w-[16ch]">{product.name}</h1>
            <div className="text-right shrink-0">
              <p className="text-xl md:text-2xl font-semibold">
                <span className="text-muted font-normal text-base">Price: </span>
                {formatMoney(product.price)}
              </p>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <p className="text-sm text-muted line-through">{formatMoney(product.compareAtPrice)}</p>
              )}
            </div>
          </div>

          {product.colors.length > 0 && (
            <div className="mt-7">
              <p className="label">Colour: <span className="font-normal text-muted">{color}</span></p>
              <div className="flex gap-2.5">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => {
                      setColor(c.name);
                      setImageIndex(0);
                    }}
                    aria-label={c.name}
                    aria-pressed={c.name === color}
                    className={cn("size-10 rounded-full p-1 border-2 transition-colors", c.name === color ? "border-ink" : "border-transparent")}
                  >
                    <span className="block size-full rounded-full border border-black/10" style={{ background: c.hex }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <p className="label">Select size</p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => {
                const out = stockFor(s) === 0;
                return (
                  <button
                    key={s}
                    onClick={() => {
                      setSize(s);
                      setQty(1);
                      setError(null);
                    }}
                    disabled={out}
                    aria-pressed={size === s}
                    className={cn(
                      "min-w-12 h-12 px-3 rounded-full border text-sm transition-all",
                      size === s ? "bg-ink text-paper border-ink" : "border-line hover:border-ink",
                      out && "opacity-35 line-through cursor-not-allowed hover:border-line",
                    )}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            <p className={cn("mt-3 text-sm font-medium", availability.tone)}>{availability.text}</p>
          </div>

          <p className="mt-6 text-muted leading-relaxed">{product.description}</p>

          {product.details.length > 0 && (
            <ul className="mt-4 space-y-1.5 text-sm">
              {product.details.map((d) => (
                <li key={d} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0" /> {d}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex gap-3">
          <div className="card flex items-center px-2">
            <button aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))} className="size-11 grid place-items-center"><Minus size={16} /></button>
            <span className="w-8 text-center tabular-nums" aria-live="polite">{qty}</span>
            <button
              aria-label="Increase quantity"
              onClick={() => setQty((q) => Math.min(variant?.stock ?? 10, q + 1))}
              className="size-11 grid place-items-center"
            >
              <Plus size={16} />
            </button>
          </div>
          <button
            onClick={addToCart}
            disabled={totalStock === 0}
            className="flex-1 rounded-[1.75rem] bg-butter border border-[#ece6c2] py-6 text-lg font-medium hover:bg-[#f6f0c8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {totalStock === 0 ? "Sold out" : added ? "Added ✓" : "Add to cart"}
          </button>
        </div>
        {error && <p className="text-sm text-danger px-2" role="alert">{error}</p>}

        <div className="card divide-y divide-line">
          <Accordion title="Delivery">
            Delivered nationwide in 1–5 business days depending on your location. Delivery fees are calculated at checkout
            {freeThreshold > 0 ? ` — free on orders above ${formatMoney(freeThreshold)}.` : "."}
          </Accordion>
          <Accordion title="Returns & refunds">
            Unworn items with tags attached can be returned within 7 days of delivery. See our returns policy for details.
          </Accordion>
          <a href={whatsappLink(`Hi CLASSICC, I have a question about the ${product.name}`)} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-6 py-5 text-sm font-medium hover:bg-bg/50 rounded-b-[var(--radius-card)]">
            <MessageCircle size={18} /> Questions? Chat with us on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="group px-6 py-5">
      <summary className="flex items-center justify-between cursor-pointer list-none font-medium text-sm">
        {title}
        <ChevronDown size={18} className="transition-transform group-open:rotate-180" />
      </summary>
      <p className="mt-3 text-sm text-muted leading-relaxed">{children}</p>
    </details>
  );
}
