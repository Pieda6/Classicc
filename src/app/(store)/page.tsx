import Link from "next/link";
import { ArrowRight, BadgeCheck, Lock, PackageOpen, Truck } from "lucide-react";
import { prisma } from "@/lib/db";
import { getFeatured, getNewest } from "@/lib/catalog";
import { ProductCard } from "@/components/store/product-card";
import { Marquee } from "@/components/store/marquee";

export const dynamic = "force-dynamic";

const groups = [
  { title: "Men", copy: "Elevated everyday essentials.", href: "/shop?gender=MEN", image: "/brand/category-men.svg" },
  { title: "Women", copy: "Effortless style for every you.", href: "/shop?gender=WOMEN", image: "/brand/category-women.svg" },
  { title: "Kids", copy: "Comfort meets cool everyday.", href: "/shop?gender=KIDS", image: "/brand/category-kids.svg" },
];

export default async function HomePage() {
  const [featured, newest, categories] = await Promise.all([
    getFeatured(8),
    getNewest(4),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" }, take: 6 }),
  ]);
  const year = new Date().getFullYear();

  return (
    <>
      {/* ---------- HERO: desktop editorial ---------- */}
      <section className="hidden md:block relative overflow-hidden">
        <div className="container-x relative h-[calc(100svh-7.25rem)] min-h-[600px] max-h-[860px]">
          <div className="absolute left-8 top-14 eyebrow leading-[2.2] animate-fade-up">
            <p>Fashion</p>
            <p>That moves</p>
            <p>With you.</p>
            <span className="block mt-3 w-9 h-px bg-ink" />
          </div>

          <h1
            className="absolute inset-x-0 top-[24%] text-center font-display font-semibold leading-[0.8] tracking-[-0.02em] select-none text-[clamp(6rem,16.2vw,15.5rem)] animate-fade-up"
            style={{ fontStretch: "105%" }}
          >
            CLASSICC
          </h1>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/hero-coat.svg"
            alt="The CLASSICC signature trench coat"
            className="absolute left-1/2 -translate-x-1/2 bottom-6 h-[86%] w-auto animate-fade-up [animation-delay:150ms]"
          />

          <div className="absolute left-8 bottom-16 flex items-center gap-8">
            <Link href="/shop" className="btn btn-dark rounded-none px-8">Shop now</Link>
            <Link href="/shop?sort=new" className="link-underline">Explore new in</Link>
          </div>
          <div className="absolute right-8 bottom-16 eyebrow leading-[2.2] text-right">
            <p>New</p>
            <p>Collection</p>
            <p>{year}</p>
            <span className="block mt-3 ml-auto w-9 h-px bg-ink" />
          </div>
        </div>
      </section>

      {/* ---------- HERO: mobile app style ---------- */}
      <section className="md:hidden px-3 pt-1 space-y-2">
        <div className="relative rounded-[2rem] overflow-hidden bg-stone h-[62svh] min-h-[420px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/hero-coat.svg" alt="The CLASSICC signature trench coat" className="absolute inset-x-0 mx-auto bottom-4 h-[88%] w-auto" />
          <p className="absolute top-5 inset-x-0 text-center eyebrow">New collection {year}</p>
          <p className="absolute -bottom-3 left-2 font-display text-[22vw] leading-none font-semibold text-ink/10 select-none">CLASSICC</p>
        </div>
        <div className="rounded-[2rem] bg-butter py-5">
          <Marquee words={["TIMELESS CLASSICS", "MADE TO MOVE"]} className="font-display font-extrabold text-6xl tracking-tight" />
        </div>
        <Link href="/shop" className="block rounded-[2rem] bg-clay text-center py-6 text-lg font-medium">
          Discover Now
        </Link>
      </section>

      {/* ---------- CATEGORY STRIP ---------- */}
      <section className="bg-ink text-paper mt-3 md:mt-0">
        <div className="container-x py-10 md:py-12 grid gap-8 md:grid-cols-3">
          {groups.map((g) => (
            <Link key={g.title} href={g.href} className="group flex items-center gap-6">
              <div className="w-24 md:w-28 aspect-[3/4] shrink-0 overflow-hidden rounded-xl md:rounded-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={g.image} alt="" className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div>
                <h2 className="text-lg font-medium tracking-[0.12em] uppercase">{g.title}</h2>
                <p className="mt-2 text-sm text-paper/70 max-w-[12rem]">{g.copy}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.12em] uppercase border-b border-paper pb-0.5">
                  Shop {g.title} <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- MARQUEE ---------- */}
      <section className="hidden md:block container-x mt-10">
        <div className="rounded-[2.25rem] bg-butter py-8 border border-[#ece6c2]">
          <Marquee words={["TIMELESS CLASSICS", "MADE TO MOVE", "ESSENTIALS FOR EVERY DAY"]} className="font-display font-extrabold text-[7rem] leading-none tracking-tight" />
        </div>
      </section>

      {/* ---------- TRENDING ---------- */}
      <section className="container-x mt-14 md:mt-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-muted">Curated for you</p>
            <h2 className="mt-2 font-display text-3xl md:text-4xl font-semibold">Trending now</h2>
          </div>
          <Link href="/shop" className="link-underline hidden sm:inline-block">View all</Link>
        </div>
        <div className="mt-6 flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
          <Link href="/shop?featured=1" className="chip" data-active="true">Trending</Link>
          {categories.map((c) => (
            <Link key={c.id} href={`/shop?category=${c.slug}`} className="chip">{c.name}</Link>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-8 md:gap-x-5">
          {featured.map((p, i) => (
            <ProductCard key={p.slug} product={p} priority={i < 4} />
          ))}
        </div>
      </section>

      {/* ---------- NEW SEASON ---------- */}
      <section className="mt-20 md:mt-24 bg-[#c9c7c1]">
        <div className="container-x grid md:grid-cols-2 items-center">
          <div className="py-14 md:py-20 order-2 md:order-1">
            <p className="eyebrow">New season</p>
            <h2 className="mt-5 font-display text-6xl md:text-8xl font-bold leading-[0.9] tracking-tight">NEW<br />VIBES</h2>
            <p className="mt-6 text-lg max-w-xs">Discover everything new and now — shirts, knits and outerwear in our quietest palette yet.</p>
            <Link href="/shop?sort=new" className="btn btn-dark rounded-none mt-8 px-8">Explore collection</Link>
          </div>
          <div className="order-1 md:order-2 relative h-[360px] md:h-[560px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/new-season.svg" alt="New season shirt" className="absolute inset-0 size-full object-cover" />
          </div>
        </div>
      </section>

      {/* ---------- FEATURES ---------- */}
      <section className="bg-stone">
        <div className="container-x py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { icon: Truck, title: "Fast delivery", copy: "Quick & safe nationwide" },
            { icon: PackageOpen, title: "Easy returns", copy: "Within 7 days" },
            { icon: BadgeCheck, title: "Quality assured", copy: "Fabrics that last" },
            { icon: Lock, title: "Secure payment", copy: "Protected by Paystack" },
          ].map(({ icon: Icon, title, copy }) => (
            <div key={title} className="flex items-start gap-4">
              <Icon size={30} strokeWidth={1.3} className="shrink-0" />
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide">{title}</p>
                <p className="text-sm text-muted mt-0.5">{copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- BEST OF ---------- */}
      <section className="container-x mt-16 md:mt-20">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-2xl md:text-3xl font-semibold uppercase tracking-wide">Best of CLASSICC</h2>
          <Link href="/shop?sort=new" className="link-underline">View all</Link>
        </div>
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-8 md:gap-x-5">
          {newest.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      {/* ---------- BRAND STORY ---------- */}
      <section className="container-x mt-20">
        <div className="card grid md:grid-cols-[1.1fr_1fr] overflow-hidden">
          <div className="p-8 md:p-14 flex flex-col justify-center">
            <p className="eyebrow text-muted">Our story</p>
            <h2 className="mt-4 font-display text-3xl md:text-5xl font-semibold leading-tight">Clothes you keep. Style that stays.</h2>
            <p className="mt-5 text-muted leading-relaxed max-w-md">
              CLASSICC was born from a simple idea: fewer, better pieces. We design timeless essentials in honest fabrics, cut to
              move with your day — from the commute to the weekend.
            </p>
            <Link href="/about" className="btn btn-dark mt-8 self-start">Read our story</Link>
          </div>
          <div className="relative min-h-[320px] bg-stone">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/about-1.svg" alt="" className="absolute inset-0 size-full object-cover" />
          </div>
        </div>
      </section>
    </>
  );
}
