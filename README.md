# CLASSICC

Online store for the CLASSICC clothing brand. The design combines the editorial, monochrome layout of the GAZU desktop template (giant wordmark hero, black category strip, "New Vibes" banner, feature row) with the soft, rounded, app-style UI of the Lumière mobile template (ivory cards, pill category chips, heart buttons, round size selectors, big "Add to cart" button, bottom tab bar on phones).

**Stack:** Next.js 15 (App Router, server actions) · TypeScript · Tailwind CSS 4 · Prisma (SQLite locally, Postgres in production) · Paystack · Nodemailer.

## Features

**Storefront**
- **Home**: brand intro, featured/trending products, category links, new season banner, brand story.
- **Shop** (`/shop`): search, category chips, Men/Women/Kids, size/colour/price/in-stock filters, sorting, pagination.
- **Product details**: gallery that switches with the selected colour, size picker that shows stock per size, availability, quantity, wishlist, WhatsApp question link.
- **Cart**: change quantities and remove items. Prices and stock are re-checked against the database when the cart opens.
- **Checkout**: contact and delivery details, delivery-zone fees, free-delivery threshold, saved addresses, payment through **Paystack**.
- **My Account**: sign up, log in, reset password by email, manage addresses, edit profile and password, order history with live status.
- **Contact**: business details, contact form (emailed to the store), social links, WhatsApp support.
- **Policies**: delivery (fees come from the admin's delivery zones), returns and refunds, privacy, terms.
- **Wishlist**, saved on the shopper's device.

**Admin** (`/admin`, admin accounts only)
- Dashboard: revenue, paid orders, average order value, a 14-day revenue chart, best sellers, low stock, orders waiting to be fulfilled.
- Products: add, edit and delete products, upload and reorder images, link images to colours, set prices and sale prices, show or hide products, mark products as featured.
- Variants and stock per size and colour, plus an **Inventory** page for quick stock updates and low/out-of-stock views.
- Categories: add, edit and delete, with images.
- Orders: search and filter. Each order shows the customer's delivery details, the Paystack reference and payment status. Admins can update the order status and choose to email the customer. Cancelling a paid order puts its items back into stock.
- Delivery: set up locations, fees and delivery times, and the free-delivery threshold.

**Emails**: order confirmation (to the customer, plus an alert to the store), order status updates, password reset, welcome email, and contact-form messages.

## Getting started

```bash
npm install
cp .env.example .env        # then fill in values (see below)
npm run setup               # creates the database and seeds products, categories, delivery zones, admin
npm run dev                 # http://localhost:3000
```

Seeded admin login: the `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env` (defaults: `admin@classicc.com` / `ChangeMe123!`). **Change this password before going live** (Account → Profile & password).

Other scripts: `npm test` (unit tests) · `npm run lint` (type check) · `npm run db:reset` (wipe and reseed) · `node scripts/garment-art.mjs` (regenerate placeholder artwork).

## Paystack

1. In your Paystack dashboard, go to **Settings → API Keys & Webhooks** and copy the secret key into `PAYSTACK_SECRET_KEY` (and the public key into `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`).
2. Set the **Webhook URL** to `https://YOUR-DOMAIN/api/webhooks/paystack`.
3. Set `NEXT_PUBLIC_SITE_URL` to your live domain. Paystack sends customers back to `/checkout/verify` after they pay.

How a payment works: the server recalculates prices, stock and delivery from the database, creates the order, and starts a Paystack transaction. When the customer comes back, the server verifies the payment with Paystack. The webhook confirms it as well, so the order is marked paid even if the customer closes the tab. Marking an order paid only happens once: stock is reduced and the confirmation email is sent a single time, and the amount paid must match the order total.

**Test mode:** when `PAYSTACK_SECRET_KEY` is empty and the app is not running in production, checkout simulates a successful payment so you can try the whole flow locally. This never happens in production. Without a key there, checkout shows "payment unavailable".

## Email

Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` and `EMAIL_FROM` (any SMTP provider works: Resend, Postmark, Mailgun, Zoho, Gmail app password…). Without SMTP settings, emails are printed to the server console, which is handy in development for password-reset links.

## Going to production

- **Database**: in `prisma/schema.prisma`, change `provider = "sqlite"` to `provider = "postgresql"`, set `DATABASE_URL` to your Postgres database (Neon, Supabase, Railway…), then run `npx prisma db push && npm run db:seed`.
- **AUTH_SECRET**: set a long random value (`openssl rand -base64 32`).
- **Image uploads** are saved in `UPLOAD_DIR` on disk and served from `/uploads/...`. Use a host with a persistent disk (Railway volume, Render disk, a VPS). On serverless hosts like Vercel, either paste image URLs from a CDN into the product form, or swap `src/lib/uploads.ts` for S3/Cloudinary storage.
- Update the business details (`NEXT_PUBLIC_STORE_*`, WhatsApp number, social links) in `.env`.
- The rate limiter for login, sign-up and checkout keeps its counts in memory. If you run several server instances, replace it with Redis/Upstash.

## Product images

The seeded products use generated SVG placeholder artwork (`public/products`, made by `scripts/garment-art.mjs`) so the store looks finished out of the box. Replace them with real photography from **Admin → Products → Images**: upload photos, use the arrows to put the main photo first, and link each photo to a colour.

## Project layout

```
prisma/              schema + seed data
public/products      placeholder product artwork
src/app/(store)      storefront pages (home, shop, product, cart, checkout, account, policies…)
src/app/admin        admin dashboard + server actions
src/app/api/webhooks Paystack webhook
src/components       store + admin UI components
src/lib              auth, Paystack, email, orders, pricing, settings, uploads
src/middleware.ts    protects /admin and /account
tests/               unit tests (node:test)
```
