import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { site, whatsappLink } from "@/lib/site";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = { title: "Contact us" };

export default function ContactPage() {
  const details = [
    { icon: Mail, label: "Email", value: site.email, href: `mailto:${site.email}` },
    { icon: Phone, label: "Phone", value: site.phone, href: `tel:${site.phone.replace(/\s/g, "")}` },
    { icon: MapPin, label: "Studio", value: site.address, href: `https://maps.google.com/?q=${encodeURIComponent(site.address)}` },
    { icon: Clock, label: "Hours", value: site.hours },
  ];
  return (
    <div className="container-x pt-10 md:pt-16">
      <p className="eyebrow text-muted">Contact</p>
      <h1 className="mt-4 font-display text-5xl md:text-7xl font-semibold tracking-tight">We&apos;re here to help.</h1>

      <div className="mt-10 grid lg:grid-cols-[1fr_1.3fr] gap-4 items-start">
        <div className="space-y-4">
          <a href={whatsappLink()} target="_blank" rel="noreferrer" className="block rounded-[var(--radius-card)] bg-[#1f3d2b] text-paper p-8 group">
            <MessageCircle size={30} strokeWidth={1.4} />
            <p className="mt-6 font-display text-2xl font-semibold">WhatsApp support</p>
            <p className="mt-2 text-paper/75 text-sm">The fastest way to reach us — sizing advice, order updates and returns. Typical reply in under an hour during opening hours.</p>
            <span className="mt-6 btn bg-paper text-ink group-hover:bg-butter">Start a chat</span>
          </a>
          <div className="card p-8 space-y-5">
            {details.map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="flex gap-4">
                <div className="size-11 rounded-full bg-bg grid place-items-center shrink-0"><Icon size={18} strokeWidth={1.6} /></div>
                <div className="text-sm">
                  <p className="font-semibold">{label}</p>
                  {href ? <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="text-muted hover:text-ink">{value}</a> : <p className="text-muted">{value}</p>}
                </div>
              </div>
            ))}
          </div>
          <div className="card p-8">
            <p className="font-semibold text-sm">Follow us</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={site.socials.instagram} target="_blank" rel="noreferrer" className="chip">Instagram</a>
              <a href={site.socials.tiktok} target="_blank" rel="noreferrer" className="chip">TikTok</a>
              <a href={site.socials.x} target="_blank" rel="noreferrer" className="chip">X (Twitter)</a>
            </div>
          </div>
        </div>
        <div className="card p-6 md:p-10">
          <h2 className="font-display text-2xl font-semibold">Send us a message</h2>
          <p className="text-sm text-muted mt-1">For order questions, include your order number (e.g. CLS-ABC123).</p>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
