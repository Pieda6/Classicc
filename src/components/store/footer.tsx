import Link from "next/link";
import { site, whatsappLink } from "@/lib/site";

const cols = [
  {
    title: "Shop",
    links: [
      ["/shop", "Shop all"],
      ["/shop?gender=MEN", "Men"],
      ["/shop?gender=WOMEN", "Women"],
      ["/shop?category=accessories", "Accessories"],
    ],
  },
  {
    title: "Help",
    links: [
      ["/policies/delivery", "Delivery information"],
      ["/policies/returns", "Returns & refunds"],
      ["/account", "Track your order"],
      ["/contact", "Contact us"],
    ],
  },
  {
    title: "Company",
    links: [
      ["/about", "Our story"],
      ["/policies/privacy", "Privacy policy"],
      ["/policies/terms", "Terms & conditions"],
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-ink text-paper mt-20 pb-24 md:pb-0 overflow-hidden">
      <div className="container-x pt-16 grid gap-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <p className="font-display text-3xl font-semibold tracking-[0.12em]">CLASSICCC</p>
          <p className="mt-4 text-sm text-paper/60 max-w-xs leading-relaxed">{site.tagline}</p>
          <div className="mt-6 space-y-1 text-sm text-paper/70">
            <p>{site.address}</p>
            <p>
              <a href={`mailto:${site.email}`} className="hover:text-paper">{site.email}</a> ·{" "}
              <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="hover:text-paper">{site.phone}</a>
            </p>
          </div>
          <div className="mt-6 flex gap-2 text-xs font-semibold tracking-[0.12em] uppercase">
            <a href={site.socials.instagram} target="_blank" rel="noreferrer" className="rounded-full border border-paper/25 px-4 py-2 hover:bg-paper hover:text-ink transition-colors">Instagram</a>
            <a href={site.socials.tiktok} target="_blank" rel="noreferrer" className="rounded-full border border-paper/25 px-4 py-2 hover:bg-paper hover:text-ink transition-colors">TikTok</a>
            <a href={whatsappLink()} target="_blank" rel="noreferrer" className="rounded-full border border-paper/25 px-4 py-2 hover:bg-paper hover:text-ink transition-colors">WhatsApp</a>
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <p className="eyebrow text-paper/50 mb-4">{c.title}</p>
            <ul className="space-y-2.5 text-sm">
              {c.links.map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-paper/80 hover:text-paper">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="container-x mt-14 flex flex-col md:flex-row gap-2 justify-between text-xs text-paper/45 border-t border-paper/10 pt-6 pb-4">
        <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
        <p>Secure payments powered by Paystack</p>
      </div>
      <p
        aria-hidden
        className="font-display font-semibold text-center leading-[0.8] tracking-[0.04em] text-transparent select-none -mb-[1.8vw] text-[15.4vw]"
        style={{ WebkitTextStroke: "1px rgba(250,248,240,0.16)" }}
      >
        CLASSICCC
      </p>
    </footer>
  );
}
