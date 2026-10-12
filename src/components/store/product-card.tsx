import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { HeartButton } from "./heart-button";

export type CardProduct = {
  slug: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  images: string[];
  inStock: boolean;
  colors?: string[];
};

export function ProductCard({ product, priority }: { product: CardProduct; priority?: boolean }) {
  const [first, second] = product.images;
  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-stone">
        {first && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={first}
            alt={product.name}
            loading={priority ? "eager" : "lazy"}
            className="absolute inset-0 size-full object-cover transition-all duration-700 group-hover:scale-[1.03]"
          />
        )}
        {second && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={second}
            alt=""
            aria-hidden
            loading="lazy"
            className="absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}
        <HeartButton
          className="absolute top-3 right-3"
          item={{ slug: product.slug, name: product.name, price: product.price, image: first ?? null }}
        />
        <div className="absolute top-3 left-3 flex gap-1.5">
          {!product.inStock && <span className="rounded-full bg-ink text-paper text-[0.65rem] font-semibold tracking-wider uppercase px-2.5 py-1">Sold out</span>}
          {product.inStock && product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="rounded-full bg-clay text-ink text-[0.65rem] font-semibold tracking-wider uppercase px-2.5 py-1">Sale</span>
          )}
        </div>
      </div>
      <div className="mt-3 px-1">
        <p className="text-[0.92rem] leading-snug line-clamp-1">{product.name}</p>
        <div className="mt-1 flex items-center gap-2">
          <p className="font-semibold">{formatMoney(product.price)}</p>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <p className="text-sm text-muted line-through">{formatMoney(product.compareAtPrice)}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
