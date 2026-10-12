import { test } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { deliveryFeeFor, subtotalOf } from "../src/lib/pricing";
import { toMinor, toMajor } from "../src/lib/money";
import { isValidWebhookSignature } from "../src/lib/paystack-signature";
import { sortSizes } from "../src/lib/constants";
import { slugify } from "../src/lib/utils";

test("subtotal sums unit price × quantity", () => {
  assert.equal(subtotalOf([{ unitPrice: 4850000, quantity: 2 }, { unitPrice: 6800000, quantity: 1 }]), 16500000);
  assert.equal(subtotalOf([]), 0);
});

test("delivery is free at or above the threshold, and threshold 0 disables it", () => {
  assert.equal(deliveryFeeFor(15000000, 350000, 15000000), 0);
  assert.equal(deliveryFeeFor(14999999, 350000, 15000000), 350000);
  assert.equal(deliveryFeeFor(99999999, 350000, 0), 350000);
});

test("admin price input converts to minor units", () => {
  assert.equal(toMinor("48,500"), 4850000);
  assert.equal(toMinor("12.5"), 1250);
  assert.ok(Number.isNaN(toMinor("abc")));
  assert.equal(toMajor(4850000), "48500");
  assert.equal(toMajor(1250), "12.50");
});

test("webhook signature: accepts valid HMAC-SHA512, rejects tampering", () => {
  const secret = "sk_test_123";
  const body = JSON.stringify({ event: "charge.success", data: { reference: "CLS_x", amount: 1000 } });
  const sig = crypto.createHmac("sha512", secret).update(body).digest("hex");
  assert.equal(isValidWebhookSignature(body, sig, secret), true);
  assert.equal(isValidWebhookSignature(body.replace("1000", "1"), sig, secret), false);
  assert.equal(isValidWebhookSignature(body, sig, "sk_test_other"), false);
  assert.equal(isValidWebhookSignature(body, null, secret), false);
});

test("sizes sort in garment order, unknown sizes numerically after", () => {
  assert.deepEqual(sortSizes(["XL", "S", "M", "XS"]), ["XS", "S", "M", "XL"]);
  assert.deepEqual(sortSizes(["42", "40", "41"]), ["40", "41", "42"]);
});

test("slugify", () => {
  assert.equal(slugify("Men’s Knit Cardigan — Écru!"), "men-s-knit-cardigan-ecru");
});

test("price parsing rejects malformed input instead of treating it as zero", () => {
  assert.ok(Number.isNaN(toMinor("")));
  assert.ok(Number.isNaN(toMinor("1.2.3")));
  assert.ok(Number.isNaN(toMinor("-500")));
  assert.equal(toMinor("₦ 3,000"), 300000);
  assert.equal(toMinor("0"), 0);
});
