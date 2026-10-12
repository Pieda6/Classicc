// Normalises database env var names so the app works with whichever Postgres
// integration is connected on Vercel (Neon, Supabase, Prisma Postgres, …).
// - DATABASE_URL: pooled URL used by the app
// - DATABASE_URL_UNPOOLED: direct URL used by migrations (falls back to DATABASE_URL)
export function applyDbEnv(env = process.env) {
  env.DATABASE_URL ||= env.POSTGRES_PRISMA_URL || env.POSTGRES_URL || env.NEON_DATABASE_URL || "";
  env.DATABASE_URL_UNPOOLED ||=
    env.POSTGRES_URL_NON_POOLING || env.DATABASE_URL_NON_POOLING || env.DIRECT_URL || env.DATABASE_URL;
  if (!env.DATABASE_URL) delete env.DATABASE_URL;
  if (!env.DATABASE_URL_UNPOOLED) delete env.DATABASE_URL_UNPOOLED;
}
