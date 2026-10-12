// Normalises database env var names so the app works with whichever Postgres
// integration is connected on Vercel (Neon, Supabase, Prisma Postgres, …),
// including integrations connected with a custom prefix (e.g. STORE_DATABASE_URL).
// - DATABASE_URL: pooled URL used by the app
// - DATABASE_URL_UNPOOLED: direct URL used by migrations (falls back to DATABASE_URL)

const POOLED = ["DATABASE_URL", "POSTGRES_PRISMA_URL", "POSTGRES_URL", "NEON_DATABASE_URL"];
const DIRECT = ["DATABASE_URL_UNPOOLED", "POSTGRES_URL_NON_POOLING", "DATABASE_URL_NON_POOLING", "DIRECT_URL"];

function find(env, names) {
  for (const n of names) if (env[n]) return env[n];
  // Prefixed variants, e.g. MYDB_DATABASE_URL or MYDB_POSTGRES_URL
  for (const n of names) {
    const key = Object.keys(env).find((k) => k.endsWith(`_${n}`) && env[k]);
    if (key) return env[key];
  }
  return undefined;
}

export function applyDbEnv(env = process.env) {
  const pooled = find(env, POOLED);
  if (pooled) env.DATABASE_URL = pooled;
  const direct = find(env, DIRECT) || pooled;
  if (direct) env.DATABASE_URL_UNPOOLED = direct;
}

/** Names (never values) of env vars that look database-related — for build diagnostics. */
export function dbEnvNames(env = process.env) {
  return Object.keys(env)
    .filter((k) => /DATABASE|POSTGRES|^PG|NEON/i.test(k))
    .map((k) => `${k}${env[k] ? "" : " (empty)"}`)
    .sort();
}
