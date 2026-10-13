import type { Metadata, Viewport } from "next";
import { Archivo, Figtree } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/store/cart-context";
import { WishlistProvider } from "@/components/store/wishlist-context";
import { site } from "@/lib/site";

const body = Figtree({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const display = Archivo({
  subsets: ["latin"],
  variable: "--font-display-face",
  display: "swap",
  axes: ["wdth"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — Timeless Elegance`, template: `%s · ${site.name}` },
  description:
    "CLASSICCC blends vintage inspiration with modern luxury — pieces that speak without saying too much. Move in silence. Leave a lasting impression.",
  openGraph: { siteName: site.name, type: "website" },
};

export const viewport: Viewport = { themeColor: "#111110" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable}`}>
      <body className="font-sans min-h-screen">
        <CartProvider>
          <WishlistProvider>{children}</WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
