# CLASSICC

Online store for the CLASSICC clothing brand. The design combines the editorial, monochrome layout of the GAZU desktop template (giant wordmark hero, black category strip, "New Vibes" banner, feature row) with the soft, rounded, app-style UI of the Lumière mobile template (ivory cards, pill category chips, heart buttons, round size selectors, big "Add to cart" button, bottom tab bar on phones).

**Stack:** Next.js 15 (App Router, server actions) · TypeScript · Tailwind CSS 4 · Prisma + PostgreSQL · Vercel Blob (image uploads) · Paystack · Nodemailer.

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

## Deploy on Vercel

1. **Import the repo.** On [vercel.com/new](https://vercel.com/new), import `Pieda6/Classicc`. The framework (Next.js) and build command are detected from `package.json`; leave the defaults. The first build will fail until the database exists. That's expected.
2. **Add a database.** In the project, open **Storage → Create Database → Neon (Postgres)** and connect it to the project. Only `DATABASE_URL` is required. The build also recognises the usual alternatives (`POSTGRES_PRISMA_URL`, `POSTGRES_URL`, and `DATABASE_URL_UNPOOLED` / `POSTGRES_URL_NON_POOLING` for the direct connection) and falls back to `DATABASE_URL` when there's no separate direct URL.
3. **Add image storage.** **Storage → Create → Blob**, connect it to the project. This sets `BLOB_READ_WRITE_TOKEN`, so product photos uploaded in the admin are stored in Blob. Vercel's own filesystem is read-only.
4. **Add environment variables** (**Settings → Environment Variables**). At minimum:
   - `AUTH_SECRET`: a long random string (`openssl rand -base64 32`). **Required**; the app refuses to start without it.
   - `ADMIN_EMAIL` and `ADMIN_PASSWORD`: the first admin account, created on the first successful deploy.
   - `PAYSTACK_SECRET_KEY` and `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`, `STORE_NOTIFY_EMAIL`
   - `NEXT_PUBLIC_STORE_EMAIL`, `NEXT_PUBLIC_STORE_PHONE`, `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_STORE_ADDRESS` and the social links

   See `.env.example` for the full list.
5. **Redeploy** (**Deployments → ⋯ → Redeploy**). Each build runs `prisma migrate deploy`, then the seed script, then `next build`. The seed only fills an empty database, so it never overwrites changes made in the admin.
6. **Point Paystack at the site.** Set the webhook URL to `https://YOUR-DOMAIN/api/webhooks/paystack`.
7. **Custom domain (optional).** Add it under **Settings → Domains**, then set `NEXT_PUBLIC_SITE_URL=https://yourdomain.com` and redeploy. Without it, the site uses the project's `*.vercel.app` production URL for payment callbacks and email links.

Then log in at `/account/login` with your admin email and change the password.

## Local development

You need Node 20+ and a Postgres database: a free Neon database or a local one, for example `docker run -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:16`.

```bash
npm install
cp .env.example .env        # set DATABASE_URL / DATABASE_URL_UNPOOLED
npm run setup               # runs migrations, seeds products, categories, delivery zones and the admin
npm run dev                 # http://localhost:3000
```

The default admin login is `admin@classicc.com` / `ChangeMe123!` unless you change `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

Other scripts: `npm test` (unit tests) · `npm run lint` (type check) · `npm run db:migrate` · `npm run db:seed` · `node scripts/garment-art.mjs` (regenerate placeholder artwork).

Changing the schema: edit `prisma/schema.prisma`, run `npx prisma migrate dev --name what-changed`, commit the new folder in `prisma/migrations`, and deploy.

## Paystack

1. In your Paystack dashboard, go to **Settings → API Keys & Webhooks** and copy the secret key into `PAYSTACK_SECRET_KEY` (and the public key into `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`).
2. Set the **Webhook URL** to `https://YOUR-DOMAIN/api/webhooks/paystack`.
3. Set `NEXT_PUBLIC_SITE_URL` to your live domain. Paystack sends customers back to `/checkout/verify` after they pay.

How a payment works: the server recalculates prices, stock and delivery from the database, creates the order, and starts a Paystack transaction. When the customer comes back, the server verifies the payment with Paystack. The webhook confirms it as well, so the order is marked paid even if the customer closes the tab. Marking an order paid only happens once: stock is reduced and the confirmation email is sent a single time, and the amount paid must match the order total.

**Test mode:** when `PAYSTACK_SECRET_KEY` is empty and the app is not running in production, checkout simulates a successful payment so you can try the whole flow locally. This never happens in production. Without a key there, checkout shows "payment unavailable".

## Email

Set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` and `EMAIL_FROM` (any SMTP provider works: Resend, Postmark, Mailgun, Zoho, Gmail app password…). Without SMTP settings, emails are printed to the server console, which is handy in development for password-reset links.

## Production notes

- **Image uploads** go to Vercel Blob when `BLOB_READ_WRITE_TOKEN` is set, and to `UPLOAD_DIR` on disk otherwise (local development or a server with a persistent disk). Pasting an `https://` image URL into the product form also works.
- The rate limiter for login, sign-up and checkout keeps its counts in memory, per server instance. On Vercel that's a best-effort limit. For stricter limits, swap `src/lib/rate-limit.ts` for Upstash Redis.

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
