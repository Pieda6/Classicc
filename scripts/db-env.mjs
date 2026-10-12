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

const isPg = (v) => typeof v === "string" && /^postgres(ql)?:\/\//.test(v);
const isDirectName = (k) => /UNPOOLED|NON_POOLING|DIRECT/i.test(k);

/** Last resort: any variable whose value is a Postgres URL, whatever its name (e.g. STORAGE_URL). */
function scan(env, wantDirect) {
  const keys = Object.keys(env).filter((k) => isPg(env[k])).sort();
  const key = keys.find((k) => isDirectName(k) === wantDirect) ?? keys[0];
  return key ? env[key] : undefined;
}

export function applyDbEnv(env = process.env) {
  const pooled = find(env, POOLED) || scan(env, false);
  if (pooled) env.DATABASE_URL = pooled;
  const direct = find(env, DIRECT) || scan(env, true) || pooled;
  if (direct) env.DATABASE_URL_UNPOOLED = direct;
}

/** Names (never values) of env vars that look database-related — for build diagnostics. */
export function dbEnvNames(env = process.env) {
  return Object.keys(env)
    .filter((k) => /DATABASE|POSTGRES|^PG|NEON/i.test(k))
    .map((k) => `${k}${env[k] ? "" : " (empty)"}`)
    .sort();
}
