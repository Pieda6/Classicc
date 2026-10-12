// Production build: migrate the database, seed it if empty, then build Next.js.
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { applyDbEnv } from "./db-env.mjs";

// Load a local .env (Vercel injects env vars directly, so there isn't one there).
if (existsSync(".env")) process.loadEnvFile(".env");
applyDbEnv();

if (!process.env.DATABASE_URL) {
  console.error(
    "\n✖ No database configured. On Vercel, open your project → Storage → connect a Postgres database\n" +
      "  (e.g. Neon), or set DATABASE_URL in Settings → Environment Variables, then redeploy.\n",
  );
  process.exit(1);
}

const run = (cmd) => execSync(cmd, { stdio: "inherit", env: process.env });
run("prisma generate");
run("prisma migrate deploy");
run("tsx prisma/seed.ts");
run("next build");
