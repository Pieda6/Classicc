import Link from "next/link";
import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Our story",
  description: "The story of CLASSICCC — timeless elegance, vintage inspiration and modern luxury. Move in silence. Leave a lasting impression.",
};

const pillars = [
  { n: "01", title: "Beyond trends", copy: "Born from a vision that outlasts the season." },
  { n: "02", title: "Vintage, made modern", copy: "Vintage inspiration blended with modern luxury." },
  { n: "03", title: "Quiet presence", copy: "Pieces that speak without saying too much." },
  { n: "04", title: "Individuality", copy: "For those who move differently and stand apart." },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="container-x pt-10 md:pt-16">
        <p className="eyebrow text-muted">The story of CLASSICCC</p>
        <h1 className="mt-4 font-display font-semibold leading-[0.9] tracking-tight text-[clamp(3rem,10vw,9rem)]">
          Timeless<br />
          <span className="text-muted">Elegance.</span>
        </h1>
      </section>

      {/* Origin */}
      <section className="container-x mt-12 grid md:grid-cols-2 gap-4">
        <div className="relative card overflow-hidden aspect-[4/5] md:aspect-auto md:min-h-[520px] bg-stone">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/about-2.svg" alt="" className="absolute inset-0 size-full object-cover" />
        </div>
        <div className="card p-8 md:p-14 flex flex-col justify-center">
          <p className="font-display text-2xl md:text-4xl font-medium leading-snug">
            Born from a vision beyond trends, CLASSICCC blends vintage inspiration with modern luxury, creating pieces that
            speak without saying too much.
          </p>
          <Link href="/shop" className="btn btn-dark mt-10 self-start">Shop the collection</Link>
        </div>
      </section>

      {/* GHOST */}
      <section className="bg-ink text-paper mt-20 overflow-hidden">
        <div className="container-x py-20 md:py-28 relative">
          <p
            aria-hidden
            className="pointer-events-none select-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center font-display font-semibold leading-none tracking-[0.06em] text-transparent text-[30vw] md:text-[22vw]"
            style={{ WebkitTextStroke: "1px rgba(250,248,240,0.12)" }}
          >
            GHOST
          </p>
          <div className="relative max-w-3xl mx-auto text-center">
            <p className="eyebrow text-paper/50">At its heart</p>
            <h2 className="mt-6 font-display text-6xl md:text-8xl font-semibold tracking-[0.12em]">GHOST</h2>
            <p className="mt-8 text-lg md:text-2xl text-paper/80 leading-relaxed">
              A symbol of quiet presence, individuality, and mystery.
            </p>
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="container-x mt-20 md:mt-28">
        <p className="font-display font-semibold leading-[1.05] tracking-tight text-[clamp(2rem,5.4vw,4.75rem)] max-w-5xl">
          For those who move differently, stand apart, and let their presence speak.
        </p>
        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {pillars.map((p) => (
            <div key={p.n} className="card p-7">
              <p className="font-display text-4xl font-semibold text-ink/20">{p.n}</p>
              <p className="mt-4 text-lg font-medium">{p.title}</p>
              <p className="mt-2 text-sm text-muted leading-relaxed">{p.copy}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sign-off */}
      <section className="container-x mt-20">
        <div className="rounded-[2.25rem] bg-butter border border-[#ece6c2] px-6 py-16 md:py-24 text-center">
          <p className="font-display text-[2.6rem] leading-none sm:text-5xl md:text-7xl font-extrabold tracking-[0.04em] md:tracking-[0.06em]">CLASSICCC.</p>
          <p className="mt-6 text-lg md:text-2xl">Move in silence. Leave a lasting impression.</p>
          <Link href="/shop" className="btn btn-dark mt-10">Discover the collection</Link>
        </div>
      </section>

      {/* Business information */}
      <section className="container-x mt-20 grid md:grid-cols-[1fr_1.2fr] gap-4">
        <div className="card p-8 md:p-12">
          <p className="eyebrow text-muted">Business information</p>
          <dl className="mt-6 space-y-5 text-sm">
            <div><dt className="label">Studio & store</dt><dd className="text-muted">{site.address}</dd></div>
            <div><dt className="label">Opening hours</dt><dd className="text-muted">{site.hours}</dd></div>
            <div><dt className="label">Contact</dt><dd className="text-muted">{site.email} · {site.phone}</dd></div>
          </dl>
        </div>
        <div className="relative card overflow-hidden min-h-[320px] bg-stone">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/about-1.svg" alt="" className="absolute inset-0 size-full object-cover" />
          <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-paper/90 backdrop-blur p-5">
            <p className="font-medium">Visit the studio</p>
            <p className="text-sm text-muted mt-1">Try pieces on, pick up online orders, or just say hello.</p>
            <Link href="/contact" className="link-underline mt-3 inline-block">Get directions</Link>
          </div>
        </div>
      </section>
    </>
  );
}
