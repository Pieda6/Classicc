export type PricedLine = { unitPrice: number; quantity: number };

export function subtotalOf(lines: PricedLine[]) {
  return lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
}

/** Delivery fee after applying the free-delivery threshold (0 = disabled). */
export function deliveryFeeFor(subtotal: number, zoneFee: number, freeThreshold: number) {
  if (freeThreshold > 0 && subtotal >= freeThreshold) return 0;
  return zoneFee;
}
