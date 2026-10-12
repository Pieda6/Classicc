import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { formatMoney } from "@/lib/money";
import { getFreeDeliveryThreshold } from "@/lib/settings";
import { site, whatsappLink } from "@/lib/site";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const POLICIES = {
  delivery: "Delivery information",
  returns: "Returns & refunds",
  privacy: "Privacy policy",
  terms: "Terms & conditions",
} as const;
type Slug = keyof typeof POLICIES;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: POLICIES[slug as Slug] ?? "Policies" };
}

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!(slug in POLICIES)) notFound();

  return (
    <div className="container-x pt-10 md:pt-16">
      <p className="eyebrow text-muted">Policies</p>
      <h1 className="mt-4 font-display text-4xl md:text-6xl font-semibold tracking-tight">{POLICIES[slug as Slug]}</h1>
      <div className="mt-10 grid lg:grid-cols-[230px_1fr] gap-6 items-start">
        <nav className="flex lg:flex-col gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0 lg:sticky lg:top-28">
          {(Object.keys(POLICIES) as Slug[]).map((s) => (
            <Link key={s} href={`/policies/${s}`} className={cn("chip lg:!rounded-2xl lg:!py-3 lg:!px-5")} data-active={s === slug}>
              {POLICIES[s]}
            </Link>
          ))}
        </nav>
        <article className="card p-6 md:p-12 prose-classicc max-w-none">
          {slug === "delivery" && <Delivery />}
          {slug === "returns" && <Returns />}
          {slug === "privacy" && <Privacy />}
          {slug === "terms" && <Terms />}
          <p className="mt-10 text-xs">Last updated: {new Date().getFullYear()}. Questions? Email <a href={`mailto:${site.email}`}>{site.email}</a> or <a href={whatsappLink()}>chat on WhatsApp</a>.</p>
        </article>
      </div>
    </div>
  );
}

async function Delivery() {
  const [zones, free] = await Promise.all([
    prisma.deliveryZone.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    getFreeDeliveryThreshold(),
  ]);
  return (
    <>
      <p>We deliver across Nigeria with trusted courier partners. Orders placed before 12pm (Mon–Fri) are dispatched the same day; later orders ship the next business day.</p>
      <h2>Delivery locations & fees</h2>
      <div className="not-prose overflow-x-auto mt-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-line">
              <th className="py-3 pr-4 font-semibold">Location</th>
              <th className="py-3 pr-4 font-semibold">Estimated time</th>
              <th className="py-3 font-semibold text-right">Fee</th>
            </tr>
          </thead>
          <tbody>
            {zones.map((z) => (
              <tr key={z.id} className="border-b border-line/60">
                <td className="py-3 pr-4">{z.name}</td>
                <td className="py-3 pr-4 text-muted">{z.eta}</td>
                <td className="py-3 text-right">{z.fee === 0 ? "Free" : formatMoney(z.fee)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {free > 0 && <p className="mt-4"><strong>Free delivery</strong> on all orders above {formatMoney(free)}.</p>}
      <h2>Tracking your order</h2>
      <p>You&apos;ll receive an email when your order is confirmed and again when it ships. You can follow its status at any time from <Link href="/account">My Account</Link> or via the link in your confirmation email.</p>
      <h2>Failed deliveries</h2>
      <p>Our courier will call before delivery. If a delivery fails twice, the parcel returns to our studio and we&apos;ll contact you to rearrange; a second delivery fee may apply.</p>
    </>
  );
}

function Returns() {
  return (
    <>
      <p>We want you to love what you ordered. If something isn&apos;t right, you can return it within <strong>7 days of delivery</strong>.</p>
      <h2>Eligibility</h2>
      <ul>
        <li>Items must be unworn, unwashed and in their original condition with tags attached.</li>
        <li>Underwear, socks, and items marked final sale cannot be returned for hygiene reasons.</li>
        <li>Proof of purchase (your order number) is required.</li>
      </ul>
      <h2>How to return</h2>
      <ul>
        <li>Contact us via WhatsApp or email with your order number and the item(s) you&apos;d like to return.</li>
        <li>We&apos;ll arrange a pickup (Lagos) or share our studio address for drop-off or courier.</li>
        <li>Once received and inspected, we&apos;ll confirm your refund or exchange within 3 business days.</li>
      </ul>
      <h2>Refunds</h2>
      <p>Approved refunds are issued to your original payment method via Paystack and usually reflect within 5–10 business days depending on your bank. Original delivery fees are non-refundable unless the item was faulty or we sent the wrong item.</p>
      <h2>Exchanges</h2>
      <p>Need a different size? We&apos;ll happily exchange subject to availability — we cover the delivery cost of the replacement for your first exchange.</p>
      <h2>Faulty items</h2>
      <p>If your item arrives damaged or faulty, let us know within 48 hours with photos and we&apos;ll replace or refund it in full, including delivery.</p>
    </>
  );
}

function Privacy() {
  return (
    <>
      <p>This policy explains how {site.name} collects, uses and protects your personal information when you use our website, in line with the Nigeria Data Protection Act 2023.</p>
      <h2>What we collect</h2>
      <ul>
        <li>Account details: your name, email address, phone number and password (stored securely as a one-way hash).</li>
        <li>Order details: delivery address, items purchased and order history.</li>
        <li>Payment information is processed directly by Paystack. We never see or store your full card details.</li>
        <li>Basic technical data such as browser type, used to keep the site secure and working.</li>
      </ul>
      <h2>How we use it</h2>
      <ul>
        <li>To process and deliver your orders and send order updates.</li>
        <li>To manage your account and respond to your enquiries.</li>
        <li>To prevent fraud and keep our services secure.</li>
        <li>With your consent, to send occasional news about new collections (you can opt out at any time).</li>
      </ul>
      <h2>Sharing</h2>
      <p>We only share information with service providers who help us run the store — our payment processor (Paystack), delivery partners and email provider — and only as needed to provide the service. We never sell your data.</p>
      <h2>Cookies</h2>
      <p>We use essential cookies to keep you logged in. Your cart and wishlist are stored on your own device.</p>
      <h2>Your rights</h2>
      <p>You can access, correct or delete your personal data at any time. Update your details from My Account, or contact us to request deletion.</p>
      <h2>Retention</h2>
      <p>We keep order records for as long as required for accounting and legal purposes, and account data until you ask us to delete it.</p>
    </>
  );
}

function Terms() {
  return (
    <>
      <p>By using this website and placing an order with {site.name}, you agree to these terms.</p>
      <h2>Orders</h2>
      <p>Your order is an offer to buy. A contract is formed once payment is confirmed and we send your order confirmation. We may cancel and refund an order if an item becomes unavailable or a pricing error occurs.</p>
      <h2>Prices & payment</h2>
      <p>All prices are shown in Nigerian Naira (₦) and include applicable taxes. Delivery fees are shown at checkout. Payments are processed securely by Paystack.</p>
      <h2>Product information</h2>
      <p>We make every effort to display colours and details accurately, but slight variations may occur depending on your screen.</p>
      <h2>Accounts</h2>
      <p>You are responsible for keeping your login details confidential. Let us know immediately if you suspect unauthorised use of your account.</p>
      <h2>Intellectual property</h2>
      <p>All content on this site, including the {site.name} name, logo, images and text, belongs to {site.name} and may not be used without permission.</p>
      <h2>Liability</h2>
      <p>To the extent permitted by law, our liability for any order is limited to the amount paid for that order.</p>
      <h2>Governing law</h2>
      <p>These terms are governed by the laws of the Federal Republic of Nigeria.</p>
    </>
  );
}
