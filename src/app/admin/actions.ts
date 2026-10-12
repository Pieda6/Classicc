"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { toMinor } from "@/lib/money";
import { slugify } from "@/lib/utils";
import { saveImageUpload } from "@/lib/uploads";
import { setSetting } from "@/lib/settings";
import { sendOrderStatusUpdate } from "@/lib/email";
import { GENDERS, ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/constants";

export type AdminState = { error?: string; success?: string } | undefined;

function refreshStore() {
  revalidatePath("/", "layout");
}

// ---------------------------------------------------------------- images

export async function uploadImages(formData: FormData): Promise<{ urls: string[]; error?: string }> {
  await requireAdmin();
  const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (!files.length) return { urls: [], error: "Choose at least one image." };
  if (files.length > 10) return { urls: [], error: "Upload up to 10 images at a time." };
  try {
    const urls = [];
    for (const f of files) urls.push(await saveImageUpload(f));
    return { urls };
  } catch (e) {
    return { urls: [], error: e instanceof Error ? e.message : "Upload failed" };
  }
}

// ---------------------------------------------------------------- products

const imageSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1)
    .refine((u) => u.startsWith("/") || /^https:\/\//.test(u), "Image URLs must start with / or https://"),
  alt: z.string().trim().max(200).optional().nullable(),
  color: z.string().trim().max(60).optional().nullable(),
});

const variantSchema = z.object({
  id: z.string().optional(),
  size: z.string().trim().min(1, "Every variant needs a size").max(20),
  color: z.string().trim().min(1, "Every variant needs a colour").max(60),
  colorHex: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/, "Colour must be a hex value like #1A1A1A"),
  stock: z.coerce.number().int().min(0, "Stock can't be negative").max(100000),
  sku: z.string().trim().max(60).optional().nullable(),
});

const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, "Name is required").max(140),
  slug: z.string().trim().max(90).optional(),
  description: z.string().trim().min(10, "Add a description (10+ characters)").max(5000),
  details: z.string().trim().max(3000).optional(),
  price: z.string().min(1, "Price is required"),
  compareAtPrice: z.string().optional(),
  categoryId: z.string().optional(),
  gender: z.enum(GENDERS),
  featured: z.boolean(),
  active: z.boolean(),
  images: z.array(imageSchema).max(30),
  variants: z.array(variantSchema).min(1, "Add at least one size/colour variant").max(200),
});

export type ProductInput = z.infer<typeof productSchema>;

export async function saveProduct(input: ProductInput): Promise<{ error?: string; id?: string }> {
  await requireAdmin();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;

  const price = toMinor(d.price);
  if (!Number.isFinite(price) || price <= 0) return { error: "Enter a valid price." };
  const compareAt = d.compareAtPrice ? toMinor(d.compareAtPrice) : null;
  if (compareAt !== null && !Number.isFinite(compareAt)) return { error: "Enter a valid compare-at price." };

  const keys = new Set(d.variants.map((v) => `${v.size}|${v.color}`.toLowerCase()));
  if (keys.size !== d.variants.length) return { error: "Each size + colour combination must be unique." };

  const slug = slugify(d.slug || d.name);
  if (!slug) return { error: "Enter a valid slug." };
  const clash = await prisma.product.findFirst({ where: { slug, ...(d.id && { id: { not: d.id } }) } });
  if (clash) return { error: `The URL slug "${slug}" is already used by another product.` };

  const data = {
    name: d.name,
    slug,
    description: d.description,
    details: d.details || null,
    price,
    compareAtPrice: compareAt && compareAt > price ? compareAt : null,
    categoryId: d.categoryId || null,
    gender: d.gender,
    featured: d.featured,
    active: d.active,
  };
  const images = d.images.map((img, i) => ({ url: img.url, alt: img.alt || null, color: img.color || null, sortOrder: i }));

  let id = d.id;
  if (id) {
    const existing = await prisma.product.findUnique({ where: { id }, include: { variants: true } });
    if (!existing) return { error: "Product not found." };
    const keepIds = d.variants.map((v) => v.id).filter(Boolean) as string[];
    await prisma.$transaction(async (tx) => {
      await tx.product.update({ where: { id }, data });
      await tx.productImage.deleteMany({ where: { productId: id } });
      if (images.length) await tx.productImage.createMany({ data: images.map((img) => ({ ...img, productId: id! })) });
      await tx.productVariant.deleteMany({ where: { productId: id, id: { notIn: keepIds } } });
      for (const v of d.variants) {
        const vdata = { size: v.size, color: v.color, colorHex: v.colorHex, stock: v.stock, sku: v.sku || null };
        if (v.id && existing.variants.some((x) => x.id === v.id)) await tx.productVariant.update({ where: { id: v.id }, data: vdata });
        else await tx.productVariant.create({ data: { ...vdata, productId: id! } });
      }
    });
  } else {
    const created = await prisma.product.create({
      data: {
        ...data,
        images: { create: images },
        variants: {
          create: d.variants.map((v) => ({ size: v.size, color: v.color, colorHex: v.colorHex, stock: v.stock, sku: v.sku || null })),
        },
      },
    });
    id = created.id;
  }

  refreshStore();
  return { id };
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  await prisma.product.delete({ where: { id: String(formData.get("id")) } });
  refreshStore();
  redirect("/admin/products?deleted=1");
}

export async function toggleProductActive(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const p = await prisma.product.findUniqueOrThrow({ where: { id } });
  await prisma.product.update({ where: { id }, data: { active: !p.active } });
  refreshStore();
}

// ---------------------------------------------------------------- inventory

export async function updateStock(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const stock = Math.max(0, Math.floor(Number(formData.get("stock"))));
  if (!Number.isFinite(stock)) return;
  await prisma.productVariant.update({ where: { id }, data: { stock } });
  refreshStore();
}

// ---------------------------------------------------------------- categories

export async function saveCategory(_: AdminState, formData: FormData): Promise<AdminState> {
  await requireAdmin();
  const parsed = z
    .object({
      id: z.string().optional(),
      name: z.string().trim().min(2, "Name is required").max(60),
      slug: z.string().trim().max(60).optional(),
      description: z.string().trim().max(300).optional(),
      image: z.string().trim().max(500).optional(),
      sortOrder: z.coerce.number().int().min(0).max(999).default(0),
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { id, ...rest } = parsed.data;
  const slug = slugify(rest.slug || rest.name);
  const clash = await prisma.category.findFirst({ where: { slug, ...(id && { id: { not: id } }) } });
  if (clash) return { error: `Slug "${slug}" is already in use.` };

  let image = rest.image || null;
  const file = formData.get("file");
  if (file instanceof File && file.size > 0) {
    try {
      image = await saveImageUpload(file);
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Upload failed" };
    }
  }
  const data = { name: rest.name, slug, description: rest.description || null, image, sortOrder: rest.sortOrder };
  if (id) await prisma.category.update({ where: { id }, data });
  else await prisma.category.create({ data });
  refreshStore();
  return { success: id ? "Category updated." : "Category created." };
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  await prisma.category.delete({ where: { id: String(formData.get("id")) } });
  refreshStore();
  redirect("/admin/categories");
}

// ---------------------------------------------------------------- orders

export async function updateOrderStatus(_: AdminState, formData: FormData): Promise<AdminState> {
  await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  const paymentStatus = String(formData.get("paymentStatus"));
  const notify = formData.get("notify") === "on";
  if (!(ORDER_STATUSES as readonly string[]).includes(status)) return { error: "Invalid status." };
  if (!(PAYMENT_STATUSES as readonly string[]).includes(paymentStatus)) return { error: "Invalid payment status." };

  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) return { error: "Order not found." };

  // Return stock to inventory when a paid order is cancelled.
  const restock = status === "CANCELLED" && order.status !== "CANCELLED" && order.paymentStatus === "PAID";

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id },
      data: { status, paymentStatus, ...(paymentStatus === "PAID" && !order.paidAt && { paidAt: new Date() }) },
    });
    if (restock) {
      for (const i of order.items) {
        if (i.variantId) await tx.productVariant.updateMany({ where: { id: i.variantId }, data: { stock: { increment: i.quantity } } });
      }
    }
  });

  if (notify && status !== order.status) await sendOrderStatusUpdate({ ...order, status });
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
  return { success: `Order updated${notify && status !== order.status ? " and customer notified" : ""}.${restock ? " Stock returned to inventory." : ""}` };
}

// ---------------------------------------------------------------- delivery

const zoneSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, "Zone name is required").max(80),
  fee: z.string().min(1, "Fee is required"),
  eta: z.string().trim().min(2, "Delivery time is required").max(60),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
});

export async function saveZone(_: AdminState, formData: FormData): Promise<AdminState> {
  await requireAdmin();
  const parsed = zoneSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const fee = toMinor(parsed.data.fee);
  if (!Number.isFinite(fee)) return { error: "Enter a valid fee (0 for free)." };
  const data = { name: parsed.data.name, fee, eta: parsed.data.eta, sortOrder: parsed.data.sortOrder, active: formData.get("active") === "on" };
  if (parsed.data.id) await prisma.deliveryZone.update({ where: { id: parsed.data.id }, data });
  else await prisma.deliveryZone.create({ data });
  revalidatePath("/admin/delivery");
  refreshStore();
  return { success: parsed.data.id ? "Zone saved." : "Zone added." };
}

export async function deleteZone(formData: FormData) {
  await requireAdmin();
  await prisma.deliveryZone.delete({ where: { id: String(formData.get("id")) } });
  revalidatePath("/admin/delivery");
  refreshStore();
}

export async function saveFreeDelivery(_: AdminState, formData: FormData): Promise<AdminState> {
  await requireAdmin();
  const raw = String(formData.get("threshold") ?? "").trim();
  const minor = raw === "" ? 0 : toMinor(raw);
  if (!Number.isFinite(minor)) return { error: "Enter a valid amount (or 0 to disable)." };
  await setSetting("freeDeliveryThreshold", String(minor));
  refreshStore();
  return { success: minor ? "Free delivery threshold saved." : "Free delivery disabled." };
}
