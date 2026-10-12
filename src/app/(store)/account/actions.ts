"use server";

import crypto from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createSession, destroySession, hashPassword, requireUser, verifyPassword } from "@/lib/auth";
import { sendPasswordReset, sendWelcome } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { site } from "@/lib/site";

export type FormState = { error?: string; success?: string; fieldErrors?: Record<string, string> } | undefined;

const password = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(100)
  .regex(/[A-Za-z]/, "Include at least one letter")
  .regex(/[0-9]/, "Include at least one number");

function fieldErrors(err: z.ZodError) {
  const out: Record<string, string> = {};
  for (const i of err.issues) out[String(i.path[0])] ??= i.message;
  return out;
}

async function clientKey(prefix: string) {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  return `${prefix}:${ip}`;
}

/** Only allow internal redirects after login. */
function safeNext(next: FormDataEntryValue | null, fallback: string) {
  const n = typeof next === "string" ? next : "";
  return n.startsWith("/") && !n.startsWith("//") ? n : fallback;
}

let dummy: Promise<string> | null = null;
const dummyHash = () => (dummy ??= hashPassword(crypto.randomBytes(16).toString("hex")));

export async function login(_: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const pw = String(formData.get("password") ?? "");
  if (!rateLimit(await clientKey("login"), 10)) return { error: "Too many attempts. Please wait a few minutes." };
  if (!email || !pw) return { error: "Enter your email and password." };

  const user = await prisma.user.findUnique({ where: { email } });
  // Compare against a dummy hash when the user doesn't exist to keep timing similar.
  const ok = await verifyPassword(pw, user?.passwordHash ?? (await dummyHash()));
  if (!user || !ok) return { error: "Incorrect email or password." };

  await createSession(user);
  redirect(safeNext(formData.get("next"), user.role === "ADMIN" ? "/admin" : "/account"));
}

export async function register(_: FormState, formData: FormData): Promise<FormState> {
  const schema = z.object({
    name: z.string().trim().min(2, "Enter your name").max(80),
    email: z.string().trim().toLowerCase().email("Enter a valid email"),
    phone: z.string().trim().max(30).optional(),
    password,
  });
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Please fix the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  if (!rateLimit(await clientKey("register"), 5)) return { error: "Too many attempts. Please try again later." };

  const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (exists) return { error: "An account with this email already exists.", fieldErrors: { email: "Already registered — try logging in" } };

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      passwordHash: await hashPassword(parsed.data.password),
    },
  });
  // Link earlier guest orders placed with the same email.
  await prisma.order.updateMany({ where: { email: user.email, userId: null }, data: { userId: user.id } });
  await sendWelcome(user.email, user.name);
  await createSession(user);
  redirect(safeNext(formData.get("next"), "/account"));
}

export async function logout() {
  await destroySession();
  redirect("/");
}

export async function requestPasswordReset(_: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!z.string().email().safeParse(email).success) return { error: "Enter a valid email address." };
  if (!rateLimit(await clientKey("reset"), 5)) return { error: "Too many requests. Please try again later." };

  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: crypto.createHash("sha256").update(token).digest("hex"),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });
    await sendPasswordReset(user.email, user.name, `${site.url}/account/reset-password?token=${token}`);
  }
  // Same response either way so emails can't be enumerated.
  return { success: "If an account exists for that email, we've sent a link to reset your password." };
}

export async function resetPassword(_: FormState, formData: FormData): Promise<FormState> {
  const token = String(formData.get("token") ?? "");
  const pw = password.safeParse(formData.get("password"));
  if (!pw.success) return { fieldErrors: { password: pw.error.issues[0].message } };
  if (formData.get("password") !== formData.get("confirm")) return { fieldErrors: { confirm: "Passwords don't match" } };

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const row = await prisma.passwordResetToken.findUnique({ where: { tokenHash }, include: { user: true } });
  if (!row || row.usedAt || row.expiresAt < new Date()) return { error: "This reset link is invalid or has expired. Please request a new one." };

  await prisma.$transaction([
    prisma.user.update({ where: { id: row.userId }, data: { passwordHash: await hashPassword(pw.data) } }),
    prisma.passwordResetToken.updateMany({ where: { userId: row.userId, usedAt: null }, data: { usedAt: new Date() } }),
  ]);
  await createSession(row.user);
  redirect("/account?reset=1");
}

export async function updateProfile(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = z
    .object({ name: z.string().trim().min(2, "Enter your name").max(80), phone: z.string().trim().max(30).optional() })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };
  await prisma.user.update({ where: { id: user.id }, data: { name: parsed.data.name, phone: parsed.data.phone || null } });
  revalidatePath("/account", "layout");
  return { success: "Profile updated." };
}

export async function changePassword(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const full = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
  if (!(await verifyPassword(String(formData.get("current") ?? ""), full.passwordHash))) {
    return { fieldErrors: { current: "Current password is incorrect" } };
  }
  const pw = password.safeParse(formData.get("password"));
  if (!pw.success) return { fieldErrors: { password: pw.error.issues[0].message } };
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(pw.data) } });
  return { success: "Password changed." };
}

const addressSchema = z.object({
  label: z.string().trim().min(1).max(30).default("Home"),
  fullName: z.string().trim().min(2, "Enter a name").max(120),
  phone: z.string().trim().min(7, "Enter a phone number").max(30),
  line1: z.string().trim().min(3, "Enter a street address").max(200),
  line2: z.string().trim().max(200).optional(),
  city: z.string().trim().min(2, "Enter a city").max(80),
  state: z.string().trim().min(2, "Enter a state").max(80),
  zoneId: z.string().optional(),
});

export async function saveAddress(_: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = addressSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Please fix the highlighted fields.", fieldErrors: fieldErrors(parsed.error) };
  const id = String(formData.get("id") ?? "");
  const makeDefault = formData.get("isDefault") === "on";
  const data = { ...parsed.data, line2: parsed.data.line2 || null, zoneId: parsed.data.zoneId || null };

  if (makeDefault) await prisma.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
  if (id) {
    await prisma.address.updateMany({ where: { id, userId: user.id }, data: { ...data, ...(makeDefault && { isDefault: true }) } });
  } else {
    const count = await prisma.address.count({ where: { userId: user.id } });
    await prisma.address.create({ data: { ...data, userId: user.id, isDefault: makeDefault || count === 0 } });
  }
  revalidatePath("/account/addresses");
  return { success: id ? "Address updated." : "Address added." };
}

export async function deleteAddress(formData: FormData) {
  const user = await requireUser();
  await prisma.address.deleteMany({ where: { id: String(formData.get("id")), userId: user.id } });
  revalidatePath("/account/addresses");
}

export async function setDefaultAddress(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  await prisma.$transaction([
    prisma.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } }),
    prisma.address.updateMany({ where: { id, userId: user.id }, data: { isDefault: true } }),
  ]);
  revalidatePath("/account/addresses");
}
