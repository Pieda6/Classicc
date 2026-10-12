export const site = {
  name: "CLASSICC",
  tagline: "Timeless pieces, made to move with you.",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000"),
  email: process.env.NEXT_PUBLIC_STORE_EMAIL || "hello@classicc.com",
  phone: process.env.NEXT_PUBLIC_STORE_PHONE || "+234 800 000 0000",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "2348000000000",
  address:
    process.env.NEXT_PUBLIC_STORE_ADDRESS || "12 Admiralty Way, Lekki Phase 1, Lagos, Nigeria",
  hours: "Mon – Sat, 9:00am – 6:00pm",
  socials: {
    instagram: process.env.NEXT_PUBLIC_INSTAGRAM || "https://instagram.com/classicc",
    tiktok: process.env.NEXT_PUBLIC_TIKTOK || "https://tiktok.com/@classicc",
    x: process.env.NEXT_PUBLIC_X || "https://x.com/classicc",
  },
};

export function whatsappLink(message = "Hi CLASSICC, I need help with") {
  return `https://wa.me/${site.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}
