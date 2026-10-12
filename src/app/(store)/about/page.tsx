import Link from "next/link";
import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "About us", description: "The story, values and people behind CLASSICC." };

const values = [
  { n: "01", title: "Timeless over trend", copy: "We design pieces to wear for years, not weeks — clean lines, considered details and a neutral palette that works together." },
  { n: "02", title: "Honest materials", copy: "Heavyweight cottons, brushed fleece, real suede and wool blends chosen for how they feel and how they age." },
  { n: "03", title: "Made to move", copy: "Every cut is tested for real life: commuting, working, travelling and everything in between." },
  { n: "04", title: "Fair & local", copy: "We partner with small workshops and pay fairly. Many of our pieces are finished by hand in Lagos." },
];

export default function AboutPage() {
  return (
    <>
      <section className="container-x pt-10 md:pt-16">
        <p className="eyebrow text-muted">Our story</p>
        <h1 className="mt-4 font-display font-semibold leading-[0.9] tracking-tight text-[clamp(3rem,10vw,9rem)]">
          Fewer, <span className="text-muted">better</span><br /> pieces.
        </h1>
      </section>

      <section className="container-x mt-12 grid md:grid-cols-2 gap-4">
        <div className="relative card overflow-hidden aspect-[4/5] md:aspect-auto bg-stone">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/about-2.svg" alt="" className="absolute inset-0 size-full object-cover" />
        </div>
        <div className="card p-8 md:p-14 flex flex-col justify-center">
          <p className="text-lg md:text-xl leading-relaxed">
            CLASSICC began in 2024 with a simple frustration: wardrobes full of clothes, and nothing to wear. We set out to make
            the opposite — a small, tightly edited collection of essentials that look as good in five years as they do today.
          </p>
          <p className="mt-6 text-muted leading-relaxed">
            From the signature trench to the heavyweight tee, every piece starts with fabric. We work with mills and workshops we
            know by name, refine each pattern over months, and release in small batches so nothing goes to waste. The result is
            clothing that feels familiar from the first wear — classic, with a second C for character.
          </p>
          <Link href="/shop" className="btn btn-dark mt-8 self-start">Shop the collection</Link>
        </div>
      </section>

      <section className="bg-ink text-paper mt-20">
        <div className="container-x py-16 md:py-24">
          <p className="eyebrow text-paper/50">What we stand for</p>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {values.map((v) => (
              <div key={v.n}>
                <p className="font-display text-5xl font-semibold text-paper/25">{v.n}</p>
                <p className="mt-4 text-lg font-medium">{v.title}</p>
                <p className="mt-2 text-sm text-paper/65 leading-relaxed">{v.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x mt-20 grid md:grid-cols-[1fr_1.2fr] gap-4">
        <div className="card p-8 md:p-12">
          <p className="eyebrow text-muted">Business information</p>
          <dl className="mt-6 space-y-5 text-sm">
            <div><dt className="label">Registered name</dt><dd className="text-muted">CLASSICC Clothing Ltd.</dd></div>
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
