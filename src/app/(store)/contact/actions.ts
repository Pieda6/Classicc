"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { sendContactMessage } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import type { FormState } from "../account/actions";

export async function sendMessage(_: FormState, formData: FormData): Promise<FormState> {
  if (formData.get("company")) return { success: "Thanks! We'll be in touch." }; // honeypot
  const parsed = z
    .object({
      name: z.string().trim().min(2, "Enter your name").max(100),
      email: z.string().trim().email("Enter a valid email"),
      subject: z.string().trim().min(2, "Add a subject").max(150),
      message: z.string().trim().min(10, "Tell us a little more").max(4000),
    })
    .safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fe: Record<string, string> = {};
    for (const i of parsed.error.issues) fe[String(i.path[0])] ??= i.message;
    return { fieldErrors: fe };
  }
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`contact:${ip}`, 5)) return { error: "Too many messages. Please try again later or reach us on WhatsApp." };
  await sendContactMessage(parsed.data);
  return { success: "Thanks for reaching out! We usually reply within one business day." };
}
