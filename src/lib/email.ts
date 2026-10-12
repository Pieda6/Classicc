import "server-only";
import nodemailer from "nodemailer";
import { site } from "./site";
import { formatMoney } from "./money";
import { STATUS_LABEL } from "./constants";

type Mail = { to: string; subject: string; html: string; text: string; replyTo?: string };

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!process.env.SMTP_HOST) return null;
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || 587);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });
  }
  return transporter;
}

export async function sendMail(mail: Mail) {
  const t = getTransporter();
  if (!t) {
    console.info(`\n[email] (SMTP not configured — printing instead)\nTo: ${mail.to}\nSubject: ${mail.subject}\n\n${mail.text}\n`);
    return;
  }
  try {
    await t.sendMail({
      from: process.env.EMAIL_FROM || `${site.name} <${site.email}>`,
      ...mail,
    });
  } catch (err) {
    // Never let an email failure break checkout or auth flows.
    console.error("[email] failed to send", err);
  }
}

function escape(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function layout(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#EEEBE3;font-family:Helvetica,Arial,sans-serif;color:#111">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
  <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FAF8F0;border-radius:24px;overflow:hidden">
    <tr><td style="background:#0E0E0E;color:#FAF8F0;padding:24px 32px;font-size:22px;letter-spacing:6px;font-weight:700">${site.name}</td></tr>
    <tr><td style="padding:32px">
      <h1 style="font-size:22px;margin:0 0 16px">${escape(title)}</h1>
      ${body}
    </td></tr>
    <tr><td style="padding:20px 32px;border-top:1px solid #DAD6CC;font-size:12px;color:#6B6862">
      ${escape(site.name)} · ${escape(site.address)} · ${escape(site.email)}
    </td></tr>
  </table></td></tr></table></body></html>`;
}

function button(href: string, label: string) {
  return `<a href="${href}" style="display:inline-block;background:#0E0E0E;color:#FAF8F0;text-decoration:none;padding:14px 28px;border-radius:999px;font-weight:600;font-size:14px">${escape(label)}</a>`;
}

type OrderForEmail = {
  orderNumber: string;
  reference: string;
  fullName: string;
  email: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  phone: string;
  deliveryZone: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  items: { name: string; size: string; color: string; quantity: number; unitPrice: number }[];
};

export async function sendOrderConfirmation(order: OrderForEmail) {
  const rows = order.items
    .map(
      (i) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #DAD6CC">${escape(i.name)}<br><span style="color:#6B6862;font-size:12px">${escape(i.color)} · ${escape(i.size)} · Qty ${i.quantity}</span></td>
        <td align="right" style="padding:10px 0;border-bottom:1px solid #DAD6CC">${formatMoney(i.unitPrice * i.quantity)}</td>
      </tr>`,
    )
    .join("");
  const html = layout(
    `Thank you, ${order.fullName.split(" ")[0]}! Your order is confirmed.`,
    `<p style="color:#6B6862;margin:0 0 20px">Order <strong style="color:#111">${order.orderNumber}</strong> has been paid and is now being prepared.</p>
     <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px">${rows}
       <tr><td style="padding:8px 0;color:#6B6862">Subtotal</td><td align="right">${formatMoney(order.subtotal)}</td></tr>
       <tr><td style="padding:8px 0;color:#6B6862">Delivery (${escape(order.deliveryZone)})</td><td align="right">${order.deliveryFee ? formatMoney(order.deliveryFee) : "Free"}</td></tr>
       <tr><td style="padding:8px 0;font-weight:700">Total paid</td><td align="right" style="font-weight:700">${formatMoney(order.total)}</td></tr>
     </table>
     <p style="margin:24px 0 8px;font-weight:700">Delivering to</p>
     <p style="margin:0 0 24px;color:#6B6862">${escape(order.fullName)}<br>${escape(order.line1)}${order.line2 ? "<br>" + escape(order.line2) : ""}<br>${escape(order.city)}, ${escape(order.state)}<br>${escape(order.phone)}</p>
     ${button(`${site.url}/checkout/verify?reference=${encodeURIComponent(order.reference)}`, "View your order")}`,
  );
  const text = [
    `Thank you for your order ${order.orderNumber}.`,
    ...order.items.map((i) => `- ${i.name} (${i.color}, ${i.size}) x${i.quantity}: ${formatMoney(i.unitPrice * i.quantity)}`),
    `Subtotal: ${formatMoney(order.subtotal)}`,
    `Delivery: ${order.deliveryFee ? formatMoney(order.deliveryFee) : "Free"}`,
    `Total paid: ${formatMoney(order.total)}`,
    `Delivering to: ${order.fullName}, ${order.line1}, ${order.city}, ${order.state}`,
  ].join("\n");
  await sendMail({ to: order.email, subject: `Order confirmed — ${order.orderNumber}`, html, text });

  const notify = process.env.STORE_NOTIFY_EMAIL;
  if (notify) {
    await sendMail({
      to: notify,
      subject: `New paid order ${order.orderNumber} — ${formatMoney(order.total)}`,
      html: layout(`New order ${order.orderNumber}`, `<p>${escape(order.fullName)} (${escape(order.email)}) paid ${formatMoney(order.total)}.</p>${button(`${site.url}/admin/orders`, "Open admin")}`),
      text: `New order ${order.orderNumber} from ${order.fullName} — ${formatMoney(order.total)}`,
    });
  }
}

export async function sendOrderStatusUpdate(order: { orderNumber: string; reference: string; email: string; fullName: string; status: string }) {
  const label = STATUS_LABEL[order.status] ?? order.status;
  const messages: Record<string, string> = {
    PROCESSING: "We're preparing your items for dispatch.",
    SHIPPED: "Your order is on its way. Our delivery partner will contact you shortly.",
    DELIVERED: "Your order has been delivered. We hope you love it!",
    CANCELLED: "Your order has been cancelled. If you were charged, a refund will be processed to your original payment method.",
  };
  await sendMail({
    to: order.email,
    subject: `Your order ${order.orderNumber} is ${label.toLowerCase()}`,
    html: layout(`Order ${order.orderNumber}: ${label}`, `<p style="color:#6B6862">${messages[order.status] ?? "Your order status has changed."}</p>${button(`${site.url}/checkout/verify?reference=${encodeURIComponent(order.reference)}`, "Track your order")}`),
    text: `Hi ${order.fullName}, your order ${order.orderNumber} is now: ${label}. ${messages[order.status] ?? ""}`,
  });
}

export async function sendPasswordReset(to: string, name: string, link: string) {
  await sendMail({
    to,
    subject: `Reset your ${site.name} password`,
    html: layout("Reset your password", `<p style="color:#6B6862">Hi ${escape(name)}, we received a request to reset your password. This link expires in 1 hour.</p>${button(link, "Choose a new password")}<p style="color:#6B6862;font-size:12px;margin-top:24px">If you didn't request this, you can ignore this email.</p>`),
    text: `Hi ${name}, reset your password using this link (valid for 1 hour): ${link}`,
  });
}

export async function sendWelcome(to: string, name: string) {
  await sendMail({
    to,
    subject: `Welcome to ${site.name}`,
    html: layout(`Welcome, ${name.split(" ")[0]}.`, `<p style="color:#6B6862">Your account is ready. Save addresses, check out faster and follow every order from your account.</p>${button(`${site.url}/shop`, "Start shopping")}`),
    text: `Welcome to ${site.name}, ${name}! Start shopping at ${site.url}/shop`,
  });
}

export async function sendContactMessage(input: { name: string; email: string; subject: string; message: string }) {
  const to = process.env.STORE_NOTIFY_EMAIL || site.email;
  await sendMail({
    to,
    replyTo: input.email,
    subject: `[Contact] ${input.subject}`,
    html: layout(`Message from ${input.name}`, `<p style="white-space:pre-wrap">${escape(input.message)}</p><p style="color:#6B6862">${escape(input.email)}</p>`),
    text: `From ${input.name} <${input.email}>\n\n${input.message}`,
  });
}
