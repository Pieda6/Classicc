export const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY || "NGN";

const formatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: CURRENCY,
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** Prices are stored in minor units (kobo / pesewas / cents). */
export function formatMoney(minor: number) {
  return formatter.format(minor / 100);
}

/** Parse a major-unit amount typed by an admin ("12,500.50") into minor units. */
export function toMinor(input: string | number) {
  const cleaned = typeof input === "number" ? String(input) : String(input).trim().replace(/[₦,\s]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return NaN;
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n < 0) return NaN;
  return Math.round(n * 100);
}

export function toMajor(minor: number) {
  return (minor / 100).toFixed(2).replace(/\.00$/, "");
}
