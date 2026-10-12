import "server-only";
import crypto from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || "./uploads");
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const SIGNATURES: { ext: string; type: string; test: (b: Buffer) => boolean }[] = [
  { ext: "jpg", type: "image/jpeg", test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { ext: "png", type: "image/png", test: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { ext: "webp", type: "image/webp", test: (b) => b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP" },
  { ext: "gif", type: "image/gif", test: (b) => b.toString("ascii", 0, 4) === "GIF8" },
  { ext: "avif", type: "image/avif", test: (b) => b.toString("ascii", 4, 12) === "ftypavif" },
];

export const CONTENT_TYPES: Record<string, string> = Object.fromEntries(SIGNATURES.map((s) => [s.ext, s.type]));

/** Validate an uploaded image by its bytes (not its claimed type) and store it. */
export async function saveImageUpload(file: File): Promise<string> {
  if (file.size === 0) throw new Error("Empty file");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("Images must be 5MB or smaller");
  const buf = Buffer.from(await file.arrayBuffer());
  const sig = SIGNATURES.find((s) => s.test(buf));
  if (!sig) throw new Error("Only JPG, PNG, WebP, GIF or AVIF images are allowed");
  await mkdir(UPLOAD_DIR, { recursive: true });
  const name = `${Date.now().toString(36)}-${crypto.randomBytes(6).toString("hex")}.${sig.ext}`;
  await writeFile(path.join(UPLOAD_DIR, name), buf);
  return `/uploads/${name}`;
}
