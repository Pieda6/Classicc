import { readFile } from "node:fs/promises";
import path from "node:path";
import { CONTENT_TYPES, UPLOAD_DIR } from "@/lib/uploads";

// Serves admin-uploaded images from UPLOAD_DIR (files added after build aren't served from /public).
export async function GET(_: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  if (!/^[a-z0-9-]+\.(jpg|png|webp|gif|avif)$/i.test(file)) return new Response("Not found", { status: 404 });
  try {
    const data = await readFile(path.join(UPLOAD_DIR, file));
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": CONTENT_TYPES[file.split(".").pop()!.toLowerCase()] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
