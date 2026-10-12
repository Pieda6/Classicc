import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { whatsappLink } from "@/lib/site";

export function AnnouncementBar({ freeThreshold }: { freeThreshold: number }) {
  return (
    <div className="bg-ink text-paper text-[0.66rem] md:text-[0.68rem] font-semibold tracking-[0.12em] uppercase">
      <div className="container-x flex h-9 items-center justify-center md:justify-between">
        <p>{freeThreshold > 0 ? `Free delivery on orders above ${formatMoney(freeThreshold)}` : "Nationwide delivery · Secure payment with Paystack"}</p>
        <nav className="hidden md:flex items-center gap-4">
          <a href={whatsappLink()} target="_blank" rel="noreferrer" className="hover:opacity-70">WhatsApp support</a>
          <span className="opacity-40">|</span>
          <Link href="/account" className="hover:opacity-70">Track order</Link>
          <span className="opacity-40">|</span>
          <Link href="/contact" className="hover:opacity-70">Help</Link>
        </nav>
      </div>
    </div>
  );
}
